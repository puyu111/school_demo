package org.example.school_demo.controller;

import org.example.school_demo.common.Result;
import org.example.school_demo.dto.drag_schedule.request.*;
import org.example.school_demo.dto.drag_schedule.response.*;
import org.example.school_demo.service.DragScheduleService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drag-schedule")
public class DragScheduleController {

    private final DragScheduleService service;

    public DragScheduleController(DragScheduleService service) {
        this.service = service;
    }

    // ========================= 一、课程管理 =========================

    @GetMapping("/courses")
    public Result<List<CourseVO>> getCourses(
            @RequestParam Integer week,
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String roomId) {
        return Result.success(service.getCourses(week, classId, teacherId, roomId));
    }

    @GetMapping("/courses/{courseId}")
    public Result<CourseVO> getCourse(@PathVariable String courseId) {
        CourseVO vo = service.getCourse(courseId);
        if (vo == null) return Result.error(404, "课程不存在");
        return Result.success(vo);
    }

    @PostMapping("/courses")
    public Result<CourseVO> createCourse(@RequestBody CourseCreateRequest req) {
        return Result.success(service.createCourse(req));
    }

    @PutMapping("/courses/{courseId}")
    public Result<CourseVO> updateCourse(@PathVariable String courseId, @RequestBody CourseUpdateRequest req) {
        return Result.success(service.updateCourse(courseId, req));
    }

    @PostMapping("/courses/move")
    public Result<BatchMoveResultVO> batchMove(@RequestBody BatchMoveRequest req) {
        return Result.success(service.batchMove(req));
    }

    @DeleteMapping("/courses/{courseId}")
    public Result<DeleteResultVO> deleteCourse(@PathVariable String courseId) {
        return Result.success(service.deleteCourse(courseId));
    }

    @PostMapping("/courses/batch-delete")
    public Result<Map<String, Object>> batchDelete(@RequestBody BatchDeleteRequest req) {
        return Result.success(service.batchDelete(req));
    }

    // ========================= 二、时段配置 =========================

    @GetMapping("/time-slots")
    public Result<TimeSlotConfigVO> getTimeSlots(@RequestParam(required = false) Integer dayOfWeek) {
        return Result.success(service.getTimeSlots(dayOfWeek));
    }

    @PutMapping("/time-slots")
    public Result<Map<String, Object>> updateTimeSlots(@RequestBody TimeSlotUpdateRequest req) {
        return Result.success(service.updateTimeSlots(req));
    }

    @PostMapping("/time-slots/reset")
    public Result<Map<String, Object>> resetTimeSlots() {
        return Result.success(service.resetTimeSlots());
    }

    // ========================= 三、星期配置 =========================

    @GetMapping("/week-days")
    public Result<List<WeekDayConfigVO>> getWeekDays() {
        return Result.success(service.getWeekDays());
    }

    @PutMapping("/week-days")
    public Result<Map<String, Object>> updateWeekDays(@RequestBody WeekDayUpdateRequest req) {
        return Result.success(service.updateWeekDays(req));
    }

    // ========================= 四、周次管理 =========================

    @GetMapping("/weeks/{weekNumber}")
    public Result<WeekInfoVO> getWeekInfo(@PathVariable Integer weekNumber) {
        return Result.success(service.getWeekInfo(weekNumber));
    }

    @PostMapping("/weeks/copy")
    public Result<WeekCopyResultVO> copyWeek(@RequestBody WeekCopyRequest req) {
        return Result.success(service.copyWeek(req));
    }

    @DeleteMapping("/weeks/{weekNumber}")
    public Result<WeekClearResultVO> clearWeek(@PathVariable Integer weekNumber,
                                                @RequestParam(defaultValue = "true") boolean preserveConfig) {
        return Result.success(service.clearWeek(weekNumber, preserveConfig));
    }

    // ========================= 五、冲突检测 =========================

    @PostMapping("/conflicts/check")
    public Result<ConflictCheckResultVO> checkConflict(@RequestBody ConflictCheckRequest req) {
        return Result.success(service.checkConflict(req));
    }

    @GetMapping("/conflicts/types")
    public Result<List<Map<String, String>>> getConflictTypes() {
        return Result.success(service.getConflictTypes());
    }

    // ========================= 六、数据导出/导入 =========================

    @GetMapping("/export")
    public Result<ExportResultVO> export(
            @RequestParam Integer startWeek,
            @RequestParam Integer endWeek,
            @RequestParam(required = false) String classId,
            @RequestParam(defaultValue = "json") String format) {
        return Result.success(service.export(startWeek, endWeek, classId, format));
    }

    @PostMapping("/import")
    public Result<ImportResultVO> importData(@RequestParam("file") MultipartFile file) {
        try {
            return Result.success(service.importData(file.getInputStream()));
        } catch (IOException e) {
            return Result.error(400, "文件读取失败: " + e.getMessage());
        }
    }

    // ========================= 七、保存/提交 =========================

    @PostMapping("/save")
    public Result<SaveResultVO> save(@RequestBody SaveRequest req) {
        return Result.success(service.save(req));
    }

    @GetMapping("/refresh")
    public Result<Map<String, Object>> refresh(@RequestParam Integer week) {
        return Result.success(service.refresh(week));
    }
}
