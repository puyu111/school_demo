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
 * 教室实体
 * 对应数据库表：classroom
 */
@Entity
@Table(name = "classroom")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomEntity {

    /**
     * 教室 ID
     */
    @Id
    @Column(name = "id", length = 32)
    private String id;

    /**
     * 教室名称/编号
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 教室容量（座位数）
     */
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    /**
     * 教室类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    @Builder.Default
    private ClassroomType type = ClassroomType.NORMAL;

    /**
     * 所在楼宇
     */
    @Column(name = "building", length = 100)
    private String building;

    /**
     * 楼层
     * 使用 Short 类型匹配数据库 TINYINT
     */
    @Column(name = "floor", columnDefinition = "TINYINT")
    private Short floor;

    /**
     * 可用时间段集合
     */
    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ClassroomAvailableSlotEntity> availableSlots = new HashSet<>();

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
     * 教室类型枚举
     */
    public enum ClassroomType {
        NORMAL("普通教室"),
        LAB("实验室"),
        COMPUTER("计算机房"),
        MULTIMEDIA("多媒体教室"),
        LECTURE_HALL("报告厅");

        private final String description;

        ClassroomType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 添加可用时间段
     */
    public void addAvailableSlot(TimeSlotEntity timeSlot) {
        ClassroomAvailableSlotEntity slot = ClassroomAvailableSlotEntity.builder()
                .classroom(this)
                .timeSlot(timeSlot)
                .build();
        availableSlots.add(slot);
    }
}
