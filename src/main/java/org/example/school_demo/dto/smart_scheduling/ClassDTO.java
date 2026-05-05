package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 班级信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassDTO {
    private String id;
    private String name;
    private Integer studentCount;
    private Integer maxDailyCourses;
    private List<UnavailableTime> unavailableTimes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnavailableTime {
        private String day;
        private List<Integer> slots;
    }
}
