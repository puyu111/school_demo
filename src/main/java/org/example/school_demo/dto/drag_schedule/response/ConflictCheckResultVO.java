package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.util.List;

@Data
public class ConflictCheckResultVO {
    private Boolean hasConflicts;
    private List<ConflictItem> conflicts;
    private List<Recommendation> recommendations;

    @Data
    public static class ConflictItem {
        private String type;
        private String message;
        private ExistingCourseInfo existingCourse;
    }

    @Data
    public static class ExistingCourseInfo {
        private String id;
        private String courseName;
        private Integer weekDay;
        private String startTime;
        private String endTime;
    }

    @Data
    public static class Recommendation {
        private Integer weekDay;
        private String startTime;
        private String roomId;
        private String reason;
    }
}
