package org.example.school_demo.service;

import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.CourseListResp;
import org.example.school_demo.dto.response.PageResult;

/**
 * 课程服务接口
 */
public interface CourseService {

    /**
     * 分页获取课程列表
     *
     * @param pageReq 分页请求参数
     * @return 分页结果
     */
    PageResult<CourseListResp> getPageList(PageReq pageReq);
}