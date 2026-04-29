package org.example.school_demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.CourseSettingDataDTO;
import org.example.school_demo.dto.request.CourseSettingCreateReq;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.*;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.entity.CoursePrerequisiteEntity;
import org.example.school_demo.entity.CourseSettingEntity;
import org.example.school_demo.listener.CourseSettingExcelListener;
import org.example.school_demo.repository.CoursePrerequisiteRepo;
import org.example.school_demo.repository.CourseRepo;
import org.example.school_demo.repository.CourseSettingRepo;
import org.example.school_demo.service.CourseSettingService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseSettingServiceImpl implements CourseSettingService {

    private final CourseSettingRepo courseSettingRepo;
    private final CoursePrerequisiteRepo coursePrerequisiteRepo;
    private final CourseRepo courseRepo;

    @Override
    public PageResult<CourseSettingListResp> getPageList(PageReq pageReq, String semester) {
        log.info("查询课程设置列表，页码：{}, 每页数量：{}, 学期：{}", pageReq.getPage(), pageReq.getPageSize(), semester);

        Page<CourseSettingEntity> page = (semester != null && !semester.isBlank())
                ? courseSettingRepo.findBySemester(semester, pageReq.toPageable())
                : courseSettingRepo.findAll(pageReq.toPageable());

        List<CourseSettingListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        log.info("查询完成，当前页数量：{}, 总记录数：{}", list.size(), page.getTotalElements());
        return PageResult.of(list, page.getTotalElements());
    }

    private CourseSettingListResp entityToResp(CourseSettingEntity entity) {
        CourseEntity course = courseRepo.findById(entity.getCourseId())
                .orElseThrow(() -> new org.example.school_demo.exception.BusinessException("课程不存在"));
        return CourseSettingListResp.builder()
                .dbId(entity.getSettingId())
                .name(course.getCourseName())
                .priority(entity.getPriority())
                .prerequisites(getPrerequisites(entity.getCourseId()))
                .semester(entity.getSemester())
                .createdAt(entity.getCreatedTime())
                .build();
    }

    private List<String> getPrerequisites(Long courseId) {
        return coursePrerequisiteRepo.findByCourseId(courseId)
                .stream()
                .map(cp -> courseRepo.findById(cp.getPrereqId())
                        .map(CourseEntity::getCourseName)
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> createCourseSetting(CourseSettingCreateReq req) {
        Map<String, Object> result = new HashMap<>();

        Optional<CourseEntity> courseOpt = courseRepo.findByCourseName(req.getName());
        if (courseOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "课程不存在: " + req.getName());
            return result;
        }

        CourseEntity course = courseOpt.get();
        if (courseSettingRepo.existsByCourseId(course.getCourseId())) {
            result.put("success", false);
            result.put("message", "课程设置已存在: " + req.getName());
            return result;
        }

        CourseSettingEntity entity = CourseSettingEntity.builder()
                .courseId(course.getCourseId())
                .priority(req.getPriority())
                .semester(req.getSemester())
                .build();

        CourseSettingEntity saved = courseSettingRepo.save(entity);

        if (req.getPrerequisites() != null && !req.getPrerequisites().isEmpty()) {
            savePrerequisites(course.getCourseId(), req.getPrerequisites());
        }

        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }

    private void savePrerequisites(Long courseId, List<String> prerequisiteNames) {
        for (String prereqName : prerequisiteNames) {
            courseRepo.findByCourseName(prereqName.trim())
                    .ifPresent(prereq -> {
                        CoursePrerequisiteEntity cp = CoursePrerequisiteEntity.builder()
                                .courseId(courseId)
                                .prereqId(prereq.getCourseId())
                                .build();
                        coursePrerequisiteRepo.save(cp);
                    });
        }
    }

    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        log.info("批量删除课程设置，dbIds: {}", dbIds);

        List<Long> ids = dbIds.stream().map(Long::valueOf).collect(Collectors.toList());
        List<CourseSettingEntity> found = courseSettingRepo.findAllById(ids);
        Set<Long> foundIds = found.stream()
                .map(CourseSettingEntity::getSettingId)
                .collect(Collectors.toSet());

        List<String> notFoundIds = dbIds.stream()
                .filter(id -> !foundIds.contains(Long.valueOf(id)))
                .collect(Collectors.toList());

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "课程设置不存在: " + String.join(", ", notFoundIds));
            return result;
        }

        List<String> displayNames = found.stream()
                .map(cs -> courseRepo.findById(cs.getCourseId())
                        .map(CourseEntity::getCourseName)
                        .orElse("未知"))
                .collect(Collectors.toList());

        for (CourseSettingEntity cs : found) {
            coursePrerequisiteRepo.deleteByCourseId(cs.getCourseId());
        }
        courseSettingRepo.deleteAll(found);

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(cs -> String.valueOf(cs.getSettingId())).collect(Collectors.toList()))
                .deletedDisplayIds(displayNames)
                .failedCount(notFoundIds.size())
                .failedDbIds(notFoundIds.isEmpty() ? null : notFoundIds)
                .deleteTime(LocalDateTime.now())
                .build();

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", resp);
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> importCourseSettings(InputStream inputStream) {
        log.info("开始解析 Excel 文件");

        Map<String, Object> result = new HashMap<>();

        CourseSettingExcelListener listener = new CourseSettingExcelListener(
                courseSettingRepo, coursePrerequisiteRepo, courseRepo);

        try {
            com.alibaba.excel.EasyExcel.read(inputStream, CourseSettingDataDTO.class, listener)
                    .sheet()
                    .doRead();
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "导入失败：Excel 文件格式不正确");
            return result;
        }

        int total = listener.getCreatedRecords().size() + listener.getErrors().size();
        int success = listener.getCreatedRecords().size();
        int failed = listener.getErrors().size();

        log.info("导入完成，总计: {}, 成功: {}, 失败: {}", total, success, failed);

        if (failed == total) {
            result.put("success", false);
            result.put("message", "导入失败：所有数据行验证不通过");
            return result;
        }

        result.put("success", true);
        result.put("data", ImportResp.<CourseSettingCreateResp>builder()
                .total(total)
                .success(success)
                .failed(failed)
                .createdRecords(success > 0 ? listener.getCreatedRecords() : null)
                .errors(failed > 0 ? listener.getErrors() : null)
                .build());
        return result;
    }

    private CourseSettingCreateResp entityToCreateResp(CourseSettingEntity entity) {
        CourseEntity course = courseRepo.findById(entity.getCourseId())
                .orElseThrow(() -> new org.example.school_demo.exception.BusinessException("课程不存在"));
        return CourseSettingCreateResp.builder()
                .dbId(entity.getSettingId())
                .name(course.getCourseName())
                .priority(entity.getPriority())
                .prerequisites(getPrerequisites(entity.getCourseId()))
                .semester(entity.getSemester())
                .createdAt(entity.getCreatedTime())
                .build();
    }
}