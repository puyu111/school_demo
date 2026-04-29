package org.example.school_demo.listener.base_data;

import org.example.school_demo.dto.base_data.TeacherDataDTO;
import org.example.school_demo.dto.base_data.response.TeacherCreateResp;
import org.example.school_demo.entity.TeacherEntity;
import org.example.school_demo.repository.TeacherRepository;

import java.util.*;
import java.util.stream.Collectors;

public class TeacherExcelListener extends BaseExcelListener<TeacherDataDTO, TeacherCreateResp> {

    private final TeacherRepository teacherRepo;
    private final Set<String> existingNames;
    private final Set<String> existingIds;

    public TeacherExcelListener(TeacherRepository teacherRepo) {
        this.teacherRepo = teacherRepo;
        List<TeacherEntity> all = teacherRepo.findAll();
        this.existingNames = all.stream()
                .map(TeacherEntity::getName)
                .filter(name -> name != null && !name.isBlank())
                .collect(Collectors.toSet());
        this.existingIds = all.stream()
                .map(TeacherEntity::getId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
    }

    @Override
    protected void validate(TeacherDataDTO data, int rowNum) {
        String name = trim(data.getName());
        if (name == null || name.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("教师姓名不能为空");
        }
        if (existingNames.contains(name)) {
            throw new org.example.school_demo.exception.BusinessException("教师姓名已存在");
        }

        String gender = trim(data.getGender());
        if (gender == null || gender.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("性别不能为空");
        }
        if (!"男".equals(gender) && !"女".equals(gender)) {
            throw new org.example.school_demo.exception.BusinessException("性别必须是男或女");
        }

        String degree = trim(data.getDegree());
        if (degree == null || degree.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("学历不能为空");
        }
        if (!Set.of("本科", "硕士研究生", "博士研究生").contains(degree)) {
            throw new org.example.school_demo.exception.BusinessException("学历必须是本科、硕士研究生或博士研究生");
        }

        String id = trim(data.getId());
        if (id == null || id.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("教师ID不能为空");
        }
        if (existingIds.contains(id)) {
            throw new org.example.school_demo.exception.BusinessException("教师ID已存在");
        }
    }

    @Override
    protected Map<String, Object> buildErrorData(TeacherDataDTO data, org.example.school_demo.exception.BusinessException e) {
        Map<String, Object> map = new LinkedHashMap<>();
        String id = trim(data.getId());
        if (id != null && !id.isEmpty()) {
            map.put("id", id);
        }
        String name = trim(data.getName());
        if (name != null && !name.isEmpty()) {
            map.put("name", name);
        }
        return map;
    }

    @Override
    protected TeacherCreateResp convertToEntity(TeacherDataDTO data) {
        String name = trim(data.getName());
        String gender = trim(data.getGender());
        String degree = trim(data.getDegree());
        String email = trim(data.getEmail());
        String phone = trim(data.getPhone());

        String id = trim(data.getId());
        if (id == null || id.isEmpty()) {
            id = generateId();
        }

        String courses = trim(data.getCourses());

        TeacherEntity entity = TeacherEntity.builder()
                .id(id)
                .name(name)
                .gender(gender)
                .courses(courses)
                .degree(degree)
                .email(email)
                .phone(phone)
                .build();

        TeacherEntity saved = teacherRepo.save(entity);
        existingNames.add(name);
        if (id != null && !id.isEmpty()) {
            existingIds.add(id);
        }

        List<String> courseList = new ArrayList<>();
        if (courses != null && !courses.isEmpty()) {
            courseList = Arrays.stream(courses.split(";"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }

        return TeacherCreateResp.builder()
                .dbId(saved.getDbId())
                .id(saved.getId())
                .name(saved.getName())
                .gender(saved.getGender())
                .courses(courseList.isEmpty() ? null : courseList)
                .degree(saved.getDegree())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .createdAt(saved.getCreatedTime())
                .build();
    }

    private String generateId() {
        long next = teacherRepo.count() + 1;
        return "T" + String.format("%03d", next);
    }

    private String trim(String s) {
        return s == null ? null : s.trim();
    }
}
