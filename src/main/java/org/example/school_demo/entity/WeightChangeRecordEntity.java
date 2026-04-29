package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "weight_change_record")
public class WeightChangeRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id", nullable = false, length = 50)
    private String ruleId;

    @Column(name = "rule_name", nullable = false, length = 200)
    private String ruleName;

    @Column(name = "old_value", nullable = false)
    private Integer oldValue;

    @Column(name = "new_value", nullable = false)
    private Integer newValue;

    @Column(name = "change_time", nullable = false)
    private LocalTime changeTime;

    @Column(name = "change_date", nullable = false)
    private LocalDate changeDate;
}
