package org.example.school_demo.service.course_adjustment.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.PageResult;
import org.example.school_demo.dto.course_adjustment.request.ApplicationCreateReq;
import org.example.school_demo.dto.course_adjustment.request.ApplicationReviewReq;
import org.example.school_demo.dto.course_adjustment.request.BatchReviewReq;
import org.example.school_demo.dto.course_adjustment.response.*;
import org.example.school_demo.entity.CourseAdjustmentApplication;
import org.example.school_demo.entity.ReviewHistory;
import org.example.school_demo.repository.CourseAdjustmentApplicationRepository;
import org.example.school_demo.repository.ReviewHistoryRepository;
import org.example.school_demo.service.course_adjustment.CourseAdjustmentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseAdjustmentServiceImpl implements CourseAdjustmentService {

    private final CourseAdjustmentApplicationRepository applicationRepo;
    private final ReviewHistoryRepository reviewHistoryRepo;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter DT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Override
    public PageResult<ApplicationListResp> getApplicationList(PageReq pageReq, String status,
                                                               String urgency, String department, String keyword) {
        if ("all".equals(status)) status = null;
        if ("all".equals(urgency)) urgency = null;

        Page<CourseAdjustmentApplication> page = applicationRepo.findByFilters(
                status, urgency, department, keyword, pageReq.toPageable());

        List<ApplicationListResp> list = page.getContent().stream()
                .map(this::entityToListResp)
                .collect(Collectors.toList());

        return PageResult.of(list, page.getTotalElements());
    }

    @Override
    public Map<String, Object> getApplicationDetail(String id) {
        Optional<CourseAdjustmentApplication> opt = applicationRepo.findById(id);
        if (opt.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "申请不存在: " + id);
            return result;
        }

        CourseAdjustmentApplication entity = opt.get();
        ApplicationDetailResp resp = ApplicationDetailResp.builder()
                .key(entity.getId())
                .id(entity.getId())
                .teacherId(entity.getTeacherId())
                .teacherName(entity.getTeacherName())
                .department(entity.getDepartment())
                .originalCourse(entity.getOriginalCourse())
                .targetCourse(entity.getTargetCourse())
                .reason(entity.getReason())
                .applyTime(formatDateTime(entity.getApplyTime()))
                .status(entity.getStatus())
                .urgency(entity.getUrgency())
                .reviewComment(entity.getReviewComment())
                .reviewerId(entity.getReviewerId())
                .reviewerName(entity.getReviewerName())
                .reviewTime(formatDateTime(entity.getReviewTime()))
                .originalCourseDetail(parseJsonToMap(entity.getOriginalDetail()))
                .targetCourseDetail(parseJsonToMap(entity.getTargetDetail()))
                .createdAt(entity.getCreatedTime())
                .updatedAt(entity.getUpdatedTime())
                .attachments(parseJsonToList(entity.getAttachments()))
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", resp);
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> createApplication(ApplicationCreateReq req) {
        String id = generateApplicationId();

        String attachmentsJson = toJson(req.getAttachments());

        CourseAdjustmentApplication entity = CourseAdjustmentApplication.builder()
                .id(id)
                .teacherId(req.getTeacherId())
                .teacherName(req.getTeacherName())
                .department(req.getDepartment())
                .originalCourseId(req.getOriginalCourseId())
                .originalCourse(req.getOriginalCourse())
                .targetCourse(req.getTargetCourse())
                .targetWeekDay(req.getTargetWeekDay())
                .targetSlot(req.getTargetSlot())
                .reason(req.getReason())
                .status("pending")
                .urgency(req.getUrgency())
                .attachments(attachmentsJson)
                .build();

        applicationRepo.save(entity);

        reviewHistoryRepo.save(ReviewHistory.builder()
                .applicationId(id)
                .action("submit")
                .actionName("提交申请")
                .operatorId(req.getTeacherId())
                .operatorName(req.getTeacherName())
                .operatorType("teacher")
                .comment(req.getReason())
                .timestamp(LocalDateTime.now())
                .build());

        log.info("调课申请已提交，id: {}, teacher: {}", id, req.getTeacherName());

        ApplicationCreateResp resp = ApplicationCreateResp.builder()
                .id(id)
                .teacherId(req.getTeacherId())
                .teacherName(req.getTeacherName())
                .status("pending")
                .applyTime(entity.getApplyTime())
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", resp);
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> reviewApplication(ApplicationReviewReq req) {
        return doReview(req.getApplicationId(), req.getStatus(),
                req.getReviewComment(), req.getReviewerId(), req.getReviewerName());
    }

    @Override
    @Transactional
    public Map<String, Object> batchReview(BatchReviewReq req) {
        List<BatchReviewResp.BatchReviewDetail> details = new ArrayList<>();
        List<String> failedIds = new ArrayList<>();
        int successCount = 0;

        for (String appId : req.getApplicationIds()) {
            Map<String, Object> reviewResult = doReview(appId, req.getStatus(),
                    req.getReviewComment(), "batch", "批量审核");

            boolean success = (boolean) reviewResult.get("success");
            String message = (String) reviewResult.get("message");

            details.add(BatchReviewResp.BatchReviewDetail.builder()
                    .applicationId(appId)
                    .status(success ? req.getStatus() : "failed")
                    .message(message)
                    .build());

            if (success) {
                successCount++;
            } else {
                failedIds.add(appId);
            }
        }

        BatchReviewResp resp = BatchReviewResp.builder()
                .successCount(successCount)
                .failedIds(failedIds)
                .details(details)
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", resp);
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> revokeApplication(String id) {
        Optional<CourseAdjustmentApplication> opt = applicationRepo.findById(id);
        if (opt.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "申请不存在: " + id);
            return result;
        }

        CourseAdjustmentApplication app = opt.get();
        if (!"pending".equals(app.getStatus())) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "该申请已审核，无法撤销");
            return result;
        }

        app.setStatus("revoked");
        applicationRepo.save(app);

        reviewHistoryRepo.save(ReviewHistory.builder()
                .applicationId(id)
                .action("revoke")
                .actionName("撤销申请")
                .operatorId(app.getTeacherId())
                .operatorName(app.getTeacherName())
                .operatorType("teacher")
                .timestamp(LocalDateTime.now())
                .build());

        ApplicationRevokeResp resp = ApplicationRevokeResp.builder()
                .id(id)
                .status("revoked")
                .revokeTime(LocalDateTime.now())
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", resp);
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteApplication(String id) {
        Optional<CourseAdjustmentApplication> opt = applicationRepo.findById(id);
        if (opt.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "申请不存在: " + id);
            return result;
        }

        String teacherName = opt.get().getTeacherName();
        applicationRepo.deleteById(id);

        ApplicationDeleteResp resp = ApplicationDeleteResp.builder()
                .deletedId(id)
                .teacherName(teacherName)
                .deleteTime(LocalDateTime.now())
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", resp);
        return result;
    }

    @Override
    public ApplicationStatsResp getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();

        return ApplicationStatsResp.builder()
                .total(applicationRepo.count())
                .pending(applicationRepo.countByStatus("pending"))
                .approved(applicationRepo.countByStatus("approved"))
                .rejected(applicationRepo.countByStatus("rejected"))
                .revoked(applicationRepo.countByStatus("revoked"))
                .highUrgency(applicationRepo.countByUrgency("high"))
                .normalUrgency(applicationRepo.countByUrgency("normal"))
                .thisWeekCount(applicationRepo.countByApplyTimeAfter(startOfWeek))
                .thisMonthCount(applicationRepo.countByApplyTimeAfter(startOfMonth))
                .build();
    }

    @Override
    public List<DepartmentStatsResp> getDepartmentStats() {
        List<Object[]> raw = applicationRepo.findDepartmentStats();
        return raw.stream().map(row -> DepartmentStatsResp.builder()
                .department((String) row[0])
                .total(((Number) row[1]).longValue())
                .pending(((Number) row[2]).longValue())
                .approved(((Number) row[3]).longValue())
                .rejected(((Number) row[4]).longValue())
                .build()).collect(Collectors.toList());
    }

    @Override
    public PageResult<ReviewHistoryResp> getHistory(String applicationId, PageReq pageReq) {
        Page<ReviewHistory> page = reviewHistoryRepo.findByApplicationId(applicationId,
                PageRequest.of(pageReq.getPage() - 1, pageReq.getPageSize(),
                        Sort.by(Sort.Direction.DESC, "timestamp")));

        List<ReviewHistoryResp> list = page.getContent().stream()
                .map(h -> ReviewHistoryResp.builder()
                        .id(h.getId())
                        .applicationId(h.getApplicationId())
                        .action(h.getAction())
                        .actionName(h.getActionName())
                        .operatorId(h.getOperatorId())
                        .operatorName(h.getOperatorName())
                        .operatorType(h.getOperatorType())
                        .comment(h.getComment())
                        .timestamp(h.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return PageResult.of(list, page.getTotalElements());
    }

    // ========== private helpers ==========

    private Map<String, Object> doReview(String applicationId, String status,
                                          String reviewComment, String reviewerId, String reviewerName) {
        Map<String, Object> result = new HashMap<>();

        Optional<CourseAdjustmentApplication> opt = applicationRepo.findById(applicationId);
        if (opt.isEmpty()) {
            result.put("success", false);
            result.put("message", "申请不存在: " + applicationId);
            return result;
        }

        CourseAdjustmentApplication app = opt.get();
        if (!"pending".equals(app.getStatus())) {
            result.put("success", false);
            result.put("message", "该申请已审核，无法操作");
            return result;
        }

        if ("rejected".equals(status) && (reviewComment == null || reviewComment.isBlank())) {
            result.put("success", false);
            result.put("message", "驳回时审核意见必填");
            return result;
        }

        app.setStatus(status);
        app.setReviewComment(reviewComment);
        app.setReviewerId(reviewerId);
        app.setReviewerName(reviewerName);
        app.setReviewTime(LocalDateTime.now());
        applicationRepo.save(app);

        reviewHistoryRepo.save(ReviewHistory.builder()
                .applicationId(applicationId)
                .action("review")
                .actionName("approved".equals(status) ? "审核通过" : "审核拒绝")
                .operatorId(reviewerId)
                .operatorName(reviewerName)
                .operatorType("admin")
                .comment(reviewComment)
                .timestamp(LocalDateTime.now())
                .build());

        log.info("调课申请审核完成，id: {}, status: {}", applicationId, status);

        result.put("success", true);
        result.put("data", ApplicationReviewResp.builder()
                .id(applicationId)
                .status(status)
                .reviewComment(reviewComment)
                .reviewerId(reviewerId)
                .reviewerName(reviewerName)
                .reviewTime(app.getReviewTime())
                .build());
        return result;
    }

    private String generateApplicationId() {
        String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = applicationRepo.countByIdStartingWith("T" + year);
        return "T" + year + String.format("%03d", count + 1);
    }

    private ApplicationListResp entityToListResp(CourseAdjustmentApplication entity) {
        return ApplicationListResp.builder()
                .key(entity.getId())
                .id(entity.getId())
                .teacherId(entity.getTeacherId())
                .teacherName(entity.getTeacherName())
                .department(entity.getDepartment())
                .originalCourse(entity.getOriginalCourse())
                .targetCourse(entity.getTargetCourse())
                .reason(entity.getReason())
                .applyTime(formatDateTime(entity.getApplyTime()))
                .status(entity.getStatus())
                .urgency(entity.getUrgency())
                .reviewComment(entity.getReviewComment())
                .reviewerId(entity.getReviewerId())
                .reviewerName(entity.getReviewerName())
                .reviewTime(formatDateTime(entity.getReviewTime()))
                .build();
    }

    private String formatDateTime(LocalDateTime dt) {
        return dt != null ? dt.format(DT_FORMATTER) : null;
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("JSON serialization error", e);
            return null;
        }
    }

    private Map<String, Object> parseJsonToMap(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("JSON parse error", e);
            return null;
        }
    }

    private List<Map<String, Object>> parseJsonToList(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.warn("JSON parse error", e);
            return null;
        }
    }
}
