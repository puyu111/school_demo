package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "disabled_date")
public class DisabledDateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "disabled_id")
    private Long disabledId;

    @Column(name = "calendar_id", nullable = false)
    private Long calendarId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "remark", length = 255)
    private String remark;

    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdTime;
}
