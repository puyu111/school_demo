package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.util.List;

@Data
public class WeekInfoVO {
    private Integer weekNumber;
    private String startDate;
    private String endDate;
    private Integer courseCount;
    private Boolean isCurrentWeek;
    private Boolean hasUnsavedChanges;
}
