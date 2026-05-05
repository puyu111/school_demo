package org.example.school_demo.dto.schedule.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleVO {
    private Long id;
    private Long courseId;
    private String courseName;
    private Long teacherId;
    private String teacherName;
    private String classId;
    private String className;
    private Long roomId;
    private String roomName;
    private Integer weekday;
    private String startTime;
    private String endTime;
    private Integer duration;
    private List<Integer> weeks;
    private String color;
    private Integer studentCount;
}
