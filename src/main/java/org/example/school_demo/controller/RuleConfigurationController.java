package org.example.school_demo.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.rule.request.*;
import org.example.school_demo.dto.rule.response.*;
import org.example.school_demo.service.RuleConfigurationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
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
        log.info("【规则配置-规则列表】current: {}, pageSize: {}", current, pageSize);
        return Result.success(service.getRules(current, pageSize));
    }

    @PostMapping("/api/rules")
    public Result<RuleVO> createRule(@RequestBody RuleCreateRequest req) {
        log.info("【规则配置-创建规则】ruleName: {}", req.getRuleName());
        return Result.success(service.createRule(req));
    }

    @PutMapping("/api/rules/{key}")
    public Result<RuleVO> updateRule(@PathVariable String key, @RequestBody RuleUpdateRequest req) {
        log.info("【规则配置-更新规则】key: {}", key);
        return Result.success(service.updateRule(key, req));
    }

    @DeleteMapping("/api/rules/{key}")
    public Result<Void> deleteRule(@PathVariable String key) {
        log.info("【规则配置-删除规则】key: {}", key);
        service.deleteRule(key);
        return Result.success(null);
    }

    // ========================= 二、教师管理 =========================

    @GetMapping("/api/teachers")
    public Result<List<TeacherVO>> getTeachers() {
        log.info("【规则配置-教师列表】");
        return Result.success(service.getTeachers());
    }

    // ========================= 三、教师不可用日期 =========================

    @GetMapping("/api/unavailable-dates")
    public Result<List<UnavailableDateVO>> getUnavailableDates(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String type) {
        log.info("【规则配置-不可用日期列表】teacherId: {}, type: {}", teacherId, type);
        return Result.success(service.getUnavailableDates(teacherId, type));
    }

    @PostMapping("/api/unavailable-dates")
    public Result<UnavailableDateVO> createUnavailableDate(@RequestBody UnavailableDateRequest req) {
        log.info("【规则配置-创建不可用日期】teacherId: {}, reason: {}", req.getTeacherId(), req.getReason());
        return Result.success(service.createUnavailableDate(req));
    }

    @PostMapping("/api/unavailable-dates/batch")
    public Result<List<UnavailableDateVO>> createUnavailableDatesBatch(@RequestBody List<UnavailableDateRequest> requests) {
        log.info("【规则配置-批量创建不可用日期】size: {}", requests.size());
        return Result.success(service.createUnavailableDatesBatch(requests));
    }

    @DeleteMapping("/api/unavailable-dates/{key}")
    public Result<Void> deleteUnavailableDate(@PathVariable String key) {
        log.info("【规则配置-删除不可用日期】key: {}", key);
        service.deleteUnavailableDate(key);
        return Result.success(null);
    }

    @PostMapping("/api/unavailable-dates/batch-delete")
    public Result<Void> batchDeleteUnavailableDates(@RequestBody BatchDeleteRequest req) {
        log.info("【规则配置-批量删除不可用日期】keys: {}", req.getKeys());
        service.batchDeleteUnavailableDates(req.getKeys());
        return Result.success(null);
    }

    // ========================= 四、规则权重管理 =========================

    @GetMapping("/api/rule-weights")
    public Result<List<RuleWeightVO>> getRuleWeights() {
        log.info("【规则配置-权重列表】");
        return Result.success(service.getRuleWeights());
    }

    @PutMapping("/api/rule-weights/{id}")
    public Result<RuleWeightVO> updateRuleWeight(@PathVariable String id, @RequestBody WeightUpdateRequest req) {
        log.info("【规则配置-更新权重】id: {}, currentWeight: {}", id, req.getCurrentWeight());
        return Result.success(service.updateRuleWeight(id, req));
    }

    @PostMapping("/api/rule-weights/batch")
    public Result<List<RuleWeightVO>> batchUpdateRuleWeights(@RequestBody List<WeightBatchItem> items) {
        log.info("【规则配置-批量更新权重】size: {}", items.size());
        return Result.success(service.batchUpdateRuleWeights(items));
    }

    @GetMapping("/api/rule-weights/history")
    public Result<Map<String, Object>> getWeightHistory(
            @RequestParam(required = false) String ruleId,
            @RequestParam(defaultValue = "1") int current,
            @RequestParam(defaultValue = "10") int pageSize) {
        log.info("【规则配置-权重历史】ruleId: {}, current: {}, pageSize: {}", ruleId, current, pageSize);
        return Result.success(service.getWeightHistory(ruleId, current, pageSize));
    }

    @PostMapping("/api/rule-weights/reset")
    public Result<Map<String, Object>> resetRuleWeights() {
        log.info("【规则配置-重置权重】");
        return Result.success(service.resetRuleWeights());
    }
}
