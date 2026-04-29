package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Data
@Entity
@Table(name = "time_slot_config")
public class TimeSlotConfigEntity {

    @Id
    private String id;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer duration;

    @Column(name = "half_day_type", nullable = false, length = 20)
    private String halfDayType;

    @Column(name = "is_break")
    private Boolean isBreak = false;

    private Integer breakAfter;

    @Column(name = "is_schedulable")
    private Boolean isSchedulable = true;
}
