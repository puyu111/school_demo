package org.example.school_demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.algorithm.SAConfig;
import org.example.school_demo.dto.algorithm.request.AutoScheduleRequest;
import org.example.school_demo.dto.algorithm.response.AutoScheduleResultVO;
import org.example.school_demo.dto.drag_schedule.response.CourseVO;
import org.example.school_demo.dto.smart_scheduling.*;
import org.example.school_demo.entity.*;
import org.example.school_demo.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 智能排课服务层。
 * 提供课程池、教师/班级/教室数据、排课 CRUD、冲突检测、时间推荐、自动排课、统计等功能。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmartSchedulingService {

    private static final String[] WEEKDAY_NAMES = {
            "", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    };
    private static final Map<String, Integer> NAME_TO_WEEKDAY = new HashMap<>();

    static {
        NAME_TO_WEEKDAY.put("monday", 1);
        NAME_TO_WEEKDAY.put("tuesday", 2);
        NAME_TO_WEEKDAY.put("wednesday", 3);
        NAME_TO_WEEKDAY.put("thursday", 4);
        NAME_TO_WEEKDAY.put("friday", 5);
        NAME_TO_WEEKDAY.put("saturday", 6);
        NAME_TO_WEEKDAY.put("sunday", 7);
    }

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final MajorRepository majorRepository;
    private final CourseSettingRepository courseSettingRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleHistoryRepository scheduleHistoryRepository;
    private final TimeSlotConfigRepository timeSlotConfigRepository;
    private final UnavailableDateRepository unavailableDateRepository;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;
    private final SimulatedAnnealingService simulatedAnnealingService;

    // ==================== 1. 基础数据 ====================

    /**
     * 获取待排课程池。
     */
    public List<CourseDTO> getCourses(String semesterId) {
        List<CourseEntity> courses = courseRepository.findAll();
        List<TeacherEntity> teachers = teacherRepository.findAll();
        List<Major> majors = majorRepository.findAll();
        List<CourseSetting> settings = courseSettingRepository.findAll();

        Map<String, CourseSetting> settingMap = settings.stream()
                .collect(Collectors.toMap(CourseSetting::getCourseName, s -> s, (a, b) -> a));

        // 教师可教课程映射: courseName -> teacher
        Map<String, TeacherEntity> courseTeacherMap = buildCourseTeacherMap(courses, teachers);

        // 专业课程映射: courseName -> major
        Map<String, Major> courseMajorMap = buildCourseMajorMap(courses, majors);

        List<CourseDTO> result = new ArrayList<>();
        for (CourseEntity course : courses) {
            TeacherEntity teacher = courseTeacherMap.get(course.getName());
            Major major = courseMajorMap.get(course.getName());
            CourseSetting setting = settingMap.get(course.getName());

            int duration = calcDurationInSlots(course);

            // 计算优先级：course_setting.priority 越低越优先，转成 1=最高
            int priority = setting != null ? setting.getPriority() : 5;

            result.add(CourseDTO.builder()
                    .id(course.getId() != null ? course.getId() : String.valueOf(course.getDbId()))
                    .name(course.getName())
                    .teacherId(teacher != null ? (teacher.getId() != null ? teacher.getId() : String.valueOf(teacher.getDbId())) : "")
                    .teacherName(teacher != null ? teacher.getName() : "")
                    .classId(major != null ? (major.getId() != null ? major.getId() : String.valueOf(major.getDbId())) : "")
                    .className(major != null ? major.getName() : "")
                    .duration(duration)
                    .priority(priority)
                    .courseType(course.getType())
                    .preferredTimes(Collections.emptyList())
                    .build());
        }
        return result;
    }

    /**
     * 获取教师列表。
     */
    public List<TeacherDTO> getTeachers() {
        List<TeacherEntity> teachers = teacherRepository.findAll();
        List<UnavailableDateEntity> unavailableDates = unavailableDateRepository.findAll();

        // 按 teacherId 分组不可用时间
        Map<String, List<UnavailableDateEntity>> udByTeacher = unavailableDates.stream()
                .collect(Collectors.groupingBy(UnavailableDateEntity::getTeacherId));

        List<TeacherDTO> result = new ArrayList<>();
        for (TeacherEntity t : teachers) {
            String tid = t.getId() != null ? t.getId() : String.valueOf(t.getDbId());
            List<UnavailableDateEntity> uds = udByTeacher.getOrDefault(tid, Collections.emptyList());

            List<TeacherDTO.UnavailableTime> unavailableTimes = new ArrayList<>();
            for (UnavailableDateEntity ud : uds) {
                // 将日期范围转换为 weekday + slots
                // 简化处理：标记全天所有时段
                for (int wd = 1; wd <= 5; wd++) {
                    List<Integer> allSlots = new ArrayList<>();
                    for (int s = 1; s <= 10; s++) allSlots.add(s);
                    unavailableTimes.add(TeacherDTO.UnavailableTime.builder()
                            .day(WEEKDAY_NAMES[wd])
                            .slots(allSlots)
                            .build());
                }
            }

            result.add(TeacherDTO.builder()
                    .id(tid)
                    .name(t.getName())
                    .department(t.getDegree()) // 用学历字段作为院系（可根据实际调整）
                    .maxDailyCourses(4)
                    .unavailableTimes(unavailableTimes.isEmpty() ? null : unavailableTimes)
                    .build());
        }
        return result;
    }

    /**
     * 获取班级列表。
     */
    public List<ClassDTO> getClasses() {
        List<Major> majors = majorRepository.findAll();
        List<ClassDTO> result = new ArrayList<>();
        for (Major m : majors) {
            result.add(ClassDTO.builder()
                    .id(m.getId() != null ? m.getId() : String.valueOf(m.getDbId()))
                    .name(m.getName())
                    .studentCount(m.getClassSize())
                    .maxDailyCourses(6)
                    .unavailableTimes(Collections.emptyList())
                    .build());
        }
        return result;
    }

    /**
     * 获取教室列表。
     */
    public List<RoomDTO> getRooms() {
        List<RoomEntity> rooms = roomRepository.findAll();
        List<RoomDTO> result = new ArrayList<>();
        for (RoomEntity r : rooms) {
            result.add(RoomDTO.builder()
                    .id(r.getId() != null ? r.getId() : String.valueOf(r.getDbId()))
                    .name(r.getName())
                    .capacity(r.getCapacity())
                    .type(r.getType())
                    .building(r.getBuilding())
                    .build());
        }
        return result;
    }

    // ==================== 2. 排课操作 ====================

    /**
     * 获取已排课程列表。
     */
    public List<ScheduleItemDTO> getSchedules(Integer week) {
        List<ScheduleEntity> schedules;
        if (week != null) {
            schedules = scheduleRepository.findByWeek(week);
        } else {
            schedules = scheduleRepository.findAll();
        }

        // 加载关联数据
        Map<Long, CourseEntity> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(CourseEntity::getDbId, c -> c));
        Map<Long, TeacherEntity> teacherMap = teacherRepository.findAll().stream()
                .collect(Collectors.toMap(TeacherEntity::getDbId, t -> t));
        Map<Long, RoomEntity> roomMap = roomRepository.findAll().stream()
                .collect(Collectors.toMap(RoomEntity::getDbId, r -> r));
        List<TimeSlotConfigEntity> timeSlots = timeSlotConfigRepository.findAll();

        List<ScheduleItemDTO> result = new ArrayList<>();
        for (ScheduleEntity s : schedules) {
            int slotNumber = findSlotNumber(s.getStartTime(), timeSlots);

            CourseEntity course = courseMap.get(s.getCourseId());
            TeacherEntity teacher = teacherMap.get(s.getTeacherId());
            RoomEntity room = s.getRoomId() != null ? roomMap.get(s.getRoomId()) : null;
            Major major = findMajorByClassId(s.getClassId());

            // 周次取第1个
            int weekNumber = (s.getWeeks() != null && !s.getWeeks().isEmpty()) ? s.getWeeks().get(0) : 1;

            result.add(ScheduleItemDTO.builder()
                    .id(String.valueOf(s.getScheduleId()))
                    .courseId(course != null ? (course.getId() != null ? course.getId() : String.valueOf(course.getDbId())) : "")
                    .courseName(course != null ? course.getName() : "未知课程")
                    .teacherId(teacher != null ? (teacher.getId() != null ? teacher.getId() : String.valueOf(teacher.getDbId())) : "")
                    .teacherName(teacher != null ? teacher.getName() : "未知教师")
                    .classId(s.getClassId() != null ? s.getClassId() : "")
                    .className(resolveClassName(s.getClassId(), major))
                    .roomId(room != null ? (room.getId() != null ? room.getId() : String.valueOf(room.getDbId())) : null)
                    .roomName(room != null ? room.getName() : null)
                    .day(WEEKDAY_NAMES[s.getWeekday()])
                    .slot(slotNumber)
                    .week(weekNumber)
                    .duration(calcDurationInSlotsByMinutes(s.getDuration()))
                    .build());
        }
        return result;
    }

    /**
     * 保存单个排课记录。
     */
    @Transactional
    public Map<String, Object> saveSchedule(String courseId, String day, int slot,
                                            Integer week, String roomId) {
        Integer wd = NAME_TO_WEEKDAY.get(day);
        if (wd == null) throw new IllegalArgumentException("无效的星期: " + day);
        if (slot < 1 || slot > 10) throw new IllegalArgumentException("节次必须在 1-10 之间");
        int weekVal = week != null ? week : 1;

        // 查找课程
        CourseEntity course = resolveCourse(courseId);
        if (course == null) throw new IllegalArgumentException("课程不存在: " + courseId);

        // 查找教师
        Long teacherDbId = findTeacherForCourse(course);
        if (teacherDbId == null) throw new IllegalArgumentException("课程 " + course.getName() + " 无对应教师");

        // 查找教室
        Long roomDbId = null;
        if (roomId != null && !roomId.isEmpty()) {
            roomDbId = resolveRoomDbId(roomId);
        }

        // 确定时段
        List<TimeSlotConfigEntity> timeSlots = timeSlotConfigRepository.findAll();
        int slotIndex = slot - 1;
        if (slotIndex >= timeSlots.size()) throw new IllegalArgumentException("节次超出范围");

        int durationSlots = calcDurationInSlots(course);
        int endSlotIndex = Math.min(slotIndex + durationSlots - 1, timeSlots.size() - 1);

        // 创建排课记录
        ScheduleEntity entity = new ScheduleEntity();
        entity.setCourseId(course.getDbId());
        entity.setTeacherId(teacherDbId);
        entity.setClassId(null); // 由 major 数据推断
        entity.setRoomId(roomDbId);
        entity.setWeekday(wd);
        entity.setWeeks(List.of(weekVal));
        entity.setStartTime(timeSlots.get(slotIndex).getStartTime());
        entity.setEndTime(timeSlots.get(endSlotIndex).getEndTime());
        entity.setDuration(calcMinutes(timeSlots.get(slotIndex).getStartTime(), timeSlots.get(endSlotIndex).getEndTime()));
        entity.setColor(generateColor(course.getDbId()));

        entity = scheduleRepository.save(entity);

        // 记录历史
        saveHistory("add", course, null, day, slot);

        Map<String, Object> result = new HashMap<>();
        result.put("id", String.valueOf(entity.getScheduleId()));
        return result;
    }

    /**
     * 批量保存排课记录。
     */
    @Transactional
    public BatchScheduleResultDTO batchSaveSchedules(BatchScheduleRequest request) {
        List<BatchScheduleResultDTO.DetailItem> details = new ArrayList<>();
        int successCount = 0;
        int failCount = 0;

        List<TimeSlotConfigEntity> timeSlots = timeSlotConfigRepository.findAll();
        Map<String, CourseEntity> courseCache = new HashMap<>();
        Map<String, Long> roomCache = new HashMap<>();

        if (request.getCourses() != null) {
            for (BatchScheduleRequest.CourseItem item : request.getCourses()) {
                try {
                    Integer wd = NAME_TO_WEEKDAY.get(item.getDay());
                    if (wd == null) throw new IllegalArgumentException("无效星期: " + item.getDay());

                    CourseEntity course = resolveCourseFromCache(item.getCourseId(), courseCache);
                    if (course == null) throw new IllegalArgumentException("课程不存在: " + item.getCourseId());

                    Long teacherDbId = findTeacherForCourse(course);
                    if (teacherDbId == null) throw new IllegalArgumentException("课程无对应教师");

                    Long roomDbId = null;
                    if (item.getRoomId() != null && !item.getRoomId().isEmpty()) {
                        roomDbId = roomCache.computeIfAbsent(item.getRoomId(), this::resolveRoomDbId);
                    }

                    int slotIndex = item.getSlot() - 1;
                    if (slotIndex < 0 || slotIndex >= timeSlots.size())
                        throw new IllegalArgumentException("节次超出范围");

                    int durationSlots = calcDurationInSlots(course);
                    int endIdx = Math.min(slotIndex + durationSlots - 1, timeSlots.size() - 1);
                    int weekVal = request.getWeek() != null ? request.getWeek() : 1;

                    ScheduleEntity entity = new ScheduleEntity();
                    entity.setCourseId(course.getDbId());
                    entity.setTeacherId(teacherDbId);
                    entity.setWeekday(wd);
                    entity.setWeeks(List.of(weekVal));
                    entity.setStartTime(timeSlots.get(slotIndex).getStartTime());
                    entity.setEndTime(timeSlots.get(endIdx).getEndTime());
                    entity.setDuration(calcMinutes(timeSlots.get(slotIndex).getStartTime(), timeSlots.get(endIdx).getEndTime()));
                    entity.setColor(generateColor(course.getDbId()));

                    entity = scheduleRepository.save(entity);

                    details.add(BatchScheduleResultDTO.DetailItem.builder()
                            .courseId(item.getCourseId())
                            .status("success")
                            .scheduleId(String.valueOf(entity.getScheduleId()))
                            .build());

                    saveHistory("add", course, null, item.getDay(), item.getSlot());
                    successCount++;
                } catch (Exception e) {
                    log.warn("批量保存失败: courseId={}, {}", item.getCourseId(), e.getMessage());
                    details.add(BatchScheduleResultDTO.DetailItem.builder()
                            .courseId(item.getCourseId())
                            .status("failed")
                            .error(e.getMessage())
                            .build());
                    failCount++;
                }
            }
        }

        return BatchScheduleResultDTO.builder()
                .scheduled(successCount)
                .failed(failCount)
                .details(details)
                .build();
    }

    /**
     * 删除排课记录。
     */
    @Transactional
    public Map<String, Object> deleteSchedule(String id) {
        Long scheduleId = Long.parseLong(id);
        ScheduleEntity entity = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("排课记录不存在: " + id));

        String courseName = courseRepository.findById(entity.getCourseId())
                .map(CourseEntity::getName).orElse("未知课程");

        scheduleRepository.delete(entity);

        Map<String, Object> result = new HashMap<>();
        result.put("deletedId", id);
        result.put("courseId", String.valueOf(entity.getCourseId()));
        result.put("courseName", courseName);
        return result;
    }

    /**
     * 清空排课。
     */
    @Transactional
    public Map<String, Object> clearSchedules(String semesterId) {
        List<ScheduleEntity> all = scheduleRepository.findAll();
        long count = all.size();

        if (semesterId != null) {
            // 按学期清空：这里简化处理，全部清空
            scheduleRepository.deleteAll();
        } else {
            scheduleRepository.deleteAll();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("deletedCount", count);
        result.put("semesterId", semesterId);
        return result;
    }

    // ==================== 3. 智能排课 ====================

    /**
     * 一键智能排课（贪心算法）。
     */
    @Transactional
    public AutoArrangeResultDTO autoArrange(String strategy, Integer week) {
        int weekVal = week != null ? week : 1;

        // 使用模拟退火算法进行排课
        AutoScheduleRequest request = new AutoScheduleRequest();
        request.setWeek(weekVal);

        // strategy 影响退火参数：priority → 标准配置，balanced → 更多迭代找均衡解
        if ("balanced".equals(strategy)) {
            SAConfig config = new SAConfig();
            config.setInitialTemp(200);
            config.setCoolingRate(0.998);
            config.setMinTemp(0.1);
            config.setMaxIterations(200000);
            config.setRestartCount(5);
            request.setConfig(config);
        }

        AutoScheduleResultVO annealResult;
        try {
            annealResult = simulatedAnnealingService.autoSchedule(request, true);
        } catch (Exception e) {
            log.error("模拟退火排课失败", e);
            return AutoArrangeResultDTO.builder()
                    .scheduled(Collections.emptyList())
                    .failed(Collections.emptyList())
                    .stats(AutoArrangeResultDTO.Stats.builder().scheduled(0).failed(0).total(0).successRate(0).build())
                    .build();
        }

        // 将退火结果转换为前端期望的格式
        List<AutoArrangeResultDTO.ScheduledItem> scheduled = new ArrayList<>();
        List<TimeSlotConfigEntity> timeSlots = timeSlotConfigRepository.findAll();

        Map<String, CourseEntity> courseBizIdMap = new HashMap<>();
        for (CourseEntity ce : courseRepository.findAll()) {
            String bizId = ce.getId() != null ? ce.getId() : String.valueOf(ce.getDbId());
            courseBizIdMap.put(bizId, ce);
        }

        if (annealResult.getSchedules() != null) {
            for (CourseVO cv : annealResult.getSchedules()) {
                int slotNumber = findSlotNumber(
                        cv.getStartTime() != null ? LocalTime.parse(cv.getStartTime()) : null,
                        timeSlots);

                String bizCourseId = "";
                if (cv.getId() != null && courseBizIdMap.containsKey(cv.getId())) {
                    bizCourseId = cv.getId();
                } else {
                    // 通过 courseName 查找业务 ID
                    for (Map.Entry<String, CourseEntity> e : courseBizIdMap.entrySet()) {
                        if (e.getValue().getName().equals(cv.getCourseName())) {
                            bizCourseId = e.getKey();
                            break;
                        }
                    }
                }

                scheduled.add(AutoArrangeResultDTO.ScheduledItem.builder()
                        .courseId(bizCourseId)
                        .courseName(cv.getCourseName())
                        .day(cv.getWeekDay() != null && cv.getWeekDay() >= 1 && cv.getWeekDay() <= 7
                                ? WEEKDAY_NAMES[cv.getWeekDay()] : "monday")
                        .slot(slotNumber)
                        .week(weekVal)
                        .duration(cv.getDuration() != null ? (int) Math.ceil(cv.getDuration() / 45.0) : 1)
                        .build());
            }
        }

        // 退火算法总是能排完所有课程（有冲突则通过高权重惩罚），无严格"失败"概念
        int total = scheduled.size();
        return AutoArrangeResultDTO.builder()
                .scheduled(scheduled)
                .failed(Collections.emptyList())
                .stats(AutoArrangeResultDTO.Stats.builder()
                        .scheduled(total)
                        .failed(0)
                        .total(total)
                        .successRate(100.0)
                        .build())
                .build();
    }

    /**
     * 检测时间冲突。
     */
    public ConflictResultDTO checkConflict(String courseId, String day, int slot, Integer week) {
        Integer wd = NAME_TO_WEEKDAY.get(day);
        if (wd == null) throw new IllegalArgumentException("无效星期: " + day);
        int weekVal = week != null ? week : 1;

        CourseEntity course = resolveCourse(courseId);
        int duration = course != null ? calcDurationInSlots(course) : 2;
        Long teacherDbId = course != null ? findTeacherForCourse(course) : null;

        List<ConflictResultDTO.ConflictItem> conflicts = new ArrayList<>();

        // 加载该周的所有排课
        List<ScheduleEntity> weekSchedules = scheduleRepository.findByWeek(weekVal);
        Map<Long, CourseEntity> courseMap = courseRepository.findAll().stream()
                .collect(Collectors.toMap(CourseEntity::getDbId, c -> c));

        // 教师冲突
        if (teacherDbId != null) {
            for (ScheduleEntity s : weekSchedules) {
                if (s.getTeacherId().equals(teacherDbId) && s.getWeekday() == wd) {
                    if (timeOverlap(slot, duration, s.getStartTime(), timeSlotConfigRepository.findAll())) {
                        CourseEntity existing = courseMap.get(s.getCourseId());
                        conflicts.add(ConflictResultDTO.ConflictItem.builder()
                                .type("teacher")
                                .message("教师" + (existing != null ? existing.getName() : "") +
                                        "在" + day + "第" + slot + "节已有课程安排")
                                .existingCourse(ConflictResultDTO.ConflictItem.ExistingCourse.builder()
                                        .courseId(existing != null ? (existing.getId() != null ? existing.getId() : String.valueOf(existing.getDbId())) : "")
                                        .courseName(existing != null ? existing.getName() : "")
                                        .day(day)
                                        .slot(findSlotNumber(s.getStartTime(), timeSlotConfigRepository.findAll()))
                                        .build())
                                .build());
                    }
                }
            }
        }

        boolean hasConflict = !conflicts.isEmpty();
        return ConflictResultDTO.builder()
                .hasConflict(hasConflict)
                .conflicts(conflicts)
                .build();
    }

    /**
     * 推荐排课时间。
     */
    public List<TimeRecommendationDTO> recommendTime(String courseId) {
        CourseEntity course = resolveCourse(courseId);
        if (course == null) return Collections.emptyList();

        Long teacherDbId = findTeacherForCourse(course);
        int duration = calcDurationInSlots(course);
        List<TimeSlotConfigEntity> timeSlots = timeSlotConfigRepository.findAll();
        List<Integer> weekdays = List.of(1, 2, 3, 4, 5);

        List<TimeRecommendationDTO> recommendations = new ArrayList<>();

        for (int wd : weekdays) {
            for (int si = 0; si <= timeSlots.size() - duration; si++) {
                boolean conflict = hasConflict(teacherDbId, null, null, wd, si, duration, 1);
                if (conflict) continue;

                int score = 70;
                String reason = "可用";

                // 上午时段加分
                String halfDay = timeSlots.get(si).getHalfDayType();
                if ("morning".equals(halfDay) && "必修".equals(course.getType())) {
                    score += 20;
                    reason = "上午时段，教师可用";
                } else if ("morning".equals(halfDay)) {
                    score += 15;
                    reason = "上午时段，教师可用";
                } else if ("afternoon".equals(halfDay)) {
                    score += 5;
                    reason = "下午时段，可用";
                }

                // 周一/周二加分
                if (wd <= 2) score += 5;

                recommendations.add(TimeRecommendationDTO.builder()
                        .day(WEEKDAY_NAMES[wd])
                        .slot(si + 1)
                        .reason(reason)
                        .score(score)
                        .build());
            }
        }

        recommendations.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));
        return recommendations.stream().limit(10).collect(Collectors.toList());
    }

    // ==================== 4. 统计与导出 ====================

    /**
     * 获取排课统计数据。
     */
    public ScheduleStatsDTO getStats(String semesterId) {
        long totalCourses = courseRepository.count();
        long totalTeachers = teacherRepository.count();
        long totalClasses = majorRepository.count();
        long totalSchedules = scheduleRepository.count();

        // 计算活跃教师
        Set<Long> activeTeacherIds = scheduleRepository.findAll().stream()
                .map(ScheduleEntity::getTeacherId)
                .collect(Collectors.toSet());

        // 计算被覆盖班级
        Set<String> coveredClassIds = scheduleRepository.findAll().stream()
                .map(ScheduleEntity::getClassId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 时段利用率
        int totalSlots = 5 * 10; // 5天 × 10节
        Set<String> usedSlots = new HashSet<>();
        for (ScheduleEntity s : scheduleRepository.findAll()) {
            usedSlots.add(s.getWeekday() + "-" + findSlotNumber(s.getStartTime(), timeSlotConfigRepository.findAll()));
        }

        double completionRate = totalCourses > 0
                ? Math.round((double) totalSchedules / totalCourses * 1000.0) / 10.0 : 0;
        double teacherUtilRate = totalTeachers > 0
                ? Math.round((double) activeTeacherIds.size() / totalTeachers * 1000.0) / 10.0 : 0;
        double classCoverRate = totalClasses > 0
                ? Math.round((double) coveredClassIds.size() / totalClasses * 1000.0) / 10.0 : 0;
        double slotUtilRate = totalSlots > 0
                ? Math.round((double) usedSlots.size() / totalSlots * 1000.0) / 10.0 : 0;

        return ScheduleStatsDTO.builder()
                .totalCourses((int) totalCourses)
                .scheduledCourses((int) totalSchedules)
                .pendingCourses((int) (totalCourses - totalSchedules))
                .completionRate(completionRate)
                .teacherStats(ScheduleStatsDTO.TeacherStats.builder()
                        .totalTeachers((int) totalTeachers)
                        .activeTeachers(activeTeacherIds.size())
                        .utilizationRate(teacherUtilRate)
                        .build())
                .classStats(ScheduleStatsDTO.ClassStats.builder()
                        .totalClasses((int) totalClasses)
                        .coveredClasses(coveredClassIds.size())
                        .coverageRate(classCoverRate)
                        .build())
                .timeSlotStats(ScheduleStatsDTO.TimeSlotStats.builder()
                        .totalSlots(totalSlots)
                        .usedSlots(usedSlots.size())
                        .utilizationRate(slotUtilRate)
                        .build())
                .build();
    }

    /**
     * 导出排课表（返回下载信息）。
     */
    public ExportResultDTO exportSchedule(String format, Integer week, String type) {
        String fmt = format != null ? format : "excel";
        List<ScheduleItemDTO> schedules = getSchedules(week);
        String fileName = "排课表" + (week != null ? "_第" + week + "周" : "_全部") + "." + fmt;
        String downloadUrl = "/api/smart-scheduling/export/download/" + fileName;

        return ExportResultDTO.builder()
                .downloadUrl(downloadUrl)
                .fileName(fileName)
                .format(fmt)
                .exportedAt(LocalDateTime.now().toString())
                .totalCourses(schedules.size())
                .build();
    }

    /**
     * 获取操作历史。
     */
    public HistoryResultDTO getHistory(int page, int pageSize) {
        Page<ScheduleHistoryEntity> p = scheduleHistoryRepository
                .findAllByOrderByTimestampDesc(PageRequest.of(page - 1, pageSize));

        List<HistoryResultDTO.HistoryItem> list = p.getContent().stream()
                .map(h -> HistoryResultDTO.HistoryItem.builder()
                        .id(String.valueOf(h.getId()))
                        .action(h.getAction())
                        .courseId(h.getCourseId() != null ? String.valueOf(h.getCourseId()) : null)
                        .courseName(h.getCourseName())
                        .teacherName(h.getTeacherName())
                        .className(h.getClassName())
                        .day(h.getDay())
                        .slot(h.getSlot())
                        .timestamp(h.getTimestamp() != null ? h.getTimestamp().toString() : "")
                        .operator(h.getOperator())
                        .build())
                .collect(Collectors.toList());

        return HistoryResultDTO.builder()
                .list(list)
                .total(p.getTotalElements())
                .page(page)
                .pageSize(pageSize)
                .build();
    }

    // ==================== 辅助方法 ====================

    private Map<String, TeacherEntity> buildCourseTeacherMap(List<CourseEntity> courses, List<TeacherEntity> teachers) {
        Map<String, TeacherEntity> result = new HashMap<>();

        // 1. 从 teacher.courses JSON 建立映射
        for (TeacherEntity teacher : teachers) {
            if (teacher.getCourses() == null || teacher.getCourses().isBlank()) continue;
            try {
                List<String> teacherCourseNames = objectMapper.readValue(
                        teacher.getCourses(), new TypeReference<List<String>>() {});
                for (String tcn : teacherCourseNames) {
                    result.putIfAbsent(tcn, teacher);
                }
            } catch (Exception e) {
                log.warn("解析教师 {} 的 courses 字段失败", teacher.getName(), e);
            }
        }

        // 2. 从已有排课回退
        for (ScheduleEntity s : scheduleRepository.findAll()) {
            for (CourseEntity c : courses) {
                if (c.getDbId().equals(s.getCourseId())) {
                    TeacherEntity t = findTeacherById(teachers, s.getTeacherId());
                    if (t != null) result.putIfAbsent(c.getName(), t);
                }
            }
        }

        return result;
    }

    private Map<String, Major> buildCourseMajorMap(List<CourseEntity> courses, List<Major> majors) {
        Map<String, Major> result = new HashMap<>();
        Set<String> courseNames = courses.stream().map(CourseEntity::getName).collect(Collectors.toSet());

        for (Major major : majors) {
            if (major.getCourses() == null || major.getCourses().isBlank()) continue;
            try {
                List<String> majorCourses = objectMapper.readValue(
                        major.getCourses(), new TypeReference<List<String>>() {});
                for (String cn : majorCourses) {
                    if (courseNames.contains(cn) && !result.containsKey(cn)) {
                        result.put(cn, major);
                    }
                }
            } catch (Exception e) {
                log.warn("解析专业 {} 的课程列表失败", major.getName(), e);
            }
        }
        return result;
    }

    private TeacherEntity findTeacherById(List<TeacherEntity> teachers, Long dbId) {
        return teachers.stream().filter(t -> t.getDbId().equals(dbId)).findFirst().orElse(null);
    }

    private Major findMajorByClassId(String classId) {
        if (classId == null) return null;
        return majorRepository.findAll().stream()
                .filter(m -> classId.equals(m.getId()))
                .findFirst().orElse(null);
    }

    private String resolveClassName(String classId, Major major) {
        if (classId != null) {
            if (major != null) return major.getName();
            return "班级-" + classId;
        }
        return "未分配";
    }

    private Long resolveCourseDbId(String bizId) {
        CourseEntity c = resolveCourse(bizId);
        return c != null ? c.getDbId() : null;
    }

    private CourseEntity resolveCourse(String bizId) {
        // 先按业务 ID (如 C001) 查找
        List<CourseEntity> all = courseRepository.findAll();
        for (CourseEntity c : all) {
            if (bizId.equals(c.getId())) return c;
        }
        // 再按数字 dbId 查找
        try {
            Long dbId = Long.parseLong(bizId);
            return courseRepository.findById(dbId).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private CourseEntity resolveCourseFromCache(String bizId, Map<String, CourseEntity> cache) {
        return cache.computeIfAbsent(bizId, this::resolveCourse);
    }

    private Long resolveTeacherDbId(String bizId) {
        TeacherEntity t = teacherRepository.findByBusinessId(bizId).orElse(null);
        if (t != null) return t.getDbId();
        try {
            return Long.parseLong(bizId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long resolveRoomDbId(String bizId) {
        RoomEntity r = roomRepository.findById(bizId).orElse(null);
        if (r != null) return r.getDbId();
        try {
            return Long.parseLong(bizId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long findTeacherForCourse(CourseEntity course) {
        // 从 teacher.courses JSON 查找能教该课程的教师
        List<TeacherEntity> teachers = teacherRepository.findAll();
        for (TeacherEntity teacher : teachers) {
            if (teacher.getCourses() == null || teacher.getCourses().isBlank()) continue;
            try {
                List<String> teacherCourses = objectMapper.readValue(
                        teacher.getCourses(), new TypeReference<List<String>>() {});
                if (teacherCourses.contains(course.getName())) {
                    return teacher.getDbId();
                }
            } catch (Exception e) {
                // ignore
            }
        }
        // 从已有排课回退
        return scheduleRepository.findAll().stream()
                .filter(s -> s.getCourseId().equals(course.getDbId()))
                .findFirst()
                .map(ScheduleEntity::getTeacherId)
                .orElse(null);
    }

    private int calcDurationInSlots(CourseEntity course) {
        if (course.getTotalHours() == null) return 2;
        // 按 16 周计算，每周课时 = totalHours / 16，再转换成 slot 数（每 slot 约 45 分钟）
        int weeklyHours = Math.max(1, course.getTotalHours() / 16);
        return Math.max(1, weeklyHours / 45);
    }

    private int calcDurationInSlotsByMinutes(int minutes) {
        return Math.max(1, minutes / 45);
    }

    private int calcMinutes(LocalTime start, LocalTime end) {
        return (int) (end.toSecondOfDay() - start.toSecondOfDay()) / 60;
    }

    private int findSlotNumber(LocalTime time, List<TimeSlotConfigEntity> timeSlots) {
        if (time == null || timeSlots == null) return 1;
        for (int i = 0; i < timeSlots.size(); i++) {
            if (timeSlots.get(i).getStartTime().equals(time)) {
                return i + 1;
            }
        }
        // 若未精确匹配，找最近的
        for (int i = 0; i < timeSlots.size(); i++) {
            if (!timeSlots.get(i).getStartTime().isAfter(time)) {
                if (i + 1 < timeSlots.size() && timeSlots.get(i + 1).getStartTime().isAfter(time)) {
                    return i + 1;
                }
            }
        }
        return 1;
    }

    private boolean timeOverlap(int slot, int duration, LocalTime existingStart,
                                List<TimeSlotConfigEntity> timeSlots) {
        int startIdx = slot - 1;
        int endIdx = startIdx + duration - 1;
        if (startIdx >= timeSlots.size() || endIdx < 0) return false;
        LocalTime newStart = timeSlots.get(Math.max(0, startIdx)).getStartTime();
        LocalTime newEnd = timeSlots.get(Math.min(timeSlots.size() - 1, endIdx)).getEndTime();

        return existingStart.isBefore(newEnd) && existingStart.isAfter(newStart)
                || existingStart.equals(newStart);
    }

    private boolean hasConflict(Long teacherDbId, String classId, Long roomDbId,
                                int weekday, int startSlotIdx, int duration, int week) {
        List<ScheduleEntity> weekSchedules = scheduleRepository.findByWeek(week);
        List<TimeSlotConfigEntity> timeSlots = timeSlotConfigRepository.findAll();

        for (ScheduleEntity s : weekSchedules) {
            if (s.getWeekday() != weekday) continue;

            // 教师冲突
            if (teacherDbId != null && s.getTeacherId().equals(teacherDbId)) {
                int existingSlot = findSlotNumber(s.getStartTime(), timeSlots);
                int existingEnd = existingSlot + calcDurationInSlotsByMinutes(s.getDuration()) - 1;
                int newEnd = startSlotIdx + duration;
                if (startSlotIdx < existingEnd && newEnd > existingSlot) {
                    return true;
                }
            }
        }
        return false;
    }

    private String generateColor(Long courseId) {
        String[] colors = {"#4FC3F7", "#81C784", "#FFB74D", "#BA68C8",
                "#FF8A65", "#4DB6AC", "#F06292", "#AED581"};
        return colors[(int) (courseId % colors.length)];
    }

    private void saveHistory(String action, CourseEntity course, String courseName,
                             String day, Integer slot) {
        ScheduleHistoryEntity history = new ScheduleHistoryEntity();
        history.setAction(action);
        if (course != null) {
            history.setCourseId(course.getDbId());
            history.setCourseName(course.getName());
        } else {
            history.setCourseName(courseName);
        }
        history.setDay(day);
        history.setSlot(slot);
        history.setOperator("admin");
        scheduleHistoryRepository.save(history);
    }
}
