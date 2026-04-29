package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.util.List;

@Data
public class ExportResultVO {
    private ExportInfo exportInfo;
    private List<CourseVO> courses;
    private List<TimeSlotConfigVO.TimeSlotItem> timeSlots;
    private List<WeekDayConfigVO> weekDays;
    private List<TimeSlotConfigVO.HalfDayConfig> halfDayConfigs;

    @Data
    public static class ExportInfo {
        private String exportedAt;
        private int startWeek;
        private int endWeek;
        private int totalCourses;
    }
}
