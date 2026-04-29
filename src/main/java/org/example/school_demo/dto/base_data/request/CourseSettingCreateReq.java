package org.example.school_demo.dto.base_data.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSettingCreateReq {

    @NotBlank(message = "课程名称不能为空")
    private String name;

    @NotNull(message = "优先级不能为空")
    @Min(value = 1, message = "优先级必须为正整数")
    private Integer priority;

    private List<String> prerequisites;

    @NotBlank(message = "开课学期不能为空")
    private String semester;
}
