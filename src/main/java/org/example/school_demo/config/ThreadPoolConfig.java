package org.example.school_demo.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 通用线程池配置
 * 提供三种线程池: 异步任务、排课计算、定时任务
 */
@Slf4j
@Configuration
@EnableAsync
public class ThreadPoolConfig {

    @Value("${threadpool.async.core-pool-size:4}")
    private int corePoolSize;

    @Value("${threadpool.async.max-pool-size:8}")
    private int maxPoolSize;

    @Value("${threadpool.async.queue-capacity:100}")
    private int queueCapacity;

    @Value("${threadpool.async.keep-alive-seconds:60}")
    private int keepAliveSeconds;

    @Value("${threadpool.async.thread-name-prefix:async-scheduler-}")
    private String threadNamePrefix;

    @Value("${threadpool.async.await-termination-seconds:30}")
    private int awaitTerminationSeconds;

    @Value("${threadpool.async.wait-for-tasks-to-complete-on-shutdown:true}")
    private boolean waitForTasksToCompleteOnShutdown;

    @Value("${threadpool.async.rejected-execution-handler:caller-runs}")
    private String rejectedExecutionHandler;

    // ==================== 1. 通用异步任务线程池 ====================

    @Bean("asyncTaskExecutor")
    public Executor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = createExecutor(
                "通用异步线程池",
                threadNamePrefix,
                corePoolSize,
                maxPoolSize,
                queueCapacity
        );
        executor.setRejectedExecutionHandler(parseRejectionPolicy(rejectedExecutionHandler));
        executor.setWaitForTasksToCompleteOnShutdown(waitForTasksToCompleteOnShutdown);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);
        executor.initialize();
        logPool("通用异步线程池", executor);
        return executor;
    }

    // ==================== 2. 排课计算专用线程池 ====================

    @Bean("schedulingTaskExecutor")
    public Executor schedulingTaskExecutor() {
        ThreadPoolTaskExecutor executor = createExecutor(
                "排课计算线程池",
                "scheduling-",
                Math.max(2, corePoolSize / 2),
                Math.max(4, maxPoolSize),
                Math.max(50, queueCapacity / 2)
        );
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        logPool("排课计算线程池", executor);
        return executor;
    }

    // ==================== 3. 批量处理线程池 ====================

    @Bean("batchTaskExecutor")
    public Executor batchTaskExecutor() {
        ThreadPoolTaskExecutor executor = createExecutor(
                "批量处理线程池",
                "batch-",
                Math.max(2, corePoolSize / 2),
                maxPoolSize,
                queueCapacity * 2
        );
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);
        executor.initialize();
        logPool("批量处理线程池", executor);
        return executor;
    }

    // ==================== 工具方法 ====================

    private ThreadPoolTaskExecutor createExecutor(String logName, String prefix,
                                                   int core, int max, int capacity) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix(prefix);
        executor.setCorePoolSize(core);
        executor.setMaxPoolSize(max);
        executor.setQueueCapacity(capacity);
        executor.setKeepAliveSeconds(keepAliveSeconds);
        return executor;
    }

    private void logPool(String name, ThreadPoolTaskExecutor executor) {
        log.info("线程池初始化: {} | 核心={}, 最大={}, 队列容量={}, 拒绝策略={}",
                name,
                executor.getCorePoolSize(),
                executor.getMaxPoolSize(),
                executor.getQueueCapacity(),
                rejectedExecutionHandler);
    }

    private java.util.concurrent.RejectedExecutionHandler parseRejectionPolicy(String policy) {
        return switch (policy.toLowerCase()) {
            case "abort" -> new ThreadPoolExecutor.AbortPolicy();
            case "discard" -> new ThreadPoolExecutor.DiscardPolicy();
            case "discard-oldest" -> new ThreadPoolExecutor.DiscardOldestPolicy();
            case "caller-runs" -> new ThreadPoolExecutor.CallerRunsPolicy();
            default -> {
                log.warn("未知拒绝策略: {}, 使用 CallerRunsPolicy", policy);
                yield new ThreadPoolExecutor.CallerRunsPolicy();
            }
        };
    }
}
