package org.example.school_demo.dto.course_adjustment.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationCreateReq {

    @NotBlank(message = "教师ID不能为空")
    private String teacherId;

    @NotBlank(message = "教师姓名不能为空")
    private String teacherName;

    @NotBlank(message = "院系不能为空")
    private String department;

    private Long originalCourseId;

    @NotBlank(message = "原课程信息不能为空")
    private String originalCourse;

    @NotBlank(message = "目标课程信息不能为空")
    private String targetCourse;

    private Integer targetWeekDay;

    private Integer targetSlot;

    @NotBlank(message = "调课原因不能为空")
    private String reason;

    @NotBlank(message = "紧急程度不能为空")
    private String urgency;

    private List<Map<String, Object>> attachments;
}
