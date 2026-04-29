package org.example.school_demo.dto.base_data.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageReq {

    @Min(value = 1, message = "页码最小值为 1")
    @Builder.Default
    private Integer page = 1;

    @Min(value = 1, message = "每页记录数最小值为 1")
    @Max(value = 100, message = "每页记录数最大值为 100")
    @Builder.Default
    private Integer pageSize = 10;

    public org.springframework.data.domain.Pageable toPageable() {
        return org.springframework.data.domain.PageRequest.of(
                page - 1, pageSize,
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdTime")
        );
    }
}
