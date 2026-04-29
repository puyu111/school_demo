package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class BatchDeleteRequest {
    private List<String> courseIds;
}
