package org.example.school_demo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

/**
 * 排课方案实体
 * 表示一个完整的排课结果，包含所有课程的分配情况
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableSolution {

    /**
     * 方案唯一标识（用于异步任务追踪）
     */
    private String solutionId;

    /**
     * 课程排课分配列表
     * key: 课程 ID, value: 该课程的排课详情
     */
    @Builder.Default
    private Map<String, CourseAssignment> assignments = new HashMap<>();

    /**
     * 适应度得分（越低越好）
     * 包含硬约束惩罚和软约束惩罚
     */
    private Double fitnessScore;

    /**
     * 硬约束违反次数
     */
    private Integer hardConstraintViolations;

    /**
     * 软约束违反代价
     */
    private Double softConstraintCost;

    /**
     * 方案是否可行（无硬约束违反）
     */
    private Boolean feasible;

    /**
     * 创建该方案时的数据快照（用于算法执行）
     */
    @Builder.Default
    private List<Course> courses = new ArrayList<>();

    @Builder.Default
    private List<Teacher> teachers = new ArrayList<>();

    @Builder.Default
    private List<Classroom> classrooms = new ArrayList<>();

    @Builder.Default
    private List<String> allTimeSlots = new ArrayList<>();

    /**
     * 添加一个课程分配
     */
    public void addAssignment(CourseAssignment assignment) {
        assignments.put(assignment.getCourseId(), assignment);
    }

    /**
     * 获取某课程的分配
     */
    public CourseAssignment getAssignment(String courseId) {
        return assignments.get(courseId);
    }

    /**
     * 移除某课程的分配
     */
    public void removeAssignment(String courseId) {
        assignments.remove(courseId);
    }

    /**
     * 检查方案是否有效（所有课程都已分配）
     */
    public boolean isComplete() {
        return assignments.size() == courses.size();
    }

    /**
     * 获取所有已分配的时间段
     */
    public Set<String> getUsedTimeSlots() {
        Set<String> used = new HashSet<>();
        for (CourseAssignment assignment : assignments.values()) {
            used.add(assignment.getTimeSlotId());
        }
        return used;
    }

    /**
     * 深度复制当前方案
     */
    public TimetableSolution copy() {
        TimetableSolution copy = new TimetableSolution();
        copy.solutionId = this.solutionId;
        copy.assignments = new HashMap<>(this.assignments);
        copy.fitnessScore = this.fitnessScore;
        copy.hardConstraintViolations = this.hardConstraintViolations;
        copy.softConstraintCost = this.softConstraintCost;
        copy.feasible = this.feasible;
        copy.courses = new ArrayList<>(this.courses);
        copy.teachers = new ArrayList<>(this.teachers);
        copy.classrooms = new ArrayList<>(this.classrooms);
        copy.allTimeSlots = new ArrayList<>(this.allTimeSlots);
        return copy;
    }
}
