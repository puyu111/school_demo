package org.example.school_demo.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class CourseSettingDataDTO {

    @ExcelProperty("课程名称")
    private String name;

    @ExcelProperty("优先级")
    private Integer priority;

    @ExcelProperty("先修课程")
    private String prerequisites;

    @ExcelProperty("开课学期")
    private String semester;
}
