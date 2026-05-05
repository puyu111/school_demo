package org.example.school_demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.drag_schedule.request.*;
import org.example.school_demo.dto.drag_schedule.response.*;
import org.example.school_demo.entity.*;
import org.example.school_demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DragScheduleService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ScheduleRepository scheduleRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotConfigRepository timeSlotConfigRepository;
    private final WeekDayConfigRepository weekDayConfigRepository;

    public DragScheduleService(ScheduleRepository scheduleRepository,
                               CourseRepository courseRepository,
                               TeacherRepository teacherRepository,
                               RoomRepository roomRepository,
                               TimeSlotConfigRepository timeSlotConfigRepository,
                               WeekDayConfigRepository weekDayConfigRepository) {
        this.scheduleRepository = scheduleRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
        this.roomRepository = roomRepository;
        this.timeSlotConfigRepository = timeSlotConfigRepository;
        this.weekDayConfigRepository = weekDayConfigRepository;
    }

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ========================= Course CRUD =========================

    public List<CourseVO> getCourses(Integer week, String classId, String teacherId, String roomId) {

        List<ScheduleEntity> schedules = scheduleRepository.findByWeek(week);
        return schedules.stream()
                .filter(s -> classId == null || classId.equals(s.getClassId()))
                .filter(s -> teacherId == null || teacherId.equals(String.valueOf(s.getTeacherId())))
                .filter(s -> roomId == null || roomId.equals(s.getRoomId() != null ? String.valueOf(s.getRoomId()) : null))
                .map(this::toCourseVO)
                .collect(Collectors.toList());
    }

    public CourseVO getCourse(String courseId) {
        Long id = parseLong(courseId);
        ScheduleEntity s = scheduleRepository.findById(id).orElse(null);
        if (s == null) return null;
        return toCourseVO(s);
    }

    @Transactional
    public CourseVO createCourse(CourseCreateRequest req) {
        ScheduleEntity schedule = new ScheduleEntity();
        schedule.setTeacherId(resolveTeacherDbId(req.getTeacherId()));
        schedule.setClassId(req.getClassId());
        schedule.setRoomId(resolveRoomDbId(req.getRoomId()));
        schedule.setWeekday(req.getWeekDay());
        schedule.setStartTime(LocalTime.parse(req.getStartTime(), TIME_FMT));
        schedule.setEndTime(LocalTime.parse(req.getEndTime(), TIME_FMT));
        schedule.setDuration(req.getDuration());
        schedule.setWeeks(req.getWeeks());
        schedule.setColor(req.getColor() != null ? req.getColor() : randomColor());
        schedule.setStudentCount(null);

        // Find course db_id by name
        courseRepository.findByName(req.getCourseName()).ifPresent(c -> schedule.setCourseId(c.getDbId()));

        ScheduleEntity saved = scheduleRepository.save(schedule);
        return toCourseVO(saved);
    }

    @Transactional
    public CourseVO updateCourse(String courseId, CourseUpdateRequest req) {
        Long id = parseLong(courseId);
        ScheduleEntity s = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("课程不存在: " + courseId));

        if (req.getCourseName() != null) {
            courseRepository.findByName(req.getCourseName()).ifPresent(c -> s.setCourseId(c.getDbId()));
        }
        if (req.getTeacherId() != null) s.setTeacherId(resolveTeacherDbId(req.getTeacherId()));
        if (req.getClassId() != null) s.setClassId(req.getClassId());
        if (req.getRoomId() != null) s.setRoomId(resolveRoomDbId(req.getRoomId()));
        if (req.getWeekDay() != null) s.setWeekday(req.getWeekDay());
        if (req.getStartTime() != null) s.setStartTime(LocalTime.parse(req.getStartTime(), TIME_FMT));
        if (req.getEndTime() != null) s.setEndTime(LocalTime.parse(req.getEndTime(), TIME_FMT));
        if (req.getDuration() != null) s.setDuration(req.getDuration());
        if (req.getWeeks() != null) s.setWeeks(req.getWeeks());
        if (req.getColor() != null) s.setColor(req.getColor());

        ScheduleEntity saved = scheduleRepository.save(s);
        return toCourseVO(saved);
    }

    @Transactional
    public BatchMoveResultVO batchMove(BatchMoveRequest req) {
        BatchMoveResultVO result = new BatchMoveResultVO();
        result.setSuccess(new ArrayList<>());
        result.setFailed(new ArrayList<>());
        result.setConflicts(new ArrayList<>());

        for (MoveRequest move : req.getMoves()) {
            Long scheduleId = parseLong(move.getCourseId());
            Optional<ScheduleEntity> opt = scheduleRepository.findById(scheduleId);
            if (opt.isEmpty()) {
                result.getFailed().add(move.getCourseId());
                continue;
            }

            ScheduleEntity s = opt.get();
            Integer oldWeekDay = s.getWeekday();
            String oldStartTime = s.getStartTime().format(TIME_FMT);

            // Conflict detection
            if (hasConflict(s, move.getNewWeekDay(), move.getNewStartTime())) {
                result.getConflicts().add(move.getCourseId());
                continue;
            }

            if (move.getNewWeekDay() != null) s.setWeekday(move.getNewWeekDay());
            if (move.getNewStartTime() != null) s.setStartTime(LocalTime.parse(move.getNewStartTime(), TIME_FMT));

            scheduleRepository.save(s);

            MoveResultVO mr = new MoveResultVO();
            mr.setCourseId(move.getCourseId());
            mr.setOldWeekDay(oldWeekDay);
            mr.setNewWeekDay(s.getWeekday());
            mr.setOldStartTime(oldStartTime);
            mr.setNewStartTime(s.getStartTime().format(TIME_FMT));
            result.getSuccess().add(mr);
        }
        return result;
    }

    @Transactional
    public DeleteResultVO deleteCourse(String courseId) {
        Long id = parseLong(courseId);
        Optional<ScheduleEntity> opt = scheduleRepository.findById(id);
        if (opt.isEmpty()) throw new RuntimeException("课程不存在: " + courseId);

        ScheduleEntity s = opt.get();
        String courseName = getCourseName(s.getCourseId());
        scheduleRepository.delete(s);

        DeleteResultVO r = new DeleteResultVO();
        r.setDeletedId(courseId);
        r.setCourseName(courseName);
        return r;
    }

    @Transactional
    public Map<String, Object> batchDelete(BatchDeleteRequest req) {
        List<String> deletedIds = new ArrayList<>();
        List<String> failedIds = new ArrayList<>();

        for (String id : req.getCourseIds()) {
            try {
                Long scheduleId = parseLong(id);
                if (scheduleRepository.existsById(scheduleId)) {
                    scheduleRepository.deleteById(scheduleId);
                    deletedIds.add(id);
                } else {
                    failedIds.add(id);
                }
            } catch (Exception e) {
                failedIds.add(id);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("deletedCount", deletedIds.size());
        result.put("deletedIds", deletedIds);
        result.put("failedIds", failedIds);
        return result;
    }

    // ========================= Time Slots =========================

    public TimeSlotConfigVO getTimeSlots(Integer dayOfWeek) {
        TimeSlotConfigVO vo = new TimeSlotConfigVO();

        List<TimeSlotConfigEntity> slots = timeSlotConfigRepository.findAll();
        List<TimeSlotConfigVO.TimeSlotItem> items = slots.stream()
                .map(this::toTimeSlotItem)
                .collect(Collectors.toList());

        if (dayOfWeek != null) {
            items = items.stream()
                    .filter(t -> {
                        WeekDayConfigEntity wd = weekDayConfigRepository.findById(dayOfWeek).orElse(null);
                        return wd != null && Boolean.TRUE.equals(wd.getIsSchedulable());
                    })
                    .collect(Collectors.toList());
        }

        vo.setTimeSlots(items);

        // Build halfDayConfigs from time slots
        vo.setHalfDayConfigs(buildHalfDayConfigs(slots));

        // Build dailyConfig
        TimeSlotConfigVO.DailyScheduleConfig dc = new TimeSlotConfigVO.DailyScheduleConfig();
        dc.setTotalPeriods(items.size());
        if (!items.isEmpty()) {
            dc.setDefaultDuration(items.get(0).getDuration());
        }
        dc.setDefaultBreakDuration(10);
        vo.setDailyConfig(dc);

        return vo;
    }

    @Transactional
    public Map<String, Object> updateTimeSlots(TimeSlotUpdateRequest req) {
        List<String> updatedFields = new ArrayList<>();

        if (req.getHalfDayConfigs() != null) {
            for (TimeSlotUpdateRequest.HalfDayConfigUpdate hc : req.getHalfDayConfigs()) {
                List<TimeSlotConfigEntity> slots = timeSlotConfigRepository.findAll();
                for (TimeSlotConfigEntity slot : slots) {
                    if (hc.getType().equals(slot.getHalfDayType())) {
                        slot.setIsSchedulable(hc.isSchedulable());
                        timeSlotConfigRepository.save(slot);
                    }
                }
            }
            updatedFields.add("halfDayConfigs");
        }

        if (req.getTimeSlots() != null) {
            for (TimeSlotUpdateRequest.TimeSlotUpdate tu : req.getTimeSlots()) {
                timeSlotConfigRepository.findById(tu.getId()).ifPresent(slot -> {
                    if (tu.getStartTime() != null) slot.setStartTime(LocalTime.parse(tu.getStartTime(), TIME_FMT));
                    if (tu.getEndTime() != null) slot.setEndTime(LocalTime.parse(tu.getEndTime(), TIME_FMT));
                    if (tu.getDuration() != null) slot.setDuration(tu.getDuration());
                    slot.setIsSchedulable(tu.isSchedulable());
                    timeSlotConfigRepository.save(slot);
                });
            }
            updatedFields.add("timeSlots");
        }

        if (req.getDailyConfig() != null) {
            updatedFields.add("dailyConfig");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("updatedFields", updatedFields);
        result.put("dailyConfig", getTimeSlots(null).getDailyConfig());
        result.put("halfDayConfigs", getTimeSlots(null).getHalfDayConfigs());
        return result;
    }

    @Transactional
    public Map<String, Object> resetTimeSlots() {
        timeSlotConfigRepository.deleteAll();

        // Insert default time slots matching data.sql
        List<String[]> defaults = Arrays.asList(
                new String[]{"SLOT01", "第 1 节", "08:00", "08:45", "45", "morning", "0", "", "1"},
                new String[]{"SLOT02", "第 2 节", "08:55", "09:40", "45", "morning", "0", "10", "1"},
                new String[]{"SLOT03", "第 3 节", "10:00", "10:45", "45", "morning", "0", "", "1"},
                new String[]{"SLOT04", "第 4 节", "10:55", "11:40", "45", "morning", "0", "20", "1"},
                new String[]{"SLOT05", "第 5 节", "14:00", "14:45", "45", "afternoon", "0", "", "1"},
                new String[]{"SLOT06", "第 6 节", "14:55", "15:40", "45", "afternoon", "0", "10", "1"},
                new String[]{"SLOT07", "第 7 节", "16:00", "16:45", "45", "afternoon", "0", "", "1"},
                new String[]{"SLOT08", "第 8 节", "16:55", "17:40", "45", "afternoon", "0", "0", "1"},
                new String[]{"SLOT09", "第 9 节", "19:00", "19:45", "45", "evening", "0", "", "1"},
                new String[]{"SLOT10", "第 10 节", "19:55", "20:40", "45", "evening", "0", "0", "1"}
        );

        for (String[] d : defaults) {
            TimeSlotConfigEntity slot = new TimeSlotConfigEntity();
            slot.setId(d[0]);
            slot.setLabel(d[1]);
            slot.setStartTime(LocalTime.parse(d[2], TIME_FMT));
            slot.setEndTime(LocalTime.parse(d[3], TIME_FMT));
            slot.setDuration(Integer.parseInt(d[4]));
            slot.setHalfDayType(d[5]);
            slot.setIsBreak("1".equals(d[6]));
            if (!d[7].isEmpty()) slot.setBreakAfter(Integer.parseInt(d[7]));
            slot.setIsSchedulable("1".equals(d[8]));
            timeSlotConfigRepository.save(slot);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("dailyConfig", getTimeSlots(null).getDailyConfig());
        result.put("timeSlots", getTimeSlots(null).getTimeSlots());
        result.put("halfDayConfigs", getTimeSlots(null).getHalfDayConfigs());
        return result;
    }

    // ========================= Week Days =========================

    public List<WeekDayConfigVO> getWeekDays() {
        return weekDayConfigRepository.findAll().stream().map(w -> {
            WeekDayConfigVO vo = new WeekDayConfigVO();
            vo.setId(w.getId());
            vo.setName(w.getName());
            vo.setIsEnabled(w.getIsEnabled());
            vo.setIsSchedulable(w.getIsSchedulable());
            return vo;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> updateWeekDays(WeekDayUpdateRequest req) {
        for (WeekDayUpdateRequest.WeekDayItem item : req.getWeekDays()) {
            weekDayConfigRepository.findById(item.getId()).ifPresent(w -> {
                if (item.getIsEnabled() != null) w.setIsEnabled(item.getIsEnabled());
                if (item.getIsSchedulable() != null) w.setIsSchedulable(item.getIsSchedulable());
                weekDayConfigRepository.save(w);
            });
        }
        Map<String, Object> result = new HashMap<>();
        result.put("weekDays", getWeekDays());
        return result;
    }

    // ========================= Week Management =========================

    public WeekInfoVO getWeekInfo(Integer weekNumber) {
        WeekInfoVO vo = new WeekInfoVO();
        vo.setWeekNumber(weekNumber);

        // Calculate date range based on calendar table
        vo.setStartDate(calculateWeekDate(weekNumber, 0));
        vo.setEndDate(calculateWeekDate(weekNumber, 6));

        List<ScheduleEntity> courses = scheduleRepository.findByWeek(weekNumber);
        vo.setCourseCount(courses.size());

        // Determine if current week
        LocalDate today = LocalDate.now();
        String startStr = calculateWeekDate(weekNumber, 0);
        String endStr = calculateWeekDate(weekNumber, 6);
        LocalDate start = LocalDate.parse(startStr);
        LocalDate end = LocalDate.parse(endStr);
        vo.setCurrentWeek(!today.isBefore(start) && !today.isAfter(end));

        vo.setHasUnsavedChanges(false);
        return vo;
    }

    @Transactional
    public WeekCopyResultVO copyWeek(WeekCopyRequest req) {
        WeekCopyResultVO result = new WeekCopyResultVO();
        result.setSourceWeek(req.getSourceWeek());
        result.setCopiedWeeks(new ArrayList<>());
        result.setSkippedWeeks(new ArrayList<>());
        result.setFailedWeeks(new ArrayList<>());

        List<ScheduleEntity> sourceCourses = scheduleRepository.findByWeek(req.getSourceWeek());
        if (sourceCourses.isEmpty()) {
            result.setCopiedCourseCount(0);
            return result;
        }

        int totalCopied = 0;

        for (Integer targetWeek : req.getTargetWeeks()) {
            try {
                List<ScheduleEntity> existing = scheduleRepository.findByWeek(targetWeek);
                if (!existing.isEmpty() && !req.getOptions().isOverrideExisting()) {
                    result.getSkippedWeeks().add(targetWeek);
                    continue;
                }

                for (ScheduleEntity src : sourceCourses) {
                    ScheduleEntity copy = new ScheduleEntity();
                    copy.setCourseId(src.getCourseId());
                    copy.setTeacherId(src.getTeacherId());
                    copy.setClassId(src.getClassId());
                    copy.setRoomId(src.getRoomId());
                    copy.setWeekday(src.getWeekday());
                    copy.setStartTime(src.getStartTime());
                    copy.setEndTime(src.getEndTime());
                    copy.setDuration(src.getDuration());
                    copy.setWeeks(Collections.singletonList(targetWeek));
                    copy.setColor(src.getColor());
                    copy.setStudentCount(src.getStudentCount());
                    scheduleRepository.save(copy);
                    totalCopied++;
                }
                result.getCopiedWeeks().add(targetWeek);
            } catch (Exception e) {
                result.getFailedWeeks().add(targetWeek);
            }
        }

        result.setCopiedCourseCount(totalCopied);
        return result;
    }

    @Transactional
    public WeekClearResultVO clearWeek(Integer weekNumber, boolean preserveConfig) {
        List<ScheduleEntity> courses = scheduleRepository.findByWeek(weekNumber);
        int count = courses.size();
        scheduleRepository.deleteByWeek(weekNumber);

        WeekClearResultVO result = new WeekClearResultVO();
        result.setWeekNumber(weekNumber);
        result.setDeletedCourseCount(count);
        result.setConfigPreserved(preserveConfig);
        return result;
    }

    // ========================= Conflict Detection =========================

    public ConflictCheckResultVO checkConflict(ConflictCheckRequest req) {
        ConflictCheckResultVO result = new ConflictCheckResultVO();
        result.setHasConflicts(false);
        result.setConflicts(new ArrayList<>());
        result.setRecommendations(new ArrayList<>());

        ConflictCheckRequest.CourseInfo course = req.getCourse();
        if (course == null) return result;

        Integer week = req.getWeek();
        List<ScheduleEntity> existing = scheduleRepository.findByWeek(week);

        LocalTime newStart = LocalTime.parse(course.getStartTime(), TIME_FMT);
        LocalTime newEnd = LocalTime.parse(course.getEndTime(), TIME_FMT);

        for (ScheduleEntity ex : existing) {
            // Check teacher conflict
            if (course.getTeacherId() != null && course.getTeacherId().equals(String.valueOf(ex.getTeacherId()))) {
                if (isTimeOverlapping(newStart, newEnd, ex.getStartTime(), ex.getEndTime(), course.getWeekDay(), ex.getWeekday())) {
                    ConflictCheckResultVO.ConflictItem conflict = new ConflictCheckResultVO.ConflictItem();
                    conflict.setType("teacher");
                    conflict.setMessage("教师" + getTeacherName(ex.getTeacherId()) + "在" + getWeekdayName(ex.getWeekday()) + " " + ex.getStartTime().format(TIME_FMT) + "-" + ex.getEndTime().format(TIME_FMT) + "已有课程安排");
                    ConflictCheckResultVO.ExistingCourseInfo eci = new ConflictCheckResultVO.ExistingCourseInfo();
                    eci.setId(String.valueOf(ex.getScheduleId()));
                    eci.setCourseName(getCourseName(ex.getCourseId()));
                    eci.setWeekDay(ex.getWeekday());
                    eci.setStartTime(ex.getStartTime().format(TIME_FMT));
                    eci.setEndTime(ex.getEndTime().format(TIME_FMT));
                    conflict.setExistingCourse(eci);
                    result.getConflicts().add(conflict);
                    result.setHasConflicts(true);
                }
            }

            // Check room conflict
            if (course.getRoomId() != null && course.getRoomId().equals(ex.getRoomId() != null ? String.valueOf(ex.getRoomId()) : null)) {
                if (isTimeOverlapping(newStart, newEnd, ex.getStartTime(), ex.getEndTime(), course.getWeekDay(), ex.getWeekday())) {
                    ConflictCheckResultVO.ConflictItem conflict = new ConflictCheckResultVO.ConflictItem();
                    conflict.setType("room");
                    conflict.setMessage("教室" + getRoomName(ex.getRoomId()) + "在" + getWeekdayName(ex.getWeekday()) + " " + ex.getStartTime().format(TIME_FMT) + "-" + ex.getEndTime().format(TIME_FMT) + "已被占用");
                    ConflictCheckResultVO.ExistingCourseInfo eci = new ConflictCheckResultVO.ExistingCourseInfo();
                    eci.setId(String.valueOf(ex.getScheduleId()));
                    eci.setCourseName(getCourseName(ex.getCourseId()));
                    eci.setWeekDay(ex.getWeekday());
                    eci.setStartTime(ex.getStartTime().format(TIME_FMT));
                    eci.setEndTime(ex.getEndTime().format(TIME_FMT));
                    conflict.setExistingCourse(eci);
                    result.getConflicts().add(conflict);
                    result.setHasConflicts(true);
                }
            }

            // Check class conflict
            if (course.getClassId() != null && course.getClassId().equals(ex.getClassId())) {
                if (isTimeOverlapping(newStart, newEnd, ex.getStartTime(), ex.getEndTime(), course.getWeekDay(), ex.getWeekday())) {
                    ConflictCheckResultVO.ConflictItem conflict = new ConflictCheckResultVO.ConflictItem();
                    conflict.setType("class");
                    conflict.setMessage("班级" + course.getClassId() + "在" + getWeekdayName(ex.getWeekday()) + " " + ex.getStartTime().format(TIME_FMT) + "-" + ex.getEndTime().format(TIME_FMT) + "已有课程安排");
                    ConflictCheckResultVO.ExistingCourseInfo eci = new ConflictCheckResultVO.ExistingCourseInfo();
                    eci.setId(String.valueOf(ex.getScheduleId()));
                    eci.setCourseName(getCourseName(ex.getCourseId()));
                    eci.setWeekDay(ex.getWeekday());
                    eci.setStartTime(ex.getStartTime().format(TIME_FMT));
                    eci.setEndTime(ex.getEndTime().format(TIME_FMT));
                    conflict.setExistingCourse(eci);
                    result.getConflicts().add(conflict);
                    result.setHasConflicts(true);
                }
            }
        }

        // Generate recommendations if conflicts exist
        if (result.isHasConflicts()) {
            result.setRecommendations(generateRecommendations(course, week));
        }

        return result;
    }

    public List<Map<String, String>> getConflictTypes() {
        return Arrays.asList(
                Map.of("type", "teacher", "name", "教师冲突", "description", "同一教师在同一时间有多个课程安排"),
                Map.of("type", "room", "name", "教室冲突", "description", "同一教室在同一时间被多个课程占用"),
                Map.of("type", "class", "name", "班级冲突", "description", "同一班级在同一时间有多个课程"),
                Map.of("type", "duration", "name", "时长冲突", "description", "课程时长超出一天的可排课时间范围")
        );
    }

    // ========================= Export / Import =========================

    public ExportResultVO export(Integer startWeek, Integer endWeek, String classId, String format) {
        ExportResultVO vo = new ExportResultVO();

        List<CourseVO> allCourses = new ArrayList<>();
        for (int w = startWeek; w <= endWeek; w++) {
            allCourses.addAll(getCourses(w, classId, null, null));
        }

        ExportResultVO.ExportInfo info = new ExportResultVO.ExportInfo();
        info.setExportedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")));
        info.setStartWeek(startWeek);
        info.setEndWeek(endWeek);
        info.setTotalCourses(allCourses.size());

        vo.setExportInfo(info);
        vo.setCourses(allCourses);
        vo.setTimeSlots(getTimeSlots(null).getTimeSlots());
        vo.setWeekDays(getWeekDays());
        vo.setHalfDayConfigs(getTimeSlots(null).getHalfDayConfigs());

        return vo;
    }

    @Transactional
    public ImportResultVO importData(InputStream inputStream) {
        ImportResultVO result = new ImportResultVO();
        result.setImportedCount(0);
        result.setSkippedCount(0);
        result.setFailedCount(0);
        result.setConflictCount(0);

        ImportResultVO.ImportDetails details = new ImportResultVO.ImportDetails();
        details.setSkipped(new ArrayList<>());
        details.setFailed(new ArrayList<>());
        details.setConflicts(new ArrayList<>());
        result.setDetails(details);

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(inputStream);
            JsonNode courses = root.get("courses");

            if (courses != null && courses.isArray()) {
                for (JsonNode courseNode : courses) {
                    try {
                        CourseCreateRequest req = new CourseCreateRequest();
                        req.setCourseName(courseNode.get("courseName").asText());

                        if (courseNode.has("teacherId")) req.setTeacherId(courseNode.get("teacherId").asText());
                        if (courseNode.has("classId")) req.setClassId(courseNode.get("classId").asText());
                        if (courseNode.has("roomId")) req.setRoomId(courseNode.get("roomId").asText());
                        if (courseNode.has("weekDay")) req.setWeekDay(courseNode.get("weekDay").asInt());
                        if (courseNode.has("startTime")) req.setStartTime(courseNode.get("startTime").asText());
                        if (courseNode.has("endTime")) req.setEndTime(courseNode.get("endTime").asText());
                        if (courseNode.has("duration")) req.setDuration(courseNode.get("duration").asInt());
                        if (courseNode.has("color")) req.setColor(courseNode.get("color").asText());

                        List<Integer> weeks = new ArrayList<>();
                        if (courseNode.has("weeks") && courseNode.get("weeks").isArray()) {
                            for (JsonNode weekNode : courseNode.get("weeks")) {
                                weeks.add(weekNode.asInt());
                            }
                        }
                        req.setWeeks(weeks);

                        createCourse(req);
                        result.setImportedCount(result.getImportedCount() + 1);
                    } catch (Exception e) {
                        result.setFailedCount(result.getFailedCount() + 1);
                        details.getFailed().add(courseNode.get("courseName").asText());
                    }
                }
            }
        } catch (IOException e) {
            result.setFailedCount(result.getFailedCount() + 1);
        }

        return result;
    }

    // ========================= Save / Refresh =========================

    @Transactional
    public SaveResultVO save(SaveRequest req) {
        int savedCount = 0;

        if (req.getCourses() != null) {
            for (SaveRequest.CourseData cd : req.getCourses()) {
                try {
                    if (cd.getId() != null && !cd.getId().isEmpty()) {
                        // Update existing
                        Long id = parseLong(cd.getId());
                        scheduleRepository.findById(id).ifPresent(s -> {
                            if (cd.getWeekDay() != null) s.setWeekday(cd.getWeekDay());
                            if (cd.getStartTime() != null) s.setStartTime(LocalTime.parse(cd.getStartTime(), TIME_FMT));
                            if (cd.getEndTime() != null) s.setEndTime(LocalTime.parse(cd.getEndTime(), TIME_FMT));
                            if (cd.getDuration() != null) s.setDuration(cd.getDuration());
                            if (cd.getClassId() != null) s.setClassId(cd.getClassId());
                            if (cd.getRoomId() != null) s.setRoomId(resolveRoomDbId(cd.getRoomId()));
                            if (cd.getColor() != null) s.setColor(cd.getColor());
                            if (cd.getWeeks() != null) s.setWeeks(cd.getWeeks());
                            scheduleRepository.save(s);
                        });
                    } else {
                        // Create new
                        CourseCreateRequest createReq = new CourseCreateRequest();
                        createReq.setCourseName(cd.getCourseName());
                        createReq.setTeacherId(cd.getTeacherId());
                        createReq.setClassId(cd.getClassId());
                        createReq.setRoomId(cd.getRoomId());
                        createReq.setWeekDay(cd.getWeekDay());
                        createReq.setStartTime(cd.getStartTime());
                        createReq.setEndTime(cd.getEndTime());
                        createReq.setDuration(cd.getDuration());
                        createReq.setWeeks(cd.getWeeks());
                        createReq.setColor(cd.getColor());
                        createCourse(createReq);
                    }
                    savedCount++;
                } catch (Exception e) {
                    // skip failed
                }
            }
        }

        SaveResultVO result = new SaveResultVO();
        result.setWeek(req.getWeek());
        result.setSavedCount(savedCount);
        result.setMessage("第 " + req.getWeek() + " 周课表已保存");
        return result;
    }

    public Map<String, Object> refresh(Integer week) {
        Map<String, Object> result = new HashMap<>();
        result.put("week", week);
        result.put("courses", getCourses(week, null, null, null));
        result.put("timeSlots", getTimeSlots(null).getTimeSlots());
        result.put("weekDays", getWeekDays());
        return result;
    }

    // ========================= Helper Methods =========================

    private CourseVO toCourseVO(ScheduleEntity s) {
        CourseVO vo = new CourseVO();
        vo.setId(String.valueOf(s.getScheduleId()));
        vo.setCourseName(getCourseName(s.getCourseId()));
        vo.setTeacherName(getTeacherName(s.getTeacherId()));
        vo.setTeacherId(String.valueOf(s.getTeacherId()));
        vo.setClassName(s.getClassId() != null ? "班级-" + s.getClassId() : "未分配");
        vo.setClassId(s.getClassId());
        vo.setRoomName(getRoomName(s.getRoomId()));
        vo.setRoomId(s.getRoomId() != null ? String.valueOf(s.getRoomId()) : null);
        vo.setWeekDay(s.getWeekday());
        vo.setStartTime(s.getStartTime().format(TIME_FMT));
        vo.setEndTime(s.getEndTime().format(TIME_FMT));
        vo.setDuration(s.getDuration());
        vo.setColor(s.getColor());
        vo.setWeeks(s.getWeeks());
        vo.setStudentCount(s.getStudentCount());
        return vo;
    }

    private String getCourseName(Long courseId) {
        if (courseId == null) return "未知课程";
        return courseRepository.findById(courseId)
                .map(CourseEntity::getName)
                .orElse("未知课程");
    }

    private String getTeacherName(Long teacherId) {
        if (teacherId == null) return "未知教师";
        return teacherRepository.findById(teacherId)
                .map(TeacherEntity::getName)
                .orElse("未知教师");
    }

    private String getRoomName(Long roomId) {
        if (roomId == null) return "未指定";
        return roomRepository.findById(roomId)
                .map(RoomEntity::getName)
                .orElse("未知教室");
    }

    private Long resolveTeacherDbId(String teacherId) {
        // Try as numeric dbId first
        try {
            return Long.parseLong(teacherId);
        } catch (NumberFormatException e) {
            // Try as business id (T001)
            return teacherRepository.findByBusinessId(teacherId)
                    .map(TeacherEntity::getDbId)
                    .orElseThrow(() -> new RuntimeException("教师不存在: " + teacherId));
        }
    }

    private Long resolveRoomDbId(String roomId) {
        if (roomId == null) return null;
        try {
            return Long.parseLong(roomId);
        } catch (NumberFormatException e) {
            return roomRepository.findById(roomId)
                    .map(RoomEntity::getDbId)
                    .orElseThrow(() -> new RuntimeException("教室不存在: " + roomId));
        }
    }

    private boolean hasConflict(ScheduleEntity schedule, Integer newWeekDay, String newStartTime) {
        Integer wd = newWeekDay != null ? newWeekDay : schedule.getWeekday();
        LocalTime st = newStartTime != null ? LocalTime.parse(newStartTime, TIME_FMT) : schedule.getStartTime();
        LocalTime et = st.plusMinutes(schedule.getDuration());
        Integer week = schedule.getWeeks().get(0); // Use first week for conflict check

        List<ScheduleEntity> existing = scheduleRepository.findByWeek(week);
        for (ScheduleEntity ex : existing) {
            if (ex.getScheduleId().equals(schedule.getScheduleId())) continue;

            // Teacher conflict
            if (ex.getTeacherId().equals(schedule.getTeacherId())
                    && ex.getWeekday().equals(wd)
                    && isTimeOverlapping(st, et, ex.getStartTime(), ex.getEndTime())) {
                return true;
            }

            // Room conflict
            if (ex.getRoomId() != null && ex.getRoomId().equals(schedule.getRoomId())
                    && ex.getWeekday().equals(wd)
                    && isTimeOverlapping(st, et, ex.getStartTime(), ex.getEndTime())) {
                return true;
            }
        }
        return false;
    }

    private boolean isTimeOverlapping(LocalTime aStart, LocalTime aEnd, LocalTime bStart, LocalTime bEnd) {
        return aStart.isBefore(bEnd) && aEnd.isAfter(bStart);
    }

    private boolean isTimeOverlapping(LocalTime aStart, LocalTime aEnd, LocalTime bStart, LocalTime bEnd, int aWeekday, int bWeekday) {
        return aWeekday == bWeekday && aStart.isBefore(bEnd) && aEnd.isAfter(bStart);
    }

    private String getWeekdayName(int weekday) {
        return switch (weekday) {
            case 1 -> "周一";
            case 2 -> "周二";
            case 3 -> "周三";
            case 4 -> "周四";
            case 5 -> "周五";
            case 6 -> "周六";
            case 7 -> "周日";
            default -> "周" + weekday;
        };
    }

    private String randomColor() {
        String[] colors = {"#1890ff", "#52c41a", "#fa8c16", "#722ed1", "#13c2c2", "#eb2f96", "#f5222d", "#faad14"};
        return colors[new Random().nextInt(colors.length)];
    }

    private TimeSlotConfigVO.TimeSlotItem toTimeSlotItem(TimeSlotConfigEntity e) {
        TimeSlotConfigVO.TimeSlotItem item = new TimeSlotConfigVO.TimeSlotItem();
        item.setId(e.getId());
        item.setLabel(e.getLabel());
        item.setStartTime(e.getStartTime().format(TIME_FMT));
        item.setEndTime(e.getEndTime().format(TIME_FMT));
        item.setDuration(e.getDuration());
        item.setHalfDayType(e.getHalfDayType());
        item.setBreak(Boolean.TRUE.equals(e.getIsBreak()));
        item.setBreakAfter(e.getBreakAfter());
        item.setSchedulable(Boolean.TRUE.equals(e.getIsSchedulable()));
        return item;
    }

    private List<TimeSlotConfigVO.HalfDayConfig> buildHalfDayConfigs(List<TimeSlotConfigEntity> slots) {
        Map<String, List<TimeSlotConfigEntity>> grouped = slots.stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsSchedulable()))
                .collect(Collectors.groupingBy(TimeSlotConfigEntity::getHalfDayType));

        Map<String, String> names = Map.of("morning", "上午", "afternoon", "下午", "evening", "晚上");

        return grouped.entrySet().stream().map(entry -> {
            TimeSlotConfigVO.HalfDayConfig hc = new TimeSlotConfigVO.HalfDayConfig();
            hc.setType(entry.getKey());
            hc.setName(names.getOrDefault(entry.getKey(), entry.getKey()));
            List<TimeSlotConfigEntity> s = entry.getValue();
            hc.setStartTime(s.stream().map(TimeSlotConfigEntity::getStartTime).min(LocalTime::compareTo).map(t -> t.format(TIME_FMT)).orElse(""));
            hc.setEndTime(s.stream().map(TimeSlotConfigEntity::getEndTime).max(LocalTime::compareTo).map(t -> t.format(TIME_FMT)).orElse(""));
            hc.setSchedulable(true);
            return hc;
        }).collect(Collectors.toList());
    }

    private String calculateWeekDate(int weekNumber, int dayOffset) {
        // Use semester start date: 2026-02-23 (Spring semester)
        LocalDate semesterStart = LocalDate.of(2026, 2, 23);
        // Week 1 starts at semesterStart (Monday)
        LocalDate weekStart = semesterStart.plusWeeks(weekNumber - 1);
        LocalDate target = weekStart.plusDays(dayOffset);
        return target.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private List<ConflictCheckResultVO.Recommendation> generateRecommendations(ConflictCheckRequest.CourseInfo course, int week) {
        List<ConflictCheckResultVO.Recommendation> recs = new ArrayList<>();
        List<TimeSlotConfigEntity> allSlots = timeSlotConfigRepository.findAll();
        List<ScheduleEntity> existing = scheduleRepository.findByWeek(week);

        // Find available slots
        for (int wd = 1; wd <= 5; wd++) {
            for (TimeSlotConfigEntity slot : allSlots) {
                if (!Boolean.TRUE.equals(slot.getIsSchedulable())) continue;

                boolean hasConflict = false;
                for (ScheduleEntity ex : existing) {
                    if (ex.getWeekday() != wd) continue;
                    if (course.getTeacherId() != null && course.getTeacherId().equals(String.valueOf(ex.getTeacherId()))
                            && isTimeOverlapping(slot.getStartTime(), slot.getStartTime().plusMinutes(course.getDuration()), ex.getStartTime(), ex.getEndTime())) {
                        hasConflict = true;
                        break;
                    }
                }

                if (!hasConflict) {
                    ConflictCheckResultVO.Recommendation rec = new ConflictCheckResultVO.Recommendation();
                    rec.setWeekDay(wd);
                    rec.setStartTime(slot.getStartTime().format(TIME_FMT));
                    rec.setRoomId(course.getRoomId());
                    rec.setReason(getWeekdayName(wd) + " " + slot.getStartTime().format(TIME_FMT) + " 该时间段教师可用");
                    recs.add(rec);
                    if (recs.size() >= 3) return recs;
                }
            }
        }
        return recs;
    }

    private Long parseLong(String s) {
        try {
            return Long.parseLong(s);
        } catch (NumberFormatException e) {
            throw new RuntimeException("无效的课程ID: " + s);
        }
    }
}
