package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 时间段实体
 * 对应数据库表：time_slot
 */
@Entity
@Table(name = "time_slot")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotEntity {

    /**
     * 时间段 ID，如 "Mon-1" 表示周一第 1 节
     */
    @Id
    @Column(name = "id", length = 20)
    private String id;

    /**
     * 星期几 (1-7, 1=周一)
     */
    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    /**
     * 节次 (1-12)
     */
    @Column(name = "period", nullable = false)
    private Integer period;

    /**
     * 显示名称，如 "周一第 1 节"
     */
    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

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
}
