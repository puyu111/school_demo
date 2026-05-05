package org.example.school_demo.dto.schedule.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleUpdateResp {
    private Long id;
    private Long courseId;
    private Integer weekday;
    private String startTime;
    private String endTime;
}
