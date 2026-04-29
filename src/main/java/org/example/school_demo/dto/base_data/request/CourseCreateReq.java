package org.example.school_demo.dto.base_data.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreateReq {

    @NotBlank(message = "课程ID不能为空")
    private String id;

    @NotBlank(message = "课程名称不能为空")
    private String name;

    @NotNull(message = "学分不能为空")
    private Integer credits;

    @Builder.Default
    private String type = "必修";

    @NotNull(message = "总学时不能为空")
    private Integer totalHours;
}
