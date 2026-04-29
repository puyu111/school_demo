package org.example.school_demo.dto.rule.request;

import lombok.Data;

import java.util.List;

@Data
public class BatchDeleteRequest {
    private List<String> keys;
}
