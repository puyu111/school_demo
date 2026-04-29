package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

@Data
public class SaveResultVO {
    private Integer week;
    private int savedCount;
    private String message;
}
