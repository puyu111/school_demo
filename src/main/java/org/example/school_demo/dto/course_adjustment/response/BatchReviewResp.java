package org.example.school_demo.dto.course_adjustment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchReviewResp {

    private int successCount;
    private List<String> failedIds;
    private List<BatchReviewDetail> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchReviewDetail {
        private String applicationId;
        private String status;
        private String message;
    }
}
