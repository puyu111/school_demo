package org.example.school_demo.dto.course_adjustment.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewReq {

    @NotBlank(message = "申请ID不能为空")
    private String applicationId;

    @NotBlank(message = "审核结果不能为空")
    private String status;

    private String reviewComment;

    @NotBlank(message = "审核人ID不能为空")
    private String reviewerId;

    @NotBlank(message = "审核人姓名不能为空")
    private String reviewerName;
}
