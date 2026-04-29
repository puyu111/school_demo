package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.util.List;

@Data
public class WeekCopyResultVO {
    private Integer sourceWeek;
    private List<Integer> copiedWeeks;
    private int copiedCourseCount;
    private List<Integer> skippedWeeks;
    private List<Integer> failedWeeks;
}
