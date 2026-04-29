package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class WeekDayUpdateRequest {
    private List<WeekDayItem> weekDays;

    @Data
    public static class WeekDayItem {
        private Integer id;
        private Boolean isEnabled;
        private Boolean isSchedulable;
    }
}
