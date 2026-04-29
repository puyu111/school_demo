package org.example.school_demo.dto.rule.response;

import lombok.Data;

@Data
public class RuleWeightVO {
    private String id;
    private String name;
    private String category;
    private Integer currentWeight;
    private Integer defaultWeight;
    private Integer minWeight;
    private Integer maxWeight;
    private Boolean enabled;
    private String description;
}
