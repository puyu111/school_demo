package org.example.school_demo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.CourseListResp;
import org.example.school_demo.dto.response.PageResult;
import org.example.school_demo.service.CourseService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 课程管理 REST API 控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/base-data/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    /**
     * 获取课程列表（分页）
     *
     * 请求：GET /api/base-data/courses?page=1&pageSize=10
     *
     * 响应：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": {
     *     "list": [...],
     *     "total": 46
     *   },
     *   "timestamp": 1713580800000
     * }
     *
     * @param pageReq 分页请求参数
     * @return 分页结果
     */
    @GetMapping
    public Result<PageResult<CourseListResp>> getPageList(
            @ModelAttribute @Validated PageReq pageReq
    ) {
        log.info("【课程列表】请求参数 - page: {}, pageSize: {}",
                 pageReq.getPage(), pageReq.getPageSize());

        PageResult<CourseListResp> result = courseService.getPageList(pageReq);

        return Result.success(result);
    }
}
