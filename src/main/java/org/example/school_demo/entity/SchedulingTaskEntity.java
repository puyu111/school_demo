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
 * 排课任务实体
 * 对应数据库表：scheduling_task
 */
@Entity
@Table(name = "scheduling_task")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchedulingTaskEntity {

    /**
     * 任务 ID
     */
    @Id
    @Column(name = "id", length = 64)
    private String id;

    /**
     * 状态：RUNNING=执行中，COMPLETED=完成，FAILED=失败，CANCELLED=已取消
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TaskStatus status = TaskStatus.RUNNING;

    /**
     * 最终方案 ID
     */
    @Column(name = "solution_id", length = 64)
    private String solutionId;

    /**
     * 迭代次数
     */
    @Column(name = "iterations")
    private Integer iterations;

    /**
     * 最终温度
     */
    @Column(name = "final_temperature")
    private Double finalTemperature;

    /**
     * 最终代价
     */
    @Column(name = "final_cost")
    private Double finalCost;

    /**
     * 是否找到可行解
     */
    @Column(name = "found_feasible")
    private Boolean foundFeasible;

    /**
     * 执行耗时（毫秒）
     */
    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    /**
     * 错误信息
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

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
     * 任务状态枚举
     */
    public enum TaskStatus {
        RUNNING("执行中"),
        COMPLETED("完成"),
        FAILED("失败"),
        CANCELLED("已取消");

        private final String description;

        TaskStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
