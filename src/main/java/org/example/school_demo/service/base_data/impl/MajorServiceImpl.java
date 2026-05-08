package org.example.school_demo.service.base_data.impl;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.base_data.MajorDataDTO;
import org.example.school_demo.dto.base_data.request.MajorCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.entity.Major;
import org.example.school_demo.listener.base_data.MajorExcelListener;
import org.example.school_demo.repository.MajorRepository;
import org.example.school_demo.service.base_data.MajorService;
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
public class MajorServiceImpl implements MajorService {

    private final MajorRepository majorRepo;

    @Override
    public PageResult<MajorListResp> getPageList(PageReq pageReq, String keyword) {
        Page<Major> page = (keyword != null && !keyword.isBlank())
                ? majorRepo.findByNameContaining(keyword, pageReq.toPageable())
                : majorRepo.findAll(pageReq.toPageable());

        List<MajorListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        return PageResult.of(list, page.getTotalElements());
    }

    private MajorListResp entityToResp(Major entity) {
        List<String> courses = parseCourses(entity.getCourses());
        return MajorListResp.builder()
                .dbId(entity.getDbId())
                .id(entity.getId())
                .name(entity.getName())
                .courses(courses.isEmpty() ? null : courses)
                .classSize(entity.getClassSize())
                .duration(entity.getDuration())
                .createdAt(entity.getCreatedTime())
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> createMajor(MajorCreateReq req) {
        Map<String, Object> result = new HashMap<>();

        if (majorRepo.existsByName(req.getName())) {
            result.put("success", false);
            result.put("message", "专业名称已存在: " + req.getName());
            return result;
        }

        String id = (req.getId() != null && !req.getId().isBlank())
                ? req.getId().trim()
                : generateId();

        if (majorRepo.existsByBusinessId(id)) {
            result.put("success", false);
            result.put("message", "专业ID已存在: " + id);
            return result;
        }

        String courses = (req.getCourses() != null && !req.getCourses().isEmpty())
                ? String.join(";", req.getCourses())
                : null;

        Major entity = Major.builder()
                .id(id)
                .name(req.getName())
                .courses(courses)
                .classSize(req.getClassSize())
                .duration(req.getDuration())
                .build();

        Major saved = majorRepo.save(entity);

        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        List<Long> ids = dbIds.stream().map(Long::valueOf).collect(Collectors.toList());
        List<Major> found = majorRepo.findByIdIn(ids);

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "专业不存在: " + String.join(", ", dbIds));
            return result;
        }

        majorRepo.deleteAll(found);

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(m -> String.valueOf(m.getDbId())).collect(Collectors.toList()))
                .deletedDisplayIds(found.stream().map(Major::getId).collect(Collectors.toList()))
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
    public Map<String, Object> importMajors(InputStream inputStream) {
        MajorExcelListener listener = new MajorExcelListener(majorRepo);

        try {
            EasyExcel.read(inputStream, MajorDataDTO.class, listener)
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

        if (failed == total) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "导入失败：所有数据行验证不通过");
            return result;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", ImportResp.<MajorCreateResp>builder()
                .total(total)
                .success(success)
                .failed(failed)
                .createdRecords(success > 0 ? listener.getCreatedRecords() : null)
                .errors(failed > 0 ? listener.getErrors() : null)
                .build());
        return result;
    }

    private String generateId() {
        long next = majorRepo.count() + 1;
        return "M" + String.format("%03d", next);
    }

    private MajorCreateResp entityToCreateResp(Major entity) {
        List<String> courses = parseCourses(entity.getCourses());
        return MajorCreateResp.builder()
                .dbId(entity.getDbId())
                .id(entity.getId())
                .name(entity.getName())
                .courses(courses.isEmpty() ? null : courses)
                .classSize(entity.getClassSize())
                .duration(entity.getDuration())
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
