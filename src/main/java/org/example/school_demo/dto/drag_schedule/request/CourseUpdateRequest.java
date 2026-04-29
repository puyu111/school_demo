package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class CourseUpdateRequest {
    private String courseName;
    private String teacherId;
    private String classId;
    private String roomId;
    private Integer weekDay;
    private String startTime;
    private String endTime;
    private Integer duration;
    private List<Integer> weeks;
    private String color;
}
