package org.example.school_demo.listener;

import org.example.school_demo.dto.CourseSettingDataDTO;
import org.example.school_demo.dto.response.CourseSettingCreateResp;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.entity.CoursePrerequisiteEntity;
import org.example.school_demo.entity.CourseSettingEntity;
import org.example.school_demo.repository.CoursePrerequisiteRepo;
import org.example.school_demo.repository.CourseRepo;
import org.example.school_demo.repository.CourseSettingRepo;

import java.util.*;
import java.util.stream.Collectors;

public class CourseSettingExcelListener extends BaseExcelListener<CourseSettingDataDTO, CourseSettingCreateResp> {

    private final CourseSettingRepo courseSettingRepo;
    private final CoursePrerequisiteRepo coursePrerequisiteRepo;
    private final CourseRepo courseRepo;
    private final Set<Long> existingCourseIds;

    public CourseSettingExcelListener(CourseSettingRepo courseSettingRepo,
                                       CoursePrerequisiteRepo coursePrerequisiteRepo,
                                       CourseRepo courseRepo) {
        this.courseSettingRepo = courseSettingRepo;
        this.coursePrerequisiteRepo = coursePrerequisiteRepo;
        this.courseRepo = courseRepo;
        this.existingCourseIds = courseSettingRepo.findAll()
                .stream()
                .map(CourseSettingEntity::getCourseId)
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

        Optional<CourseEntity> courseOpt = courseRepo.findByCourseName(name);
        if (courseOpt.isEmpty()) {
            throw new org.example.school_demo.exception.BusinessException("课程不存在，请先添加课程");
        }

        CourseEntity course = courseOpt.get();
        if (existingCourseIds.contains(course.getCourseId())) {
            throw new org.example.school_demo.exception.BusinessException("课程设置已存在");
        }

        String prereqs = trim(data.getPrerequisites());
        if (prereqs != null && !prereqs.isEmpty()) {
            String[] parts = prereqs.split(";");
            for (String part : parts) {
                String p = part.trim();
                if (!p.isEmpty() && courseRepo.findByCourseName(p).isEmpty()) {
                    throw new org.example.school_demo.exception.BusinessException("先修课程不存在");
                }
            }
        }
    }

    @Override
    protected Map<String, Object> buildErrorData(CourseSettingDataDTO data, org.example.school_demo.exception.BusinessException e) {
        Map<String, Object> map = new LinkedHashMap<>();
        String name = trim(data.getName());
        if (name != null && !name.isEmpty()) {
            map.put("name", name);
        }
        if (data.getPriority() != null) {
            map.put("priority", data.getPriority());
        }
        String prereqs = trim(data.getPrerequisites());
        if (prereqs != null && !prereqs.isEmpty()) {
            map.put("prerequisites", prereqs);
        }
        return map;
    }

    @Override
    protected CourseSettingCreateResp convertToEntity(CourseSettingDataDTO data) {
        String courseName = trim(data.getName());

        CourseEntity course = courseRepo.findByCourseName(courseName)
                .orElseThrow(() -> new org.example.school_demo.exception.BusinessException("课程不存在"));

        CourseSettingEntity entity = CourseSettingEntity.builder()
                .courseId(course.getCourseId())
                .priority(data.getPriority())
                .semester(trim(data.getSemester()))
                .build();

        CourseSettingEntity saved = courseSettingRepo.save(entity);
        existingCourseIds.add(course.getCourseId());

        List<String> prerequisiteList = new ArrayList<>();
        String prereqs = trim(data.getPrerequisites());
        if (prereqs != null && !prereqs.isEmpty()) {
            for (String part : prereqs.split(";")) {
                String p = part.trim();
                if (!p.isEmpty()) {
                    courseRepo.findByCourseName(p).ifPresent(prereq -> {
                        CoursePrerequisiteEntity cp = CoursePrerequisiteEntity.builder()
                                .courseId(course.getCourseId())
                                .prereqId(prereq.getCourseId())
                                .build();
                        coursePrerequisiteRepo.save(cp);
                    });
                    prerequisiteList.add(p);
                }
            }
        }

        return CourseSettingCreateResp.builder()
                .dbId(saved.getSettingId())
                .name(course.getCourseName())
                .priority(saved.getPriority())
                .prerequisites(prerequisiteList.isEmpty() ? null : prerequisiteList)
                .semester(saved.getSemester())
                .createdAt(saved.getCreatedTime())
                .build();
    }

    private String trim(String s) {
        return s == null ? null : s.trim();
    }
}
