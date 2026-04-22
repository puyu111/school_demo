package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 教师实体
 * 对应数据库表：teacher
 */
@Entity
@Table(name = "teacher")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherEnt {

    /**
     * 教师 ID
     */
    @Id
    @Column(name = "id", length = 32)
    private String id;

    /**
     * 教师姓名
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 最大连续授课节数
     */
    @Column(name = "max_continuous_periods", nullable = false)
    @Builder.Default
    private Integer maxContinuousPeriods = 4;

    /**
     * 可用时间段集合
     */
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TeacherAvailableSlotEntity> availableSlots = new HashSet<>();

    /**
     * 偏好时间段集合
     */
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<TeacherPreferredSlotEntity> preferredSlots = new HashSet<>();

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private LocalDateTime updatedTime;

    /**
     * 添加可用时间段
     */
    public void addAvailableSlot(TimeSlotEntity timeSlot) {
        TeacherAvailableSlotEntity slot = TeacherAvailableSlotEntity.builder()
                .teacher(this)
                .timeSlot(timeSlot)
                .build();
        availableSlots.add(slot);
    }

    /**
     * 添加偏好时间段
     */
    public void addPreferredSlot(TimeSlotEntity timeSlot) {
        TeacherPreferredSlotEntity slot = TeacherPreferredSlotEntity.builder()
                .teacher(this)
                .timeSlot(timeSlot)
                .build();
        preferredSlots.add(slot);
    }
}
