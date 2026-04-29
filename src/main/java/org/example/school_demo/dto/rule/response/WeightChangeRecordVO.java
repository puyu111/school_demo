package org.example.school_demo.dto.rule.response;

import lombok.Data;

@Data
public class WeightChangeRecordVO {
    private Long id;
    private String ruleId;
    private String ruleName;
    private Integer oldValue;
    private Integer newValue;
    private String time;
}
