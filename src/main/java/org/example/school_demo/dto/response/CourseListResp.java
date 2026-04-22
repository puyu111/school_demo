package org.example.school_demo.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 课程列表响应 DTO
 * <p>
 * 用于返回课程列表中的单条课程数据。
 *
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseListResp {

    /**
     * 数据库主键 ID
     */
    private Long dbId;

    /**
     * 课程 ID（业务主键）
     */
    private String id;

    /**
     * 课程名称
     */
    private String name;

    /**
     * 学分
     */
    private Integer credits;

    /**
     * 课程类型
     */
    private String type;

    /**
     * 总学时
     */
    private Integer totalHours;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}