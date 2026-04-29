package org.example.school_demo.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class MajorDataDTO {

    @ExcelProperty("专业ID")
    private String id;

    @ExcelProperty("专业名称")
    private String name;

    @ExcelProperty("必修课程")
    private String courses;

    @ExcelProperty("班级数")
    private Integer classSize;

    @ExcelProperty("学制")
    private Integer duration;
}
