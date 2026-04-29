package org.example.school_demo.service.base_data.impl;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.base_data.TeacherDataDTO;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.request.TeacherCreateReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.entity.TeacherEntity;
import org.example.school_demo.listener.base_data.TeacherExcelListener;
import org.example.school_demo.repository.TeacherRepository;
import org.example.school_demo.service.base_data.TeacherService;
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

    private final TeacherRepository teacherRepo;

    @Override
    public PageResult<TeacherListResp> getPageList(PageReq pageReq, String keyword, String degree) {
        Page<TeacherEntity> page;
        if (keyword != null && !keyword.isBlank()) {
            page = teacherRepo.findByNameContaining(keyword, pageReq.toPageable());
        } else if (degree != null && !degree.isBlank()) {
            page = teacherRepo.findByDegreeContaining(degree, pageReq.toPageable());
        } else {
            page = teacherRepo.findAll(pageReq.toPageable());
        }

        List<TeacherListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        return PageResult.of(list, page.getTotalElements());
    }

    private TeacherListResp entityToResp(TeacherEntity entity) {
        List<String> courses = parseCourses(entity.getCourses());
        return TeacherListResp.builder()
                .dbId(entity.getDbId())
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
    @Transactional
    public Map<String, Object> createTeacher(TeacherCreateReq req) {
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

        String courses = (req.getCourses() != null && !req.getCourses().isEmpty())
                ? String.join(";", req.getCourses())
                : null;

        TeacherEntity entity = TeacherEntity.builder()
                .id(id)
                .name(req.getName())
                .gender(req.getGender())
                .courses(courses)
                .degree(req.getDegree())
                .email(req.getEmail())
                .phone(req.getPhone())
                .build();

        TeacherEntity saved = teacherRepo.save(entity);

        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        List<TeacherEntity> found = teacherRepo.findByIdIn(dbIds);

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "教师不存在: " + String.join(", ", dbIds));
            return result;
        }

        teacherRepo.deleteAll(found);

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(t -> String.valueOf(t.getDbId())).collect(Collectors.toList()))
                .deletedDisplayIds(found.stream().map(TeacherEntity::getId).collect(Collectors.toList()))
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
    public Map<String, Object> importTeachers(InputStream inputStream) {
        TeacherExcelListener listener = new TeacherExcelListener(teacherRepo);

        try {
            EasyExcel.read(inputStream, TeacherDataDTO.class, listener)
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
        List<String> courses = parseCourses(entity.getCourses());
        return TeacherCreateResp.builder()
                .dbId(entity.getDbId())
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

    private List<String> parseCourses(String courses) {
        if (courses == null || courses.isBlank()) return Collections.emptyList();
        return Arrays.stream(courses.split(";"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
