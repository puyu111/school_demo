package org.example.school_demo.algorithm;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 排课单元：表示一门课在一个时间段+教室的分配。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSlot {

    /** 课程 ID (CourseEntity.dbId) */
    private Long courseId;

    /** 教师 ID (TeacherEntity.dbId) */
    private Long teacherId;

    /** 班级 ID */
    private String classId;

    /** 教室 ID (RoomEntity.dbId)，null 表示未分配教室 */
    private Long roomId;

    /** 星期几 (1=周一 .. 7=周日) */
    private int weekday;
 
    /** 起始时间段索引 (从 0 开始) */
    private int startSlotIndex;

    /** 占用连续时间段数 */
    private int durationSlots;

    /**
     * 深拷贝
     */
    public ScheduleSlot deepCopy() {
        return new ScheduleSlot(courseId, teacherId, classId, roomId, weekday, startSlotIndex, durationSlots);
    }
}
