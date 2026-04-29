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
@Table(name = "major", indexes = {
        @Index(name = "idx_major_name", columnList = "name"),
        @Index(name = "uk_major_id", columnList = "id", unique = true)
})
public class Major {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "db_id")
    private Long dbId;

    @Column(name = "id", length = 50, unique = true)
    private String id;

    @Column(name = "name", length = 200, nullable = false)
    private String name;

    @Lob
    @Column(name = "courses", columnDefinition = "TEXT")
    private String courses;

    @Column(name = "class_size", nullable = false)
    private Integer classSize;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedTime;
}
