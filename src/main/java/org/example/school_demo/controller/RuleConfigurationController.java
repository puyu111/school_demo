package org.example.school_demo.controller;

import org.example.school_demo.common.Result;
import org.example.school_demo.dto.rule.request.*;
import org.example.school_demo.dto.rule.response.*;
import org.example.school_demo.service.RuleConfigurationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class RuleConfigurationController {

    private final RuleConfigurationService service;

    public RuleConfigurationController(RuleConfigurationService service) {
        this.service = service;
    }

    // ========================= 一、规则管理 =========================

    @GetMapping("/api/rules")
    public Result<Map<String, Object>> getRules(
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(service.getRules(current, pageSize));
    }

    @PostMapping("/api/rules")
    public Result<RuleVO> createRule(@RequestBody RuleCreateRequest req) {
        return Result.success(service.createRule(req));
    }

    @PutMapping("/api/rules/{key}")
    public Result<RuleVO> updateRule(@PathVariable String key, @RequestBody RuleUpdateRequest req) {
        return Result.success(service.updateRule(key, req));
    }

    @DeleteMapping("/api/rules/{key}")
    public Result<Void> deleteRule(@PathVariable String key) {
        service.deleteRule(key);
        return Result.success(null);
    }

    // ========================= 二、教师管理 =========================

    @GetMapping("/api/teachers")
    public Result<List<TeacherVO>> getTeachers() {
        return Result.success(service.getTeachers());
    }

    // ========================= 三、教师不可用日期 =========================

    @GetMapping("/api/unavailable-dates")
    public Result<List<UnavailableDateVO>> getUnavailableDates(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String type) {
        return Result.success(service.getUnavailableDates(teacherId, type));
    }

    @PostMapping("/api/unavailable-dates")
    public Result<UnavailableDateVO> createUnavailableDate(@RequestBody UnavailableDateRequest req) {
        return Result.success(service.createUnavailableDate(req));
    }

    @PostMapping("/api/unavailable-dates/batch")
    public Result<List<UnavailableDateVO>> createUnavailableDatesBatch(@RequestBody List<UnavailableDateRequest> requests) {
        return Result.success(service.createUnavailableDatesBatch(requests));
    }

    @DeleteMapping("/api/unavailable-dates/{key}")
    public Result<Void> deleteUnavailableDate(@PathVariable String key) {
        service.deleteUnavailableDate(key);
        return Result.success(null);
    }

    @PostMapping("/api/unavailable-dates/batch-delete")
    public Result<Void> batchDeleteUnavailableDates(@RequestBody BatchDeleteRequest req) {
        service.batchDeleteUnavailableDates(req.getKeys());
        return Result.success(null);
    }

    // ========================= 四、规则权重管理 =========================

    @GetMapping("/api/rule-weights")
    public Result<List<RuleWeightVO>> getRuleWeights() {
        return Result.success(service.getRuleWeights());
    }

    @PutMapping("/api/rule-weights/{id}")
    public Result<RuleWeightVO> updateRuleWeight(@PathVariable String id, @RequestBody WeightUpdateRequest req) {
        return Result.success(service.updateRuleWeight(id, req));
    }

    @PostMapping("/api/rule-weights/batch")
    public Result<List<RuleWeightVO>> batchUpdateRuleWeights(@RequestBody List<WeightBatchItem> items) {
        return Result.success(service.batchUpdateRuleWeights(items));
    }

    @GetMapping("/api/rule-weights/history")
    public Result<Map<String, Object>> getWeightHistory(
            @RequestParam(required = false) String ruleId,
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(service.getWeightHistory(ruleId, current, pageSize));
    }

    @PostMapping("/api/rule-weights/reset")
    public Result<Map<String, Object>> resetRuleWeights() {
        return Result.success(service.resetRuleWeights());
    }
}
