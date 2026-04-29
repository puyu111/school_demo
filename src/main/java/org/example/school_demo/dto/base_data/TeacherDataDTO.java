package org.example.school_demo.dto.base_data;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class TeacherDataDTO {

    @ExcelProperty("教师ID")
    private String id;

    @ExcelProperty("教师姓名")
    private String name;

    @ExcelProperty("性别")
    private String gender;

    @ExcelProperty("可授课程")
    private String courses;

    @ExcelProperty("学历")
    private String degree;

    @ExcelProperty("邮箱")
    private String email;

    @ExcelProperty("电话")
    private String phone;
}
