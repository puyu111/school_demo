package org.example.school_demo.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 线程池配置
 * 为异步任务提供自定义执行器
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "threadpool.async")
public class ThreadPoolConfig {

    /**
     * 核心线程数
     */
    private int corePoolSize = 4;

    /**
     * 最大线程数
     */
    private int maxPoolSize = 8;

    /**
     * 队列容量
     */
    private int queueCapacity = 100;

    /**
     * 空闲线程存活时间（秒）
     */
    private int keepAliveSeconds = 60;

    /**
     * 线程名称前缀
     */
    private String threadNamePrefix = "async-scheduler-";

    /**
     * 关闭时等待任务完成的最大时间（秒）
     */
    private int awaitTerminationSeconds = 30;

    /**
     * 是否等待任务完成
     */
    private boolean waitForTasksToCompleteOnShutdown = true;

    /**
     * 拒绝执行策略：caller-runs, abort, discard
     */
    private String rejectedExecutionHandler = "caller-runs";

    /**
     * 创建异步任务执行器
     * 使用 @Async("schedulingTaskExecutor") 绑定到此执行器
     */
    @Bean(name = "schedulingTaskExecutor")
    public Executor schedulingTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 核心配置
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setKeepAliveSeconds(keepAliveSeconds);
        executor.setThreadNamePrefix(threadNamePrefix);

        // 拒绝执行策略
        executor.setRejectedExecutionHandler(getRejectedExecutionHandler());

        // 优雅停机配置
        executor.setWaitForTasksToCompleteOnShutdown(waitForTasksToCompleteOnShutdown);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);

        // 初始化
        executor.initialize();

        log.info("线程池初始化完成 - 核心线程数：{}, 最大线程数：{}, 队列容量：{}",
                corePoolSize, maxPoolSize, queueCapacity);

        return executor;
    }

    /**
     * 获取拒绝执行策略
     */
    private RejectedExecutionHandler getRejectedExecutionHandler() {
        return switch (rejectedExecutionHandler.toLowerCase()) {
            case "abort" -> new ThreadPoolExecutor.AbortPolicy();
            case "discard" -> new ThreadPoolExecutor.DiscardPolicy();
            case "discard-oldest" -> new ThreadPoolExecutor.DiscardOldestPolicy();
            case "caller-runs" -> new ThreadPoolExecutor.CallerRunsPolicy();
            default -> {
                log.warn("未知的拒绝策略：{}，使用默认的 CallerRunsPolicy", rejectedExecutionHandler);
                yield new ThreadPoolExecutor.CallerRunsPolicy();
            }
        };
    }
}
