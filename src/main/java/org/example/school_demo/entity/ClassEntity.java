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
 * 班级实体类
 * <p>
 * 对应数据库表：class
 * 存储班级的基础信息。
 *
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "class", indexes = {
        @Index(name = "idx_major_id", columnList = "major_id"),
        @Index(name = "idx_grade", columnList = "grade")
})
public class ClassEntity {

    /**
     * 主键 ID（数据库主键）
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    private Long classId;

    /**
     * 班级名称
     */
    @Column(name = "class_name", length = 100, nullable = false)
    private String className;

    /**
     * 专业 ID
     */
    @Column(name = "major_id", length = 50, nullable = false)
    private String majorId;

    /**
     * 学生人数
     */
    @Column(name = "student_count", nullable = false)
    private Integer studentCount;

    /**
     * 年级（如：2023）
     */
    @Column(name = "grade", length = 10, nullable = false)
    private String grade;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedTime;
}