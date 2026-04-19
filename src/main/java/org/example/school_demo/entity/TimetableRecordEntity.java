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
 * 排课结果实体
 * 对应数据库表：timetable_record
 */
@Entity
@Table(name = "timetable_record")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableRecordEntity {

    /**
     * 主键 ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 排课任务 ID
     */
    @Column(name = "task_id", nullable = false, length = 64)
    private String taskId;

    /**
     * 课程 ID
     */
    @Column(name = "course_id", nullable = false, length = 32)
    private String courseId;

    /**
     * 教师 ID
     */
    @Column(name = "teacher_id", nullable = false, length = 32)
    private String teacherId;

    /**
     * 教室 ID
     */
    @Column(name = "classroom_id", nullable = false, length = 32)
    private String classroomId;

    /**
     * 时间段 ID
     */
    @Column(name = "time_slot_id", nullable = false, length = 20)
    private String timeSlotId;

    /**
     * 所属排课方案 ID
     */
    @Column(name = "solution_id", nullable = false, length = 64)
    private String solutionId;

    /**
     * 状态：PENDING=待确认，CONFIRMED=已确认，PUBLISHED=已发布
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TimetableStatus status = TimetableStatus.PENDING;

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
     * 排课状态枚举
     */
    public enum TimetableStatus {
        PENDING("待确认"),
        CONFIRMED("已确认"),
        PUBLISHED("已发布");

        private final String description;

        TimetableStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
