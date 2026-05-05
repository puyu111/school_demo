package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "schedule_history")
public class ScheduleHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String action;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "course_name", length = 200)
    private String courseName;

    @Column(name = "teacher_name", length = 100)
    private String teacherName;

    @Column(name = "class_name", length = 100)
    private String className;

    @Column(length = 20)
    private String day;

    @Column
    private Integer slot;

    @Column(length = 50)
    private String operator;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
