package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalTime;
import java.util.List;

@Data
@Entity
@Table(name = "schedule")
public class ScheduleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Long teacherId;

    @Column(length = 50)
    private String classId;

    private Long roomId;

    @Column(nullable = false)
    private Integer weekday;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer duration;

    @Lob
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "TEXT")
    private List<Integer> weeks;

    private String color;

    private Integer studentCount;
}
