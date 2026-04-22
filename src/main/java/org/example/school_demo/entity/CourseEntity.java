package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 课程实体类
 * <p>
 * 对应数据库表：course
 * 存储课程的基础信息。
 *
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "course", indexes = {
        @Index(name = "idx_course_type", columnList = "course_type")
})
public class CourseEntity {

    /**
     * 主键 ID（数据库主键）
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    /**
     * 课程名称
     */
    @Column(name = "course_name", length = 200, nullable = false)
    private String courseName;

    /**
     * 学分
     */
    @Column(name = "credits", nullable = false, precision = 3, scale = 1)
    private java.math.BigDecimal credits;

    /**
     * 持续周数
     */
    @Column(name = "duration", nullable = false)
    private Integer duration;

    /**
     * 排课优先级（数字越小优先级越高）
     */
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 1;

    /**
     * 课程类型
     * THEORY=理论课，PRACTICE=实践课，LAB=实验课
     */
    @Column(name = "course_type", nullable = false, length = 50)
    @Builder.Default
    private String courseType = "THEORY";

    /**
     * 总学时
     */
    @Column(name = "total_hours", nullable = false)
    private Integer totalHours;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private LocalDateTime updatedTime;

    /**
     * 课程类型枚举
     */
    public enum CourseType {
        THEORY("理论课"),
        PRACTICE("实践课"),
        LAB("实验课");

        private final String description;

        CourseType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}