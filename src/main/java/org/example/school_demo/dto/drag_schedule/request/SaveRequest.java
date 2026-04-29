package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class SaveRequest {
    private Integer week;
    private List<CourseData> courses;
    private List<TimeSlotData> timeSlots;
    private List<WeekDayData> weekDays;
    private DailyConfigData dailyConfig;
    private List<HalfDayData> halfDayConfig;

    @Data
    public static class CourseData {
        private String id;
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

    @Data
    public static class TimeSlotData {
        private String id;
        private String startTime;
        private String endTime;
        private Integer duration;
    }

    @Data
    public static class WeekDayData {
        private Integer id;
        private Boolean isEnabled;
    }

    @Data
    public static class DailyConfigData {
        private int defaultDuration;
        private int defaultBreakDuration;
    }

    @Data
    public static class HalfDayData {
        private String type;
        private boolean isSchedulable;
    }
}
