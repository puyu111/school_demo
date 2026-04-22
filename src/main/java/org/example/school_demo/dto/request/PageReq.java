package org.example.school_demo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * 分页查询请求 DTO
 * <p>
 * 用于接收前端提交的分页参数，所有分页列表接口通用。
 *
 * <h3>使用场景：</h3>
 * <pre>GET /api/base-data/courses?page=1&amp;pageSize=10</pre>
 *
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageReq {

    /**
     * 当前页码
     * 从 1 开始，默认值：1
     */
    @Min(value = 1, message = "页码最小值为 1")
    @Builder.Default
    private Integer page = 1;

    /**
     * 每页记录数
     * 默认值：10，最大值：100
     */
    @Min(value = 1, message = "每页记录数最小值为 1")
    @Max(value = 100, message = "每页记录数最大值为 100")
    @Builder.Default
    private Integer pageSize = 10;

    /**
     * 获取偏移量（用于数据库分页查询）
     * @return offset = (page - 1) * pageSize
     */
    public int getOffset() {
        return (page - 1) * pageSize;
    }

    /**
     * 转换为 Spring Data JPA 的 Pageable 对象
     * @return Pageable 对象（页码从 0 开始，按创建时间倒序）
     */
    public org.springframework.data.domain.Pageable toPageable() {
        return org.springframework.data.domain.PageRequest.of(
                page - 1,  // JPA 页码从 0 开始
                pageSize,
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC,
                        "createdTime"  // 默认按创建时间倒序
                )
        );
    }
}