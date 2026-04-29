package org.example.school_demo.service.base_data.impl;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.base_data.CourseSettingDataDTO;
import org.example.school_demo.dto.base_data.request.CourseSettingCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.entity.CourseSetting;
import org.example.school_demo.listener.base_data.CourseSettingExcelListener;
import org.example.school_demo.repository.CourseRepository;
import org.example.school_demo.repository.CourseSettingRepository;
import org.example.school_demo.service.base_data.CourseSettingService;
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

    private final CourseSettingRepository courseSettingRepo;
    private final CourseRepository courseRepo;

    @Override
    public PageResult<CourseSettingListResp> getPageList(PageReq pageReq, String semester) {
        Page<CourseSetting> page = (semester != null && !semester.isBlank())
                ? courseSettingRepo.findBySemester(semester, pageReq.toPageable())
                : courseSettingRepo.findAll(pageReq.toPageable());

        List<CourseSettingListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        return PageResult.of(list, page.getTotalElements());
    }

    private CourseSettingListResp entityToResp(CourseSetting entity) {
        List<String> prereqs = parsePrerequisites(entity.getPrerequisites());
        return CourseSettingListResp.builder()
                .dbId(entity.getDbId())
                .name(entity.getCourseName())
                .priority(entity.getPriority())
                .prerequisites(prereqs.isEmpty() ? null : prereqs)
                .semester(entity.getSemester())
                .createdAt(entity.getCreatedTime())
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> createCourseSetting(CourseSettingCreateReq req) {
        Map<String, Object> result = new HashMap<>();

        Optional<CourseEntity> course = courseRepo.findByName(req.getName());
        if (course.isEmpty()) {
            result.put("success", false);
            result.put("message", "课程不存在: " + req.getName());
            return result;
        }

        if (courseSettingRepo.existsByCourseName(req.getName())) {
            result.put("success", false);
            result.put("message", "课程设置已存在: " + req.getName());
            return result;
        }

        String prereqJson = null;
        if (req.getPrerequisites() != null && !req.getPrerequisites().isEmpty()) {
            prereqJson = String.join(";", req.getPrerequisites());
        }

        CourseSetting entity = CourseSetting.builder()
                .courseName(req.getName())
                .priority(req.getPriority())
                .prerequisites(prereqJson)
                .semester(req.getSemester())
                .build();

        CourseSetting saved = courseSettingRepo.save(entity);

        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        List<Long> ids = dbIds.stream().map(Long::valueOf).collect(Collectors.toList());
        List<CourseSetting> found = courseSettingRepo.findAllById(ids);

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "课程设置不存在: " + String.join(", ", dbIds));
            return result;
        }

        List<String> displayNames = found.stream()
                .map(CourseSetting::getCourseName)
                .collect(Collectors.toList());

        courseSettingRepo.deleteAll(found);

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(cs -> String.valueOf(cs.getDbId())).collect(Collectors.toList()))
                .deletedDisplayIds(displayNames)
                .failedCount(0)
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
        CourseSettingExcelListener listener = new CourseSettingExcelListener(
                courseSettingRepo, courseRepo);

        try {
            EasyExcel.read(inputStream, CourseSettingDataDTO.class, listener)
                    .sheet()
                    .doRead();
        } catch (Exception e) {
            log.error("导入失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "导入失败：Excel 文件格式不正确");
            return result;
        }

        int total = listener.getCreatedRecords().size() + listener.getErrors().size();
        int success = listener.getCreatedRecords().size();
        int failed = listener.getErrors().size();

        if (failed == total) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "导入失败：所有数据行验证不通过");
            return result;
        }

        Map<String, Object> result = new HashMap<>();
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

    private CourseSettingCreateResp entityToCreateResp(CourseSetting entity) {
        List<String> prereqs = parsePrerequisites(entity.getPrerequisites());
        return CourseSettingCreateResp.builder()
                .dbId(entity.getDbId())
                .name(entity.getCourseName())
                .priority(entity.getPriority())
                .prerequisites(prereqs.isEmpty() ? null : prereqs)
                .semester(entity.getSemester())
                .createdAt(entity.getCreatedTime())
                .build();
    }

    private List<String> parsePrerequisites(String prereqs) {
        if (prereqs == null || prereqs.isBlank()) return Collections.emptyList();
        return Arrays.stream(prereqs.split(";"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
