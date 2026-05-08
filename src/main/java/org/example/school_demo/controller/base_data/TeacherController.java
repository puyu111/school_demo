package org.example.school_demo.controller.base_data;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.base_data.TeacherDataDTO;
import org.example.school_demo.dto.base_data.request.BatchDeleteReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.request.TeacherCreateReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.service.base_data.TeacherService;
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
@RequestMapping("/api/base-data/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public Result<PageResult<TeacherListResp>> getPageList(
            @ModelAttribute @Validated PageReq pageReq,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String degree
    ) {
        log.info("【教师列表】请求 - page: {}, pageSize: {}, keyword: {}, degree: {}",
                pageReq.getPage(), pageReq.getPageSize(), keyword, degree);
        return Result.success(teacherService.getPageList(pageReq, keyword, degree));
    }

    @PostMapping
    public Result<TeacherCreateResp> createTeacher(@Validated @RequestBody TeacherCreateReq req) {
        log.info("【创建教师】请求 - name: {}", req.getName());
        Map<String, Object> result = teacherService.createTeacher(req);
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((TeacherCreateResp) result.get("data"));
        } else {
            return Result.error(409, (String) result.get("message"));
        }
    }

    @PostMapping("/batch-delete")
    public Result<BatchDeleteResp> batchDelete(@Validated @RequestBody BatchDeleteReq req) {
        log.info("【批量删除教师】请求，dbIds: {}", req.getDbIds());
        Map<String, Object> result = teacherService.batchDelete(req.getDbIds());
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((BatchDeleteResp) result.get("data"));
        } else {
            return Result.error(404, (String) result.get("message"));
        }
    }

    @PostMapping("/import")
    public Result<ImportResp<TeacherCreateResp>> importTeachers(@RequestParam("file") MultipartFile file) {
        log.info("【导入教师】请求，文件名: {}, 大小: {} bytes",
                file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) return Result.error(400, "导入失败：文件不能为空");
        if (file.getSize() > 10 * 1024 * 1024) return Result.error(400, "导入失败：文件大小不能超过10MB");

        String filename = file.getOriginalFilename();
        boolean validExt = filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
        if (!validExt) {
            return Result.error(400, "导入失败：文件格式不正确，请上传 .xlsx 或 .xls 文件");
        }

        try {
            Map<String, Object> result = teacherService.importTeachers(file.getInputStream());
            boolean success = (boolean) result.get("success");
            if (success) {
                ImportResp<TeacherCreateResp> importResp = (ImportResp<TeacherCreateResp>) result.get("data");
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
            log.error("【导入教师】解析失败", e);
            return Result.error(500, "导入失败：文件解析异常");
        }
    }

    @GetMapping("/import/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        ExcelUtils.setExcelResponseHeader(response, "教师导入模板");
        List<TeacherDataDTO> demoList = Arrays.asList(
                buildDemo("T001", "张三", "男", "高等数学;线性代数", "博士研究生", "zhangsan@university.edu.cn", "13812341234"),
                buildDemo("T002", "李四", "女", "数据结构;算法分析", "博士研究生", "lisi@university.edu.cn", "13912341234")
        );
        EasyExcel.write(response.getOutputStream(), TeacherDataDTO.class)
                .sheet("模板数据")
                .doWrite(demoList);
    }

    private TeacherDataDTO buildDemo(String id, String name, String gender, String courses,
                                      String degree, String email, String phone) {
        TeacherDataDTO dto = new TeacherDataDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setGender(gender);
        dto.setCourses(courses);
        dto.setDegree(degree);
        dto.setEmail(email);
        dto.setPhone(phone);
        return dto;
    }
}
