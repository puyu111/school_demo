package org.example.school_demo.service.base_data;

import org.example.school_demo.dto.base_data.request.TeacherCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface TeacherService {

    PageResult<TeacherListResp> getPageList(PageReq pageReq, String keyword, String degree);

    Map<String, Object> createTeacher(TeacherCreateReq req);

    Map<String, Object> batchDelete(List<String> dbIds);

    Map<String, Object> importTeachers(InputStream inputStream);
}
