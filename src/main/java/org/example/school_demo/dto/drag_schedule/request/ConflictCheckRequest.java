package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class ConflictCheckRequest {
    private CourseInfo course;
    private Integer week;

    @Data
    public static class CourseInfo {
        private String teacherId;
        private String roomId;
        private String classId;
        private Integer weekDay;
        private String startTime;
        private String endTime;
        private Integer duration;
        private List<Integer> weeks;
    }
}
