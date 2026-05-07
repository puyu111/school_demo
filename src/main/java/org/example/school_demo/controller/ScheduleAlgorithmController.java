package org.example.school_demo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.algorithm.request.AutoScheduleRequest;
import org.example.school_demo.dto.algorithm.response.AutoScheduleResultVO;
import org.example.school_demo.dto.rule.response.RuleWeightVO;
import org.example.school_demo.service.RuleConfigurationService;
import org.example.school_demo.service.SimulatedAnnealingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 排课算法接口。
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class ScheduleAlgorithmController {

    private final SimulatedAnnealingService saService;
    private final RuleConfigurationService ruleConfigService;

    /**
     * 执行自动排课并写入数据库。
     */
    @PostMapping("/api/algorithm/auto-schedule")
    public Result<AutoScheduleResultVO> autoSchedule(@RequestBody AutoScheduleRequest request) {
        log.info("【算法-自动排课】week: {}, courseIds: {}", request.getWeek(), request.getCourseIds());
        try {
            AutoScheduleResultVO result = saService.autoSchedule(request, true);
            return Result.success("自动排课完成", result);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error("自动排课失败: " + e.getMessage());
        }
    }

    /**
     * 预览排课结果（不写入数据库）。
     */
    @PostMapping("/api/algorithm/preview")
    public Result<AutoScheduleResultVO> preview(@RequestBody AutoScheduleRequest request) {
        log.info("【算法-预览排课】week: {}, courseIds: {}", request.getWeek(), request.getCourseIds());
        try {
            AutoScheduleResultVO result = saService.autoSchedule(request, false);
            return Result.success("预览完成", result);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            return Result.error("预览失败: " + e.getMessage());
        }
    }

    /**
     * 获取当前可用规则及权重。
     */
    @GetMapping("/api/algorithm/rules")
    public Result<List<RuleWeightVO>> getRules() {
        log.info("【算法-规则列表】");
        try {
            List<RuleWeightVO> rules = ruleConfigService.getRuleWeights();
            return Result.success(rules);
        } catch (Exception e) {
            return Result.error("获取规则失败: " + e.getMessage());
        }
    }
}
