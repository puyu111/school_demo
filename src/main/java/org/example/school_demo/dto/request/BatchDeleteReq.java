package org.example.school_demo.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 批量删除请求（通用）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDeleteReq {
    @NotEmpty(message = "删除ID列表不能为空")
    private List<Long> dbIds;
}
