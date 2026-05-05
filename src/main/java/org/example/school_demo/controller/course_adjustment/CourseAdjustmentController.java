package org.example.school_demo.controller.course_adjustment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.PageResult;
import org.example.school_demo.dto.course_adjustment.request.ApplicationCreateReq;
import org.example.school_demo.dto.course_adjustment.request.ApplicationReviewReq;
import org.example.school_demo.dto.course_adjustment.request.BatchReviewReq;
import org.example.school_demo.dto.course_adjustment.response.*;
import org.example.school_demo.service.course_adjustment.CourseAdjustmentService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/course-adjustment")
@RequiredArgsConstructor
public class CourseAdjustmentController {

    private final CourseAdjustmentService courseAdjustmentService;

    @GetMapping("/applications")
    public Result<PageResult<ApplicationListResp>> getApplicationList(
            @ModelAttribute @Validated PageReq pageReq,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String urgency,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String keyword
    ) {
        log.info("【调课申请列表】page: {}, status: {}, urgency: {}, department: {}, keyword: {}",
                pageReq.getPage(), status, urgency, department, keyword);
        return Result.success(courseAdjustmentService.getApplicationList(
                pageReq, status, urgency, department, keyword));
    }

    @GetMapping("/applications/{id}")
    public Result<ApplicationDetailResp> getApplicationDetail(@PathVariable String id) {
        log.info("【调课申请详情】id: {}", id);
        Map<String, Object> result = courseAdjustmentService.getApplicationDetail(id);
        if ((boolean) result.get("success")) {
            return Result.success((ApplicationDetailResp) result.get("data"));
        }
        return Result.error(404, (String) result.get("message"));
    }

    @PostMapping("/applications")
    public Result<ApplicationCreateResp> createApplication(
            @Validated @RequestBody ApplicationCreateReq req) {
        log.info("【提交调课申请】teacher: {}, reason: {}", req.getTeacherName(), req.getReason());
        Map<String, Object> result = courseAdjustmentService.createApplication(req);
        if ((boolean) result.get("success")) {
            return Result.success("申请提交成功", (ApplicationCreateResp) result.get("data"));
        }
        return Result.error(400, (String) result.get("message"));
    }

    @PostMapping("/applications/review")
    public Result<ApplicationReviewResp> reviewApplication(
            @Validated @RequestBody ApplicationReviewReq req) {
        log.info("【审核调课申请】id: {}, status: {}", req.getApplicationId(), req.getStatus());
        Map<String, Object> result = courseAdjustmentService.reviewApplication(req);
        if ((boolean) result.get("success")) {
            String msg = "approved".equals(req.getStatus()) ? "审核成功" : "已驳回申请";
            return Result.success(msg, (ApplicationReviewResp) result.get("data"));
        }
        return Result.error(409, (String) result.get("message"));
    }

    @PostMapping("/applications/batch-review")
    public Result<BatchReviewResp> batchReview(
            @Validated @RequestBody BatchReviewReq req) {
        log.info("【批量审核调课申请】ids: {}, status: {}", req.getApplicationIds(), req.getStatus());
        Map<String, Object> result = courseAdjustmentService.batchReview(req);
        BatchReviewResp resp = (BatchReviewResp) result.get("data");
        String msg = String.format("批量审核完成，成功 %d 条，失败 %d 条",
                resp.getSuccessCount(), resp.getFailedIds().size());
        return Result.success(msg, resp);
    }

    @PostMapping("/applications/{id}/revoke")
    public Result<ApplicationRevokeResp> revokeApplication(@PathVariable String id) {
        log.info("【撤销调课申请】id: {}", id);
        Map<String, Object> result = courseAdjustmentService.revokeApplication(id);
        if ((boolean) result.get("success")) {
            return Result.success("申请已撤销", (ApplicationRevokeResp) result.get("data"));
        }
        return Result.error(409, (String) result.get("message"));
    }

    @DeleteMapping("/applications/{id}")
    public Result<ApplicationDeleteResp> deleteApplication(@PathVariable String id) {
        log.info("【删除调课申请】id: {}", id);
        Map<String, Object> result = courseAdjustmentService.deleteApplication(id);
        if ((boolean) result.get("success")) {
            return Result.success("删除成功", (ApplicationDeleteResp) result.get("data"));
        }
        return Result.error(404, (String) result.get("message"));
    }

    @GetMapping("/stats")
    public Result<ApplicationStatsResp> getStats() {
        log.info("【调课申请统计】");
        return Result.success(courseAdjustmentService.getStats());
    }

    @GetMapping("/stats/departments")
    public Result<List<DepartmentStatsResp>> getDepartmentStats() {
        log.info("【院系调课统计】");
        return Result.success(courseAdjustmentService.getDepartmentStats());
    }

    @GetMapping("/history")
    public Result<PageResult<ReviewHistoryResp>> getHistory(
            @RequestParam String applicationId,
            @ModelAttribute @Validated PageReq pageReq) {
        log.info("【审核历史记录】applicationId: {}", applicationId);
        return Result.success(courseAdjustmentService.getHistory(applicationId, pageReq));
    }
}
