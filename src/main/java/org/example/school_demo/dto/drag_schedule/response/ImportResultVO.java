package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.util.List;

@Data
public class ImportResultVO {
    private int importedCount;
    private int skippedCount;
    private int failedCount;
    private int conflictCount;
    private ImportDetails details;

    @Data
    public static class ImportDetails {
        private List<String> skipped;
        private List<String> failed;
        private List<String> conflicts;
    }
}
