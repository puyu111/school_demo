package org.example.school_demo.service;

import org.example.school_demo.dto.request.CourseCreateReq;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.*;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * 课程服务接口
 */
public interface CourseService {

    /**
     * 分页获取课程列表
     */
    PageResult<CourseListResp> getPageList(PageReq pageReq);



    Map<String, Object> createCourse(CourseCreateReq req);
    Map<String, Object> batchDelete(List<String> dbIds);
    Map<String, Object> importCourses(InputStream inputStream);

}
