package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "disabled_date", indexes = {
        @Index(name = "idx_dd_calendar_id", columnList = "calendar_id"),
        @Index(name = "idx_dd_date", columnList = "date")
})
public class DisabledDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "calendar_id", nullable = false)
    private Long calendarId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "remark", length = 200)
    private String remark;
}
