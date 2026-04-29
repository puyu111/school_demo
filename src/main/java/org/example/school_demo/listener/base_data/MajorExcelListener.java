package org.example.school_demo.listener.base_data;

import org.example.school_demo.dto.base_data.MajorDataDTO;
import org.example.school_demo.dto.base_data.response.MajorCreateResp;
import org.example.school_demo.entity.Major;
import org.example.school_demo.repository.MajorRepository;

import java.util.*;
import java.util.stream.Collectors;

public class MajorExcelListener extends BaseExcelListener<MajorDataDTO, MajorCreateResp> {

    private final MajorRepository majorRepo;
    private final Set<String> existingNames;
    private final Set<String> existingIds;

    public MajorExcelListener(MajorRepository majorRepo) {
        this.majorRepo = majorRepo;
        List<Major> all = majorRepo.findAll();
        this.existingNames = all.stream().map(Major::getName).collect(Collectors.toSet());
        this.existingIds = all.stream()
                .map(Major::getId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
    }

    @Override
    protected void validate(MajorDataDTO data, int rowNum) {
        String name = trim(data.getName());
        if (name == null || name.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("专业名称不能为空");
        }
        if (data.getClassSize() == null || data.getClassSize() <= 0) {
            throw new org.example.school_demo.exception.BusinessException("班级数必须为正整数");
        }
        if (data.getDuration() == null || data.getDuration() <= 0) {
            throw new org.example.school_demo.exception.BusinessException("学制必须为正整数");
        }
        String id = trim(data.getId());
        if (id != null && !id.isBlank() && existingIds.contains(id)) {
            throw new org.example.school_demo.exception.BusinessException("专业ID已存在");
        }
        if (existingNames.contains(name)) {
            throw new org.example.school_demo.exception.BusinessException("专业名称已存在");
        }
    }

    @Override
    protected Map<String, Object> buildErrorData(MajorDataDTO data, org.example.school_demo.exception.BusinessException e) {
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

        Major entity = Major.builder()
                .id(id)
                .name(trim(data.getName()))
                .courses(trim(data.getCourses()))
                .classSize(data.getClassSize())
                .duration(data.getDuration())
                .build();

        Major saved = majorRepo.save(entity);
        existingNames.add(entity.getName());
        if (id != null && !id.isBlank()) {
            existingIds.add(id);
        }

        List<String> courseList = new ArrayList<>();
        String coursesRaw = trim(data.getCourses());
        if (coursesRaw != null && !coursesRaw.isBlank()) {
            courseList = Arrays.stream(coursesRaw.split(";"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        return MajorCreateResp.builder()
                .dbId(saved.getDbId())
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
