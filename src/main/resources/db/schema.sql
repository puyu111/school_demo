-- ============================================
-- 智能排课系统 - 数据库初始化脚本
-- MySQL 8.0+
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS school_scheduler
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE school_scheduler;

-- ============================================
-- 1. 时间段表 (time_slot)
-- 存储一周中的所有可能时间段
-- ============================================
DROP TABLE IF EXISTS `time_slot`;
CREATE TABLE `time_slot` (
    `id` VARCHAR(20) NOT NULL COMMENT '时间段 ID，如 "Mon-1" 表示周一第 1 节',
    `day_of_week` TINYINT NOT NULL COMMENT '星期几 (1-7, 1=周一)',
    `period` TINYINT NOT NULL COMMENT '节次 (1-12)',
    `display_name` VARCHAR(50) NOT NULL COMMENT '显示名称，如 "周一第 1 节"',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_day_period` (`day_of_week`, `period`) COMMENT '按星期和节次查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='时间段表';

-- ============================================
-- 2. 教师表 (teacher)
-- ============================================
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher` (
    `id` VARCHAR(32) NOT NULL COMMENT '教师 ID',
    `name` VARCHAR(100) NOT NULL COMMENT '教师姓名',
    `max_continuous_periods` TINYINT NOT NULL DEFAULT 4 COMMENT '最大连续授课节数',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_name` (`name`(50)) COMMENT '按姓名查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师表';

-- ============================================
-- 教师 - 可用时间段关联表 (teacher_available_slot)
-- ============================================
DROP TABLE IF EXISTS `teacher_available_slot`;
CREATE TABLE `teacher_available_slot` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
    `teacher_id` VARCHAR(32) NOT NULL COMMENT '教师 ID',
    `time_slot_id` VARCHAR(20) NOT NULL COMMENT '时间段 ID',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_teacher_slot` (`teacher_id`, `time_slot_id`) COMMENT '唯一约束：教师 + 时间段',
    INDEX `idx_time_slot` (`time_slot_id`) COMMENT '按时间段查询索引',
    CONSTRAINT `fk_teacher_available_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_teacher_available_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师可用时间段关联表';

-- ============================================
-- 教师 - 偏好时间段关联表 (teacher_preferred_slot)
-- ============================================
DROP TABLE IF EXISTS `teacher_preferred_slot`;
CREATE TABLE `teacher_preferred_slot` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
    `teacher_id` VARCHAR(32) NOT NULL COMMENT '教师 ID',
    `time_slot_id` VARCHAR(20) NOT NULL COMMENT '时间段 ID',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_teacher_slot` (`teacher_id`, `time_slot_id`) COMMENT '唯一约束：教师 + 时间段',
    INDEX `idx_time_slot` (`time_slot_id`) COMMENT '按时间段查询索引',
    CONSTRAINT `fk_teacher_preferred_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_teacher_preferred_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师偏好时间段关联表';

-- ============================================
-- 3. 教室表 (classroom)
-- ============================================
DROP TABLE IF EXISTS `classroom`;
CREATE TABLE `classroom` (
    `id` VARCHAR(32) NOT NULL COMMENT '教室 ID',
    `name` VARCHAR(100) NOT NULL COMMENT '教室名称/编号',
    `capacity` INT NOT NULL COMMENT '教室容量（座位数）',
    `type` VARCHAR(32) NOT NULL DEFAULT 'NORMAL' COMMENT '教室类型：NORMAL=普通教室，LAB=实验室，COMPUTER=计算机房，MULTIMEDIA=多媒体教室，LECTURE_HALL=报告厅',
    `building` VARCHAR(100) DEFAULT NULL COMMENT '所在楼宇',
    `floor` TINYINT DEFAULT NULL COMMENT '楼层',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_type` (`type`) COMMENT '按类型查询索引',
    INDEX `idx_capacity` (`capacity`) COMMENT '按容量查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教室表';

-- ============================================
-- 教室 - 可用时间段关联表 (classroom_available_slot)
-- ============================================
DROP TABLE IF EXISTS `classroom_available_slot`;
CREATE TABLE `classroom_available_slot` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
    `classroom_id` VARCHAR(32) NOT NULL COMMENT '教室 ID',
    `time_slot_id` VARCHAR(20) NOT NULL COMMENT '时间段 ID',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_classroom_slot` (`classroom_id`, `time_slot_id`) COMMENT '唯一约束：教室 + 时间段',
    INDEX `idx_time_slot` (`time_slot_id`) COMMENT '按时间段查询索引',
    CONSTRAINT `fk_classroom_available_classroom` FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_classroom_available_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教室可用时间段关联表';

-- ============================================
-- 4. 课程表 (course)
-- ============================================
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
    `id` VARCHAR(32) NOT NULL COMMENT '课程 ID',
    `name` VARCHAR(200) NOT NULL COMMENT '课程名称',
    `required_periods` TINYINT NOT NULL COMMENT '所需课时数',
    `student_count` INT NOT NULL COMMENT '选课学生人数',
    `teacher_id` VARCHAR(32) NOT NULL COMMENT '任课教师 ID',
    `preferred_classroom_type` VARCHAR(32) DEFAULT NULL COMMENT '优先教室类型',
    `class_id` VARCHAR(32) DEFAULT NULL COMMENT '所属班级/专业 ID',
    `semester` VARCHAR(50) DEFAULT NULL COMMENT '学期，如 "2026-Spring"',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE=有效，INACTIVE=无效',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_teacher` (`teacher_id`) COMMENT '按教师查询索引',
    INDEX `idx_class` (`class_id`) COMMENT '按班级查询索引',
    INDEX `idx_status` (`status`) COMMENT '按状态查询索引',
    CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- ============================================
-- 5. 排课结果表 (timetable_record)
-- 存储最终排课方案
-- ============================================
DROP TABLE IF EXISTS `timetable_record`;
CREATE TABLE `timetable_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
    `task_id` VARCHAR(64) NOT NULL COMMENT '排课任务 ID',
    `course_id` VARCHAR(32) NOT NULL COMMENT '课程 ID',
    `teacher_id` VARCHAR(32) NOT NULL COMMENT '教师 ID',
    `classroom_id` VARCHAR(32) NOT NULL COMMENT '教室 ID',
    `time_slot_id` VARCHAR(20) NOT NULL COMMENT '时间段 ID',
    `solution_id` VARCHAR(64) NOT NULL COMMENT '所属排课方案 ID',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING=待确认，CONFIRMED=已确认，PUBLISHED=已发布',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_task_id` (`task_id`) COMMENT '按任务 ID 查询索引',
    INDEX `idx_solution_id` (`solution_id`) COMMENT '按方案 ID 查询索引',
    INDEX `idx_course_id` (`course_id`) COMMENT '按课程 ID 查询索引',
    INDEX `idx_time_slot` (`time_slot_id`) COMMENT '按时间段查询索引',
    INDEX `idx_classroom_time` (`classroom_id`, `time_slot_id`) COMMENT '教室 + 时间段联合索引',
    INDEX `idx_teacher_time` (`teacher_id`, `time_slot_id`) COMMENT '教师 + 时间段联合索引',
    CONSTRAINT `fk_timetable_course` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_timetable_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_timetable_classroom` FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_timetable_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排课结果表';

-- ============================================
-- 6. 排课任务表 (scheduling_task)
-- 记录每次排课任务的执行情况
-- ============================================
DROP TABLE IF EXISTS `scheduling_task`;
CREATE TABLE `scheduling_task` (
    `id` VARCHAR(64) NOT NULL COMMENT '任务 ID',
    `status` VARCHAR(20) NOT NULL DEFAULT 'RUNNING' COMMENT '状态：RUNNING=执行中，COMPLETED=完成，FAILED=失败，CANCELLED=已取消',
    `solution_id` VARCHAR(64) DEFAULT NULL COMMENT '最终方案 ID',
    `iterations` INT DEFAULT NULL COMMENT '迭代次数',
    `final_temperature` DOUBLE DEFAULT NULL COMMENT '最终温度',
    `final_cost` DOUBLE DEFAULT NULL COMMENT '最终代价',
    `found_feasible` TINYINT(1) DEFAULT NULL COMMENT '是否找到可行解',
    `execution_time_ms` BIGINT DEFAULT NULL COMMENT '执行耗时（毫秒）',
    `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_status` (`status`) COMMENT '按状态查询索引',
    INDEX `idx_created_time` (`created_time`) COMMENT '按创建时间查询索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排课任务表';

-- ============================================
-- 初始化数据 - 时间段（周一至周五，每天 8 节）
-- ============================================
INSERT INTO `time_slot` (`id`, `day_of_week`, `period`, `display_name`) VALUES
('Mon-1', 1, 1, '周一第 1 节'), ('Mon-2', 1, 2, '周一第 2 节'), ('Mon-3', 1, 3, '周一第 3 节'), ('Mon-4', 1, 4, '周一第 4 节'),
('Mon-5', 1, 5, '周一第 5 节'), ('Mon-6', 1, 6, '周一第 6 节'), ('Mon-7', 1, 7, '周一第 7 节'), ('Mon-8', 1, 8, '周一第 8 节'),
('Tue-1', 2, 1, '周二第 1 节'), ('Tue-2', 2, 2, '周二第 2 节'), ('Tue-3', 2, 3, '周二第 3 节'), ('Tue-4', 2, 4, '周二第 4 节'),
('Tue-5', 2, 5, '周二第 5 节'), ('Tue-6', 2, 6, '周二第 6 节'), ('Tue-7', 2, 7, '周二第 7 节'), ('Tue-8', 2, 8, '周二第 8 节'),
('Wed-1', 3, 1, '周三第 1 节'), ('Wed-2', 3, 2, '周三第 2 节'), ('Wed-3', 3, 3, '周三第 3 节'), ('Wed-4', 3, 4, '周三第 4 节'),
('Wed-5', 3, 5, '周三第 5 节'), ('Wed-6', 3, 6, '周三第 6 节'), ('Wed-7', 3, 7, '周三第 7 节'), ('Wed-8', 3, 8, '周三第 8 节'),
('Thu-1', 4, 1, '周四第 1 节'), ('Thu-2', 4, 2, '周四第 2 节'), ('Thu-3', 4, 3, '周四第 3 节'), ('Thu-4', 4, 4, '周四第 4 节'),
('Thu-5', 4, 5, '周四第 5 节'), ('Thu-6', 4, 6, '周四第 6 节'), ('Thu-7', 4, 7, '周四第 7 节'), ('Thu-8', 4, 8, '周四第 8 节'),
('Fri-1', 5, 1, '周五第 1 节'), ('Fri-2', 5, 2, '周五第 2 节'), ('Fri-3', 5, 3, '周五第 3 节'), ('Fri-4', 5, 4, '周五第 4 节'),
('Fri-5', 5, 5, '周五第 5 节'), ('Fri-6', 5, 6, '周五第 6 节'), ('Fri-7', 5, 7, '周五第 7 节'), ('Fri-8', 5, 8, '周五第 8 节');

-- ============================================
-- 结束
-- ============================================
