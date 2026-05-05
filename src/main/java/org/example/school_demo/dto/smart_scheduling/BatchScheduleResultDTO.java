package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 批量保存排课响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchScheduleResultDTO {
    private int scheduled;
    private int failed;
    private List<DetailItem> details;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailItem {
        private String courseId;
        private String status;
        private String scheduleId;
        private String error;
    }
}
