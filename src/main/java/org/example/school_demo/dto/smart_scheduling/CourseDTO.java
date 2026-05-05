package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 待排课程（课程池）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private String id;
    private String name;
    private String teacherId;
    private String teacherName;
    private String classId;
    private String className;
    private int duration;
    private int priority;
    private String courseType;
    private List<PreferredTime> preferredTimes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreferredTime {
        private String day;
        private int slot;
    }
}
