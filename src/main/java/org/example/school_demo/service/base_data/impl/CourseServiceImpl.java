package org.example.school_demo.service.base_data.impl;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.base_data.CourseDataDTO;
import org.example.school_demo.dto.base_data.request.CourseCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.listener.base_data.CourseExcelListener;
import org.example.school_demo.repository.CourseRepository;
import org.example.school_demo.service.base_data.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepo;

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
                .dbId(entity.getDbId())
                .id(entity.getId())
                .name(entity.getName())
                .credits(entity.getCredits().intValue())
                .type(entity.getType())
                .totalHours(entity.getTotalHours())
                .createdAt(entity.getCreatedTime())
                .updatedAt(entity.getUpdatedTime())
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> createCourse(CourseCreateReq req) {
        Map<String, Object> result = new HashMap<>();

        if (courseRepo.existsByBusinessId(req.getId())) {
            result.put("success", false);
            result.put("message", "课程ID重复: " + req.getId());
            return result;
        }

        CourseEntity entity = CourseEntity.builder()
                .id(req.getId())
                .name(req.getName())
                .credits(new BigDecimal(req.getCredits()))
                .type(convertCourseType(req.getType()))
                .totalHours(req.getTotalHours())
                .build();

        CourseEntity saved = courseRepo.save(entity);
        result.put("success", true);
        result.put("data", entityToCreateResp(saved));
        return result;
    }

    private String convertCourseType(String type) {
        if (type == null) return "必修";
        return switch (type) {
            case "必修" -> "必修";
            case "选修" -> "选修";
            case "限选" -> "限选";
            default -> type;
        };
    }

    @Override
    @Transactional
    public Map<String, Object> batchDelete(List<String> dbIds) {
        log.info("批量删除课程，dbIds: {}", dbIds);

        List<CourseEntity> found = courseRepo.findByIdIn(dbIds);

        if (found.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "课程不存在: " + String.join(", ", dbIds));
            return result;
        }

        courseRepo.deleteAll(found);

        BatchDeleteResp resp = BatchDeleteResp.builder()
                .deletedCount(found.size())
                .deletedDbIds(found.stream().map(c -> String.valueOf(c.getDbId())).collect(Collectors.toList()))
                .deletedDisplayIds(found.stream().map(CourseEntity::getId).collect(Collectors.toList()))
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
    public Map<String, Object> importCourses(InputStream inputStream) {
        log.info("开始解析 Excel 文件");

        CourseExcelListener listener = new CourseExcelListener(courseRepo);

        try {
            EasyExcel.read(inputStream, CourseDataDTO.class, listener)
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
                .dbId(entity.getDbId())
                .id(entity.getId())
                .name(entity.getName())
                .credits(entity.getCredits().intValue())
                .type(entity.getType())
                .totalHours(entity.getTotalHours())
                .createdAt(entity.getCreatedTime())
                .build();
    }
}
