package org.example.school_demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 异步配置
 * 启用异步方法执行，配置线程池
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * 排课任务专用线程池
     * 排课算法可能耗时较长，使用独立线程池避免阻塞其他异步任务
     */
    @Bean(name = "schedulingExecutor")
    public Executor schedulingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(10);
        executor.setThreadNamePrefix("scheduling-");
        executor.setRejectedExecutionHandler((r, e) -> {
            // 队列满时的拒绝策略
            System.out.println("排课任务队列已满，任务被拒绝");
        });
        executor.initialize();
        return executor;
    }
}
