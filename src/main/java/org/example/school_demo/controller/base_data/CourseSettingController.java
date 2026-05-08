package org.example.school_demo.controller.base_data;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.base_data.CourseSettingDataDTO;
import org.example.school_demo.dto.base_data.request.BatchDeleteReq;
import org.example.school_demo.dto.base_data.request.CourseSettingCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.service.base_data.CourseSettingService;
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
@RequestMapping("/api/base-data/course-settings")
@RequiredArgsConstructor
public class CourseSettingController {

    private final CourseSettingService courseSettingService;

    @GetMapping
    public Result<PageResult<CourseSettingListResp>> getPageList(
            @ModelAttribute @Validated PageReq pageReq,
            @RequestParam(required = false) String semester
    ) {
        log.info("【课程设置列表】请求 - page: {}, pageSize: {}, semester: {}",
                pageReq.getPage(), pageReq.getPageSize(), semester);
        return Result.success(courseSettingService.getPageList(pageReq, semester));
    }

    @PostMapping
    public Result<CourseSettingCreateResp> createCourseSetting(@Validated @RequestBody CourseSettingCreateReq req) {
        log.info("【创建课程设置】请求 - name: {}", req.getName());
        Map<String, Object> result = courseSettingService.createCourseSetting(req);
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((CourseSettingCreateResp) result.get("data"));
        } else {
            return Result.error(409, (String) result.get("message"));
        }
    }

    @PostMapping("/batch-delete")
    public Result<BatchDeleteResp> batchDelete(@Validated @RequestBody BatchDeleteReq req) {
        log.info("【批量删除课程设置】请求，dbIds: {}", req.getDbIds());
        Map<String, Object> result = courseSettingService.batchDelete(req.getDbIds());
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((BatchDeleteResp) result.get("data"));
        } else {
            return Result.error(404, (String) result.get("message"));
        }
    }

    @PostMapping("/import")
    public Result<ImportResp<CourseSettingCreateResp>> importCourseSettings(@RequestParam("file") MultipartFile file) {
        log.info("【导入课程设置】请求，文件名: {}, 大小: {} bytes",
                file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) return Result.error(400, "导入失败：文件不能为空");
        if (file.getSize() > 10 * 1024 * 1024) return Result.error(400, "导入失败：文件大小不能超过10MB");

        String filename = file.getOriginalFilename();
        boolean validExt = filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
        if (!validExt) {
            return Result.error(400, "导入失败：文件格式不正确，请上传 .xlsx 或 .xls 文件");
        }

        try {
            Map<String, Object> result = courseSettingService.importCourseSettings(file.getInputStream());
            boolean success = (boolean) result.get("success");
            if (success) {
                ImportResp<CourseSettingCreateResp> importResp = (ImportResp<CourseSettingCreateResp>) result.get("data");
                if (importResp.getFailed() > 0) {
                    return Result.success(
                            String.format("导入完成，成功 %d 条，失败 %d 条", importResp.getSuccess(), importResp.getFailed()),
                            importResp);
                }
                return Result.success(importResp);
            } else {
                return Result.error(400, (String) result.get("message"));
            }
        } catch (Exception e) {
            log.error("【导入课程设置】解析失败", e);
            return Result.error(500, "导入失败：文件解析异常");
        }
    }

    @GetMapping("/import/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        ExcelUtils.setExcelResponseHeader(response, "课程设置导入模板");
        List<CourseSettingDataDTO> demoList = Arrays.asList(
                buildDemo("高等数学", 1, "", "第 1 学期"),
                buildDemo("线性代数", 2, "高等数学", "第 2 学期"),
                buildDemo("概率论", 3, "高等数学;线性代数", "第 3 学期")
        );
        EasyExcel.write(response.getOutputStream(), CourseSettingDataDTO.class)
                .sheet("模板数据")
                .doWrite(demoList);
    }

    private CourseSettingDataDTO buildDemo(String name, int priority, String prerequisites, String semester) {
        CourseSettingDataDTO dto = new CourseSettingDataDTO();
        dto.setName(name);
        dto.setPriority(priority);
        dto.setPrerequisites(prerequisites);
        dto.setSemester(semester);
        return dto;
    }
}
