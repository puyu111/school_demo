package org.example.school_demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 排课请求 DTO
 * 用于接收前端的排课参数
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchedulingRequest {

    /**
     * 是否使用默认参数
     */
    @Builder.Default
    private Boolean useDefaultParams = true;

    /**
     * 初始温度（不传则使用默认值）
     */
    private Double initialTemperature;

    /**
     * 终止温度
     */
    private Double minTemperature;

    /**
     * 温度衰减系数 (0.9-0.99)
     */
    private Double coolingRate;

    /**
     * 每个温度水平的迭代次数
     */
    private Integer iterationsPerTemperature;

    /**
     * 连续无改进次数阈值（用于提前终止）
     */
    private Integer noImprovementThreshold;

    /**
     * 硬约束权重（默认极大值）
     */
    private Double hardConstraintWeight;

    /**
     * 软约束权重配置
     */
    private SoftConstraintWeights softWeights;

    /**
     * 软约束权重配置
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SoftConstraintWeights {
        /**
         * 教师偏好时间段满足度权重
         */
        @Builder.Default
        public Double teacherPreferenceWeight = 1.0;

        /**
         * 避免连续上课权重
         */
        @Builder.Default
        public Double continuousClassWeight = 2.0;

        /**
         * 教室利用率均衡权重
         */
        @Builder.Default
        public Double classroomBalanceWeight = 1.5;
    }
}
