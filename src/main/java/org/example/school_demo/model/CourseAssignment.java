package org.example.school_demo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 课程分配详情
 * 表示一门课程被分配到的具体时间段和教室
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseAssignment {

    /**
     * 课程 ID
     */
    private String courseId;

    /**
     * 时间段 ID
     */
    private String timeSlotId;

    /**
     * 教室 ID
     */
    private String classroomId;

    /**
     * 教师 ID
     */
    private String teacherId;

    /**
     * 获取时间段的星期几
     */
    public Integer getDayOfWeek() {
        return TimeSlot.fromId(timeSlotId).getDayOfWeek();
    }

    /**
     * 获取时间段的节次
     */
    public Integer getPeriod() {
        return TimeSlot.fromId(timeSlotId).getPeriod();
    }
}
