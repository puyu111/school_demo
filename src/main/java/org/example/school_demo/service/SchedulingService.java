package org.example.school_demo.service;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.algorithm.SimulatedAnnealingAlgorithm;
import org.example.school_demo.config.SimulatedAnnealingProperties;
import org.example.school_demo.dto.SchedulingRequest;
import org.example.school_demo.dto.SchedulingResult;
import org.example.school_demo.entity.SchedulingTaskEntity;
import org.example.school_demo.model.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 排课服务
 * 提供排课算法的异步执行和结果管理
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final SimulatedAnnealingAlgorithm algorithm;
    private final SimulatedAnnealingProperties properties;
    private final SchedulingDataService schedulingDataService;

    // 任务结果存储（生产环境应使用数据库或 Redis）
    private final Map<String, SchedulingResult> taskResults = new ConcurrentHashMap<>();

    /**
     * 异步执行排课任务（绑定到自定义线程池 schedulingTaskExecutor）
     * 使用 @Async("schedulingTaskExecutor") 绑定到自定义线程池
     */
    @Async("schedulingTaskExecutor")
    public CompletableFuture<String> generateSchedule(
            List<Course> courses,
            List<Teacher> teachers,
            List<Classroom> classrooms,
            List<String> allTimeSlots,
            SchedulingRequest request
    ) {
        String taskId = UUID.randomUUID().toString();
        return executeScheduleTask(taskId, courses, teachers, classrooms, allTimeSlots, request, false);
    }

    /**
     * 异步执行排课任务并持久化到数据库（绑定到自定义线程池）
     *
     * @param taskId 任务 ID（由外部生成）
     * @param saveToDb 是否保存到数据库
     */
    @Async("schedulingTaskExecutor")
    public CompletableFuture<String> generateScheduleWithDbPersistence(
            List<Course> courses,
            List<Teacher> teachers,
            List<Classroom> classrooms,
            List<String> allTimeSlots,
            String taskId,
            SchedulingRequest request
    ) {
        return executeScheduleTask(taskId, courses, teachers, classrooms, allTimeSlots, request, true);
    }

    /**
     * 执行排课任务的通用逻辑
     */
    private CompletableFuture<String> executeScheduleTask(
            String taskId,
            List<Course> courses,
            List<Teacher> teachers,
            List<Classroom> classrooms,
            List<String> allTimeSlots,
            SchedulingRequest request,
            boolean saveToDb
    ) {
        log.info("创建排课任务：{} (saveToDb={})", taskId, saveToDb);

        // 创建进行中的结果
        SchedulingResult runningResult = SchedulingResult.builder()
                .taskId(taskId)
                .status("RUNNING")
                .progress(0)
                .build();
        taskResults.put(taskId, runningResult);

        return CompletableFuture.supplyAsync(() -> {
            long startTime = System.currentTimeMillis();
            try {
                // 应用请求参数（如果用户自定义了参数）
                if (!request.getUseDefaultParams()) {
                    applyCustomParameters(request);
                }

                log.info("开始执行排课算法 - 任务 ID: {}, 课程数：{}, 教师数：{}, 教室数：{}, 时间段数：{}",
                         taskId, courses.size(), teachers.size(), classrooms.size(), allTimeSlots.size());

                // 执行模拟退火算法
                SimulatedAnnealingAlgorithm.AlgorithmResult algoResult = algorithm.execute(
                        courses, teachers, classrooms, allTimeSlots
                );

                long executionTime = System.currentTimeMillis() - startTime;

                // 构建结果
                SchedulingResult result = SchedulingResult.builder()
                        .taskId(taskId)
                        .status("COMPLETED")
                        .solution(algoResult.getSolution())
                        .iterations(algoResult.getIterations())
                        .finalTemperature(algoResult.getFinalTemperature())
                        .finalCost(algoResult.getFinalCost())
                        .foundFeasibleSolution(algoResult.isFoundFeasibleSolution())
                        .executionTimeMs(executionTime)
                        .progress(100)
                        .build();

                taskResults.put(taskId, result);

                // 保存到数据库
                if (saveToDb) {
                    saveResultToDb(taskId, algoResult);
                }

                log.info("排课任务完成：{}, 耗时：{}ms, 迭代次数：{}, 最优代价：{:.2f}",
                         taskId, executionTime, algoResult.getIterations(), algoResult.getFinalCost());

                return taskId;

            } catch (Exception e) {
                log.error("排课任务失败：{}", taskId, e);
                SchedulingResult errorResult = SchedulingResult.builder()
                        .taskId(taskId)
                        .status("FAILED")
                        .errorMessage(e.getMessage())
                        .progress(0)
                        .build();
                taskResults.put(taskId, errorResult);

                // 更新数据库任务状态
                if (saveToDb) {
                    schedulingDataService.updateTaskStatus(
                            taskId,
                            SchedulingTaskEntity.TaskStatus.FAILED,
                            null, null, null, null, null,
                            e.getMessage()
                    );
                }

                return taskId;
            }
        });
    }

    /**
     * 保存结果到数据库
     */
    private void saveResultToDb(String taskId, SimulatedAnnealingAlgorithm.AlgorithmResult algoResult) {
        try {
            // 更新任务状态
            schedulingDataService.updateTaskStatus(
                    taskId,
                    SchedulingTaskEntity.TaskStatus.COMPLETED,
                    algoResult.getIterations(),
                    algoResult.getFinalTemperature(),
                    algoResult.getFinalCost(),
                    algoResult.isFoundFeasibleSolution(),
                    algoResult.getExecutionTimeMs(),
                    null
            );

            // 保存排课记录
            if (algoResult.getSolution() != null) {
                schedulingDataService.saveTimetableRecords(taskId, algoResult.getSolution());
            }
        } catch (Exception e) {
            log.error("保存排课结果到数据库失败：{}", taskId, e);
        }
    }

    /**
     * 获取任务结果
     */
    public SchedulingResult getResult(String taskId) {
        return taskResults.get(taskId);
    }

    /**
     * 检查任务是否完成
     */
    public boolean isCompleted(String taskId) {
        SchedulingResult result = taskResults.get(taskId);
        return result != null && !"RUNNING".equals(result.getStatus());
    }

    /**
     * 取消任务
     */
    public void cancelTask(String taskId) {
        algorithm.cancel();
        SchedulingResult result = taskResults.get(taskId);
        if (result != null) {
            result.setStatus("CANCELLED");
        }
    }

    /**
     * 清除已完成的任务结果
     */
    public void clearCompletedTasks() {
        taskResults.entrySet().removeIf(e ->
                e.getValue().getStatus() != null &&
                !"RUNNING".equals(e.getValue().getStatus())
        );
    }

    /**
     * 应用自定义参数
     */
    private void applyCustomParameters(SchedulingRequest request) {
        if (request.getInitialTemperature() != null) {
            properties.setInitialTemperature(request.getInitialTemperature());
        }
        if (request.getMinTemperature() != null) {
            properties.setMinTemperature(request.getMinTemperature());
        }
        if (request.getCoolingRate() != null) {
            properties.setCoolingRate(request.getCoolingRate());
        }
        if (request.getIterationsPerTemperature() != null) {
            properties.setIterationsPerTemperature(request.getIterationsPerTemperature());
        }
        if (request.getNoImprovementThreshold() != null) {
            properties.setNoImprovementThreshold(request.getNoImprovementThreshold());
        }
        if (request.getHardConstraintWeight() != null) {
            properties.setHardConstraintWeight(request.getHardConstraintWeight());
        }
        if (request.getSoftWeights() != null) {
            properties.setTeacherPreferenceWeight(request.getSoftWeights().getTeacherPreferenceWeight());
            properties.setContinuousClassWeight(request.getSoftWeights().getContinuousClassWeight());
            properties.setClassroomBalanceWeight(request.getSoftWeights().getClassroomBalanceWeight());
        }
    }

    /**
     * 生成示例数据（用于测试）
     */
    public SchedulingData generateSampleData() {
        List<String> allTimeSlots = new ArrayList<>();
        // 生成周一到周五，每天 8 节课的时间段
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri"};
        for (String day : dayNames) {
            for (int p = 1; p <= 8; p++) {
                allTimeSlots.add(day + "-" + p);
            }
        }

        // 生成示例教师
        List<Teacher> teachers = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            Teacher teacher = Teacher.builder()
                    .id("T" + i)
                    .name("教师" + i)
                    .maxContinuousPeriods(3)
                    .build();

            // 随机设置可用时间段（80% 的时间段可用）
            for (String slot : allTimeSlots) {
                if (Math.random() > 0.2) {
                    teacher.addAvailableSlot(slot);
                }
            }

            // 随机设置偏好时间段
            teacher.getPreferredSlots().add("Mon-1");
            teacher.getPreferredSlots().add("Wed-3");

            teachers.add(teacher);
        }

        // 生成示例教室
        List<Classroom> classrooms = new ArrayList<>();
        String[] roomTypes = {"A", "B", "C"};
        for (int i = 0; i < 6; i++) {
            Classroom classroom = Classroom.builder()
                    .id("R" + i)
                    .name(roomTypes[i % 3] + "-" + (101 + i * 10))
                    .capacity(30 + (i % 3) * 20) // 30, 50, 70
                    .type(i % 3 == 0 ? Classroom.ClassroomType.NORMAL :
                          i % 3 == 1 ? Classroom.ClassroomType.MULTIMEDIA : Classroom.ClassroomType.LAB)
                    .build();

            // 所有教室在所有时间段都可用
            classroom.getAvailableSlots().addAll(allTimeSlots);
            classrooms.add(classroom);
        }

        // 生成示例课程
        List<Course> courses = new ArrayList<>();
        String[] courseNames = {
                "高等数学", "线性代数", "概率论", "数据结构", "算法分析",
                "计算机组成", "操作系统", "计算机网络", "数据库系统", "软件工程"
        };

        for (int i = 0; i < 10; i++) {
            Course course = Course.builder()
                    .id("C" + i)
                    .name(courseNames[i])
                    .requiredPeriods(2) // 每门课 2 个课时
                    .studentCount(25 + (i % 3) * 15) // 25, 40, 55
                    .teacherId("T" + (i % 5 + 1))
                    .preferredClassroomType(i % 3 == 0 ? Classroom.ClassroomType.NORMAL :
                                           i % 3 == 1 ? Classroom.ClassroomType.MULTIMEDIA : Classroom.ClassroomType.LAB)
                    .classId("CLASS" + (i % 3 + 1))
                    .build();
            courses.add(course);
        }

        return SchedulingData.builder()
                .courses(courses)
                .teachers(teachers)
                .classrooms(classrooms)
                .allTimeSlots(allTimeSlots)
                .build();
    }

    /**
     * 排课数据集合
     */
    @Data
    @Builder
    public static class SchedulingData {
        private List<Course> courses;
        private List<Teacher> teachers;
        private List<Classroom> classrooms;
        private List<String> allTimeSlots;
    }
}
