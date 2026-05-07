package org.example.school_demo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.smart_scheduling.*;
import org.example.school_demo.service.SmartSchedulingService;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 智能排课 REST 接口。
 * <p>
 * 对应 smart-scheduling-api.md 定义的所有端点：
 * 基础数据、排课操作、智能排课、统计与导出。
 */
@Slf4j
@RestController
@RequestMapping("/api/smart-scheduling")
@RequiredArgsConstructor
public class SmartSchedulingController {

    private final SmartSchedulingService service;

    // ==================== 1. 基础数据 ====================

    /**
     * 1.1 获取待排课程池
     * GET /api/smart-scheduling/courses?semesterId=
     */
    @GetMapping("/courses")
    public Result<List<CourseDTO>> getCourses(@RequestParam(required = false) String semesterId) {
        log.info("【智能排课-课程列表】semesterId: {}", semesterId);
        try {
            List<CourseDTO> courses = service.getCourses(semesterId);
            return Result.success(courses);
        } catch (Exception e) {
            return Result.error("获取课程失败: " + e.getMessage());
        }
    }

    /**
     * 1.2 获取教师列表
     * GET /api/smart-scheduling/teachers
     */
    @GetMapping("/teachers")
    public Result<List<TeacherDTO>> getTeachers() {
        log.info("【智能排课-教师列表】");
        try {
            List<TeacherDTO> teachers = service.getTeachers();
            return Result.success(teachers);
        } catch (Exception e) {
            return Result.error("获取教师失败: " + e.getMessage());
        }
    }

    /**
     * 1.3 获取班级列表
     * GET /api/smart-scheduling/classes
     */
    @GetMapping("/classes")
    public Result<List<ClassDTO>> getClasses() {
        log.info("【智能排课-班级列表】");
        try {
            List<ClassDTO> classes = service.getClasses();
            return Result.success(classes);
        } catch (Exception e) {
            return Result.error("获取班级失败: " + e.getMessage());
        }
    }

    /**
     * 1.4 获取教室列表
     * GET /api/smart-scheduling/rooms
     */
    @GetMapping("/rooms")
    public Result<List<RoomDTO>> getRooms() {
        log.info("【智能排课-教室列表】");
        try {
            List<RoomDTO> rooms = service.getRooms();
            return Result.success(rooms);
        } catch (Exception e) {
            return Result.error("获取教室失败: " + e.getMessage());
        }
    }

    // ==================== 2. 排课操作 ====================

    /**
     * 2.1 获取已排课程列表
     * GET /api/smart-scheduling/schedules?week=
     */
    @GetMapping("/schedules")
    public Result<List<ScheduleItemDTO>> getSchedules(@RequestParam(required = false) Integer week) {
        log.info("【智能排课-已排列表】week: {}", week);
        try {
            List<ScheduleItemDTO> schedules = service.getSchedules(week);
            return Result.success(schedules);
        } catch (Exception e) {
            return Result.error("获取排课列表失败: " + e.getMessage());
        }
    }

    /**
     * 2.2 保存单个排课记录
     * POST /api/smart-scheduling/schedules
     */
    @PostMapping("/schedules")
    public Result<Map<String, Object>> saveSchedule(@RequestBody Map<String, Object> body) {
        log.info("【智能排课-保存排课】courseId: {}, day: {}", body.get("courseId"), body.get("day"));
        try {
            String courseId = (String) body.get("courseId");
            String day = (String) body.get("day");
            int slot = ((Number) body.getOrDefault("slot", 1)).intValue();
            Integer week = body.containsKey("week") ? ((Number) body.get("week")).intValue() : null;
            String roomId = (String) body.get("roomId");

            if (courseId == null || courseId.isEmpty()) {
                return Result.error(400, "courseId 不能为空");
            }
            if (day == null || day.isEmpty()) {
                return Result.error(400, "day 不能为空");
            }

            Map<String, Object> result = service.saveSchedule(courseId, day, slot, week, roomId);
            return Result.success("保存成功", result);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error("保存失败: " + e.getMessage());
        }
    }

    /**
     * 2.3 批量保存排课结果
     * POST /api/smart-scheduling/schedules/batch
     */
    @PostMapping("/schedules/batch")
    public Result<BatchScheduleResultDTO> batchSaveSchedules(@RequestBody BatchScheduleRequest request) {
        log.info("【智能排课-批量保存】courses: {}, week: {}", request.getCourses() != null ? request.getCourses().size() : 0, request.getWeek());
        try {
            BatchScheduleResultDTO result = service.batchSaveSchedules(request);
            return Result.success("批量保存成功", result);
        } catch (Exception e) {
            return Result.error("批量保存失败: " + e.getMessage());
        }
    }

    /**
     * 2.4 删除排课记录
     * DELETE /api/smart-scheduling/schedules/:id
     */
    @DeleteMapping("/schedules/{id}")
    public Result<Map<String, Object>> deleteSchedule(@PathVariable String id) {
        log.info("【智能排课-删除排课】id: {}", id);
        try {
            Map<String, Object> result = service.deleteSchedule(id);
            return Result.success("删除成功", result);
        } catch (IllegalArgumentException e) {
            return Result.error(404, e.getMessage());
        } catch (Exception e) {
            return Result.error("删除失败: " + e.getMessage());
        }
    }

    /**
     * 2.5 清空所有排课
     * POST /api/smart-scheduling/schedules/clear
     */
    @PostMapping("/schedules/clear")
    public Result<Map<String, Object>> clearSchedules(@RequestBody(required = false) Map<String, Object> body) {
        log.info("【智能排课-清空排课】");
        try {
            String semesterId = body != null ? (String) body.get("semesterId") : null;
            Map<String, Object> result = service.clearSchedules(semesterId);
            return Result.success("清空成功", result);
        } catch (Exception e) {
            return Result.error("清空失败: " + e.getMessage());
        }
    }

    // ==================== 3. 智能排课 ====================

    /**
     * 3.1 一键智能排课
     * POST /api/smart-scheduling/auto-arrange
     */
    @PostMapping("/auto-arrange")
    public Result<AutoArrangeResultDTO> autoArrange(@RequestBody(required = false) Map<String, Object> body) {
        log.info("【智能排课-自动排课】strategy: {}", body != null ? body.get("strategy") : "priority");
        try {
            String strategy = body != null ? (String) body.getOrDefault("strategy", "priority") : "priority";
            AutoArrangeResultDTO result = service.autoArrange(strategy);
            return Result.success("自动排课完成", result);
        } catch (Exception e) {
            return Result.error("自动排课失败: " + e.getMessage());
        }
    }

    /**
     * 3.2 检测时间冲突
     * POST /api/smart-scheduling/check-conflict
     */
    @PostMapping("/check-conflict")
    public Result<ConflictResultDTO> checkConflict(@RequestBody Map<String, Object> body) {
        log.info("【智能排课-冲突检测】courseId: {}, day: {}", body.get("courseId"), body.get("day"));
        try {
            String courseId = (String) body.get("courseId");
            String day = (String) body.get("day");
            int slot = ((Number) body.getOrDefault("slot", 1)).intValue();
            Integer week = body.containsKey("week") ? ((Number) body.get("week")).intValue() : null;

            if (courseId == null || day == null) {
                return Result.error(400, "courseId 和 day 不能为空");
            }

            ConflictResultDTO result = service.checkConflict(courseId, day, slot, week);
            String message = result.isHasConflict() ? "检测到冲突" : "该时间段可用";
            return Result.success(message, result);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error("冲突检测失败: " + e.getMessage());
        }
    }

    /**
     * 3.3 推荐排课时间
     * POST /api/smart-scheduling/recommend
     */
    @PostMapping("/recommend")
    public Result<List<TimeRecommendationDTO>> recommendTime(@RequestBody Map<String, Object> body) {
        log.info("【智能排课-推荐时间】courseId: {}", body.get("courseId"));
        try {
            String courseId = (String) body.get("courseId");
            if (courseId == null) {
                return Result.error(400, "courseId 不能为空");
            }
            List<TimeRecommendationDTO> result = service.recommendTime(courseId);
            return Result.success("推荐成功", result);
        } catch (Exception e) {
            return Result.error("推荐失败: " + e.getMessage());
        }
    }

    // ==================== 4. 统计与导出 ====================

    /**
     * 4.1 获取统计数据
     * GET /api/smart-scheduling/stats?semesterId=
     */
    @GetMapping("/stats")
    public Result<ScheduleStatsDTO> getStats(@RequestParam(required = false) String semesterId) {
        log.info("【智能排课-统计数据】semesterId: {}", semesterId);
        try {
            ScheduleStatsDTO stats = service.getStats(semesterId);
            return Result.success(stats);
        } catch (Exception e) {
            return Result.error("获取统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 4.2 导出排课表
     * GET /api/smart-scheduling/export
     */
    @GetMapping("/export")
    public Result<ExportResultDTO> exportSchedule(
            @RequestParam(required = false) String format,
            @RequestParam(required = false) Integer week,
            @RequestParam(required = false) String type) {
        log.info("【智能排课-导出】format: {}, week: {}, type: {}", format, week, type);
        try {
            ExportResultDTO result = service.exportSchedule(format, week, type);
            return Result.success("导出成功", result);
        } catch (Exception e) {
            return Result.error("导出失败: " + e.getMessage());
        }
    }

    /**
     * 4.3 获取操作历史
     * GET /api/smart-scheduling/history?page=&pageSize=
     */
    @GetMapping("/history")
    public Result<HistoryResultDTO> getHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        log.info("【智能排课-操作历史】page: {}, pageSize: {}", page, pageSize);
        try {
            HistoryResultDTO result = service.getHistory(page, pageSize);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("获取历史记录失败: " + e.getMessage());
        }
    }
}
