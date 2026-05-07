package org.example.school_demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.algorithm.RuleEvaluator;
import org.example.school_demo.algorithm.SAConfig;
import org.example.school_demo.algorithm.ScheduleSlot;
import org.example.school_demo.algorithm.Solution;
import org.example.school_demo.dto.algorithm.request.AutoScheduleRequest;
import org.example.school_demo.dto.algorithm.response.AutoScheduleResultVO;
import org.example.school_demo.dto.drag_schedule.response.CourseVO;
import org.example.school_demo.entity.Calendar;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.entity.CourseSetting;
import org.example.school_demo.entity.DisabledDate;
import org.example.school_demo.entity.Major;
import org.example.school_demo.entity.RoomEntity;
import org.example.school_demo.entity.RuleWeightEntity;
import org.example.school_demo.entity.ScheduleEntity;
import org.example.school_demo.entity.TeacherEntity;
import org.example.school_demo.entity.TimeSlotConfigEntity;
import org.example.school_demo.entity.UnavailableDateEntity;
import org.example.school_demo.entity.WeekDayConfigEntity;
import org.example.school_demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 基于模拟退火的自动排课服务。
 * <p>
 * 完整集成 course_setting / major / calendar / disabled_date 等数据库表，
 * 规则评估使用 database 中 rule_weight 表的当前权重。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SimulatedAnnealingService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final String[] COLORS = {
            "#4FC3F7", "#81C784", "#FFB74D", "#BA68C8",
            "#FF8A65", "#4DB6AC", "#F06292", "#AED581"
    };
    private static final ZoneId TZ = ZoneId.of("Asia/Shanghai");

    private final ScheduleRepository scheduleRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotConfigRepository timeSlotConfigRepository;
    private final WeekDayConfigRepository weekDayConfigRepository;
    private final RuleWeightRepository ruleWeightRepository;
    private final UnavailableDateRepository unavailableDateRepository;

    // ----- 新增仓库 -----
    private final CourseSettingRepository courseSettingRepository;
    private final MajorRepository majorRepository;
    private final CalendarRepository calendarRepository;
    private final DisabledDateRepository disabledDateRepository;

    private final EntityManager entityManager;
    private final TransactionTemplate transactionTemplate;
    private final ObjectMapper objectMapper;

    // ==================== 主入口 ====================

    /**
     * 执行自动排课。
     *
     * @param request 排课请求
     * @param persist 是否写入数据库
     * @return 排课结果
     */
    public AutoScheduleResultVO autoSchedule(AutoScheduleRequest request, boolean persist) {
        long startTime = System.currentTimeMillis();

        // 1. 参数校验
        if (request.getWeek() == null || request.getWeek() < 1) {
            throw new IllegalArgumentException("week 参数无效，必须 >= 1");
        }
        int week = request.getWeek();
        SAConfig config = request.getConfig() != null ? request.getConfig() : SAConfig.defaults();

        // 2. 加载输入数据
        InputData data = loadInputData(week, request.getCourseIds(), request.getRuleOverrides());

        if (data.courseSessions.isEmpty()) {
            AutoScheduleResultVO result = new AutoScheduleResultVO();
            result.setSchedules(Collections.emptyList());
            result.setMessage("没有需要排课的课程");
            result.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            return result;
        }

        // 3. 多次重启取最优
        Solution bestOverall = null;
        int totalIterations = 0;
        int totalAccepted = 0;
        int totalRejected = 0;

        for (int restart = 0; restart < config.getRestartCount(); restart++) {
            log.info("退火第 {} 次重启", restart + 1);

            Solution initial = buildInitialSolution(data);
            data.evaluator.calculateCost(initial);

            AnnealingResult ar = runAnnealing(initial, config, data);
            totalIterations += ar.iterations;
            totalAccepted += ar.acceptedCount;
            totalRejected += ar.rejectedCount;

            if (bestOverall == null || ar.best.getCost() < bestOverall.getCost()) {
                bestOverall = ar.best;
            }
        }

        log.info("退火完成，最优代价: {}", bestOverall.getCost());

        // 4. 持久化
        if (persist && bestOverall.getCost() < Double.MAX_VALUE) {
            persistSolution(bestOverall, week, data);
        }

        // 5. 构建返回
        AutoScheduleResultVO result = new AutoScheduleResultVO();
        result.setTotalCost(bestOverall.getCost());
        result.setIterations(totalIterations);
        result.setRuleScores(bestOverall.getRuleScores());
        result.setAcceptedCount(totalAccepted);
        result.setRejectedCount(totalRejected);
        result.setExecutionTimeMs(System.currentTimeMillis() - startTime);

        List<CourseVO> courseVOs = convertToCourseVOs(bestOverall, data);
        result.setSchedules(courseVOs);

        int hardViolations = countHardViolations(bestOverall.getRuleScores());
        if (hardViolations == 0) {
            result.setMessage("排课完成，无硬冲突，共 " + courseVOs.size() + " 条排课记录");
        } else {
            result.setMessage("排课完成，存在 " + hardViolations + " 个硬冲突，建议调整参数后重试");
        }

        return result;
    }

    // ==================== 数据加载 ====================

    @Data
    private static class InputData {
        List<CourseSession> courseSessions;
        List<TimeSlotConfigEntity> timeSlots;
        List<Integer> enabledWeekdays;
        Map<Long, RoomEntity> roomMap;
        List<Long> roomIds;
        RuleEvaluator evaluator;
        /** 学期日历：week -> 该周实际日期区间 */
        LocalDate semesterStart;
        /** 学期总周数 */
        int totalWeeks;
    }

    /**
     * 课程 session：一门课需要排的单次课。
     */
    @Data
    private static class CourseSession {
        final Long courseId;
        final Long teacherId;
        final String classId;
        final int durationSlots;
        /** 排课优先级（数字越小越优先），来自 course_setting */
        final int priority;
        /** 课程类型（必修/选修/限选/实验），来自 course.type */
        final String courseType;
        /** 学生人数，来自 major.class_size */
        final int studentCount;
        /** 课程名称 */
        final String courseName;
    }

    private InputData loadInputData(int week, List<Long> courseIds, Map<String, Integer> ruleOverrides) {
        InputData data = new InputData();

        // ---------- 时间段 ----------
        data.timeSlots = timeSlotConfigRepository.findAll().stream()
                .filter(ts -> Boolean.TRUE.equals(ts.getIsSchedulable()) && !Boolean.TRUE.equals(ts.getIsBreak()))
                .sorted(Comparator.comparing(TimeSlotConfigEntity::getStartTime))
                .collect(Collectors.toList());

        // ---------- 工作日 ----------
        List<WeekDayConfigEntity> allWeekdays = weekDayConfigRepository.findAll();
        Set<Integer> schedulableWeekdays = allWeekdays.stream()
                .filter(wd -> Boolean.TRUE.equals(wd.getIsEnabled()) && Boolean.TRUE.equals(wd.getIsSchedulable()))
                .map(WeekDayConfigEntity::getId)
                .collect(Collectors.toSet());

        // ---------- 日历 & 禁用日期 ----------
        List<Calendar> calendars = calendarRepository.findAll();
        if (!calendars.isEmpty()) {
            Calendar cal = calendars.get(0);
            data.semesterStart = cal.getStartDate();

            // 计算总周数
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(cal.getStartDate(), cal.getEndDate());
            data.totalWeeks = Math.max(1, (int) Math.ceil(daysBetween / 7.0));

            // 计算该周的实际日期区间
            LocalDate weekStart = data.semesterStart.plusWeeks(week - 1);
            LocalDate weekEnd = weekStart.plusDays(6);

            // 加载禁用日期并排除对应 weekday
            List<DisabledDate> disabledDates = disabledDateRepository.findByCalendarId(
                    calendars.get(0).getCalendarId());
            Set<LocalDate> disabledDateSet = disabledDates.stream()
                    .map(DisabledDate::getDate)
                    .collect(Collectors.toSet());

            // 遍历该周每一天，检查是否被禁用
            LocalDate day = weekStart;
            while (!day.isAfter(weekEnd)) {
                if (disabledDateSet.contains(day)) {
                    int weekday = day.getDayOfWeek().getValue(); // 1=Mon, 7=Sun
                    schedulableWeekdays.remove(weekday);
                    log.info("禁用日期 {} (星期{}) 已从可排课日中移除", day, weekday);
                }
                day = day.plusDays(1);
            }
        }
        if (data.totalWeeks == 0) {
            data.totalWeeks = 16;
        }
        data.enabledWeekdays = schedulableWeekdays.stream().sorted().collect(Collectors.toList());

        // ---------- 教室 ----------
        List<RoomEntity> rooms = roomRepository.findAll();
        data.roomMap = rooms.stream().collect(Collectors.toMap(RoomEntity::getDbId, r -> r));
        data.roomIds = rooms.stream().map(RoomEntity::getDbId).collect(Collectors.toList());

        // ---------- 课程 ----------
        List<CourseEntity> courses;
        if (courseIds != null && !courseIds.isEmpty()) {
            courses = courseIds.stream()
                    .map(courseRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toList());
        } else {
            courses = courseRepository.findAll();
        }

        // ---------- 课程设置 (course_setting) ----------
        List<CourseSetting> allSettings = courseSettingRepository.findAll();
        Map<String, CourseSetting> settingByName = new HashMap<>();
        for (CourseSetting cs : allSettings) {
            settingByName.put(cs.getCourseName(), cs);
        }

        // ---------- 专业数据 (major) ----------
        List<Major> majors = majorRepository.findAll();
        // 构建 courseName -> (classId, studentCount) 映射
        Map<String, MajorClassInfo> courseMajorMap = buildCourseMajorMap(majors, courses);

        // ---------- 课程-教师映射 ----------
        Map<Long, Long> courseTeacherMap = buildCourseTeacherMap(courses);

        // ---------- 构建 CourseSession ----------
        data.courseSessions = new ArrayList<>();
        for (CourseEntity course : courses) {
            Long teacherId = courseTeacherMap.get(course.getDbId());
            if (teacherId == null) {
                log.warn("课程 {} 未找到对应教师，跳过", course.getName());
                continue;
            }

            int slotDuration = data.timeSlots.isEmpty() ? 45 : data.timeSlots.get(0).getDuration();
            int totalWeeksForCalc = data.totalWeeks > 0 ? data.totalWeeks : 16;
            int weeklyHours = Math.max(1, course.getTotalHours() / totalWeeksForCalc);
            int sessionCount = Math.max(1, weeklyHours / slotDuration);

            // 优先级
            CourseSetting setting = settingByName.get(course.getName());
            int priority = (setting != null) ? setting.getPriority() : 50;

            // 学生人数 & 班级
            MajorClassInfo mci = courseMajorMap.get(course.getName());
            int studentCount = (mci != null) ? mci.classSize : 40;
            String classId = (mci != null) ? mci.classId : null;

            for (int i = 0; i < sessionCount; i++) {
                data.courseSessions.add(new CourseSession(
                        course.getDbId(), teacherId, classId, 1,
                        priority, course.getType(), studentCount, course.getName()));
            }
        }

        // 按优先级排序（高优先级在前）
        data.courseSessions.sort(Comparator.comparingInt(CourseSession::getPriority));

        // ---------- 规则权重 ----------
        Map<String, Integer> weights = new HashMap<>();
        for (RuleWeightEntity rw : ruleWeightRepository.findAll()) {
            if (Boolean.TRUE.equals(rw.getEnabled())) {
                weights.put(rw.getId(), rw.getCurrentWeight());
            }
        }
        if (ruleOverrides != null) {
            weights.putAll(ruleOverrides);
        }

        // ---------- 教师不可用时段 ----------
        Map<Long, Set<Integer>> teacherUnavailable = buildTeacherUnavailableSlots(data, week);

        // ---------- 课程类型 & 学生数 map（给 evaluator） ----------
        Map<Long, String> courseTypeMap = new HashMap<>();
        Map<Long, Integer> courseStudentMap = new HashMap<>();
        for (CourseSession cs : data.courseSessions) {
            courseTypeMap.putIfAbsent(cs.getCourseId(), cs.getCourseType());
            courseStudentMap.putIfAbsent(cs.getCourseId(), cs.getStudentCount());
        }

        // ---------- RuleEvaluator ----------
        data.evaluator = new RuleEvaluator(
                weights, data.timeSlots, data.roomMap,
                teacherUnavailable, courseTypeMap, courseStudentMap);

        log.info("数据加载完成：{} 门课程需要排课，{} 个可用工作日，{} 间教室",
                data.courseSessions.size(), data.enabledWeekdays.size(), data.roomIds.size());
        return data;
    }

    /**
     * courseName -> (classId, classSize) 映射。
     */
    @Data
    private static class MajorClassInfo {
        final String classId;
        final int classSize;
    }

    private Map<String, MajorClassInfo> buildCourseMajorMap(List<Major> majors, List<CourseEntity> courses) {
        Map<String, MajorClassInfo> result = new HashMap<>();
        Set<String> courseNames = courses.stream().map(CourseEntity::getName).collect(Collectors.toSet());

        for (Major major : majors) {
            if (major.getCourses() == null || major.getCourses().isBlank()) continue;
            try {
                List<String> majorCourses = objectMapper.readValue(
                        major.getCourses(), new TypeReference<List<String>>() {});
                boolean assigned = false;
                for (String cn : majorCourses) {
                    if (courseNames.contains(cn) && !result.containsKey(cn)) {
                        result.put(cn, new MajorClassInfo(major.getId(), major.getClassSize()));
                        assigned = true;
                    }
                }
            } catch (Exception e) {
                log.warn("解析专业 {} 的课程列表失败", major.getName(), e);
            }
        }
        return result;
    }

    /**
     * 构建课程-教师映射：优先使用 teacher.courses JSON 字段。<p>
     * 若 teacher.courses 包含课程名称，则建立映射。
     * 若仍有课程无对应教师，则从已有排课记录回退。
     */
    private Map<Long, Long> buildCourseTeacherMap(List<CourseEntity> courses) {
        Map<Long, Long> courseTeacherMap = new HashMap<>();

        // 课程名 -> courseId
        Map<String, Long> courseNameToId = courses.stream()
                .collect(Collectors.toMap(CourseEntity::getName, CourseEntity::getDbId, (a, b) -> a));

        // 1. 从 teacher.courses JSON 字段建立映射
        List<TeacherEntity> teachers = teacherRepository.findAll();
        for (TeacherEntity teacher : teachers) {
            if (teacher.getCourses() == null || teacher.getCourses().isBlank()) continue;
            try {
                List<String> teacherCourseNames = objectMapper.readValue(
                        teacher.getCourses(), new TypeReference<List<String>>() {});
                for (String tcn : teacherCourseNames) {
                    Long cid = courseNameToId.get(tcn);
                    if (cid != null && !courseTeacherMap.containsKey(cid)) {
                        courseTeacherMap.put(cid, teacher.getDbId());
                    }
                }
            } catch (Exception e) {
                log.warn("解析教师 {} 的 courses 字段失败", teacher.getName(), e);
            }
        }

        // 2. 从已有排课记录回退
        List<ScheduleEntity> existing = scheduleRepository.findAll();
        for (ScheduleEntity s : existing) {
            courseTeacherMap.putIfAbsent(s.getCourseId(), s.getTeacherId());
        }

        // 3. 仍未找到的课程轮询分配
        for (CourseEntity course : courses) {
            if (!courseTeacherMap.containsKey(course.getDbId()) && !teachers.isEmpty()) {
                int idx = (int) (course.getDbId() % teachers.size());
                courseTeacherMap.put(course.getDbId(), teachers.get(idx).getDbId());
            }
        }

        return courseTeacherMap;
    }

    /**
     * 构建教师不可用时段集合。
     * 根据 unavailable_date 表的 validStart/validEnd 时间戳，结合学期日历，
     * 计算出给定周内教师不可用的具体 (weekday, slotIndex)。
     * <p>
     * compositeKey = weekday * 100 + slotIndex
     */
    private Map<Long, Set<Integer>> buildTeacherUnavailableSlots(InputData data, int week) {
        Map<Long, Set<Integer>> result = new HashMap<>();

        // 计算该周的实际日期区间
        if (data.semesterStart == null) return result;
        LocalDate weekStart = data.semesterStart.plusWeeks(week - 1);
        LocalDate weekEnd = weekStart.plusDays(6);

        List<UnavailableDateEntity> unavailableDates = unavailableDateRepository.findAll();

        for (UnavailableDateEntity ud : unavailableDates) {
            // 将 Unix 毫秒时间戳转换为 LocalDate
            LocalDate udStart = toLocalDate(ud.getValidStart());
            LocalDate udEnd = toLocalDate(ud.getValidEnd());

            // 计算不可用区间与该周的交集
            LocalDate intersectStart = udStart.isAfter(weekStart) ? udStart : weekStart;
            LocalDate intersectEnd = udEnd.isBefore(weekEnd) ? udEnd : weekEnd;

            if (intersectStart.isAfter(intersectEnd)) continue; // 无交集

            // 找到该教师 dbId
            Long teacherDbId = resolveTeacherDbId(ud);
            if (teacherDbId == null) continue;

            Set<Integer> slots = result.computeIfAbsent(teacherDbId, k -> new HashSet<>());

            // 标记交集区间内所有工作日的所有时段为不可用
            LocalDate day = intersectStart;
            while (!day.isAfter(intersectEnd)) {
                int weekday = day.getDayOfWeek().getValue(); // 1=Mon
                if (data.enabledWeekdays.contains(weekday)) {
                    for (int si = 0; si < data.timeSlots.size(); si++) {
                        slots.add(weekday * 100 + si);
                    }
                }
                day = day.plusDays(1);
            }
        }

        return result;
    }

    private LocalDate toLocalDate(long epochMs) {
        return java.time.Instant.ofEpochMilli(epochMs)
                .atZone(TZ)
                .toLocalDate();
    }

    private Long resolveTeacherDbId(UnavailableDateEntity ud) {
        try {
            return Long.parseLong(ud.getTeacherId());
        } catch (NumberFormatException e) {
            // teacherId 不是数字，按名称查找
            return teacherRepository.findByName(ud.getTeacherName())
                    .map(TeacherEntity::getDbId)
                    .orElse(null);
        }
    }

    // ==================== 初始解构建（贪心） ====================

    private Solution buildInitialSolution(InputData data) {
        List<ScheduleSlot> slots = new ArrayList<>();
        // 按优先级 + durationSlots 综合排序：高优先级 + 大课时优先
        List<CourseSession> sorted = new ArrayList<>(data.courseSessions);
        sorted.sort((a, b) -> {
            int cmp = Integer.compare(a.getPriority(), b.getPriority());
            if (cmp != 0) return cmp;
            return Integer.compare(b.getDurationSlots(), a.getDurationSlots());
        });

        Map<String, Set<Integer>> teacherOccupied = new HashMap<>();
        Map<String, Set<Integer>> roomOccupied = new HashMap<>();
        Random rand = new Random();

        for (CourseSession session : sorted) {
            boolean placed = false;
            List<int[]> shuffledSlots = getShuffledSlotCombinations(data, rand);

            for (int[] slotCombo : shuffledSlots) {
                int weekday = slotCombo[0];
                int slotIdx = slotCombo[1];

                // 检查教师冲突
                String tKey = session.getTeacherId() + "-" + weekday;
                Set<Integer> tSlots = teacherOccupied.getOrDefault(tKey, Collections.emptySet());
                boolean teacherOk = true;
                for (int d = 0; d < session.getDurationSlots(); d++) {
                    if (tSlots.contains(slotIdx + d)) {
                        teacherOk = false;
                        break;
                    }
                }
                if (!teacherOk) continue;

                // 找可用教室
                Long roomId = findAvailableRoom(session, weekday, slotIdx, roomOccupied, data);
                if (roomId == null) continue;

                // 放置
                ScheduleSlot slot = new ScheduleSlot(
                        session.getCourseId(), session.getTeacherId(),
                        session.getClassId(), roomId,
                        weekday, slotIdx, session.getDurationSlots());
                slots.add(slot);

                for (int d = 0; d < session.getDurationSlots(); d++) {
                    teacherOccupied.computeIfAbsent(tKey, k -> new HashSet<>()).add(slotIdx + d);
                    String rKey = roomId + "-" + weekday;
                    roomOccupied.computeIfAbsent(rKey, k -> new HashSet<>()).add(slotIdx + d);
                }
                placed = true;
                break;
            }

            if (!placed) {
                // 强制放置到随机位置
                if (!data.enabledWeekdays.isEmpty() && !data.timeSlots.isEmpty()) {
                    int wd = data.enabledWeekdays.get(rand.nextInt(data.enabledWeekdays.size()));
                    int maxStart = Math.max(1, data.timeSlots.size() - session.getDurationSlots() + 1);
                    int si = rand.nextInt(maxStart);
                    Long rid = data.roomIds.isEmpty() ? null : data.roomIds.get(rand.nextInt(data.roomIds.size()));
                    slots.add(new ScheduleSlot(
                            session.getCourseId(), session.getTeacherId(),
                            session.getClassId(), rid, wd, si, session.getDurationSlots()));
                }
            }
        }

        return new Solution(slots);
    }

    private List<int[]> getShuffledSlotCombinations(InputData data, Random rand) {
        List<int[]> combos = new ArrayList<>();
        for (int wd : data.enabledWeekdays) {
            for (int si = 0; si < data.timeSlots.size(); si++) {
                combos.add(new int[]{wd, si});
            }
        }
        Collections.shuffle(combos, rand);
        return combos;
    }

    private Long findAvailableRoom(CourseSession session, int weekday, int startSlot,
                                   Map<String, Set<Integer>> roomOccupied, InputData data) {
        for (Long roomId : data.roomIds) {
            String rKey = roomId + "-" + weekday;
            Set<Integer> rSlots = roomOccupied.getOrDefault(rKey, Collections.emptySet());
            boolean roomOk = true;
            for (int d = 0; d < session.getDurationSlots(); d++) {
                if (rSlots.contains(startSlot + d)) {
                    roomOk = false;
                    break;
                }
            }
            if (roomOk) return roomId;
        }
        return null;
    }

    // ==================== 模拟退火 ====================

    @Data
    private static class AnnealingResult {
        final Solution best;
        final int iterations;
        final int acceptedCount;
        final int rejectedCount;
    }

    private AnnealingResult runAnnealing(Solution initial, SAConfig config, InputData data) {
        Random rand = config.getSeed() != null ? new Random(config.getSeed()) : new Random();

        Solution current = initial.deepCopy();
        Solution best = initial.deepCopy();

        double temperature = config.getInitialTemp();
        int iterations = 0;
        int accepted = 0;
        int rejected = 0;

        while (temperature > config.getMinTemp() && iterations < config.getMaxIterations()) {
            Solution neighbor = generateNeighbor(current, data, rand);
            data.evaluator.calculateCost(neighbor);

            double deltaCost = neighbor.getCost() - current.getCost();

            if (deltaCost < 0 || rand.nextDouble() < Math.exp(-deltaCost / temperature)) {
                current = neighbor;
                accepted++;
                if (current.getCost() < best.getCost()) {
                    best = current.deepCopy();
                }
            } else {
                rejected++;
            }

            temperature *= config.getCoolingRate();
            iterations++;

            if (iterations % 10000 == 0) {
                log.info("迭代 {}, 温度 {:.2f}, 当前代价: {}, 最优代价: {}",
                        iterations, temperature, current.getCost(), best.getCost());
            }
        }

        return new AnnealingResult(best, iterations, accepted, rejected);
    }

    // ==================== 邻域解生成 ====================

    private Solution generateNeighbor(Solution current, InputData data, Random rand) {
        Solution neighbor = current.deepCopy();
        List<ScheduleSlot> slots = neighbor.getSlots();
        if (slots.isEmpty()) return neighbor;

        int idx = rand.nextInt(slots.size());
        ScheduleSlot slot = slots.get(idx);
        double r = rand.nextDouble();

        if (r < 0.7) {
            changeSlotTime(slot, data, rand);
        } else {
            changeSlotRoom(slot, data, rand);
        }

        return neighbor;
    }

    private void changeSlotTime(ScheduleSlot slot, InputData data, Random rand) {
        if (data.enabledWeekdays.isEmpty() || data.timeSlots.isEmpty()) return;
        int newWeekday = data.enabledWeekdays.get(rand.nextInt(data.enabledWeekdays.size()));
        int maxStart = data.timeSlots.size() - slot.getDurationSlots();
        if (maxStart < 0) maxStart = 0;
        int newStartSlot = rand.nextInt(maxStart + 1);
        slot.setWeekday(newWeekday);
        slot.setStartSlotIndex(newStartSlot);
    }

    private void changeSlotRoom(ScheduleSlot slot, InputData data, Random rand) {
        if (data.roomIds.isEmpty()) return;
        Long newRoomId = data.roomIds.get(rand.nextInt(data.roomIds.size()));
        slot.setRoomId(newRoomId);
    }

    // ==================== 持久化 ====================

    public void persistSolution(Solution solution, int week, InputData data) {
        List<ScheduleSlot> slots = solution.getSlots();
        List<ScheduleEntity> entities = new ArrayList<>();
        for (ScheduleSlot slot : slots) {
            entities.add(toScheduleEntity(slot, week, data));
        }

        transactionTemplate.executeWithoutResult(status -> {
            scheduleRepository.deleteByWeek(week);
            entityManager.flush();
            entityManager.clear();

            int batchSize = 50;
            for (int i = 0; i < entities.size(); i += batchSize) {
                List<ScheduleEntity> batch = entities.subList(i, Math.min(i + batchSize, entities.size()));
                scheduleRepository.saveAll(batch);
                entityManager.flush();
                entityManager.clear();
            }
        });

        log.info("已持久化 {} 条排课记录到第 {} 周", entities.size(), week);
    }

    private ScheduleEntity toScheduleEntity(ScheduleSlot slot, int week, InputData data) {
        ScheduleEntity entity = new ScheduleEntity();
        entity.setCourseId(slot.getCourseId());
        entity.setTeacherId(slot.getTeacherId());
        entity.setClassId(slot.getClassId());
        entity.setRoomId(slot.getRoomId());
        entity.setWeekday(slot.getWeekday());
        entity.setWeeks(List.of(week));

        int startIdx = slot.getStartSlotIndex();
        int endIdx = startIdx + slot.getDurationSlots() - 1;
        if (startIdx < data.timeSlots.size()) {
            entity.setStartTime(data.timeSlots.get(startIdx).getStartTime());
        }
        if (endIdx < data.timeSlots.size()) {
            entity.setEndTime(data.timeSlots.get(endIdx).getEndTime());
        } else if (!data.timeSlots.isEmpty()) {
            entity.setEndTime(data.timeSlots.get(data.timeSlots.size() - 1).getEndTime());
        }

        if (entity.getStartTime() != null && entity.getEndTime() != null) {
            entity.setDuration((int) (entity.getEndTime().toSecondOfDay() - entity.getStartTime().toSecondOfDay()) / 60);
        } else {
            entity.setDuration(45 * slot.getDurationSlots());
        }

        entity.setColor(COLORS[(int) (slot.getCourseId() % COLORS.length)]);
        entity.setStudentCount(null); // 前端自行设置
        return entity;
    }

    // ==================== 结果转换 ====================

    private List<CourseVO> convertToCourseVOs(Solution solution, InputData data) {
        List<CourseVO> vos = new ArrayList<>();
        for (ScheduleSlot slot : solution.getSlots()) {
            CourseVO vo = new CourseVO();
            vo.setCourseName(resolveCourseName(slot.getCourseId()));
            vo.setTeacherName(resolveTeacherName(slot.getTeacherId()));
            vo.setTeacherId(String.valueOf(slot.getTeacherId()));
            vo.setClassId(slot.getClassId());
            vo.setClassName(slot.getClassId() != null ? "班级-" + slot.getClassId() : "未分配");
            vo.setRoomName(resolveRoomName(slot.getRoomId()));
            vo.setRoomId(slot.getRoomId() != null ? String.valueOf(slot.getRoomId()) : null);
            vo.setWeekDay(slot.getWeekday());

            int startIdx = slot.getStartSlotIndex();
            int endIdx = startIdx + slot.getDurationSlots() - 1;
            if (startIdx < data.timeSlots.size()) {
                vo.setStartTime(data.timeSlots.get(startIdx).getStartTime().format(TIME_FMT));
            }
            if (endIdx < data.timeSlots.size()) {
                vo.setEndTime(data.timeSlots.get(endIdx).getEndTime().format(TIME_FMT));
            }

            if (vo.getStartTime() != null && vo.getEndTime() != null) {
                LocalTime start = LocalTime.parse(vo.getStartTime(), TIME_FMT);
                LocalTime end = LocalTime.parse(vo.getEndTime(), TIME_FMT);
                vo.setDuration((int) (end.toSecondOfDay() - start.toSecondOfDay()) / 60);
            } else {
                vo.setDuration(45 * slot.getDurationSlots());
            }

            vo.setColor(COLORS[(int) (slot.getCourseId() % COLORS.length)]);
            vo.setStudentCount(0);
            vos.add(vo);
        }
        return vos;
    }

    private String resolveCourseName(Long courseId) {
        return courseRepository.findById(courseId)
                .map(CourseEntity::getName)
                .orElse("未知课程");
    }

    private String resolveTeacherName(Long teacherId) {
        return teacherRepository.findById(teacherId)
                .map(TeacherEntity::getName)
                .orElse("未知教师");
    }

    private String resolveRoomName(Long roomId) {
        if (roomId == null) return "未分配";
        return roomRepository.findById(roomId)
                .map(RoomEntity::getName)
                .orElse("未知教室");
    }

    private int countHardViolations(Map<String, Double> ruleScores) {
        int count = 0;
        for (String hardRule : new String[]{"teacher_conflict", "room_conflict", "class_conflict", "teacher_unavailable"}) {
            Double v = ruleScores.get(hardRule);
            if (v != null) count += v.intValue();
        }
        return count;
    }
}
