package org.example.school_demo.dto.course_adjustment.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchReviewReq {

    @NotEmpty(message = "申请ID列表不能为空")
    private List<String> applicationIds;

    @NotBlank(message = "审核结果不能为空")
    private String status;

    private String reviewComment;
}
