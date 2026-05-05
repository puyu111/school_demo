package org.example.school_demo.dto.algorithm.response;

import lombok.Data;
import org.example.school_demo.dto.drag_schedule.response.CourseVO;

import java.util.List;
import java.util.Map;

/**
 * 自动排课结果。
 */
@Data
public class AutoScheduleResultVO {

    /** 排课结果列表 */
    private List<CourseVO> schedules;

    /** 最终代价 */
    private double totalCost;

    /** 实际迭代次数 */
    private int iterations;

    /** 各规则得分 (ruleId -> violationCount) */
    private Map<String, Double> ruleScores;

    /** 执行耗时（毫秒） */
    private long executionTimeMs;

    /** 接受次数 */
    private int acceptedCount;

    /** 拒绝次数 */
    private int rejectedCount;

    /** 结果描述 */
    private String message;
}
