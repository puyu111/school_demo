package org.example.school_demo.dto.course_adjustment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationListResp {

    private String key;
    private String id;
    private String teacherId;
    private String teacherName;
    private String department;
    private String originalCourse;
    private String targetCourse;
    private String reason;
    private String applyTime;
    private String status;
    private String urgency;
    private String reviewComment;
    private String reviewerId;
    private String reviewerName;
    private String reviewTime;
}
