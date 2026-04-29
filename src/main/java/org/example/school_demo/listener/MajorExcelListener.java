package org.example.school_demo.listener;

import org.example.school_demo.dto.MajorDataDTO;
import org.example.school_demo.dto.response.MajorCreateResp;
import org.example.school_demo.entity.MajorCourseEntity;
import org.example.school_demo.entity.MajorEntity;
import org.example.school_demo.exception.BusinessException;
import org.example.school_demo.repository.MajorCourseRepo;
import org.example.school_demo.repository.MajorRepo;

import java.util.*;
import java.util.stream.Collectors;

public class MajorExcelListener extends BaseExcelListener<MajorDataDTO, MajorCreateResp> {

    private final MajorRepo majorRepo;
    private final MajorCourseRepo majorCourseRepo;
    private final Set<String> existingNames;
    private final Set<String> existingIds;

    public MajorExcelListener(MajorRepo majorRepo, MajorCourseRepo majorCourseRepo) {
        this.majorRepo = majorRepo;
        this.majorCourseRepo = majorCourseRepo;
        List<MajorEntity> all = majorRepo.findAll();
        this.existingNames = all.stream().map(MajorEntity::getName).collect(Collectors.toSet());
        this.existingIds = all.stream()
                .map(MajorEntity::getId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
    }

    @Override
    protected void validate(MajorDataDTO data, int rowNum) {
        String name = trim(data.getName());
        if (name == null || name.isEmpty()) {
            throw new BusinessException("专业名称不能为空");
        }
        if (data.getClassSize() == null || data.getClassSize() <= 0) {
            throw new BusinessException("班级数必须为正整数");
        }
        if (data.getDuration() == null || data.getDuration() <= 0) {
            throw new BusinessException("学制必须为正整数");
        }
        String id = trim(data.getId());
        if (id != null && !id.isBlank() && existingIds.contains(id)) {
            throw new BusinessException("专业ID已存在");
        }
        if (existingNames.contains(name)) {
            throw new BusinessException("专业名称已存在");
        }
    }

    @Override
    protected Map<String, Object> buildErrorData(MajorDataDTO data, BusinessException e) {
        Map<String, Object> map = new LinkedHashMap<>();
        String id = trim(data.getId());
        if (id != null && !id.isBlank()) {
            map.put("id", id);
        }
        map.put("name", trim(data.getName()));
        return map;
    }

    @Override
    protected MajorCreateResp convertToEntity(MajorDataDTO data) {
        String id = trim(data.getId());
        if (id == null || id.isBlank()) {
            id = generateId();
        }

        MajorEntity entity = MajorEntity.builder()
                .id(id)
                .name(trim(data.getName()))
                .classSize(data.getClassSize())
                .duration(data.getDuration())
                .build();

        MajorEntity saved = majorRepo.save(entity);
        existingNames.add(entity.getName());
        existingIds.add(entity.getId());

        // 保存课程关联
        String coursesRaw = trim(data.getCourses());
        List<String> courseList = new ArrayList<>();
        if (coursesRaw != null && !coursesRaw.isBlank()) {
            courseList = Arrays.asList(coursesRaw.split(";"));
            for (String course : courseList) {
                String c = course.trim();
                if (!c.isEmpty()) {
                    MajorCourseEntity mc = MajorCourseEntity.builder()
                            .majorId(saved.getMajorId())
                            .courseName(c)
                            .build();
                    majorCourseRepo.save(mc);
                }
            }
        }

        return MajorCreateResp.builder()
                .dbId(saved.getMajorId())
                .id(saved.getId())
                .name(saved.getName())
                .courses(courseList.isEmpty() ? null : courseList)
                .classSize(saved.getClassSize())
                .duration(saved.getDuration())
                .createdAt(saved.getCreatedTime())
                .build();
    }

    private String generateId() {
        long next = majorRepo.count() + 1;
        return "M" + String.format("%03d", next);
    }

    private String trim(String s) {
        return s == null ? null : s.trim();
    }
}
