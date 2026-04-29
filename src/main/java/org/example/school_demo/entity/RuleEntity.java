package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rule")
public class RuleEntity {

    @Id
    private String key;

    @Column(name = "rule_name", nullable = false, length = 200)
    private String ruleName;

    @Column(length = 5000)
    private String teachers;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "valid_start")
    private Long validStart;

    @Column(name = "valid_end")
    private Long validEnd;

    @Column(name = "created_time", updatable = false)
    private LocalDateTime createdTime;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @PrePersist
    protected void onCreate() {
        createdTime = LocalDateTime.now();
        updatedTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }
}
