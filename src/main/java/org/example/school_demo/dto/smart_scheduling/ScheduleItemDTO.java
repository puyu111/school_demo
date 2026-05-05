package org.example.school_demo.dto.smart_scheduling;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 排课记录
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleItemDTO {
    private String id;
    private String courseId;
    private String courseName;
    private String teacherId;
    private String teacherName;
    private String classId;
    private String className;
    private String roomId;
    private String roomName;
    private String day;
    private int slot;
    private int week;
    private int duration;
}
