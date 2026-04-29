package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "weekday_config")
public class WeekDayConfigEntity {

    @Id
    private Integer id;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(name = "is_enabled")
    private Boolean isEnabled = true;

    @Column(name = "is_schedulable")
    private Boolean isSchedulable = true;
}
