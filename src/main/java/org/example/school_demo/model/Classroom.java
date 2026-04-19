package org.example.school_demo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * 教室实体
 * 表示一间教室及其属性
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {

    /**
     * 教室唯一标识
     */
    private String id;

    /**
     * 教室名称/编号，如 "A-101", "实验楼 302"
     */
    private String name;

    /**
     * 教室容量（座位数）
     */
    private Integer capacity;

    /**
     * 可用时间段集合
     */
    @Builder.Default
    private Set<String> availableSlots = new HashSet<>();

    /**
     * 教室类型
     */
    @Builder.Default
    private ClassroomType type = ClassroomType.NORMAL;

    /**
     * 检查教室在该时间段是否可用
     */
    public boolean isAvailableAt(String slotId) {
        return availableSlots.contains(slotId);
    }

    /**
     * 添加可用时间段
     */
    public void addAvailableSlot(String slotId) {
        availableSlots.add(slotId);
    }

    /**
     * 检查教室是否适合某门课程
     * @param course 课程
     * @return 是否适合
     */
    public boolean isSuitableFor(Course course) {
        if (course.getPreferredClassroomType() == null) {
            // 无特殊要求，只需容量足够
            return this.capacity >= course.getStudentCount();
        }
        // 需要特定类型且容量足够
        return this.type == course.getPreferredClassroomType()
                && this.capacity >= course.getStudentCount();
    }

    /**
     * 教室类型枚举
     */
    public enum ClassroomType {
        NORMAL("普通教室"),
        LAB("实验室"),
        COMPUTER("计算机房"),
        MULTIMEDIA("多媒体教室"),
        LECTURE_HALL("报告厅");

        private final String description;

        ClassroomType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
