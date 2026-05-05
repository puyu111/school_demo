package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 排课统计数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleStatsDTO {
    private int totalCourses;
    private int scheduledCourses;
    private int pendingCourses;
    private double completionRate;
    private TeacherStats teacherStats;
    private ClassStats classStats;
    private TimeSlotStats timeSlotStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherStats {
        private int totalTeachers;
        private int activeTeachers;
        private double utilizationRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassStats {
        private int totalClasses;
        private int coveredClasses;
        private double coverageRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlotStats {
        private int totalSlots;
        private int usedSlots;
        private double utilizationRate;
    }
}
