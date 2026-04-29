package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

@Data
public class MoveRequest {
    private String courseId;
    private Integer newWeekDay;
    private String newStartTime;
}
