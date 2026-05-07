package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 自动排课结果
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoArrangeResultDTO {
    private List<ScheduledItem> scheduled;
    private List<FailedItem> failed;
    private Stats stats;
    private Integer totalWeeks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduledItem {
        private String courseId;
        private String courseName;
        private String day;
        private int slot;
        private int week;
        private int duration;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailedItem {
        private CourseDTO course;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stats {
        private int scheduled;
        private int failed;
        private int total;
        private double successRate;
    }
}
