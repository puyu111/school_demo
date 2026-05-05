package org.example.school_demo.service.schedule.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.schedule.request.*;
import org.example.school_demo.dto.schedule.response.*;
import org.example.school_demo.entity.*;
import org.example.school_demo.repository.*;
import org.example.school_demo.service.schedule.ScheduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepo;
    private final CourseRepository courseRepo;
    private final TeacherRepository teacherRepo;
    private final RoomRepository roomRepo;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public List<ScheduleVO> getScheduleList(Integer week, Long teacherId, String classId, Long roomId) {
        List<ScheduleEntity> entities = scheduleRepo.findByWeek(week);

        return entities.stream()
                .filter(e -> teacherId == null || teacherId.equals(e.getTeacherId()))
                .filter(e -> classId == null || classId.equals(e.getClassId()))
                .filter(e -> roomId == null || roomId.equals(e.getRoomId()))
                .map(this::toScheduleVO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getScheduleDetail(Long id) {
        Optional<ScheduleEntity> opt = scheduleRepo.findById(id);
        if (opt.isEmpty()) {
            return error("排课记录不存在: " + id);
        }
        return success(toScheduleVO(opt.get()));
    }

    @Override
    @Transactional
    public Map<String, Object> createSchedule(ScheduleCreateReq req) {
        ScheduleEntity entity = new ScheduleEntity();
        entity.setCourseId(req.getCourseId());
        entity.setTeacherId(req.getTeacherId());
        entity.setClassId(req.getClassId());
        entity.setRoomId(req.getRoomId());
        entity.setWeekday(req.getWeekday());
        entity.setStartTime(LocalTime.parse(req.getStartTime(), TIME_FORMATTER));
        entity.setEndTime(LocalTime.parse(req.getEndTime(), TIME_FORMATTER));
        entity.setDuration(req.getDuration());
        entity.setWeeks(req.getWeeks());
        entity.setColor(req.getColor());
        entity.setStudentCount(req.getStudentCount());

        scheduleRepo.save(entity);

        String courseName = getCourseName(req.getCourseId());
        log.info("排课记录已创建，id: {}, course: {}", entity.getScheduleId(), courseName);

        ScheduleCreateResp resp = ScheduleCreateResp.builder()
                .id(entity.getScheduleId())
                .courseId(entity.getCourseId())
                .courseName(courseName)
                .weekday(entity.getWeekday())
                .startTime(entity.getStartTime().format(TIME_FORMATTER))
                .endTime(entity.getEndTime().format(TIME_FORMATTER))
                .build();

        return success(resp);
    }

    @Override
    @Transactional
    public Map<String, Object> updateSchedule(Long id, ScheduleUpdateReq req) {
        Optional<ScheduleEntity> opt = scheduleRepo.findById(id);
        if (opt.isEmpty()) {
            return error("排课记录不存在: " + id);
        }

        ScheduleEntity entity = opt.get();

        if (req.getCourseId() != null) entity.setCourseId(req.getCourseId());
        if (req.getTeacherId() != null) entity.setTeacherId(req.getTeacherId());
        if (req.getClassId() != null) entity.setClassId(req.getClassId());
        if (req.getRoomId() != null) entity.setRoomId(req.getRoomId());
        if (req.getWeekday() != null) entity.setWeekday(req.getWeekday());
        if (req.getStartTime() != null) entity.setStartTime(LocalTime.parse(req.getStartTime(), TIME_FORMATTER));
        if (req.getEndTime() != null) entity.setEndTime(LocalTime.parse(req.getEndTime(), TIME_FORMATTER));
        if (req.getDuration() != null) entity.setDuration(req.getDuration());
        if (req.getWeeks() != null) entity.setWeeks(req.getWeeks());
        if (req.getColor() != null) entity.setColor(req.getColor());
        if (req.getStudentCount() != null) entity.setStudentCount(req.getStudentCount());

        scheduleRepo.save(entity);

        log.info("排课记录已更新，id: {}", id);

        ScheduleUpdateResp resp = ScheduleUpdateResp.builder()
                .id(entity.getScheduleId())
                .courseId(entity.getCourseId())
                .weekday(entity.getWeekday())
                .startTime(entity.getStartTime().format(TIME_FORMATTER))
                .endTime(entity.getEndTime().format(TIME_FORMATTER))
                .build();

        return success(resp);
    }

    @Override
    @Transactional
    public Map<String, Object> deleteSchedule(Long id) {
        Optional<ScheduleEntity> opt = scheduleRepo.findById(id);
        if (opt.isEmpty()) {
            return error("排课记录不存在: " + id);
        }

        scheduleRepo.deleteById(id);

        ScheduleDeleteResp resp = ScheduleDeleteResp.builder()
                .deletedId(id)
                .build();

        return success(resp);
    }

    @Override
    @Transactional
    public Map<String, Object> batchDeleteSchedule(ScheduleBatchDeleteReq req) {
        List<Long> ids = req.getIds();
        List<ScheduleEntity> existing = scheduleRepo.findAllById(ids);

        List<Long> existingIds = existing.stream()
                .map(ScheduleEntity::getScheduleId)
                .collect(Collectors.toList());

        scheduleRepo.deleteAllById(existingIds);

        int successCount = existingIds.size();
        List<Long> failedIds = ids.stream()
                .filter(id -> !existingIds.contains(id))
                .collect(Collectors.toList());

        log.info("批量删除排课记录，成功: {}, 失败: {}", successCount, failedIds.size());

        ScheduleBatchDeleteResp resp = ScheduleBatchDeleteResp.builder()
                .successCount(successCount)
                .failedIds(failedIds)
                .build();

        return success(resp);
    }

    @Override
    @Transactional
    public Map<String, Object> moveSchedule(ScheduleMoveReq req) {
        Optional<ScheduleEntity> opt = scheduleRepo.findById(req.getId());
        if (opt.isEmpty()) {
            return error("排课记录不存在: " + req.getId());
        }

        ScheduleEntity entity = opt.get();
        entity.setWeekday(req.getWeekday());
        entity.setStartTime(LocalTime.parse(req.getStartTime(), TIME_FORMATTER));
        entity.setEndTime(LocalTime.parse(req.getEndTime(), TIME_FORMATTER));
        scheduleRepo.save(entity);

        log.info("排课记录已移动，id: {} -> weekday: {} {}:{}", req.getId(), req.getWeekday(),
                req.getStartTime(), req.getEndTime());

        ScheduleMoveResp resp = ScheduleMoveResp.builder()
                .id(entity.getScheduleId())
                .weekday(entity.getWeekday())
                .startTime(entity.getStartTime().format(TIME_FORMATTER))
                .endTime(entity.getEndTime().format(TIME_FORMATTER))
                .build();

        return success(resp);
    }

    @Override
    @Transactional
    public Map<String, Object> saveSchedule(ScheduleSaveReq req) {
        List<ScheduleSaveReq.SaveCourseData> courses = req.getCourses();
        int createdCount = 0;
        int updatedCount = 0;
        List<Long> savedIds = new ArrayList<>();

        for (ScheduleSaveReq.SaveCourseData data : courses) {
            if (data.getId() != null && scheduleRepo.existsById(data.getId())) {
                ScheduleEntity entity = scheduleRepo.findById(data.getId()).get();
                if (data.getCourseId() != null) entity.setCourseId(data.getCourseId());
                if (data.getTeacherId() != null) entity.setTeacherId(data.getTeacherId());
                if (data.getClassId() != null) entity.setClassId(data.getClassId());
                if (data.getRoomId() != null) entity.setRoomId(data.getRoomId());
                if (data.getWeekday() != null) entity.setWeekday(data.getWeekday());
                if (data.getStartTime() != null) entity.setStartTime(LocalTime.parse(data.getStartTime(), TIME_FORMATTER));
                if (data.getEndTime() != null) entity.setEndTime(LocalTime.parse(data.getEndTime(), TIME_FORMATTER));
                if (data.getDuration() != null) entity.setDuration(data.getDuration());
                if (data.getWeeks() != null) entity.setWeeks(data.getWeeks());
                if (data.getColor() != null) entity.setColor(data.getColor());
                if (data.getStudentCount() != null) entity.setStudentCount(data.getStudentCount());
                scheduleRepo.save(entity);
                savedIds.add(entity.getScheduleId());
                updatedCount++;
            } else {
                ScheduleEntity entity = new ScheduleEntity();
                entity.setCourseId(data.getCourseId());
                entity.setTeacherId(data.getTeacherId());
                entity.setClassId(data.getClassId());
                entity.setRoomId(data.getRoomId());
                entity.setWeekday(data.getWeekday());
                entity.setStartTime(LocalTime.parse(data.getStartTime(), TIME_FORMATTER));
                entity.setEndTime(LocalTime.parse(data.getEndTime(), TIME_FORMATTER));
                entity.setDuration(data.getDuration());
                entity.setWeeks(data.getWeeks());
                entity.setColor(data.getColor());
                entity.setStudentCount(data.getStudentCount());
                scheduleRepo.save(entity);
                savedIds.add(entity.getScheduleId());
                createdCount++;
            }
        }

        log.info("保存排课完成，新增: {}, 更新: {}", createdCount, updatedCount);

        ScheduleSaveResp resp = ScheduleSaveResp.builder()
                .total(courses.size())
                .createdCount(createdCount)
                .updatedCount(updatedCount)
                .savedIds(savedIds)
                .build();

        return success(resp);
    }

    @Override
    public Map<String, Object> checkConflict(ScheduleConflictCheckReq req) {
        if (req.getWeekday() == null) {
            return error("请指定星期几");
        }

        LocalTime start = LocalTime.parse(req.getStartTime(), TIME_FORMATTER);
        LocalTime end = LocalTime.parse(req.getEndTime(), TIME_FORMATTER);

        List<ScheduleEntity> weekdaySchedules = scheduleRepo.findByWeekday(req.getWeekday());

        List<ScheduleConflictCheckResp.ConflictDetail> conflicts = new ArrayList<>();

        for (ScheduleEntity s : weekdaySchedules) {
            if (req.getId() != null && req.getId().equals(s.getScheduleId())) {
                continue;
            }

            if (!isTimeOverlapping(start, end, s.getStartTime(), s.getEndTime())) {
                continue;
            }

            if (req.getTeacherId() != null && req.getTeacherId().equals(s.getTeacherId())) {
                conflicts.add(buildConflict(s, "teacher", "教师时间冲突"));
            }

            if (req.getRoomId() != null && req.getRoomId().equals(s.getRoomId())) {
                conflicts.add(buildConflict(s, "room", "教室时间冲突"));
            }

            if (req.getClassId() != null && req.getClassId().equals(s.getClassId())) {
                conflicts.add(buildConflict(s, "class", "班级时间冲突"));
            }
        }

        boolean hasConflict = !conflicts.isEmpty();

        ScheduleConflictCheckResp resp = ScheduleConflictCheckResp.builder()
                .hasConflict(hasConflict)
                .conflicts(conflicts)
                .build();

        return success(resp);
    }

    @Override
    public ScheduleStatsResp getStats() {
        long totalCourses = scheduleRepo.count();
        long totalTeachers = scheduleRepo.countDistinctTeacherId();
        long totalClasses = scheduleRepo.countDistinctClassId();
        long totalRooms = scheduleRepo.countDistinctRoomId();

        List<Object[]> weekdayRaw = scheduleRepo.countGroupByWeekday();
        Map<String, Long> weekdayDistribution = new LinkedHashMap<>();
        String[] weekdayNames = {"", "周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        for (Object[] row : weekdayRaw) {
            int wd = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            weekdayDistribution.put(weekdayNames[wd], count);
        }

        List<Object[]> topRaw = scheduleRepo.countGroupByTeacherId();
        List<ScheduleStatsResp.TeacherScheduleCount> topTeachers = topRaw.stream()
                .limit(10)
                .map(row -> {
                    Long teacherId = ((Number) row[0]).longValue();
                    long count = ((Number) row[1]).longValue();
                    String teacherName = getTeacherName(teacherId);
                    return ScheduleStatsResp.TeacherScheduleCount.builder()
                            .teacherId(teacherId)
                            .teacherName(teacherName)
                            .count(count)
                            .build();
                })
                .collect(Collectors.toList());

        Map<String, Long> timeSlotDistribution = new LinkedHashMap<>();
        timeSlotDistribution.put("上午", 0L);
        timeSlotDistribution.put("下午", 0L);
        timeSlotDistribution.put("晚上", 0L);
        for (ScheduleEntity s : scheduleRepo.findAll()) {
            int hour = s.getStartTime().getHour();
            if (hour < 12) {
                timeSlotDistribution.put("上午", timeSlotDistribution.get("上午") + 1);
            } else if (hour < 18) {
                timeSlotDistribution.put("下午", timeSlotDistribution.get("下午") + 1);
            } else {
                timeSlotDistribution.put("晚上", timeSlotDistribution.get("晚上") + 1);
            }
        }

        return ScheduleStatsResp.builder()
                .totalCourses(totalCourses)
                .totalTeachers(totalTeachers)
                .totalClasses(totalClasses)
                .totalRooms(totalRooms)
                .weekdayDistribution(weekdayDistribution)
                .topTeachers(topTeachers)
                .timeSlotDistribution(timeSlotDistribution)
                .build();
    }

    @Override
    public Map<String, Object> exportSchedule(Integer week, String classId) {
        List<ScheduleEntity> entities = scheduleRepo.findByWeek(week);

        List<ScheduleVO> list = entities.stream()
                .filter(e -> classId == null || classId.equals(e.getClassId()))
                .map(this::toScheduleVO)
                .collect(Collectors.toList());

        ScheduleExportResp resp = ScheduleExportResp.builder()
                .courses(list)
                .totalCount(list.size())
                .build();

        return success(resp);
    }

    @Override
    @Transactional
    public Map<String, Object> importSchedule(List<ScheduleCreateReq> courses) {
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < courses.size(); i++) {
            ScheduleCreateReq req = courses.get(i);
            try {
                if (req.getCourseId() == null || req.getTeacherId() == null) {
                    failCount++;
                    errors.add("第" + (i + 1) + "条数据缺少必填字段");
                    continue;
                }

                ScheduleEntity entity = new ScheduleEntity();
                entity.setCourseId(req.getCourseId());
                entity.setTeacherId(req.getTeacherId());
                entity.setClassId(req.getClassId());
                entity.setRoomId(req.getRoomId());
                entity.setWeekday(req.getWeekday());
                entity.setStartTime(LocalTime.parse(req.getStartTime(), TIME_FORMATTER));
                entity.setEndTime(LocalTime.parse(req.getEndTime(), TIME_FORMATTER));
                entity.setDuration(req.getDuration());
                entity.setWeeks(req.getWeeks());
                entity.setColor(req.getColor());
                entity.setStudentCount(req.getStudentCount());
                scheduleRepo.save(entity);
                successCount++;
            } catch (Exception e) {
                failCount++;
                errors.add("第" + (i + 1) + "条数据导入失败: " + e.getMessage());
            }
        }

        log.info("导入排课完成，成功: {}, 失败: {}", successCount, failCount);

        ScheduleImportResp resp = ScheduleImportResp.builder()
                .successCount(successCount)
                .failCount(failCount)
                .errors(errors)
                .build();

        return success(resp);
    }

    // ========== private helpers ==========

    private ScheduleVO toScheduleVO(ScheduleEntity entity) {
        return ScheduleVO.builder()
                .id(entity.getScheduleId())
                .courseId(entity.getCourseId())
                .courseName(getCourseName(entity.getCourseId()))
                .teacherId(entity.getTeacherId())
                .teacherName(getTeacherName(entity.getTeacherId()))
                .classId(entity.getClassId())
                .className(entity.getClassId())
                .roomId(entity.getRoomId())
                .roomName(getRoomName(entity.getRoomId()))
                .weekday(entity.getWeekday())
                .startTime(entity.getStartTime().format(TIME_FORMATTER))
                .endTime(entity.getEndTime().format(TIME_FORMATTER))
                .duration(entity.getDuration())
                .weeks(entity.getWeeks())
                .color(entity.getColor())
                .studentCount(entity.getStudentCount())
                .build();
    }

    private String getCourseName(Long courseId) {
        if (courseId == null) return null;
        return courseRepo.findById(courseId)
                .map(CourseEntity::getName)
                .orElse(null);
    }

    private String getTeacherName(Long teacherId) {
        if (teacherId == null) return null;
        return teacherRepo.findById(teacherId)
                .map(TeacherEntity::getName)
                .orElse(null);
    }

    private String getRoomName(Long roomId) {
        if (roomId == null) return null;
        return roomRepo.findById(roomId)
                .map(RoomEntity::getName)
                .orElse(null);
    }

    private boolean isTimeOverlapping(LocalTime aStart, LocalTime aEnd, LocalTime bStart, LocalTime bEnd) {
        return aStart.isBefore(bEnd) && aEnd.isAfter(bStart);
    }

    private ScheduleConflictCheckResp.ConflictDetail buildConflict(ScheduleEntity s, String type, String description) {
        return ScheduleConflictCheckResp.ConflictDetail.builder()
                .scheduleId(s.getScheduleId())
                .type(type)
                .description(description)
                .courseId(s.getCourseId())
                .courseName(getCourseName(s.getCourseId()))
                .teacherId(s.getTeacherId())
                .teacherName(getTeacherName(s.getTeacherId()))
                .roomName(getRoomName(s.getRoomId()))
                .classId(s.getClassId())
                .weekday(s.getWeekday())
                .startTime(s.getStartTime().format(TIME_FORMATTER))
                .endTime(s.getEndTime().format(TIME_FORMATTER))
                .build();
    }

    private Map<String, Object> success(Object data) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", data);
        return result;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("message", message);
        return result;
    }
}
