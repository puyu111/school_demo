package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 导出排课响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportResultDTO {
    private String downloadUrl;
    private String fileName;
    private String format;
    private String exportedAt;
    private int totalCourses;
}
