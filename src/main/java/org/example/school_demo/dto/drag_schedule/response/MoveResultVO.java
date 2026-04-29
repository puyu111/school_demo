package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

@Data
public class MoveResultVO {
    private String courseId;
    private Integer oldWeekDay;
    private Integer newWeekDay;
    private String oldStartTime;
    private String newStartTime;
}
