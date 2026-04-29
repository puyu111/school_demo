package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

@Data
public class WeekDayConfigVO {
    private Integer id;
    private String name;
    private Boolean isEnabled;
    private Boolean isSchedulable;
}
