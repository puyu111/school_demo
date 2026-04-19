package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 教室可用时间段关联实体
 * 对应数据库表：classroom_available_slot
 */
@Entity
@Table(name = "classroom_available_slot",
       uniqueConstraints = @UniqueConstraint(columnNames = {"classroom_id", "time_slot_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomAvailableSlotEntity {

    /**
     * 主键 ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 教室
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "classroom_id", nullable = false)
    private ClassroomEntity classroom;

    /**
     * 时间段
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlotEntity timeSlot;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;
}
