package org.example.school_demo.dto.drag_schedule.request;

import lombok.Data;

import java.util.List;

@Data
public class BatchMoveRequest {
    private List<MoveRequest> moves;
}
