package org.example.school_demo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.school_demo.dto.SchedulingRequest;
import org.example.school_demo.dto.SchedulingResult;
import org.example.school_demo.model.*;
import org.example.school_demo.service.SchedulingDataService;
import org.example.school_demo.service.SchedulingService;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 排课系统 REST API 控制器
 *
 * API 列表：
 * - POST /api/schedule/generate → 触发排课，返回任务 ID
 * - GET  /api/schedule/result/{taskId} → 获取排课结果与算法指标
 * - POST /api/schedule/generate/sample → 使用示例数据生成排课方案
 * - GET  /api/schedule/status/{taskId} → 检查任务状态
 * - POST /api/schedule/generate/db → 从数据库加载数据并生成排课方案
 * - GET  /api/schedule/records/{taskId} → 获取保存到数据库的排课记录
 */
@Slf4j
@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class SchedulingController {

    private final SchedulingService schedulingService;
    private final SchedulingDataService schedulingDataService;

    /**
     * 触发排课任务（内存数据）
     */
    @PostMapping("/generate")
    public ResponseEntity<TaskIdResponse> generateSchedule(@RequestBody SchedulingInput request) {
        log.info("收到排课请求 - 课程数：{}, 教师数：{}, 教室数：{}, 时间段数：{}",
                 request.getCourses().size(),
                 request.getTeachers().size(),
                 request.getClassrooms().size(),
                 request.getAllTimeSlots().size());

        CompletableFuture<String> future = schedulingService.generateSchedule(
                request.getCourses(),
                request.getTeachers(),
                request.getClassrooms(),
                request.getAllTimeSlots(),
                request.getSchedulingParams() != null ?
                        request.getSchedulingParams() : SchedulingRequest.builder().useDefaultParams(true).build()
        );

        String taskId = future.join();
        return ResponseEntity.ok(new TaskIdResponse(taskId, "排课任务已创建，正在执行中"));
    }

    /**
     * 从数据库加载数据并触发排课任务
     * 使用自定义线程池执行 (@Async("schedulingTaskExecutor"))
     */
    @PostMapping("/generate/db")
    public ResponseEntity<TaskIdResponse> generateScheduleFromDb(
            @RequestBody(required = false) SchedulingRequest params
    ) {
        log.info("收到数据库排课请求");

        // 从数据库加载数据
        SchedulingDataService.SchedulingData data = schedulingDataService.loadSchedulingData();

        // 保存任务状态
        String taskId = java.util.UUID.randomUUID().toString();
        schedulingDataService.saveSchedulingTask(taskId);

        // 异步执行（绑定自定义线程池）
        CompletableFuture<String> future = schedulingService.generateScheduleWithDbPersistence(
                data.getCourses(),
                data.getTeachers(),
                data.getClassrooms(),
                data.getAllTimeSlots(),
                taskId,
                params != null ? params : SchedulingRequest.builder().useDefaultParams(true).build()
        );

        return ResponseEntity.ok(new TaskIdResponse(taskId, "排课任务已创建，正在执行中"));
    }

    /**
     * 使用示例数据生成排课方案
     * 快速测试接口，无需准备数据
     */
    @PostMapping("/generate/sample")
    public ResponseEntity<TaskIdResponse> generateWithSampleData(
            @RequestBody(required = false) SchedulingRequest params
    ) {
        log.info("收到示例数据排课请求");

        // 生成示例数据
        SchedulingService.SchedulingData data = schedulingService.generateSampleData();

        // 异步执行
        CompletableFuture<String> future = schedulingService.generateSchedule(
                data.getCourses(),
                data.getTeachers(),
                data.getClassrooms(),
                data.getAllTimeSlots(),
                params != null ? params : SchedulingRequest.builder().useDefaultParams(true).build()
        );

        String taskId = future.join();
        return ResponseEntity.ok(new TaskIdResponse(taskId, "排课任务已创建，正在执行中"));
    }

    /**
     * 获取排课结果
     *
     * @param taskId 任务 ID
     * @return 排课结果，包含算法指标和排课方案
     */
    @GetMapping("/result/{taskId}")
    public ResponseEntity<SchedulingResult> getResult(@PathVariable String taskId) {
        SchedulingResult result = schedulingService.getResult(taskId);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(result);
    }

    /**
     * 检查任务状态
     *
     * @param taskId 任务 ID
     * @return 任务状态：RUNNING, COMPLETED, FAILED, CANCELLED
     */
    @GetMapping("/status/{taskId}")
    public ResponseEntity<TaskStatusResponse> getStatus(@PathVariable String taskId) {
        SchedulingResult result = schedulingService.getResult(taskId);

        if (result == null) {
            return ResponseEntity.notFound().build();
        }

        TaskStatusResponse response = TaskStatusResponse.builder()
                .taskId(taskId)
                .status(result.getStatus())
                .progress(result.getProgress())
                .foundFeasibleSolution(result.getFoundFeasibleSolution())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * 取消排课任务
     */
    @PostMapping("/cancel/{taskId}")
    public ResponseEntity<MessageResponse> cancelTask(@PathVariable String taskId) {
        schedulingService.cancelTask(taskId);
        return ResponseEntity.ok(new MessageResponse("任务已取消"));
    }

    /**
     * 清除已完成的任务结果
     */
    @PostMapping("/clear-completed")
    public ResponseEntity<MessageResponse> clearCompleted() {
        schedulingService.clearCompletedTasks();
        return ResponseEntity.ok(new MessageResponse("已完成任务已清除"));
    }

    // ==================== 内部类 ====================

    /**
     * 排课输入数据
     */
    @lombok.Data
    public static class SchedulingInput {
        /**
         * 课程列表
         */
        private List<Course> courses;

        /**
         * 教师列表
         */
        private List<Teacher> teachers;

        /**
         * 教室列表
         */
        private List<Classroom> classrooms;

        /**
         * 所有时间段 ID 列表
         */
        private List<String> allTimeSlots;

        /**
         * 排课算法参数（可选）
         */
        private SchedulingRequest schedulingParams;
    }

    /**
     * 任务 ID 响应
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class TaskIdResponse {
        private String taskId;
        private String message;
    }

    /**
     * 任务状态响应
     */
    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    public static class TaskStatusResponse {
        private String taskId;
        private String status;
        private Integer progress;
        private Boolean foundFeasibleSolution;
    }

    /**
     * 消息响应
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
