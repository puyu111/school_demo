package org.example.school_demo.dto.schedule.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleMoveReq {
    private Long id;
    private Integer weekday;
    private String startTime;
    private String endTime;
}
