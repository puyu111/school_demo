package org.example.school_demo.dto.rule.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UnavailableDateVO {
    private String key;
    private String teacherId;
    private String teacherName;
    private long[] validDate;
    private String reason;
    private String type;
    private String rangeType;
}
