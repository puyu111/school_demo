package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

@Data
public class WeekClearResultVO {
    private Integer weekNumber;
    private int deletedCourseCount;
    private boolean configPreserved;
}
