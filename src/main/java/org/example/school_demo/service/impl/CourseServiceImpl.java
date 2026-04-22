package org.example.school_demo.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.CourseListResp;
import org.example.school_demo.dto.response.PageResult;
import org.example.school_demo.entity.CourseEntity;
import org.example.school_demo.repository.CourseRepo;
import org.example.school_demo.service.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 课程服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepo courseRepo;

    @Override
    public PageResult<CourseListResp> getPageList(PageReq pageReq) {
        log.info("查询课程列表，页码：{}, 每页数量：{}", pageReq.getPage(), pageReq.getPageSize());

        // 1. 调用 Repository 进行分页查询
        Page<CourseEntity> page = courseRepo.findAll(pageReq.toPageable());


        // 2. 将 Entity 转换为 Response DTO
        List<CourseListResp> list = page.getContent().stream()
                .map(this::entityToResp)
                .collect(Collectors.toList());

        log.info("查询完成，当前页数量：{}, 总记录数：{}", list.size(), page.getTotalElements());

        // 3. 返回分页结果
        return PageResult.of(list, page.getTotalElements());
    }

    /**
     * 将 CourseEntity 转换为 CourseListResp
     */
    private CourseListResp entityToResp(CourseEntity entity) {
        return CourseListResp.builder()
                .dbId(entity.getCourseId())
                .id(String.valueOf(entity.getCourseId()))
                .name(entity.getCourseName())
                .credits(entity.getCredits().intValue())
                .type(entity.getCourseType())
                .totalHours(entity.getTotalHours())
                .createdAt(entity.getCreatedTime())
                .updatedAt(entity.getUpdatedTime())
                .build();
    }
}