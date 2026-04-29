package org.example.school_demo.service;

import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.BatchDeleteResp;
import org.example.school_demo.dto.response.ImportResp;
import org.example.school_demo.dto.response.PageResult;
import org.example.school_demo.dto.response.TeacherCreateResp;
import org.example.school_demo.dto.response.TeacherListResp;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface TeacherService {

    PageResult<TeacherListResp> getPageList(PageReq pageReq, String keyword, String degree);

    Map<String, Object> createTeacher(org.example.school_demo.dto.request.TeacherCreateReq req);

    Map<String, Object> batchDelete(List<String> dbIds);

    Map<String, Object> importTeachers(InputStream inputStream);
}
