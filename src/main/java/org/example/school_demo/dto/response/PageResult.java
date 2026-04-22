package org.example.school_demo.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 通用分页响应数据包装类
 * <p>
 * 用于封装分页查询的结果，包含数据列表和总记录数。
 * 所有分页列表接口的 data 字段都使用此类进行包装。
 *
 * @param <T> 列表元素的泛型类型
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PageResult<T> {

    /**
     * 当前页的数据列表
     */
    private List<T> list;

    /**
     * 总记录数
     * 用于前端计算总页数
     */
    private Long total;

    /**
     * 便捷构造方法
     *
     * @param list 数据列表
     * @param total 总记录数
     * @param <T> 数据类型
     * @return PageResult<T>
     */
    public static <T> PageResult<T> of(List<T> list, Long total) {
        return PageResult.<T>builder()
                .list(list)
                .total(total)
                .build();
    }
}