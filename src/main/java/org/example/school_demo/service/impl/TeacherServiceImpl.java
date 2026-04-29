package org.example.school_demo.service.impl;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.TeacherDataDTO;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.*;
import org.example.school_demo.entity.TeacherCourseEntity;
import org.example.school_demo.entity.TeacherEntity;
import org.example.school_demo.listener.TeacherExcelListener;
import org.example.school_demo.repository.TeacherCourseRepo;
import org.example.school_demo.repository.TeacherRepo;
import org.example.school_demo.service.TeacherService;
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
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepo teacherRepo;
    private final TeacherCourseRepo teacherCourseRepo;

    @Override
    public PageResult<TeacherListResp> getPageList(PageReq pageReq, String keyword, String degree) {
        log.info("查询教师列表，页码：{}, 每页数量：{}, 关键词：{}, 学历：{}",
                pageReq.getPage(), pageReq.getPageSize(), keyword, degree);

        Page<TeacherEntity> page;
        if (keyword != null && !keyword.isBlank()) {
            page = teacherRepo.findByNameContaining(keyword, pageReq.toPageable());
        } else if (degree != null && !degree.isBlank()) {
            page = teacherRepo.findByDegree(degree, pageReq.toPageable());
        } else {
            page = teacherRepo.findAll(pageReq.toPageable());
        }

        List<TeacherListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        log.info("查询完成，当前页数量：{}, 总记录数：{}", list.size(), page.getTotalElements());
        return PageResult.of(list, page.getTotalElements());
    }

    private TeacherListResp entityToResp(TeacherEntity entity) {
        List<String> courses = teacherCourseRepo.findByTeacherId(entity.getTeacherId())
                .stream()
                .map(TeacherCourseEntity::getCourseName)
                .collect(Collectors.toList());

        return TeacherListResp.builder()
                .dbId(entity.getTeacherId())
                .id(entity.getId())
                .name(entity.getName())
                .gender(entity.getGender())
                .courses(courses.isEmpty() ? null : courses)
                .degree(entity.getDegree())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .createdAt(entity.getCreatedTime())
                .build();
    }

    @Override
    public Map<String, Object> createTeacher(org.example.school_demo.dto.request.TeacherCreateReq req) {
        Map<String, Object> result = new HashMap<>();

        if (teacherRepo.existsByName(req.getName())) {
            result.put("success", false);
            result.put("message", "教师姓名已存在: " + req.getName());
            return result;
        }

        String id = (req.getId() != null && !req.getId().isBlank())
                ? req.getId().trim()
                : generateId();

        if (teacherRepo.existsByBusinessId(id)) {
            result.put("success", false);
            result.put("message", "教师ID已存在: " + id);
            return result;
        }

        TeacherEntity entity = TeacherEntity.builder()
                .id(id)
                .name(req.getName())
                .gender(req.getGender())
                .degree(req.getDegree())
                .email(req.getEmail())
                .phone(req.getPhone())
                .build();

        TeacherEntity saved = teacherRepo.save(entity);

        if (req.getCourses() != null && !req.getCourses().isEmpty()) {
            for (String course : req.getCourses()) {
                TeacherCourseEntity tc = TeacherCourseEntity.builder()
                        .teacherId(saved.getTeacherId())
                        .courseName(course.trim())
                        .build();
                teacherCourseRepo.save(tc);
            }
        }

        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        log.info("批量删除教师，dbIds: {}", dbIds);

        List<TeacherEntity> found = teacherRepo.findByIdIn(dbIds);
        Set<String> foundIds = found.stream()
                .map(TeacherEntity::getId)
                .collect(Collectors.toSet());

        List<String> notFoundIds = dbIds.stream()
                .filter(id -> !foundIds.contains(id))
                .collect(Collectors.toList());

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "教师不存在: " + String.join(", ", notFoundIds));
            return result;
        }

        for (TeacherEntity teacher : found) {
            teacherCourseRepo.deleteByTeacherId(teacher.getTeacherId());
        }
        teacherRepo.deleteAll(found);

        if (!notFoundIds.isEmpty()) {
            log.info("批量删除部分失败，成功: {}, 失败: {}", found.size(), notFoundIds.size());
        }

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(t -> String.valueOf(t.getTeacherId())).collect(Collectors.toList()))
                .deletedDisplayIds(found.stream().map(TeacherEntity::getId).collect(Collectors.toList()))
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
    public Map<String, Object> importTeachers(InputStream inputStream) {
        log.info("开始解析 Excel 文件");

        TeacherExcelListener listener = new TeacherExcelListener(teacherRepo, teacherCourseRepo);

        try {
            EasyExcel.read(inputStream, TeacherDataDTO.class, listener)
                    .sheet()
                    .doRead();
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "导入失败：Excel 文件格式不正确");
            return result;
        }

        int total = listener.getCreatedRecords().size() + listener.getErrors().size();
        int success = listener.getCreatedRecords().size();
        int failed = listener.getErrors().size();

        log.info("导入完成，总计: {}, 成功: {}, 失败: {}", total, success, failed);

        if (failed == total) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "导入失败：所有数据行验证不通过");
            return result;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", ImportResp.<TeacherCreateResp>builder()
                .total(total)
                .success(success)
                .failed(failed)
                .createdRecords(success > 0 ? listener.getCreatedRecords() : null)
                .errors(failed > 0 ? listener.getErrors() : null)
                .build());
        return result;
    }

    private String generateId() {
        long next = teacherRepo.count() + 1;
        return "T" + String.format("%03d", next);
    }

    private TeacherCreateResp entityToCreateResp(TeacherEntity entity) {
        List<String> courses = teacherCourseRepo.findByTeacherId(entity.getTeacherId())
                .stream()
                .map(TeacherCourseEntity::getCourseName)
                .collect(Collectors.toList());

        return TeacherCreateResp.builder()
                .dbId(entity.getTeacherId())
                .id(entity.getId())
                .name(entity.getName())
                .gender(entity.getGender())
                .courses(courses.isEmpty() ? null : courses)
                .degree(entity.getDegree())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .createdAt(entity.getCreatedTime())
                .build();
    }
}
