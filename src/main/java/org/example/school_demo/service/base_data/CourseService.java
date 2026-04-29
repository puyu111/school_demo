package org.example.school_demo.service.base_data;

import org.example.school_demo.dto.base_data.request.CourseCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface CourseService {

    PageResult<CourseListResp> getPageList(PageReq pageReq);

    Map<String, Object> createCourse(CourseCreateReq req);

    Map<String, Object> batchDelete(List<String> dbIds);

    Map<String, Object> importCourses(InputStream inputStream);
}
