package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "unavailable_date")
public class UnavailableDateEntity {

    @Id
    @Column(name = "`key`")
    private String key;

    @Column(name = "teacher_id", nullable = false, length = 50)
    private String teacherId;

    @Column(name = "teacher_name", nullable = false, length = 100)
    private String teacherName;

    @Column(name = "valid_start", nullable = false)
    private Long validStart;

    @Column(name = "valid_end", nullable = false)
    private Long validEnd;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(name = "range_type", length = 20)
    private String rangeType;
}
