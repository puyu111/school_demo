package org.example.school_demo;

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
@SpringBootApplication
@EnableAsync  // 启用异步方法支持
@EnableScheduling // 启用定时任务支持（用于清理完成的任务）
public class SchoolDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SchoolDemoApplication.class, args);
        System.out.println("========================================");
        System.out.println("  智能排课系统已启动");
        System.out.println("  API 文档：http://localhost:8080/api/schedule/generate/sample (POST)");
        System.out.println("========================================");
    }

}
