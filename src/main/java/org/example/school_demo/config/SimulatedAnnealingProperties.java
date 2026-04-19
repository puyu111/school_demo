package org.example.school_demo.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 模拟退火算法参数配置
 * 可通过 application.yml 外部配置
 */
@Data
@Component
@ConfigurationProperties(prefix = "scheduling.sa")
public class SimulatedAnnealingProperties {

    /**
     * 初始温度
     * 温度越高，初始接受劣解的概率越大，越有利于全局搜索
     */
    private Double initialTemperature = 1000.0;

    /**
     * 终止温度（当温度低于此值时停止）
     */
    private Double minTemperature = 0.1;

    /**
     * 温度衰减系数 (0 < alpha < 1)
     * 推荐范围：[0.90, 0.99]
     * 越大则降温越慢，搜索越充分但耗时越长
     */
    private Double coolingRate = 0.95;

    /**
     * 每个温度水平的迭代次数
     * 越大则每个温度下搜索越充分
     */
    private Integer iterationsPerTemperature = 100;

    /**
     * 连续无改进次数阈值（用于提前终止）
     * 当连续这么多代没有改进最优解时，提前停止
     */
    private Integer noImprovementThreshold = 50;

    /**
     * 硬约束违反的惩罚权重
     * 必须远大于软约束权重，确保优先满足硬约束
     */
    private Double hardConstraintWeight = 1000.0;

    /**
     * 软约束权重：教师偏好时间段满足度
     */
    private Double teacherPreferenceWeight = 1.0;

    /**
     * 软约束权重：避免连续上课
     */
    private Double continuousClassWeight = 2.0;

    /**
     * 软约束权重：教室利用率均衡
     */
    private Double classroomBalanceWeight = 1.5;

    /**
     * 随机种子（用于复现结果，null 表示使用随机种子）
     */
    private Long randomSeed;

    /**
     * 是否启用详细日志
     */
    private Boolean enableDetailedLogging = false;
}
