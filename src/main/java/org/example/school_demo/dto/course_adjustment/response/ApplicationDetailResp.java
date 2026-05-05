package org.example.school_demo.dto.course_adjustment.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailResp {

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
    private Map<String, Object> originalCourseDetail;
    private Map<String, Object> targetCourseDetail;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    private List<Map<String, Object>> attachments;
}
