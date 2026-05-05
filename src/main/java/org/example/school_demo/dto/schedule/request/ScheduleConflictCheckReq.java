package org.example.school_demo.dto.schedule.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleConflictCheckReq {
    private Long id;
    private Long teacherId;
    private Long roomId;
    private String classId;
    private Integer weekday;
    private String startTime;
    private String endTime;
}
