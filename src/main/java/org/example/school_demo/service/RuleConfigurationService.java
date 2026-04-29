package org.example.school_demo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.rule.request.*;
import org.example.school_demo.dto.rule.response.*;
import org.example.school_demo.entity.*;
import org.example.school_demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RuleConfigurationService {

    private final RuleRepository ruleRepository;
    private final UnavailableDateRepository unavailableDateRepository;
    private final RuleWeightRepository ruleWeightRepository;
    private final WeightChangeRecordRepository weightChangeRecordRepository;
    private final TeacherRepository teacherRepository;
    private final ObjectMapper objectMapper;

    public RuleConfigurationService(RuleRepository ruleRepository,
                                    UnavailableDateRepository unavailableDateRepository,
                                    RuleWeightRepository ruleWeightRepository,
                                    WeightChangeRecordRepository weightChangeRecordRepository,
                                    TeacherRepository teacherRepository,
                                    ObjectMapper objectMapper) {
        this.ruleRepository = ruleRepository;
        this.unavailableDateRepository = unavailableDateRepository;
        this.ruleWeightRepository = ruleWeightRepository;
        this.weightChangeRecordRepository = weightChangeRecordRepository;
        this.teacherRepository = teacherRepository;
        this.objectMapper = objectMapper;
    }

    // ========================= Rule Management =========================

    public Map<String, Object> getRules(int current, int pageSize) {
        int offset = (current - 1) * pageSize;
        List<RuleEntity> all = ruleRepository.findAll();
        int total = all.size();

        List<RuleEntity> paged = all.stream()
                .skip(offset)
                .limit(pageSize)
                .collect(Collectors.toList());

        List<RuleVO> rules = paged.stream().map(this::toRuleVO).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", rules);
        result.put("total", total);
        return result;
    }

    @Transactional
    public RuleVO createRule(RuleCreateRequest req) {
        RuleEntity rule = new RuleEntity();
        // Generate key
        String key = generateRuleKey();
        rule.setKey(key);
        rule.setRuleName(req.getRuleName());
        rule.setDescription(req.getDescription());

        if (req.getTeachers() != null && !req.getTeachers().isEmpty()) {
            rule.setTeachers(toJson(req.getTeachers()));
        }
        if (req.getValidDate() != null && req.getValidDate().length == 2) {
            rule.setValidStart(req.getValidDate()[0]);
            rule.setValidEnd(req.getValidDate()[1]);
        }

        rule = ruleRepository.save(rule);
        return toRuleVO(rule);
    }

    @Transactional
    public RuleVO updateRule(String key, RuleUpdateRequest req) {
        RuleEntity rule = ruleRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("规则不存在: " + key));

        if (req.getRuleName() != null) rule.setRuleName(req.getRuleName());
        if (req.getDescription() != null) rule.setDescription(req.getDescription());
        if (req.getTeachers() != null) {
            rule.setTeachers(toJson(req.getTeachers()));
        }
        if (req.getValidDate() != null && req.getValidDate().length == 2) {
            rule.setValidStart(req.getValidDate()[0]);
            rule.setValidEnd(req.getValidDate()[1]);
        }

        rule = ruleRepository.save(rule);
        return toRuleVO(rule);
    }

    @Transactional
    public void deleteRule(String key) {
        if (!ruleRepository.existsById(key)) {
            throw new RuntimeException("规则不存在: " + key);
        }
        ruleRepository.deleteById(key);
    }

    // ========================= Teacher List =========================

    public List<TeacherVO> getTeachers() {
        return teacherRepository.findAll().stream().map(t -> {
            TeacherVO vo = new TeacherVO();
            vo.setId(String.valueOf(t.getDbId()));
            vo.setName(t.getName());
            vo.setEmployeeId(t.getId());
            return vo;
        }).collect(Collectors.toList());
    }

    // ========================= Unavailable Date =========================

    public List<UnavailableDateVO> getUnavailableDates(String teacherId, String type) {
        List<UnavailableDateVO> result = new ArrayList<>();

        if (teacherId != null) {
            result = unavailableDateRepository.findByTeacherId(teacherId).stream()
                    .map(this::toUnavailableDateVO).collect(Collectors.toList());
        } else if (type != null) {
            result = unavailableDateRepository.findByType(type).stream()
                    .map(this::toUnavailableDateVO).collect(Collectors.toList());
        } else {
            result = unavailableDateRepository.findAll().stream()
                    .map(this::toUnavailableDateVO).collect(Collectors.toList());
        }
        return result;
    }

    @Transactional
    public UnavailableDateVO createUnavailableDate(UnavailableDateRequest req) {
        UnavailableDateEntity entity = new UnavailableDateEntity();
        entity.setKey(generateUnavailableDateKey());
        entity.setTeacherId(req.getTeacherId());
        entity.setTeacherName(req.getTeacherName());
        if (req.getValidDate() != null && req.getValidDate().length == 2) {
            entity.setValidStart(req.getValidDate()[0]);
            entity.setValidEnd(req.getValidDate()[1]);
        }
        entity.setReason(req.getReason());
        entity.setType(req.getType());
        entity.setRangeType(req.getRangeType());

        entity = unavailableDateRepository.save(entity);
        return toUnavailableDateVO(entity);
    }

    @Transactional
    public List<UnavailableDateVO> createUnavailableDatesBatch(List<UnavailableDateRequest> requests) {
        List<UnavailableDateEntity> entities = new ArrayList<>();
        for (UnavailableDateRequest req : requests) {
            UnavailableDateEntity entity = new UnavailableDateEntity();
            entity.setKey(generateUnavailableDateKey());
            entity.setTeacherId(req.getTeacherId());
            entity.setTeacherName(req.getTeacherName());
            if (req.getValidDate() != null && req.getValidDate().length == 2) {
                entity.setValidStart(req.getValidDate()[0]);
                entity.setValidEnd(req.getValidDate()[1]);
            }
            entity.setReason(req.getReason());
            entity.setType(req.getType());
            entity.setRangeType(req.getRangeType());
            entities.add(entity);
        }
        entities = unavailableDateRepository.saveAll(entities);
        return entities.stream().map(this::toUnavailableDateVO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteUnavailableDate(String key) {
        if (!unavailableDateRepository.existsById(key)) {
            throw new RuntimeException("记录不存在: " + key);
        }
        unavailableDateRepository.deleteById(key);
    }

    @Transactional
    public void batchDeleteUnavailableDates(List<String> keys) {
        unavailableDateRepository.deleteAllById(keys);
    }

    // ========================= Rule Weight =========================

    public List<RuleWeightVO> getRuleWeights() {
        return ruleWeightRepository.findAll().stream()
                .map(this::toRuleWeightVO).collect(Collectors.toList());
    }

    @Transactional
    public RuleWeightVO updateRuleWeight(String id, WeightUpdateRequest req) {
        RuleWeightEntity entity = ruleWeightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("权重配置不存在: " + id));

        int oldVal = entity.getCurrentWeight();
        entity.setCurrentWeight(req.getCurrentWeight());
        entity = ruleWeightRepository.save(entity);

        // Record change
        recordWeightChange(entity, oldVal);

        return toRuleWeightVO(entity);
    }

    @Transactional
    public List<RuleWeightVO> batchUpdateRuleWeights(List<WeightBatchItem> items) {
        List<RuleWeightVO> results = new ArrayList<>();
        for (WeightBatchItem item : items) {
            ruleWeightRepository.findById(item.getId()).ifPresent(entity -> {
                int oldVal = entity.getCurrentWeight();
                entity.setCurrentWeight(item.getCurrentWeight());
                ruleWeightRepository.save(entity);
                recordWeightChange(entity, oldVal);
                results.add(toRuleWeightVO(entity));
            });
        }
        return results;
    }

    public Map<String, Object> getWeightHistory(String ruleId, int current, int pageSize) {
        List<WeightChangeRecordEntity> all;
        if (ruleId != null) {
            all = weightChangeRecordRepository.findByRuleId(ruleId);
        } else {
            all = weightChangeRecordRepository.findAll();
        }

        int total = all.size();
        int offset = (current - 1) * pageSize;
        List<WeightChangeRecordVO> paged = all.stream()
                .skip(offset)
                .limit(pageSize)
                .map(r -> {
                    WeightChangeRecordVO vo = new WeightChangeRecordVO();
                    vo.setId(r.getId());
                    vo.setRuleId(r.getRuleId());
                    vo.setRuleName(r.getRuleName());
                    vo.setOldValue(r.getOldValue());
                    vo.setNewValue(r.getNewValue());
                    vo.setTime(r.getChangeTime().toString());
                    return vo;
                }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("data", paged);
        result.put("total", total);
        return result;
    }

    @Transactional
    public Map<String, Object> resetRuleWeights() {
        List<RuleWeightEntity> all = ruleWeightRepository.findAll();
        for (RuleWeightEntity entity : all) {
            Integer oldVal = entity.getCurrentWeight();
            if (!oldVal.equals(entity.getDefaultWeight())) {
                entity.setCurrentWeight(entity.getDefaultWeight());
                ruleWeightRepository.save(entity);
                recordWeightChange(entity, oldVal);
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("message", "已重置为默认权重");
        result.put("data", getRuleWeights());
        return result;
    }

    // ========================= Helper Methods =========================

    private RuleVO toRuleVO(RuleEntity e) {
        RuleVO vo = new RuleVO();
        vo.setKey(e.getKey());
        vo.setRuleName(e.getRuleName());
        vo.setDescription(e.getDescription());
        if (e.getTeachers() != null && !e.getTeachers().isEmpty()) {
            vo.setTeachers(fromJsonList(e.getTeachers()));
        }
        if (e.getValidStart() != null && e.getValidEnd() != null) {
            vo.setValidDate(new long[]{e.getValidStart(), e.getValidEnd()});
        }
        return vo;
    }

    private UnavailableDateVO toUnavailableDateVO(UnavailableDateEntity e) {
        UnavailableDateVO vo = new UnavailableDateVO();
        vo.setKey(e.getKey());
        vo.setTeacherId(e.getTeacherId());
        vo.setTeacherName(e.getTeacherName());
        vo.setValidDate(new long[]{e.getValidStart(), e.getValidEnd()});
        vo.setReason(e.getReason());
        vo.setType(e.getType());
        vo.setRangeType(e.getRangeType());
        return vo;
    }

    private RuleWeightVO toRuleWeightVO(RuleWeightEntity e) {
        RuleWeightVO vo = new RuleWeightVO();
        vo.setId(e.getId());
        vo.setName(e.getName());
        vo.setCategory(e.getCategory());
        vo.setCurrentWeight(e.getCurrentWeight());
        vo.setDefaultWeight(e.getDefaultWeight());
        vo.setMinWeight(e.getMinWeight());
        vo.setMaxWeight(e.getMaxWeight());
        vo.setEnabled(e.getEnabled());
        vo.setDescription(e.getDescription());
        return vo;
    }

    private String generateRuleKey() {
        long count = ruleRepository.count();
        return String.valueOf(count + 1);
    }

    private String generateUnavailableDateKey() {
        long count = unavailableDateRepository.count();
        return String.valueOf(count + 1);
    }

    private String toJson(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            log.error("JSON序列化失败", e);
            return "[]";
        }
    }

    private List<String> fromJsonList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.error("JSON反序列化失败", e);
            return Collections.emptyList();
        }
    }

    private void recordWeightChange(RuleWeightEntity entity, int oldValue) {
        WeightChangeRecordEntity record = new WeightChangeRecordEntity();
        record.setRuleId(entity.getId());
        record.setRuleName(entity.getName());
        record.setOldValue(oldValue);
        record.setNewValue(entity.getCurrentWeight());
        record.setChangeTime(LocalTime.now());
        record.setChangeDate(LocalDate.now());
        weightChangeRecordRepository.save(record);
    }
}
