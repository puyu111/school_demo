package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.util.List;

@Data
public class BatchMoveResultVO {
    private List<MoveResultVO> success;
    private List<String> failed;
    private List<String> conflicts;
}
