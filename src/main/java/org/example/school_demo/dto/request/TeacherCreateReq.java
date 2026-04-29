package org.example.school_demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherCreateReq {

    private String id;

    @NotBlank(message = "教师姓名不能为空")
    private String name;

    @NotBlank(message = "性别不能为空")
    private String gender;

    private List<String> courses;

    @NotBlank(message = "学历不能为空")
    private String degree;

    private String email;

    private String phone;
}
