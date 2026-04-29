package org.example.school_demo.service.impl;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.MajorDataDTO;
import org.example.school_demo.dto.request.MajorCreateReq;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.*;
import org.example.school_demo.entity.MajorCourseEntity;
import org.example.school_demo.entity.MajorEntity;
import org.example.school_demo.listener.MajorExcelListener;
import org.example.school_demo.repository.MajorCourseRepo;
import org.example.school_demo.repository.MajorRepo;
import org.example.school_demo.service.MajorService;
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
public class MajorServiceImpl implements org.example.school_demo.service.MajorService {

    private final MajorRepo majorRepo;
    private final MajorCourseRepo majorCourseRepo;

    @Override
    public PageResult<MajorListResp> getPageList(PageReq pageReq, String keyword) {
        log.info("查询专业列表，页码：{}, 每页数量：{}, 关键词：{}", pageReq.getPage(), pageReq.getPageSize(), keyword);

        Page<MajorEntity> page = (keyword != null && !keyword.isBlank())
                ? majorRepo.findByNameContaining(keyword, pageReq.toPageable())
                : majorRepo.findAll(pageReq.toPageable());

        List<MajorListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        log.info("查询完成，当前页数量：{}, 总记录数：{}", list.size(), page.getTotalElements());
        return PageResult.of(list, page.getTotalElements());
    }

    private MajorListResp entityToResp(MajorEntity entity) {
        List<String> courses = majorCourseRepo.findByMajorId(entity.getMajorId())
                .stream()
                .map(MajorCourseEntity::getCourseName)
                .collect(Collectors.toList());

        return MajorListResp.builder()
                .dbId(entity.getMajorId())
                .id(entity.getId())
                .name(entity.getName())
                .courses(courses.isEmpty() ? null : courses)
                .classSize(entity.getClassSize())
                .duration(entity.getDuration())
                .createdAt(entity.getCreatedTime())
                .build();
    }

    @Override
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

        MajorEntity entity = MajorEntity.builder()
                .id(id)
                .name(req.getName())
                .classSize(req.getClassSize())
                .duration(req.getDuration())
                .build();

        MajorEntity saved = majorRepo.save(entity);

        if (req.getCourses() != null && !req.getCourses().isEmpty()) {
            for (String course : req.getCourses()) {
                MajorCourseEntity mc = MajorCourseEntity.builder()
                        .majorId(saved.getMajorId())
                        .courseName(course.trim())
                        .build();
                majorCourseRepo.save(mc);
            }
        }

        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        log.info("批量删除专业，dbIds: {}", dbIds);

        List<MajorEntity> found = majorRepo.findByIdIn(dbIds);
        Set<String> foundIds = found.stream()
                .map(MajorEntity::getId)
                .collect(Collectors.toSet());

        List<String> notFoundIds = dbIds.stream()
                .filter(id -> !foundIds.contains(id))
                .collect(Collectors.toList());

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "专业不存在: " + String.join(", ", notFoundIds));
            return result;
        }

        for (MajorEntity major : found) {
            majorCourseRepo.deleteByMajorId(major.getMajorId());
        }
        majorRepo.deleteAll(found);

        if (!notFoundIds.isEmpty()) {
            log.info("批量删除部分失败，成功: {}, 失败: {}", found.size(), notFoundIds.size());
        }

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(m -> String.valueOf(m.getMajorId())).collect(Collectors.toList()))
                .deletedDisplayIds(found.stream().map(MajorEntity::getId).collect(Collectors.toList()))
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
    public Map<String, Object> importMajors(InputStream inputStream) {
        log.info("开始解析 Excel 文件");

        MajorExcelListener listener = new MajorExcelListener(majorRepo, majorCourseRepo);

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

        log.info("导入完成，总计: {}, 成功: {}, 失败: {}", total, success, failed);

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

    private MajorCreateResp entityToCreateResp(MajorEntity entity) {
        List<String> courses = majorCourseRepo.findByMajorId(entity.getMajorId())
                .stream()
                .map(MajorCourseEntity::getCourseName)
                .collect(Collectors.toList());

        return MajorCreateResp.builder()
                .dbId(entity.getMajorId())
                .id(entity.getId())
                .name(entity.getName())
                .courses(courses.isEmpty() ? null : courses)
                .classSize(entity.getClassSize())
                .duration(entity.getDuration())
                .createdAt(entity.getCreatedTime())
                .build();
    }
}
