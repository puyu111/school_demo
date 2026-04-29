package org.example.school_demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.CourseDataDTO;
import org.example.school_demo.dto.request.CourseCreateReq;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.*;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.listener.CourseExcelListener;
import org.example.school_demo.repository.CourseRepo;
import org.example.school_demo.repository.ScheduleRepo;
import org.example.school_demo.service.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepo courseRepo;
    private final ScheduleRepo scheduleRepo;

    @Override
    public PageResult<CourseListResp> getPageList(PageReq pageReq) {
        log.info("查询课程列表，页码：{}, 每页数量：{}", pageReq.getPage(), pageReq.getPageSize());

        Page<CourseEntity> page = courseRepo.findAll(pageReq.toPageable());

        List<CourseListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        log.info("查询完成，当前页数量：{}, 总记录数：{}", list.size(), page.getTotalElements());

        return PageResult.of(list, page.getTotalElements());
    }

    private CourseListResp entityToResp(CourseEntity entity) {
        return CourseListResp.builder()
                .dbId(entity.getCourseId())
                .id(entity.getId())
                .name(entity.getCourseName())
                .credits(entity.getCredits().intValue())
                .type(entity.getCourseType())
                .totalHours(entity.getTotalHours())
                .createdAt(entity.getCreatedTime())
                .updatedAt(entity.getUpdatedTime())
                .build();
    }
    @Override
    public Map<String, Object> createCourse(CourseCreateReq req) {
        Map<String, Object> result = new HashMap<>();

        if (courseRepo.existsByBusinessId(req.getId())) {
            result.put("success", false);
            result.put("message", "课程ID重复: " + req.getId());
            return result;
        }

        CourseEntity entity = CourseEntity.builder()
                .id(req.getId())
                .courseName(req.getName())
                .credits(new BigDecimal(req.getCredits()))
                .duration(45)
                .courseType(convertCourseType(req.getType()))
                .totalHours(req.getTotalHours())
                .build();

        CourseEntity saved = courseRepo.save(entity);
        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }


    private String convertCourseType(String type) {
        if (type == null) return "THEORY";
        return switch (type) {
            case "必修" -> "THEORY";
            case "选修" -> "PRACTICE";
            case "限选" -> "LAB";
            default -> type; // 已经是内部值直接返回
        };
    }
    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        log.info("批量删除课程，dbIds: {}", dbIds);

        List<CourseEntity> found = courseRepo.findByIdIn(dbIds);
        Set<String> foundIds = found.stream()
                .map(CourseEntity::getId)
                .collect(Collectors.toSet());

        List<String> notFoundIds = dbIds.stream()
                .filter(id -> !foundIds.contains(id))
                .collect(Collectors.toList());

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "课程不存在: " + String.join(", ", notFoundIds));
            return result;
        }

        scheduleRepo.deleteByCourseIdIn(found.stream().map(CourseEntity::getCourseId).collect(Collectors.toList()));
        courseRepo.deleteAll(found);

        if (!notFoundIds.isEmpty()) {
            log.info("批量删除部分失败，成功: {}, 失败: {}", found.size(), notFoundIds.size());
        }

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(c -> String.valueOf(c.getCourseId())).collect(Collectors.toList()))
                .deletedDisplayIds(found.stream().map(CourseEntity::getId).collect(Collectors.toList()))
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
    public Map<String, Object> importCourses(InputStream inputStream) {
        log.info("开始解析 Excel 文件");

        CourseExcelListener listener = new CourseExcelListener(courseRepo);

        try {
            com.alibaba.excel.EasyExcel.read(inputStream, CourseDataDTO.class, listener)
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
        result.put("data", ImportResp.<CourseCreateResp>builder()
                .total(total)
                .success(success)
                .failed(failed)
                .createdRecords(success > 0 ? listener.getCreatedRecords() : null)
                .errors(failed > 0 ? listener.getErrors() : null)
                .build());
        return result;
    }

    private CourseCreateResp entityToCreateResp(CourseEntity entity) {
        return CourseCreateResp.builder()
                .dbId(entity.getCourseId())
                .id(entity.getId())
                .name(entity.getCourseName())
                .credits(entity.getCredits().intValue())
                .type(entity.getCourseType())
                .totalHours(entity.getTotalHours())
                .createdAt(entity.getCreatedTime())
                .build();
    }
}
