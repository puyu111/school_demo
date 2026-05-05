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
@Table(name = "review_history")
public class ReviewHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false, length = 50)
    private String applicationId;

    @Column(nullable = false, length = 20)
    private String action;

    @Column(name = "action_name", nullable = false, length = 50)
    private String actionName;

    @Column(name = "operator_id", nullable = false, length = 50)
    private String operatorId;

    @Column(name = "operator_name", nullable = false, length = 100)
    private String operatorName;

    @Column(name = "operator_type", nullable = false, length = 20)
    private String operatorType;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
