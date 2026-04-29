package org.example.school_demo.dto.rule.request;

import lombok.Data;

@Data
public class UnavailableDateRequest {
    private String teacherId;
    private String teacherName;
    private long[] validDate;
    private String reason;
    private String type;
    private String rangeType;
}
