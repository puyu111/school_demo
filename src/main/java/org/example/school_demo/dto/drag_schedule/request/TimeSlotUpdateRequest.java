package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class TimeSlotUpdateRequest {
    private List<HalfDayConfigUpdate> halfDayConfigs;
    private List<TimeSlotUpdate> timeSlots;
    private DailyConfigUpdate dailyConfig;

    @Data
    public static class HalfDayConfigUpdate {
        private String type;
        private Boolean isSchedulable;
    }

    @Data
    public static class TimeSlotUpdate {
        private String id;
        private String startTime;
        private String endTime;
        private Integer duration;
        private Boolean isSchedulable;
    }

    @Data
    public static class DailyConfigUpdate {
        private int defaultDuration;
        private int defaultBreakDuration;
    }
}
