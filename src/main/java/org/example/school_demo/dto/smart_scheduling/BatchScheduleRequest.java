package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 批量保存排课请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchScheduleRequest {
    private List<CourseItem> courses;
    private Integer week;
    private String semesterId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseItem {
        private String courseId;
        private String day;
        private int slot;
        private String roomId;
    }
}
