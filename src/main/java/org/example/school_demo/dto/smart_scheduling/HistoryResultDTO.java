package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 操作历史响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryResultDTO {
    private List<HistoryItem> list;
    private long total;
    private int page;
    private int pageSize;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryItem {
        private String id;
        private String action;
        private String courseId;
        private String courseName;
        private String teacherName;
        private String className;
        private String day;
        private Integer slot;
        private String timestamp;
        private String operator;
    }
}
