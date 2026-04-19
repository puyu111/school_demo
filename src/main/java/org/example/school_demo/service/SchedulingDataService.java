package org.example.school_demo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.example.school_demo.entity.*;
import org.example.school_demo.model.*;
import org.example.school_demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 排课数据服务
 * 提供数据库集成的数据加载和保存功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulingDataService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final ClassroomRepository classroomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final SchedulingTaskRepository taskRepository;
    private final TimetableRecordRepository recordRepository;
    private final GenericObjectPool<TimetableSolution> solutionPool;

    /**
     * 从数据库加载所有排课所需数据
     */
    @Transactional(readOnly = true)
    public SchedulingData loadSchedulingData() {
        log.info("从数据库加载排课数据...");

        // 加载所有时间段
        List<TimeSlotEntity> timeSlotEntities = timeSlotRepository.findAll();
        List<String> allTimeSlots = timeSlotEntities.stream()
                .map(TimeSlotEntity::getId)
                .toList();

        // 加载所有教师
        List<TeacherEntity> teacherEntities = teacherRepository.findAll();
        List<Teacher> teachers = teacherEntities.stream()
                .map(this::convertToTeacher)
                .toList();

        // 加载所有教室
        List<ClassroomEntity> classroomEntities = classroomRepository.findAll();
        List<Classroom> classrooms = classroomEntities.stream()
                .map(this::convertToClassroom)
                .toList();

        // 加载所有有效课程
        List<CourseEntity> courseEntities = courseRepository.findAll();
        List<Course> courses = courseEntities.stream()
                .filter(c -> c.getStatus() == CourseEntity.CourseStatus.ACTIVE)
                .map(this::convertToCourse)
                .toList();

        log.info("加载完成 - 课程：{}, 教师：{}, 教室：{}, 时间段：{}",
                courses.size(), teachers.size(), classrooms.size(), allTimeSlots.size());

        return SchedulingData.builder()
                .courses(courses)
                .teachers(teachers)
                .classrooms(classrooms)
                .allTimeSlots(allTimeSlots)
                .build();
    }

    /**
     * 保存排课任务
     */
    @Transactional
    public SchedulingTaskEntity saveSchedulingTask(String taskId) {
        SchedulingTaskEntity task = SchedulingTaskEntity.builder()
                .id(taskId)
                .status(SchedulingTaskEntity.TaskStatus.RUNNING)
                .build();
        return taskRepository.save(task);
    }

    /**
     * 更新排课任务状态
     */
    @Transactional
    public void updateTaskStatus(String taskId,
                                  SchedulingTaskEntity.TaskStatus status,
                                  Integer iterations,
                                  Double finalTemperature,
                                  Double finalCost,
                                  Boolean foundFeasible,
                                  Long executionTimeMs,
                                  String errorMessage) {
        taskRepository.findById(taskId).ifPresent(task -> {
            task.setStatus(status);
            task.setIterations(iterations);
            task.setFinalTemperature(finalTemperature);
            task.setFinalCost(finalCost);
            task.setFoundFeasible(foundFeasible);
            task.setExecutionTimeMs(executionTimeMs);
            task.setErrorMessage(errorMessage);
            if (status == SchedulingTaskEntity.TaskStatus.COMPLETED) {
                task.setSolutionId(taskId + "-solution");
            }
            taskRepository.save(task);
        });
    }

    /**
     * 保存排课结果到数据库
     */
    @Transactional
    public void saveTimetableRecords(String taskId, TimetableSolution solution) {
        String solutionId = taskId + "-solution";

        // 保存每条排课记录
        List<TimetableRecordEntity> records = solution.getAssignments().values().stream()
                .map(assignment -> TimetableRecordEntity.builder()
                        .taskId(taskId)
                        .solutionId(solutionId)
                        .courseId(assignment.getCourseId())
                        .teacherId(assignment.getTeacherId())
                        .classroomId(assignment.getClassroomId())
                        .timeSlotId(assignment.getTimeSlotId())
                        .status(TimetableRecordEntity.TimetableStatus.PENDING)
                        .build())
                .toList();

        recordRepository.saveAll(records);
        log.info("保存 {} 条排课记录到数据库", records.size());
    }

    /**
     * 从对象池获取 TimetableSolution
     */
    public TimetableSolution borrowSolution() throws Exception {
        long startTime = System.currentTimeMillis();
        TimetableSolution solution = solutionPool.borrowObject();
        long borrowTime = System.currentTimeMillis() - startTime;
        if (borrowTime > 100) {
            log.warn("从对象池获取 Solution 耗时较长：{}ms", borrowTime);
        }
        return solution;
    }

    /**
     * 归还 TimetableSolution 到对象池
     */
    public void returnSolution(TimetableSolution solution) {
        try {
            solutionPool.returnObject(solution);
        } catch (Exception e) {
            log.error("归还 Solution 到对象池失败", e);
        }
    }

    // ==================== 实体转换方法 ====================

    private Teacher convertToTeacher(TeacherEntity entity) {
        Teacher teacher = Teacher.builder()
                .id(entity.getId())
                .name(entity.getName())
                .maxContinuousPeriods(entity.getMaxContinuousPeriods())
                .build();

        // 加载可用时间段
        if (entity.getAvailableSlots() != null) {
            entity.getAvailableSlots().forEach(slot ->
                    teacher.addAvailableSlot(slot.getTimeSlot().getId()));
        }

        // 加载偏好时间段
        if (entity.getPreferredSlots() != null) {
            entity.getPreferredSlots().forEach(slot ->
                    teacher.addPreferredSlot(slot.getTimeSlot().getId()));
        }

        return teacher;
    }

    private Classroom convertToClassroom(ClassroomEntity entity) {
        Classroom classroom = Classroom.builder()
                .id(entity.getId())
                .name(entity.getName())
                .capacity(entity.getCapacity())
                .type(convertClassroomType(entity.getType()))
                .build();

        // 加载可用时间段
        if (entity.getAvailableSlots() != null) {
            entity.getAvailableSlots().forEach(slot ->
                    classroom.addAvailableSlot(slot.getTimeSlot().getId()));
        }

        return classroom;
    }

    private Course convertToCourse(CourseEntity entity) {
        return Course.builder()
                .id(entity.getId())
                .name(entity.getName())
                .requiredPeriods(entity.getRequiredPeriods())
                .studentCount(entity.getStudentCount())
                .teacherId(entity.getTeacherId())
                .preferredClassroomType(entity.getPreferredClassroomType() != null ?
                        convertClassroomType(entity.getPreferredClassroomType()) : null)
                .classId(entity.getClassId())
                .build();
    }

    private Classroom.ClassroomType convertClassroomType(ClassroomEntity.ClassroomType type) {
        if (type == null) return null;
        return switch (type) {
            case NORMAL -> Classroom.ClassroomType.NORMAL;
            case LAB -> Classroom.ClassroomType.LAB;
            case COMPUTER -> Classroom.ClassroomType.COMPUTER;
            case MULTIMEDIA -> Classroom.ClassroomType.MULTIMEDIA;
            case LECTURE_HALL -> Classroom.ClassroomType.LECTURE_HALL;
        };
    }

    /**
     * 排课数据集合
     */
    @lombok.Data
    @lombok.Builder
    public static class SchedulingData {
        private List<Course> courses;
        private List<Teacher> teachers;
        private List<Classroom> classrooms;
        private List<String> allTimeSlots;
    }
}
