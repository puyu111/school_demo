package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rule_weight")
public class RuleWeightEntity {

    @Id
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "current_weight", nullable = false)
    private Integer currentWeight;

    @Column(name = "default_weight", nullable = false)
    private Integer defaultWeight;

    @Column(name = "min_weight", nullable = false)
    private Integer minWeight;

    @Column(name = "max_weight", nullable = false)
    private Integer maxWeight;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(length = 500)
    private String description;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedTime = LocalDateTime.now();
    }
}
