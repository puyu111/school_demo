package org.example.school_demo.dto.schedule.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleConflictCheckResp {
    private boolean hasConflict;
    private List<ConflictDetail> conflicts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConflictDetail {
        private Long scheduleId;
        private String type;
        private String description;
        private Long courseId;
        private String courseName;
        private Long teacherId;
        private String teacherName;
        private String roomName;
        private String classId;
        private Integer weekday;
        private String startTime;
        private String endTime;
    }
}
