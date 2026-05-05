package org.example.school_demo.dto.schedule.response;

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
public class ScheduleStatsResp {
    private long totalCourses;
    private long totalTeachers;
    private long totalClasses;
    private long totalRooms;
    private Map<String, Long> weekdayDistribution;
    private List<TeacherScheduleCount> topTeachers;
    private Map<String, Long> timeSlotDistribution;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherScheduleCount {
        private Long teacherId;
        private String teacherName;
        private long count;
    }
}
