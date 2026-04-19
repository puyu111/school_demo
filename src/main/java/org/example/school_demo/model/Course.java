package org.example.school_demo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 课程实体
 * 表示一门需要排课的课程
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    /**
     * 课程唯一标识
     */
    private String id;

    /**
     * 课程名称，如 "高等数学", "数据结构"
     */
    private String name;

    /**
     * 所需课时数（需要排多少个时间段）
     */
    private Integer requiredPeriods;

    /**
     * 选课学生人数
     */
    private Integer studentCount;

    /**
     * 任课教师 ID
     */
    private String teacherId;

    /**
     * 优先教室类型（如实验室课程需要 LAB 类型）
     * 为 null 表示无特殊要求
     */
    private Classroom.ClassroomType preferredClassroomType;

    /**
     * 课程所属班级/专业 ID
     * 用于硬约束：同一班级同一时间段只能排一门课
     */
    private String classId;

    /**
     * 检查是否需要特定类型的教室
     */
    public boolean hasClassroomTypeRequirement() {
        return preferredClassroomType != null;
    }

    /**
     * 检查教室是否满足要求
     */
    public boolean isClassroomSuitable(Classroom classroom) {
        if (preferredClassroomType == null) {
            // 无特殊要求，只需容量足够
            return classroom.getCapacity() >= this.studentCount;
        }
        // 需要特定类型且容量足够
        return classroom.getType() == preferredClassroomType
                && classroom.getCapacity() >= this.studentCount;
    }
}
