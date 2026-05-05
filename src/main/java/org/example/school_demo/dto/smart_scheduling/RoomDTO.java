package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 教室信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDTO {
    private String id;
    private String name;
    private Integer capacity;
    private String type;
    private String building;
}
