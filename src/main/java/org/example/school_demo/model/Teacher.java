package org.example.school_demo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * 教师实体
 * 表示一位任课教师及其可用时间段
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    /**
     * 教师唯一标识
     */
    private String id;

    /**
     * 教师姓名
     */
    private String name;

    /**
     * 可用时间段集合
     * 存储时间段 ID，如 "Mon-1", "Tue-3"
     */
    @Builder.Default
    private Set<String> availableSlots = new HashSet<>();

    /**
     * 偏好时间段集合（用于软约束优化）
     * 这些时间段被满足时会获得奖励分数
     */
    @Builder.Default
    private Set<String> preferredSlots = new HashSet<>();

    /**
     * 最大连续授课节数限制（硬约束）
     * 默认不限制
     */
    @Builder.Default
    private Integer maxContinuousPeriods = 4;

    /**
     * 检查教师在该时间段是否可用
     */
    public boolean isAvailableAt(String slotId) {
        return availableSlots.contains(slotId);
    }

    /**
     * 检查该时间段是否是教师的偏好时间段
     */
    public boolean isPreferred(String slotId) {
        return preferredSlots.contains(slotId);
    }

    /**
     * 添加可用时间段
     */
    public void addAvailableSlot(String slotId) {
        availableSlots.add(slotId);
    }

    /**
     * 添加偏好时间段
     */
    public void addPreferredSlot(String slotId) {
        preferredSlots.add(slotId);
    }
}
