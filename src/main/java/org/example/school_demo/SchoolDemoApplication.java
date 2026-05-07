package org.example.school_demo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 智能排课系统主应用类
 *
 * 基于模拟退火算法 (Simulated Annealing) 的课程自动排课系统
 *
 * @author Claude
 * @since 2026-04-13
 */
@Slf4j
@SpringBootApplication
@EnableAsync  // 启用异步方法支持
@EnableScheduling // 启用定时任务支持（用于清理完成的任务）
public class SchoolDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SchoolDemoApplication.class, args);
        log.info("========================================");
        log.info("  智能排课系统已启动");
        log.info("  API 端口：http://localhost:8080");
        log.info("========================================");
    }

}
