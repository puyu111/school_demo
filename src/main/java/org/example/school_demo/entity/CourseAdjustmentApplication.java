package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "course_adjustment_application")
public class CourseAdjustmentApplication {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "teacher_id", nullable = false, length = 50)
    private String teacherId;

    @Column(name = "teacher_name", nullable = false, length = 100)
    private String teacherName;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "original_course_id")
    private Long originalCourseId;

    @Column(name = "original_course", columnDefinition = "TEXT")
    private String originalCourse;

    @Column(name = "original_detail", columnDefinition = "JSON")
    private String originalDetail;

    @Column(name = "target_course", columnDefinition = "TEXT")
    private String targetCourse;

    @Column(name = "target_detail", columnDefinition = "JSON")
    private String targetDetail;

    @Column(name = "target_weekday")
    private Integer targetWeekDay;

    @Column(name = "target_slot")
    private Integer targetSlot;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "pending";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String urgency = "normal";

    @Column(columnDefinition = "JSON")
    private String attachments;

    @Column(name = "apply_time")
    private LocalDateTime applyTime;

    @Column(name = "review_comment", length = 1000)
    private String reviewComment;

    @Column(name = "reviewer_id", length = 50)
    private String reviewerId;

    @Column(name = "reviewer_name", length = 100)
    private String reviewerName;

    @Column(name = "review_time")
    private LocalDateTime reviewTime;

    @Column(name = "created_time", updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @PrePersist
    protected void onCreate() {
        createdTime = LocalDateTime.now();
        updatedTime = LocalDateTime.now();
        if (applyTime == null) {
            applyTime = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }
}
