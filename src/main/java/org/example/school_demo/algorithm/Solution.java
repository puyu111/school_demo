package org.example.school_demo.algorithm;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 解的表示：排课单元列表 + 代价值。
 */
@Data
public class Solution {

    /** 所有排课单元 */
    private List<ScheduleSlot> slots;

    /** 当前总代价 */
    private double cost;

    /** 各规则的评估结果 (ruleId -> violationCount) */
    private Map<String, Double> ruleScores;

    public Solution() {
        this.slots = new ArrayList<>();
        this.cost = Double.MAX_VALUE;
    }

    public Solution(List<ScheduleSlot> slots) {
        this.slots = slots;
        this.cost = Double.MAX_VALUE;
    }

    /**
     * 深拷贝：用于生成邻域解时避免修改原解。
     */
    public Solution deepCopy() {
        Solution copy = new Solution();
        List<ScheduleSlot> copiedSlots = new ArrayList<>(slots.size());
        for (ScheduleSlot slot : slots) {
            copiedSlots.add(slot.deepCopy());
        }
        copy.setSlots(copiedSlots);
        copy.setCost(this.cost);
        copy.setRuleScores(this.ruleScores);
        return copy;
    }
}
