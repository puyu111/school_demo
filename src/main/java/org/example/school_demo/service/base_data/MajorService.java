package org.example.school_demo.service.base_data;

import org.example.school_demo.dto.base_data.request.MajorCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface MajorService {

    PageResult<MajorListResp> getPageList(PageReq pageReq, String keyword);

    Map<String, Object> createMajor(MajorCreateReq req);

    Map<String, Object> batchDelete(List<String> dbIds);

    Map<String, Object> importMajors(InputStream inputStream);
}
