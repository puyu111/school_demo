package org.example.school_demo.controller.base_data;

import com.alibaba.excel.EasyExcel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.common.Result;
import org.example.school_demo.dto.base_data.MajorDataDTO;
import org.example.school_demo.dto.base_data.request.MajorBatchDeleteReq;
import org.example.school_demo.dto.base_data.request.MajorCreateReq;
import org.example.school_demo.dto.base_data.request.PageReq;
import org.example.school_demo.dto.base_data.response.*;
import org.example.school_demo.service.base_data.MajorService;
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
@RequestMapping("/api/base-data/majors")
@RequiredArgsConstructor
public class MajorController {

    private final MajorService majorService;

    @GetMapping
    public Result<PageResult<MajorListResp>> getPageList(
            @ModelAttribute @Validated PageReq pageReq,
            @RequestParam(required = false) String keyword
    ) {
        log.info("【专业列表】请求 - page: {}, pageSize: {}, keyword: {}",
                pageReq.getPage(), pageReq.getPageSize(), keyword);
        return Result.success(majorService.getPageList(pageReq, keyword));
    }

    @PostMapping
    public Result<MajorCreateResp> createMajor(@Validated @RequestBody MajorCreateReq req) {
        log.info("【创建专业】请求 - name: {}, id: {}", req.getName(), req.getId());
        Map<String, Object> result = majorService.createMajor(req);
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((MajorCreateResp) result.get("data"));
        } else {
            return Result.error(409, (String) result.get("message"));
        }
    }

    @PostMapping("/batch-delete")
    public Result<BatchDeleteResp> batchDelete(@Validated @RequestBody MajorBatchDeleteReq req) {
        log.info("【批量删除专业】请求，dbIds: {}", req.getDbIds());
        Map<String, Object> result = majorService.batchDelete(req.getDbIds());
        boolean success = (boolean) result.get("success");
        if (success) {
            return Result.success((BatchDeleteResp) result.get("data"));
        } else {
            return Result.error(404, (String) result.get("message"));
        }
    }

    @PostMapping("/import")
    public Result<ImportResp<MajorCreateResp>> importMajors(@RequestParam("file") MultipartFile file) {
        log.info("【导入专业】请求，文件名: {}, 大小: {} bytes",
                file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) return Result.error(400, "导入失败：文件不能为空");
        if (file.getSize() > 10 * 1024 * 1024) return Result.error(400, "导入失败：文件大小不能超过10MB");

        String filename = file.getOriginalFilename();
        boolean validExt = filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
        if (!validExt) {
            return Result.error(400, "导入失败：文件格式不正确，请上传 .xlsx 或 .xls 文件");
        }

        try {
            Map<String, Object> result = majorService.importMajors(file.getInputStream());
            boolean success = (boolean) result.get("success");
            if (success) {
                return Result.success((ImportResp<MajorCreateResp>) result.get("data"));
            } else {
                return Result.error(400, (String) result.get("message"));
            }
        } catch (Exception e) {
            log.error("【导入专业】解析失败", e);
            return Result.error(500, "导入失败：文件解析异常");
        }
    }

    @GetMapping("/import/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        ExcelUtils.setExcelResponseHeader(response, "专业导入模板");
        List<MajorDataDTO> demoList = Arrays.asList(
                buildDemo("M001", "计算机科学与技术", "高等数学;数据结构;操作系统;计算机组成原理", 45, 4),
                buildDemo("M002", "软件工程", "高等数学;数据结构;软件工程导论;数据库原理", 40, 4)
        );
        EasyExcel.write(response.getOutputStream(), MajorDataDTO.class)
                .sheet("模板数据")
                .doWrite(demoList);
    }

    private MajorDataDTO buildDemo(String id, String name, String courses, int classSize, int duration) {
        MajorDataDTO dto = new MajorDataDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setCourses(courses);
        dto.setClassSize(classSize);
        dto.setDuration(duration);
        return dto;
    }
}
