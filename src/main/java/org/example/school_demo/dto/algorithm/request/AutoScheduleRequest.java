package org.example.school_demo.dto.algorithm.request;

import lombok.Data;
import org.example.school_demo.algorithm.SAConfig;

import java.util.List;
import java.util.Map;

/**
 * 自动排课请求。
 */
@Data
public class AutoScheduleRequest {

    /** 排课周次（必填） */
    private Integer week;

    /** 指定待排课程 ID 列表（可选，空则排全部） */
    private List<Long> courseIds;

    /** 自定义退火参数（可选） */
    private SAConfig config;

    /** 临时覆盖规则权重 (ruleId -> weight)（可选） */
    private Map<String, Integer> ruleOverrides;
}
