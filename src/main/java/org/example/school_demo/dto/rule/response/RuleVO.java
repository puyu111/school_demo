package org.example.school_demo.dto.rule.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RuleVO {
    private String key;
    private String ruleName;
    private List<String> teachers;
    private String description;
    private long[] validDate;
}
