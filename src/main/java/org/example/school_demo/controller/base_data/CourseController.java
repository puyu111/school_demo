package org.example.school_demo.controller.base_data;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.base_data.CourseDataDTO;
import org.example.school_demo.dto.base_data.request.BatchDeleteReq;
import org.example.school_demo.dto.base_data.request.CourseCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.service.base_data.CourseService;
import org.example.school_demo.utils.ExcelUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/base-data/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public Result<PageResult<CourseListResp>> getPageList(
            @ModelAttribute @Validated PageReq pageReq
    ) {
        log.info("【课程列表】请求参数 - page: {}, pageSize: {}",
                pageReq.getPage(), pageReq.getPageSize());
        return Result.success(courseService.getPageList(pageReq));
    }

    @PostMapping
    public Result<CourseCreateResp> createCourse(@Validated @RequestBody CourseCreateReq req) {
        log.info("【创建课程】请求 - name: {}, id: {}", req.getName(), req.getId());
        Map<String, Object> result = courseService.createCourse(req);
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((CourseCreateResp) result.get("data"));
        } else {
            return Result.error(409, (String) result.get("message"));
        }
    }

    @PostMapping("/batch-delete")
    public Result<BatchDeleteResp> batchDelete(@Validated @RequestBody BatchDeleteReq req) {
        log.info("【批量删除课程】请求，dbIds: {}", req.getDbIds());
        Map<String, Object> result = courseService.batchDelete(req.getDbIds());
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((BatchDeleteResp) result.get("data"));
        } else {
            return Result.error(404, (String) result.get("message"));
        }
    }

    @PostMapping("/import")
    public Result<ImportResp<CourseCreateResp>> importCourses(@RequestParam("file") MultipartFile file) {
        log.info("【导入课程】请求，文件名: {}, 大小: {} bytes",
                file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) return Result.error(400, "导入失败：文件不能为空");
        if (file.getSize() > 10 * 1024 * 1024) return Result.error(400, "导入失败：文件大小不能超过10MB");

        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();
        boolean validExt = filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
        boolean validType = contentType != null &&
                (contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                 || contentType.equals("application/vnd.ms-excel"));
        if (!validExt || !validType) {
            return Result.error(400, "导入失败：文件格式不正确，请上传 .xlsx 或 .xls 文件");
        }

        try {
            Map<String, Object> result = courseService.importCourses(file.getInputStream());
            boolean success = (boolean) result.get("success");
            if (success) {
                return Result.success((ImportResp<CourseCreateResp>) result.get("data"));
            } else {
                return Result.error(500, (String) result.get("message"));
            }
        } catch (Exception e) {
            log.error("【导入课程】解析失败", e);
            return Result.error(500, "导入失败：文件解析异常");
        }
    }

    @GetMapping("/import/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        ExcelUtils.setExcelResponseHeader(response, "课程导入模板");
        List<CourseDataDTO> demoList = Arrays.asList(
                buildDemo("C001", "高等数学", 4.0, "必修", 64.0),
                buildDemo("C002", "线性代数", 3.0, "必修", 48.0),
                buildDemo("C003", "程序设计基础", 3.0, "选修", 48.0)
        );
        EasyExcel.write(response.getOutputStream(), CourseDataDTO.class)
                .sheet("模板数据")
                .doWrite(demoList);
    }

    private CourseDataDTO buildDemo(String id, String name, Double credits, String type, Double totalHours) {
        CourseDataDTO dto = new CourseDataDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setCredits(credits);
        dto.setType(type);
        dto.setTotalHours(totalHours);
        return dto;
    }
}
