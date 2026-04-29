package org.example.school_demo.dto.rule.request;

import lombok.Data;

import java.util.List;

@Data
public class RuleUpdateRequest {
    private String ruleName;
    private List<String> teachers;
    private String description;
    private long[] validDate;
}
