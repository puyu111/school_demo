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
 * 教室实体类
 * <p>
 * 对应数据库表：room
 * 存储教室的基础信息。
 *
 * @author 排课系统开发团队
 * @since 2025-03-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "room", indexes = {
        @Index(name = "idx_building", columnList = "building"),
        @Index(name = "idx_type", columnList = "type")
})
public class RoomEntity {

    /**
     * 主键 ID（数据库主键）
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    /**
     * 教室名称
     */
    @Column(name = "room_name", length = 100, nullable = false)
    private String roomName;

    /**
     * 教室容量（座位数）
     */
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    /**
     * 教室类型
     * NORMAL=普通教室，LAB=实验室，COMPUTER=计算机房，MULTIMEDIA=多媒体教室，LECTURE_HALL=报告厅
     */
    @Column(name = "type", nullable = false, length = 50)
    @Builder.Default
    private String type = "NORMAL";

    /**
     * 所在楼宇
     */
    @Column(name = "building", length = 100)
    private String building;

    /**
     * 所在楼层（TINYINT）
     */
    @Column(name = "floor", columnDefinition = "TINYINT")
    private Integer floor;

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