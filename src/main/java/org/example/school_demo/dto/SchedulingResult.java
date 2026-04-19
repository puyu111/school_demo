package org.example.school_demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import org.example.school_demo.model.TimetableSolution;

/**
 * 排课算法执行结果 DTO
 * 用于返回给前端的完整结果
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchedulingResult {

    /**
     * 任务 ID
     */
    private String taskId;

    /**
     * 执行状态：RUNNING, COMPLETED, FAILED
     */
    private String status;

    /**
     * 排课方案（完成后才有值）
     */
    private TimetableSolution solution;

    /**
     * 算法迭代次数
     */
    private Integer iterations;

    /**
     * 最终温度
     */
    private Double finalTemperature;

    /**
     * 最终代价/适应度
     */
    private Double finalCost;

    /**
     * 是否找到可行解（无硬约束违反）
     */
    private Boolean foundFeasibleSolution;

    /**
     * 执行耗时（毫秒）
     */
    private Long executionTimeMs;

    /**
     * 错误信息（如果失败）
     */
    private String errorMessage;

    /**
     * 算法进度百分比 (0-100)
     */
    private Integer progress;

    /**
     * 详细信息列表
     */
    private List<String> details;
}
