package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.util.List;

@Data
public class TimeSlotConfigVO {
    private List<HalfDayConfig> halfDayConfigs;
    private List<TimeSlotItem> timeSlots;
    private DailyScheduleConfig dailyConfig;

    @Data
    public static class HalfDayConfig {
        private String type;
        private String name;
        private String startTime;
        private String endTime;
        private boolean isSchedulable;
    }

    @Data
    public static class TimeSlotItem {
        private String id;
        private String label;
        private String startTime;
        private String endTime;
        private Integer duration;
        private String halfDayType;
        private boolean isBreak;
        private Integer breakAfter;
        private boolean isSchedulable;
    }

    @Data
    public static class DailyScheduleConfig {
        private int totalPeriods;
        private int defaultDuration;
        private int defaultBreakDuration;
    }
}
