package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 推荐排课时间
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeRecommendationDTO {
    private String day;
    private int slot;
    private String reason;
    private int score;
}
