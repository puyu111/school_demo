package org.example.school_demo.dto.schedule.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSaveReq {
    private Integer week;
    private List<SaveCourseData> courses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveCourseData {
        private Long id;
        private Long courseId;
        private Long teacherId;
        private String classId;
        private Long roomId;
        private Integer weekday;
        private String startTime;
        private String endTime;
        private Integer duration;
        private List<Integer> weeks;
        private String color;
        private Integer studentCount;
    }
}
