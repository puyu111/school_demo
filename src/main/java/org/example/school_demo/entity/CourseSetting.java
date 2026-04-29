package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "course_setting", indexes = {
        @Index(name = "idx_cs_course_name", columnList = "course_name"),
        @Index(name = "idx_cs_semester", columnList = "semester"),
        @Index(name = "idx_cs_priority", columnList = "priority")
})
public class CourseSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "db_id")
    private Long dbId;

    @Column(name = "course_name", length = 200, nullable = false)
    private String courseName;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 1;

    @Lob
    @Column(name = "prerequisites", columnDefinition = "TEXT")
    private String prerequisites;

    @Column(name = "semester", length = 50, nullable = false)
    private String semester;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedTime;
}
