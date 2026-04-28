-- ===========================================================
-- 排课系统数据库建表语句 (MySQL 8.0+)
-- 根据排课业务模块实体关系图设计
-- ============================================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. 教师表 (TEACHER)
-- ============================================================
CREATE TABLE IF NOT EXISTS `teacher` (
    `teacher_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '教师 ID',
    `name` VARCHAR(100) NOT NULL COMMENT '教师姓名',
    `job_number` VARCHAR(50) NOT NULL COMMENT '工号',
    `department` VARCHAR(100) COMMENT '所属院系',
    `max_daily_courses` INT NOT NULL DEFAULT 6 COMMENT '每日最大授课节数',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`teacher_id`),
    UNIQUE KEY `uk_job_number` (`job_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师信息表';

-- ============================================================
-- 2. 课程表 (COURSE)
-- ============================================================
CREATE TABLE IF NOT EXISTS `course` (
    `course_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '课程 ID',
    `course_name` VARCHAR(200) NOT NULL COMMENT '课程名称',
    `name` VARCHAR(100) DEFAULT NULL COMMENT '旧字段（保留兼容）',
    `credits` DECIMAL(3,1) NOT NULL COMMENT '学分',
    `duration` INT NOT NULL COMMENT '持续周数',
    `priority` INT NOT NULL DEFAULT 1 COMMENT '排课优先级（数字越小优先级越高）',
    `course_type` VARCHAR(50) NOT NULL DEFAULT 'THEORY' COMMENT '课程类型：THEORY=理论课，PRACTICE=实践课，LAB=实验课',
    `id` VARCHAR(50) DEFAULT NULL COMMENT '业务ID，如 C001',
    `total_hours` INT NOT NULL COMMENT '总学时',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`course_id`),
    UNIQUE KEY `uk_course_business_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程信息表';

-- ============================================================
-- 3. 班级表 (CLASS)
-- ============================================================
CREATE TABLE IF NOT EXISTS `class` (
    `class_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '班级 ID',
    `class_name` VARCHAR(100) NOT NULL COMMENT '班级名称',
    `major_id` VARCHAR(50) NOT NULL COMMENT '专业 ID',
    `student_count` INT NOT NULL COMMENT '学生人数',
    `grade` VARCHAR(10) NOT NULL COMMENT '年级（如：2023）',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`class_id`),
    KEY `idx_major_id` (`major_id`),
    KEY `idx_grade` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级信息表';

-- ============================================================
-- 4. 学期表 (SEMESTER)
-- ============================================================
CREATE TABLE IF NOT EXISTS `semester` (
    `semester_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '学期 ID',
    `semester_name` VARCHAR(100) NOT NULL COMMENT '学期名称',
    `start_date` DATE NOT NULL COMMENT '开始日期',
    `end_date` DATE NOT NULL COMMENT '结束日期',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`semester_id`),
    UNIQUE KEY `uk_semester_name` (`semester_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学期信息表';

-- ============================================================
-- 5. 教室表 (ROOM)
-- ============================================================
CREATE TABLE IF NOT EXISTS `room` (
    `room_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '教室 ID',
    `room_name` VARCHAR(100) NOT NULL COMMENT '教室名称',
    `capacity` INT NOT NULL COMMENT '教室容量（座位数）',
    `type` VARCHAR(50) NOT NULL DEFAULT 'NORMAL' COMMENT '教室类型：NORMAL=普通教室，LAB=实验室，COMPUTER=计算机房，MULTIMEDIA=多媒体教室，LECTURE_HALL=报告厅',
    `building` VARCHAR(100) COMMENT '所在楼宇',
    `floor` TINYINT COMMENT '所在楼层',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`room_id`),
    KEY `idx_building` (`building`),
    KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教室信息表';

-- ============================================================
-- 6. 排课记录表 (SCHEDULE) - 核心关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS `schedule` (
    `schedule_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '排课记录 ID',
    `course_id` BIGINT NOT NULL COMMENT '课程 ID',
    `teacher_id` BIGINT NOT NULL COMMENT '教师 ID',
    `class_id` BIGINT NOT NULL COMMENT '班级 ID',
    `room_id` BIGINT NOT NULL COMMENT '教室 ID',
    `semester_id` BIGINT NOT NULL COMMENT '学期 ID',
    `class_time` DATE NOT NULL COMMENT '上课日期',
    `week` INT NOT NULL COMMENT '第几周',
    `period` INT NOT NULL COMMENT '第几节课（1-12 节）',
    `status` VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT '状态：SCHEDULED=已排课，CANCELLED=已取消，COMPLETED=已完成',
    `created_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`schedule_id`),
    KEY `idx_course_id` (`course_id`),
    KEY `idx_teacher_id` (`teacher_id`),
    KEY `idx_class_id` (`class_id`),
    KEY `idx_room_id` (`room_id`),
    KEY `idx_semester_id` (`semester_id`),
    KEY `idx_class_time` (`class_time`),
    KEY `idx_week` (`week`),
    CONSTRAINT `fk_schedule_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_schedule_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_schedule_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_schedule_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_schedule_semester` FOREIGN KEY (`semester_id`) REFERENCES `semester` (`semester_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排课记录表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 模拟测试数据
-- ============================================================

-- ============================================================
-- 1. 插入教师数据 (TEACHER) - 8 条记录
-- ============================================================
INSERT INTO `teacher` (`name`, `job_number`, `department`, `max_daily_courses`) VALUES
('张三', 'T001', '计算机学院', 6),
('李四', 'T002', '计算机学院', 5),
('王五', 'T003', '软件学院', 6),
('赵六', 'T004', '信息学院', 4),
('陈七', 'T005', '计算机学院', 6),
('刘八', 'T006', '软件学院', 5),
('孙九', 'T007', '信息学院', 6),
('周十', 'T008', '计算机学院', 4);

-- ============================================================
-- 2. 插入课程数据 (COURSE) - 10 条记录
-- ============================================================
INSERT INTO `course` (`id`, `course_name`, `name`, `credits`, `duration`, `priority`, `course_type`, `total_hours`) VALUES
('C001', 'Java 程序设计', 'Java 程序设计', 4.0, 16, 1, 'THEORY', 64),
('C002', '数据结构', '数据结构', 3.5, 16, 1, 'THEORY', 56),
('C003', '数据库原理', '数据库原理', 3.0, 16, 2, 'THEORY', 48),
('C004', '计算机网络', '计算机网络', 3.0, 16, 2, 'THEORY', 48),
('C005', '操作系统', '操作系统', 3.5, 16, 1, 'THEORY', 56),
('C006', 'Web 开发技术', 'Web 开发技术', 2.5, 12, 3, 'PRACTICE', 40),
('C007', 'Python 编程', 'Python 编程', 3.0, 16, 2, 'THEORY', 48),
('C008', '算法分析与设计', '算法分析与设计', 3.0, 16, 1, 'THEORY', 48),
('C009', '软件工程', '软件工程', 2.5, 12, 3, 'THEORY', 40),
('C010', '人工智能基础', '人工智能基础', 2.0, 12, 3, 'THEORY', 32);

-- ============================================================
-- 3. 插入班级数据 (CLASS) - 8 条记录
-- ============================================================
INSERT INTO `class` (`class_name`, `major_id`, `student_count`, `grade`) VALUES
('计算机科学与技术 1 班', 'CS001', 45, '2023'),
('计算机科学与技术 2 班', 'CS001', 42, '2023'),
('软件工程 1 班', 'SE001', 40, '2023'),
('软件工程 2 班', 'SE001', 38, '2023'),
('网络工程 1 班', 'NE001', 35, '2023'),
('信息安全 1 班', 'IS001', 32, '2023'),
('物联网工程 1 班', 'IOT001', 36, '2023'),
('大数据技术 1 班', 'BD001', 40, '2023');

-- ============================================================
-- 4. 插入学期数据 (SEMESTER) - 5 条记录
-- ============================================================
INSERT INTO `semester` (`semester_name`, `start_date`, `end_date`) VALUES
('2025 年春季学期', '2025-03-01', '2025-07-15'),
('2025 年秋季学期', '2025-09-01', '2026-01-15'),
('2026 年春季学期', '2026-03-01', '2026-07-15'),
('2024 年秋季学期', '2024-09-01', '2025-01-15'),
('2024 年春季学期', '2024-03-01', '2024-07-15');

-- ============================================================
-- 5. 插入教室数据 (ROOM) - 10 条记录
-- ============================================================
INSERT INTO `room` (`room_name`, `capacity`, `type`, `building`, `floor`) VALUES
('A-101', 60, 'NORMAL', 'A 教学楼', 1),
('A-102', 50, 'NORMAL', 'A 教学楼', 1),
('A-201', 45, 'NORMAL', 'A 教学楼', 2),
('A-202', 40, 'NORMAL', 'A 教学楼', 2),
('B-301', 80, 'MULTIMEDIA', 'B 教学楼', 3),
('B-302', 100, 'LECTURE_HALL', 'B 教学楼', 3),
('实验楼 -401', 40, 'LAB', '实验楼', 4),
('实验楼 -402', 35, 'LAB', '实验楼', 4),
('计算机中心 -101', 50, 'COMPUTER', '计算机中心', 1),
('计算机中心 -102', 45, 'COMPUTER', '计算机中心', 1);

-- ============================================================
-- 6. 插入排课数据 (SCHEDULE) - 40 条记录
--    （先插入上面主表数据，最后插入此表以避免外键约束冲突）
-- ============================================================
INSERT INTO `schedule` (`course_id`, `teacher_id`, `class_id`, `room_id`, `semester_id`, `class_time`, `week`, `period`, `status`) VALUES
-- Java 程序设计 - 张三 - 计算机 1 班
(1, 1, 1, 5, 1, '2025-03-03', 1, 1, 'SCHEDULED'),
(1, 1, 1, 5, 1, '2025-03-03', 1, 2, 'SCHEDULED'),
-- 数据结构 - 李四 - 计算机 2 班
(2, 2, 2, 1, 1, '2025-03-03', 1, 3, 'SCHEDULED'),
(2, 2, 2, 1, 1, '2025-03-03', 1, 4, 'SCHEDULED'),
-- 数据库原理 - 王五 - 软件工程 1 班
(3, 3, 3, 2, 1, '2025-03-04', 1, 1, 'SCHEDULED'),
(3, 3, 3, 2, 1, '2025-03-04', 1, 2, 'SCHEDULED'),
-- 计算机网络 - 赵六 - 软件工程 2 班
(4, 4, 4, 6, 1, '2025-03-04', 1, 3, 'SCHEDULED'),
(4, 4, 4, 6, 1, '2025-03-04', 1, 4, 'SCHEDULED'),
-- 操作系统 - 陈七 - 网络工程 1 班
(5, 5, 5, 3, 1, '2025-03-05', 1, 1, 'SCHEDULED'),
(5, 5, 5, 3, 1, '2025-03-05', 1, 2, 'SCHEDULED'),
-- Web 开发技术 - 刘八 - 信息安全 1 班
(6, 6, 6, 9, 1, '2025-03-05', 1, 3, 'SCHEDULED'),
(6, 6, 6, 9, 1, '2025-03-05', 1, 4, 'SCHEDULED'),
-- Python 编程 - 孙九 - 物联网 1 班
(7, 7, 7, 4, 1, '2025-03-06', 1, 1, 'SCHEDULED'),
(7, 7, 7, 4, 1, '2025-03-06', 1, 2, 'SCHEDULED'),
-- 算法分析与设计 - 周十 - 大数据 1 班
(8, 8, 8, 10, 1, '2025-03-06', 1, 3, 'SCHEDULED'),
(8, 8, 8, 10, 1, '2025-03-06', 1, 4, 'SCHEDULED'),
-- Java 程序设计 - 张三 - 计算机 2 班（第二节）
(1, 1, 2, 5, 1, '2025-03-10', 2, 1, 'SCHEDULED'),
(1, 1, 2, 5, 1, '2025-03-10', 2, 2, 'SCHEDULED'),
-- 数据结构 - 李四 - 软件工程 1 班
(2, 2, 3, 1, 1, '2025-03-10', 2, 3, 'SCHEDULED'),
(2, 2, 3, 1, 1, '2025-03-10', 2, 4, 'SCHEDULED'),
-- 软件工程 - 张三 - 计算机 1 班
(9, 1, 1, 2, 1, '2025-03-11', 2, 1, 'SCHEDULED'),
(9, 1, 1, 2, 1, '2025-03-11', 2, 2, 'SCHEDULED'),
-- 人工智能基础 - 李四 - 计算机 2 班
(10, 2, 2, 5, 1, '2025-03-11', 2, 3, 'SCHEDULED'),
(10, 2, 2, 5, 1, '2025-03-11', 2, 4, 'SCHEDULED'),
-- 数据库原理 - 王五 - 软件工程 2 班
(3, 3, 4, 6, 1, '2025-03-12', 2, 1, 'SCHEDULED'),
(3, 3, 4, 6, 1, '2025-03-12', 2, 2, 'SCHEDULED'),
-- 计算机网络 - 赵六 - 网络工程 1 班
(4, 4, 5, 3, 1, '2025-03-12', 2, 3, 'SCHEDULED'),
(4, 4, 5, 3, 1, '2025-03-12', 2, 4, 'SCHEDULED'),
-- 操作系统 - 陈七 - 信息安全 1 班
(5, 5, 6, 4, 1, '2025-03-13', 2, 1, 'SCHEDULED'),
(5, 5, 6, 4, 1, '2025-03-13', 2, 2, 'SCHEDULED'),
-- Web 开发技术 - 刘八 - 物联网 1 班
(6, 6, 7, 10, 1, '2025-03-13', 2, 3, 'SCHEDULED'),
(6, 6, 7, 10, 1, '2025-03-13', 2, 4, 'SCHEDULED'),
-- Python 编程 - 孙九 - 大数据 1 班
(7, 7, 8, 7, 1, '2025-03-14', 2, 1, 'SCHEDULED'),
(7, 7, 8, 7, 1, '2025-03-14', 2, 2, 'SCHEDULED'),
-- 算法分析与设计 - 周十 - 计算机 1 班
(8, 8, 1, 8, 1, '2025-03-14', 2, 3, 'SCHEDULED'),
(8, 8, 1, 8, 1, '2025-03-14', 2, 4, 'SCHEDULED'),
-- 实验课 - 实验楼
(1, 1, 1, 7, 1, '2025-03-17', 3, 5, 'SCHEDULED'),
(1, 1, 1, 7, 1, '2025-03-17', 3, 6, 'SCHEDULED'),
-- 计算机实验课
(6, 6, 6, 9, 1, '2025-03-17', 3, 7, 'SCHEDULED'),
(6, 6, 6, 9, 1, '2025-03-17', 3, 8, 'SCHEDULED');

-- ============================================================
-- 数据验证查询
-- ============================================================
-- 查看各表数据量
SELECT 'TEACHER' AS table_name, COUNT(*) AS row_count FROM teacher
UNION ALL
SELECT 'COURSE', COUNT(*) FROM course
UNION ALL
SELECT 'CLASS', COUNT(*) FROM class
UNION ALL
SELECT 'SEMESTER', COUNT(*) FROM semester
UNION ALL
SELECT 'ROOM', COUNT(*) FROM room
UNION ALL
SELECT 'SCHEDULE', COUNT(*) FROM schedule;

-- 查看排课详情（关联查询）
SELECT
    s.schedule_id,
    c.course_name,
    t.name AS teacher_name,
    cl.class_name,
    r.room_name,
    sem.semester_name,
    s.class_time,
    CONCAT('第', s.week, '周') AS week_display,
    CONCAT('第', s.period, '节') AS period_display,
    s.status
FROM schedule s
JOIN course c ON s.course_id = c.course_id
JOIN teacher t ON s.teacher_id = t.teacher_id
JOIN class cl ON s.class_id = cl.class_id
JOIN room r ON s.room_id = r.room_id
JOIN semester sem ON s.semester_id = sem.semester_id
ORDER BY s.class_time, s.period
LIMIT 10;