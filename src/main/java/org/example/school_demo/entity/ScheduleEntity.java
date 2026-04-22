package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 排课记录实体类
 * <p>
 * 对应数据库表：schedule
 * 存储排课记录，是核心关联表，关联课程、教师、班级、教室、学期。
 *
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "schedule", indexes = {
        @Index(name = "idx_course_id", columnList = "course_id"),
        @Index(name = "idx_teacher_id", columnList = "teacher_id"),
        @Index(name = "idx_class_id", columnList = "class_id"),
        @Index(name = "idx_room_id", columnList = "room_id"),
        @Index(name = "idx_semester_id", columnList = "semester_id"),
        @Index(name = "idx_class_time", columnList = "class_time"),
        @Index(name = "idx_week", columnList = "week")
})
public class ScheduleEntity {

    /**
     * 主键 ID（数据库主键）
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    /**
     * 课程 ID（外键 -> course.course_id）
     */
    @Column(name = "course_id", nullable = false)
    private Long courseId;

    /**
     * 教师 ID（外键 -> teacher.teacher_id）
     */
    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;

    /**
     * 班级 ID（外键 -> class.class_id）
     */
    @Column(name = "class_id", nullable = false)
    private Long classId;

    /**
     * 教室 ID（外键 -> room.room_id）
     */
    @Column(name = "room_id", nullable = false)
    private Long roomId;

    /**
     * 学期 ID（外键 -> semester.semester_id）
     */
    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    /**
     * 上课日期
     */
    @Column(name = "class_time", nullable = false)
    private LocalDate classTime;

    /**
     * 第几周
     */
    @Column(name = "week", nullable = false)
    private Integer week;

    /**
     * 第几节课（1-12 节）
     */
    @Column(name = "period", nullable = false)
    private Integer period;

    /**
     * 状态
     * SCHEDULED=已排课，CANCELLED=已取消，COMPLETED=已完成
     */
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "SCHEDULED";

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
}