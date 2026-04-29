package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class WeekCopyRequest {
    private Integer sourceWeek;
    private List<Integer> targetWeeks;
    private CopyOptions options;

    @Data
    public static class CopyOptions {
        private boolean copyCourses = true;
        private boolean copyConfig = false;
        private boolean overrideExisting = false;
    }
}
