package org.example.school_demo.controller.schedule;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.schedule.request.*;
import org.example.school_demo.dto.schedule.response.*;
import org.example.school_demo.service.schedule.ScheduleService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/courses")
    public Result<List<ScheduleVO>> getScheduleList(
            @RequestParam Integer week,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) Long roomId) {
        log.info("【课表列表】week: {}, teacherId: {}, classId: {}, roomId: {}",
                week, teacherId, classId, roomId);
        return Result.success(scheduleService.getScheduleList(week, teacherId, classId, roomId));
    }

    @GetMapping("/courses/{id}")
    public Result<ScheduleVO> getScheduleDetail(@PathVariable Long id) {
        log.info("【课表详情】id: {}", id);
        Map<String, Object> result = scheduleService.getScheduleDetail(id);
        if ((boolean) result.get("success")) {
            return Result.success((ScheduleVO) result.get("data"));
        }
        return Result.error(404, (String) result.get("message"));
    }

    @PostMapping("/courses")
    public Result<ScheduleCreateResp> createSchedule(
            @Validated @RequestBody ScheduleCreateReq req) {
        log.info("【创建排课】courseId: {}, teacherId: {}", req.getCourseId(), req.getTeacherId());
        Map<String, Object> result = scheduleService.createSchedule(req);
        if ((boolean) result.get("success")) {
            return Result.success("排课创建成功", (ScheduleCreateResp) result.get("data"));
        }
        return Result.error(400, (String) result.get("message"));
    }

    @PutMapping("/courses/{id}")
    public Result<ScheduleUpdateResp> updateSchedule(
            @PathVariable Long id,
            @Validated @RequestBody ScheduleUpdateReq req) {
        log.info("【更新排课】id: {}", id);
        Map<String, Object> result = scheduleService.updateSchedule(id, req);
        if ((boolean) result.get("success")) {
            return Result.success("排课更新成功", (ScheduleUpdateResp) result.get("data"));
        }
        return Result.error(404, (String) result.get("message"));
    }

    @DeleteMapping("/courses/{id}")
    public Result<ScheduleDeleteResp> deleteSchedule(@PathVariable Long id) {
        log.info("【删除排课】id: {}", id);
        Map<String, Object> result = scheduleService.deleteSchedule(id);
        if ((boolean) result.get("success")) {
            return Result.success("删除成功", (ScheduleDeleteResp) result.get("data"));
        }
        return Result.error(404, (String) result.get("message"));
    }

    @PostMapping("/courses/batch-delete")
    public Result<ScheduleBatchDeleteResp> batchDeleteSchedule(
            @Validated @RequestBody ScheduleBatchDeleteReq req) {
        log.info("【批量删除排课】ids: {}", req.getIds());
        Map<String, Object> result = scheduleService.batchDeleteSchedule(req);
        ScheduleBatchDeleteResp resp = (ScheduleBatchDeleteResp) result.get("data");
        String msg = String.format("批量删除完成，成功 %d 条，失败 %d 条",
                resp.getSuccessCount(), resp.getFailedIds().size());
        return Result.success(msg, resp);
    }

    @PostMapping("/courses/move")
    public Result<ScheduleMoveResp> moveSchedule(
            @Validated @RequestBody ScheduleMoveReq req) {
        log.info("【移动排课】id: {} -> weekday: {}", req.getId(), req.getWeekday());
        Map<String, Object> result = scheduleService.moveSchedule(req);
        if ((boolean) result.get("success")) {
            return Result.success("移动成功", (ScheduleMoveResp) result.get("data"));
        }
        return Result.error(404, (String) result.get("message"));
    }

    @PostMapping("/save")
    public Result<ScheduleSaveResp> saveSchedule(
            @Validated @RequestBody ScheduleSaveReq req) {
        log.info("【保存排课】week: {}, courses: {}", req.getWeek(), req.getCourses().size());
        Map<String, Object> result = scheduleService.saveSchedule(req);
        ScheduleSaveResp resp = (ScheduleSaveResp) result.get("data");
        String msg = String.format("保存完成，新增 %d 条，更新 %d 条", resp.getCreatedCount(), resp.getUpdatedCount());
        return Result.success(msg, resp);
    }

    @PostMapping("/conflicts/check")
    public Result<ScheduleConflictCheckResp> checkConflict(
            @Validated @RequestBody ScheduleConflictCheckReq req) {
        log.info("【冲突检测】weekday: {}, teacherId: {}, roomId: {}",
                req.getWeekday(), req.getTeacherId(), req.getRoomId());
        Map<String, Object> result = scheduleService.checkConflict(req);
        return Result.success((ScheduleConflictCheckResp) result.get("data"));
    }

    @GetMapping("/stats")
    public Result<ScheduleStatsResp> getStats() {
        log.info("【排课统计】");
        return Result.success(scheduleService.getStats());
    }

    @GetMapping("/export")
    public Result<ScheduleExportResp> exportSchedule(
            @RequestParam Integer week,
            @RequestParam(required = false) String classId) {
        log.info("【导出排课】week: {}, classId: {}", week, classId);
        Map<String, Object> result = scheduleService.exportSchedule(week, classId);
        return Result.success((ScheduleExportResp) result.get("data"));
    }

    @PostMapping("/import")
    public Result<ScheduleImportResp> importSchedule(
            @RequestBody List<ScheduleCreateReq> courses) {
        log.info("【导入排课】courses: {}", courses.size());
        Map<String, Object> result = scheduleService.importSchedule(courses);
        ScheduleImportResp resp = (ScheduleImportResp) result.get("data");
        String msg = String.format("导入完成，成功 %d 条，失败 %d 条",
                resp.getSuccessCount(), resp.getFailCount());
        return Result.success(msg, resp);
    }
}
