package org.example.school_demo.dto.base_data.request;

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
public class MajorBatchDeleteReq {
    @NotEmpty(message = "删除ID列表不能为空")
    private List<String> dbIds;
}
