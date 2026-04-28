package org.example.school_demo.controller;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.CourseDataDTO;
import org.example.school_demo.dto.request.BatchDeleteReq;
import org.example.school_demo.dto.request.CourseCreateReq;
import org.example.school_demo.dto.request.PageReq;
import org.example.school_demo.dto.response.*;
import org.example.school_demo.service.CourseService;
import org.example.school_demo.utils.ExcelUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    @PostMapping
    public Result<CourseCreateResp> createCourse(@Validated @RequestBody CourseCreateReq req) {
        log.info("【创建课程】请求 - name: {}, id: {}", req.getName(), req.getId());
        Map<String, Object> result = courseService.createCourse(req);
        boolean success = (boolean) result.get("success");

        if (success) {
            return Result.success((CourseCreateResp) result.get("data"));
        } else {
            String message = (String) result.get("message");
            return Result.error(409, message);
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
            String message = (String) result.get("message");
            return Result.error(404, message);
        }
    }

    private static final long MAX_IMPORT_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping("/import")
    public Result<ImportResp<CourseCreateResp>> importCourses(@RequestParam("file") MultipartFile file) {
        log.info("【导入课程】请求，文件名: {}, 大小: {} bytes",
                 file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) {
            return Result.error(400, "导入失败：文件不能为空");
        }

        if (file.getSize() > MAX_IMPORT_SIZE) {
            return Result.error(400, "导入失败：文件大小不能超过10MB");
        }

        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();

        boolean validExt = filename != null
                && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
        boolean validType = contentType != null
                && (contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
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
                String message = (String) result.get("message");
                int code = message.contains("文件格式") ? 400 : (message.contains("所有数据行") ? 400 : 500);
                return Result.error(code, message);
            }
        } catch (Exception e) {
            log.error("【导入课程】解析失败", e);
            return Result.error(500, "导入失败：文件解析异常");
        }
    }

    /**
     * 下载课程导入模板
     */
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
