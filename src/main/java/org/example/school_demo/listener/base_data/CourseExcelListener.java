package org.example.school_demo.listener.base_data;

import org.example.school_demo.dto.base_data.CourseDataDTO;
import org.example.school_demo.dto.base_data.response.CourseCreateResp;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.repository.CourseRepository;

import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Collectors;

public class CourseExcelListener extends BaseExcelListener<CourseDataDTO, CourseCreateResp> {

    private final CourseRepository courseRepo;
    private final Set<String> existingIds;

    public CourseExcelListener(CourseRepository courseRepo) {
        this.courseRepo = courseRepo;
        this.existingIds = courseRepo.findAll().stream()
                .map(CourseEntity::getId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
    }

    @Override
    protected void validate(CourseDataDTO data, int rowNum) {
        String name = trim(data.getName());
        if (name == null || name.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("课程名称不能为空");
        }
        if (data.getCredits() == null || data.getCredits() <= 0) {
            throw new org.example.school_demo.exception.BusinessException("学分必须为正数");
        }
        if (data.getTotalHours() == null || data.getTotalHours() <= 0) {
            throw new org.example.school_demo.exception.BusinessException("总课时必须为正数");
        }
        String type = trim(data.getType());
        if (type == null || !Set.of("必修", "选修", "限选").contains(type)) {
            throw new org.example.school_demo.exception.BusinessException("课程类型必须是必修、选修或限选");
        }
        String id = trim(data.getId());
        if (id == null || id.isBlank()) {
            throw new org.example.school_demo.exception.BusinessException("课程ID不能为空");
        }
        if (existingIds.contains(id)) {
            throw new org.example.school_demo.exception.BusinessException("课程 ID 已存在，请勿重复添加");
        }
    }

    @Override
    protected CourseCreateResp convertToEntity(CourseDataDTO data) {
        CourseEntity entity = CourseEntity.builder()
                .id(trim(data.getId()))
                .name(trim(data.getName()))
                .credits(BigDecimal.valueOf(data.getCredits()))
                .type(trim(data.getType()))
                .totalHours(data.getTotalHours().intValue())
                .build();

        CourseEntity saved = courseRepo.save(entity);
        existingIds.add(entity.getId());

        return CourseCreateResp.builder()
                .dbId(saved.getDbId())
                .id(saved.getId())
                .name(saved.getName())
                .credits(saved.getCredits().intValue())
                .type(saved.getType())
                .totalHours(saved.getTotalHours())
                .createdAt(saved.getCreatedTime())
                .build();
    }

    private String trim(String s) {
        return s == null ? null : s.trim();
    }
}
