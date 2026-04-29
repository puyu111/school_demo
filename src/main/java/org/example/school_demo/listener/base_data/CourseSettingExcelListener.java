package org.example.school_demo.listener.base_data;

import org.example.school_demo.dto.base_data.CourseSettingDataDTO;
import org.example.school_demo.dto.base_data.response.CourseSettingCreateResp;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.entity.CourseSetting;
import org.example.school_demo.repository.CourseRepository;
import org.example.school_demo.repository.CourseSettingRepository;

import java.util.*;
import java.util.stream.Collectors;

public class CourseSettingExcelListener extends BaseExcelListener<CourseSettingDataDTO, CourseSettingCreateResp> {

    private final CourseSettingRepository courseSettingRepo;
    private final CourseRepository courseRepo;
    private final Set<Long> existingDbIds;

    public CourseSettingExcelListener(CourseSettingRepository courseSettingRepo,
                                       CourseRepository courseRepo) {
        this.courseSettingRepo = courseSettingRepo;
        this.courseRepo = courseRepo;
        this.existingDbIds = courseSettingRepo.findAll().stream()
                .map(CourseSetting::getDbId)
                .collect(Collectors.toSet());
    }

    @Override
    protected void validate(CourseSettingDataDTO data, int rowNum) {
        String name = trim(data.getName());
        if (name == null || name.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("课程名称不能为空");
        }
        if (data.getPriority() == null || data.getPriority() <= 0) {
            throw new org.example.school_demo.exception.BusinessException("优先级必须为正整数");
        }
        if (trim(data.getSemester()) == null || trim(data.getSemester()).isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("开课学期不能为空");
        }

        if (courseRepo.findByName(name).isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("课程不存在，请先添加课程");
        }

        if (courseSettingRepo.existsByCourseName(name)) {
            throw new org.example.school_demo.exception.BusinessException("课程设置已存在");
        }
    }

    @Override
    protected Map<String, Object> buildErrorData(CourseSettingDataDTO data, org.example.school_demo.exception.BusinessException e) {
        Map<String, Object> map = new LinkedHashMap<>();
        String name = trim(data.getName());
        if (name != null && !name.isEmpty()) {
            map.put("name", name);
        }
        return map;
    }

    @Override
    protected CourseSettingCreateResp convertToEntity(CourseSettingDataDTO data) {
        String courseName = trim(data.getName());

        CourseEntity courseEntity = courseRepo.findByName(courseName)
                .orElseThrow(() -> new org.example.school_demo.exception.BusinessException("课程不存在"));

        String prereqs = trim(data.getPrerequisites());
        String prereqJson = null;
        List<String> prereqList = new ArrayList<>();
        if (prereqs != null && !prereqs.isEmpty()) {
            for (String part : prereqs.split(";")) {
                String p = part.trim();
                if (!p.isEmpty()) {
                    prereqList.add(p);
                }
            }
        }
        if (!prereqList.isEmpty()) {
            prereqJson = String.join(";", prereqList);
        }

        CourseSetting entity = CourseSetting.builder()
                .courseName(courseName)
                .priority(data.getPriority())
                .prerequisites(prereqJson)
                .semester(trim(data.getSemester()))
                .build();

        CourseSetting saved = courseSettingRepo.save(entity);

        return CourseSettingCreateResp.builder()
                .dbId(saved.getDbId())
                .name(saved.getCourseName())
                .priority(saved.getPriority())
                .prerequisites(prereqList.isEmpty() ? null : prereqList)
                .semester(saved.getSemester())
                .createdAt(saved.getCreatedTime())
                .build();
    }

    private String trim(String s) {
        return s == null ? null : s.trim();
    }
}
