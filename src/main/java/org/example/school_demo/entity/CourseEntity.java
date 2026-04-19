package org.example.school_demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 课程实体
 * 对应数据库表：course
 */
@Entity
@Table(name = "course")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEntity {

    /**
     * 课程 ID
     */
    @Id
    @Column(name = "id", length = 32)
    private String id;

    /**
     * 课程名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /**
     * 所需课时数
     */
    @Column(name = "required_periods", nullable = false)
    private Integer requiredPeriods;

    /**
     * 选课学生人数
     */
    @Column(name = "student_count", nullable = false)
    private Integer studentCount;

    /**
     * 任课教师 ID
     */
    @Column(name = "teacher_id", nullable = false, length = 32)
    private String teacherId;

    /**
     * 优先教室类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_classroom_type", length = 32)
    private ClassroomEntity.ClassroomType preferredClassroomType;

    /**
     * 所属班级/专业 ID
     */
    @Column(name = "class_id", length = 32)
    private String classId;

    /**
     * 学期
     */
    @Column(name = "semester", length = 50)
    private String semester;

    /**
     * 状态：ACTIVE=有效，INACTIVE=无效
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CourseStatus status = CourseStatus.ACTIVE;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_time", nullable = false, updatable = false)
    private LocalDateTime createdTime;

    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_time", nullable = false)
    private LocalDateTime updatedTime;

    /**
     * 课程状态枚举
     */
    public enum CourseStatus {
        ACTIVE("有效"),
        INACTIVE("无效");

        private final String description;

        CourseStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 检查是否需要特定类型的教室
     */
    public boolean hasClassroomTypeRequirement() {
        return preferredClassroomType != null;
    }

    /**
     * 检查教室类型是否匹配
     */
    public boolean isClassroomTypeSuitable(ClassroomEntity.ClassroomType type) {
        if (preferredClassroomType == null) {
            return true;
        }
        return preferredClassroomType == type;
    }

    /**
     * 检查教室容量是否足够
     */
    public boolean isClassroomCapacitySufficient(ClassroomEntity classroom) {
        return classroom.getCapacity() >= this.studentCount;
    }
}
