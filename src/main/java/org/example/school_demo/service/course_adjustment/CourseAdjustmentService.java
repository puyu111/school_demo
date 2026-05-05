package org.example.school_demo.service.course_adjustment;

import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.PageResult;
import org.example.school_demo.dto.course_adjustment.request.ApplicationCreateReq;
import org.example.school_demo.dto.course_adjustment.request.ApplicationReviewReq;
import org.example.school_demo.dto.course_adjustment.request.BatchReviewReq;
import org.example.school_demo.dto.course_adjustment.response.*;

import java.util.List;
import java.util.Map;

public interface CourseAdjustmentService {

    PageResult<ApplicationListResp> getApplicationList(PageReq pageReq, String status,
                                                       String urgency, String department, String keyword);

    Map<String, Object> getApplicationDetail(String id);

    Map<String, Object> createApplication(ApplicationCreateReq req);

    Map<String, Object> reviewApplication(ApplicationReviewReq req);

    Map<String, Object> batchReview(BatchReviewReq req);

    Map<String, Object> revokeApplication(String id);

    Map<String, Object> deleteApplication(String id);

    ApplicationStatsResp getStats();

    List<DepartmentStatsResp> getDepartmentStats();

    PageResult<ReviewHistoryResp> getHistory(String applicationId, PageReq pageReq);
}
