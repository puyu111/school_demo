package org.example.school_demo.dto.course_adjustment.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatsResp {

    private long total;
    private long pending;
    private long approved;
    private long rejected;
    private long revoked;
    private long highUrgency;
    private long normalUrgency;
    private long thisWeekCount;
    private long thisMonthCount;
}
