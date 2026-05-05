package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 冲突检测结果
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConflictResultDTO {
    private boolean hasConflict;
    private List<ConflictItem> conflicts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConflictItem {
        private String type;
        private String message;
        private ExistingCourse existingCourse;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class ExistingCourse {
            private String courseId;
            private String courseName;
            private String day;
            private int slot;
        }
    }
}
