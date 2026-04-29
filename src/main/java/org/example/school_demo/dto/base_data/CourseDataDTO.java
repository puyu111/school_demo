package org.example.school_demo.dto.base_data;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class CourseDataDTO {

    @ExcelProperty("课程 ID")
    private String id;

    @ExcelProperty("课程名称")
    private String name;

    @ExcelProperty("学分")
    private Double credits;

    @ExcelProperty("课程类型")
    private String type;

    @ExcelProperty("总课时")
    private Double totalHours;
}
