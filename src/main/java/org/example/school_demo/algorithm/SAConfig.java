package org.example.school_demo.algorithm;

import lombok.Data;

/**
 * 模拟退火算法参数配置。
 */
@Data
public class SAConfig {

    /** 初始温度 */
    private double initialTemp = 100.0;

    /** 冷却速率 (0 < rate < 1) */
    private double coolingRate = 0.995;

    /** 终止温度 */
    private double minTemp = 0.1;

    /** 每个温度下的最大迭代次数 */
    private int maxIterations = 100000;

    /** 重启次数（取最优解） */
    private int restartCount = 3;

    /** 随机种子（null 表示随机） */
    private Long seed;

    /**
     * 默认配置
     */
    public static SAConfig defaults() {
        return new SAConfig();
    }
}
