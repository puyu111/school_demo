package org.example.school_demo.service;

import org.example.school_demo.dto.request.CourseSettingCreateReq;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.BatchDeleteResp;
import org.example.school_demo.dto.response.CourseSettingCreateResp;
import org.example.school_demo.dto.response.CourseSettingListResp;
import org.example.school_demo.dto.response.ImportResp;
import org.example.school_demo.dto.response.PageResult;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface CourseSettingService {

    PageResult<CourseSettingListResp> getPageList(PageReq pageReq, String semester);

    Map<String, Object> createCourseSetting(CourseSettingCreateReq req);

    Map<String, Object> batchDelete(List<String> dbIds);

    Map<String, Object> importCourseSettings(InputStream inputStream);
}
