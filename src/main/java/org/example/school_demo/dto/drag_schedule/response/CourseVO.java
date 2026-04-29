package org.example.school_demo.dto.drag_schedule.response;

import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
public class CourseVO {
    private String id;
    private String courseName;
    private String teacherName;
    private String teacherId;
    private String className;
    private String classId;
    private String roomName;
    private String roomId;
    private Integer weekDay;
    private String startTime;
    private String endTime;
    private Integer duration;
    private String color;
    private List<Integer> weeks;
    private Integer studentCount;
}
