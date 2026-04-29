SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. 学期日历表（只保留开始/结束日期，不含禁用日期）
-- ============================================================
CREATE TABLE IF NOT EXISTS `semester_calendar` (
                                                   `calendar_id`       BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日历ID',
                                                   `semester_name`     VARCHAR(100) NOT NULL COMMENT '学期名称',
                                                   `start_date`        DATE         NOT NULL COMMENT '学期开始日期',
                                                   `end_date`          DATE         NOT NULL COMMENT '学期结束日期',
                                                   `created_time`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                   `updated_time`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                                                       COMMENT '更新时间',
                                                   PRIMARY KEY (`calendar_id`),
                                                   UNIQUE KEY `uk_semester_name` (`semester_name`),
                                                   KEY `idx_date_range` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学期日历表';

-- ============================================================
-- 2. 禁用日期表
-- ============================================================
CREATE TABLE IF NOT EXISTS `disabled_date` (
                                               `disabled_id`   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '禁用日期ID',
                                               `calendar_id`   BIGINT       NOT NULL COMMENT '关联学期日历ID',
                                               `date`          DATE         NOT NULL COMMENT '禁用日期',
                                               `remark`        VARCHAR(255) DEFAULT NULL COMMENT '备注',
                                               `created_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                               PRIMARY KEY (`disabled_id`),
                                               UNIQUE KEY `uk_calendar_date` (`calendar_id`, `date`),
                                               KEY `idx_date` (`date`),
                                               CONSTRAINT `fk_disabled_calendar` FOREIGN KEY (`calendar_id`)
                                                   REFERENCES `semester_calendar` (`calendar_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='禁用日期表';

-- ============================================================
-- 3. 教师表
-- ============================================================
CREATE TABLE IF NOT EXISTS `teacher` (
                                         `teacher_id`        BIGINT       NOT NULL AUTO_INCREMENT COMMENT '教师ID',
                                         `name`              VARCHAR(100) NOT NULL COMMENT '教师姓名',
                                         `job_number`        VARCHAR(50)  NOT NULL COMMENT '工号',
                                         `department`        VARCHAR(100) DEFAULT NULL COMMENT '所属院系',
                                         `max_daily_courses` INT          NOT NULL DEFAULT 6 COMMENT '每日最大授课节数',
                                         `created_time`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                         `updated_time`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                                             COMMENT '更新时间',
                                         PRIMARY KEY (`teacher_id`),
                                         UNIQUE KEY `uk_job_number` (`job_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师信息表';

-- ============================================================
-- 4. 课程表（不变）
-- ============================================================
CREATE TABLE IF NOT EXISTS `course` (
                                        `course_id`   BIGINT         NOT NULL AUTO_INCREMENT COMMENT '课程ID',
                                        `course_name` VARCHAR(200)   NOT NULL COMMENT '课程名称',
                                        `credits`     DECIMAL(3,1)   NOT NULL COMMENT '学分',
                                        `duration`    INT            NOT NULL COMMENT '持续周数',
                                        `priority`    INT            NOT NULL DEFAULT 1 COMMENT '排课优先级',
                                        `course_type` VARCHAR(50)    NOT NULL DEFAULT 'THEORY' COMMENT '课程类型',
                                        `id`          VARCHAR(50)    DEFAULT NULL COMMENT '业务ID',
                                        `total_hours` INT            NOT NULL COMMENT '总学时',
                                        `created_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                        `updated_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT
                                            '更新时间',
                                        PRIMARY KEY (`course_id`),
                                        UNIQUE KEY `uk_course_business_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程信息表';

-- ============================================================
-- 5. 课程设置表（移除 prerequisites 字段，数据移到 course_prerequisite 中间表）
-- ============================================================
CREATE TABLE IF NOT EXISTS `course_setting` (
                                                `setting_id`   BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                                `course_id`    BIGINT      NOT NULL COMMENT '关联课程ID',
                                                `priority`     INT         NOT NULL DEFAULT 1 COMMENT '排课优先级',
                                                `semester`     VARCHAR(50) DEFAULT NULL COMMENT '开设学期',
                                                `created_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                                `updated_time` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT
                                                    '更新时间',
                                                PRIMARY KEY (`setting_id`),
                                                UNIQUE KEY `uk_setting_course` (`course_id`),
                                                CONSTRAINT `fk_setting_course` FOREIGN KEY (`course_id`)
                                                    REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程设置表';

-- ============================================================
-- 6. 课程前置关系表（多对多，替代 course_setting.prerequisites）
-- ============================================================
CREATE TABLE IF NOT EXISTS `course_prerequisite` (
                                                     `id`           BIGINT     NOT NULL AUTO_INCREMENT,
                                                     `course_id`    BIGINT     NOT NULL COMMENT '课程ID（后续课程）',
                                                     `prereq_id`    BIGINT     NOT NULL COMMENT '前置课程ID',
                                                     `created_time` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                     PRIMARY KEY (`id`),
                                                     UNIQUE KEY `uk_prereq` (`course_id`, `prereq_id`),
                                                     KEY `fk_prereq_ref` (`prereq_id`),
                                                     CONSTRAINT `fk_prereq_course` FOREIGN KEY (`course_id`)
                                                         REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                                     CONSTRAINT `fk_prereq_ref` FOREIGN KEY (`prereq_id`)
                                                         REFERENCES `course` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程前置关系表';

-- ============================================================
-- 7. 专业表
-- ============================================================
CREATE TABLE IF NOT EXISTS `major` (
                                       `major_id`     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '专业ID',
                                       `id`           VARCHAR(50)  NOT NULL COMMENT '业务ID',
                                       `name`         VARCHAR(100) NOT NULL COMMENT '专业名称',
                                       `class_size`   INT          NOT NULL COMMENT '班级数',
                                       `duration`     INT          NOT NULL COMMENT '学制（年）',
                                       `created_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `updated_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT
                                           '更新时间',
                                       PRIMARY KEY (`major_id`),
                                       UNIQUE KEY `uk_major_id` (`id`),
                                       KEY `idx_major_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专业信息表';

-- ============================================================
-- 8. 专业-课程关联表（多对多，存储必修课程）
-- ============================================================
CREATE TABLE IF NOT EXISTS `major_course` (
                                              `id`           BIGINT     NOT NULL AUTO_INCREMENT,
                                              `major_id`     BIGINT     NOT NULL COMMENT '专业ID',
                                              `course_name`  VARCHAR(200) NOT NULL COMMENT '课程名称',
                                              `created_time` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                              PRIMARY KEY (`id`),
                                              UNIQUE KEY `uk_major_course_name` (`major_id`, `course_name`),
                                              CONSTRAINT `fk_mc_major` FOREIGN KEY (`major_id`)
                                                  REFERENCES `major` (`major_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专业-课程关联表';

-- ============================================================
-- 9. 班级表
-- ============================================================
CREATE TABLE IF NOT EXISTS `class` (
                                       `class_id`      BIGINT       NOT NULL AUTO_INCREMENT COMMENT '班级ID',
                                       `class_name`    VARCHAR(100) NOT NULL COMMENT '班级名称',
                                       `major_id`      VARCHAR(50)  NOT NULL COMMENT '专业ID',
                                       `student_count` INT          NOT NULL COMMENT '学生人数',
                                       `grade`         VARCHAR(10)  NOT NULL COMMENT '年级',
                                       `created_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `updated_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT
                                           '更新时间',
                                       PRIMARY KEY (`class_id`),
                                       KEY `idx_major_id` (`major_id`),
                                       KEY `idx_grade` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级信息表';

-- ============================================================
-- 10. 排课记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS `schedule` (
                                          `schedule_id`  BIGINT       NOT NULL AUTO_INCREMENT COMMENT '排课记录ID',
                                          `course_id`    BIGINT       NOT NULL COMMENT '课程ID',
                                          `teacher_id`   BIGINT       NOT NULL COMMENT '教师ID',
                                          `class_id`     BIGINT       NOT NULL COMMENT '班级ID',
                                          `semester_id`  BIGINT       NOT NULL COMMENT '学期日历ID',
                                          `class_time`   DATE         NOT NULL COMMENT '上课日期',
                                          `week`         INT          NOT NULL COMMENT '第几周',
                                          `period`       INT          NOT NULL COMMENT '第几节（1-12）',
                                          `status`       VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED' COMMENT '状态',
                                          `created_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                          `updated_time` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT
                                              '更新时间',
                                          PRIMARY KEY (`schedule_id`),
                                          KEY `idx_course_id`  (`course_id`),
                                          KEY `idx_teacher_id` (`teacher_id`),
                                          KEY `idx_class_id`   (`class_id`),
                                          KEY `idx_semester_id`(`semester_id`),
                                          KEY `idx_class_time` (`class_time`),
                                          KEY `idx_week`       (`week`),
                                          CONSTRAINT `fk_schedule_course`   FOREIGN KEY (`course_id`)   REFERENCES `course`    (`course_id`) ON
                                              DELETE RESTRICT ON UPDATE CASCADE,
                                          CONSTRAINT `fk_schedule_teacher`  FOREIGN KEY (`teacher_id`)  REFERENCES `teacher`   (`teacher_id`)
                                              ON DELETE RESTRICT ON UPDATE CASCADE,
                                          CONSTRAINT `fk_schedule_class`    FOREIGN KEY (`class_id`)    REFERENCES `class`     (`class_id`) ON
                                              DELETE RESTRICT ON UPDATE CASCADE,
                                          CONSTRAINT `fk_schedule_semester` FOREIGN KEY (`semester_id`) REFERENCES `semester_calendar`
                                              (`calendar_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排课记录表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 插入示例数据
-- ============================================================

-- 学期日历
INSERT INTO `semester_calendar` (`semester_name`, `start_date`, `end_date`) VALUES
                                                                                ('2023-2024第一学期', '2023-09-01', '2024-01-15'),
                                                                                ('2023-2024第二学期', '2024-02-26', '2024-07-10'),
                                                                                ('2024-2025第一学期', '2024-09-02', '2025-01-12'),
                                                                                ('2024-2025第二学期', '2025-02-24', '2025-07-10');

-- 禁用日期
INSERT INTO `disabled_date` (`calendar_id`, `date`, `remark`) VALUES
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第一学期'),
                                                                   '2023-09-29', '国庆节调休'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第一学期'),
                                                                   '2023-09-30', '国庆节调休'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第一学期'),
                                                                   '2023-10-01', '国庆节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第一学期'),
                                                                   '2023-10-02', '国庆节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第一学期'),
                                                                   '2023-10-03', '国庆节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第二学期'),
                                                                   '2024-02-10', '春节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第二学期'),
                                                                   '2024-02-11', '春节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第二学期'),
                                                                   '2024-02-12', '春节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2024-2025第一学期'),
                                                                   '2024-10-01', '国庆节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2024-2025第一学期'),
                                                                   '2024-10-02', '国庆节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2024-2025第二学期'),
                                                                   '2025-02-17', '春节'),
                                                                  ((SELECT `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2024-2025第二学期'),
                                                                   '2025-02-18', '春节');

-- 教师
INSERT INTO `teacher` (`name`, `job_number`, `department`, `max_daily_courses`) VALUES
                                                                                    ('张三', 'T001', '计算机学院', 6),
                                                                                    ('李四', 'T002', '计算机学院', 6),
                                                                                    ('王五', 'T003', '数学学院', 4),
                                                                                    ('赵六', 'T004', '物理学院', 6),
                                                                                    ('孙七', 'T005', '计算机学院', 8);

-- 课程
INSERT INTO `course` (`course_name`, `credits`, `duration`, `priority`, `course_type`, `id`,
                      `total_hours`) VALUES
                                         ('高等数学', 5.0, 16, 1, 'THEORY',  'C001', 80),
                                         ('线性代数', 3.0, 16, 2, 'THEORY',  'C002', 48),
                                         ('数据结构', 4.0, 16, 1, 'THEORY',  'C003', 64),
                                         ('数据库原理', 3.5, 16, 2, 'THEORY', 'C004', 56),
                                         ('算法设计', 3.0, 16, 3, 'PRACTICE','C005', 48),
                                         ('计算机网络', 3.0, 16, 2, 'THEORY', 'C006', 48),
                                         ('操作系统', 4.0, 16, 1, 'THEORY',  'C007', 64),
                                         ('软件工程', 2.5, 16, 4, 'PRACTICE','C008', 40);

-- 课程设置（不再包含 prerequisites）
INSERT INTO `course_setting` (`course_id`, `priority`, `semester`) VALUES
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C001'), 1, '第一学期'),
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C002'), 2, '第一学期'),
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C003'), 1, '第二学期'),
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C004'), 2, '第二学期'),
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C005'), 3, '第三学期'),
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C006'), 2, '第三学期'),
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C007'), 1, '第二学期'),
                                                                       ((SELECT `course_id` FROM `course` WHERE `id`='C008'), 4, '第四学期');

-- 课程前置关系（替代原 prerequisites 逗号字符串）
INSERT INTO `course_prerequisite` (`course_id`, `prereq_id`) VALUES
                                                                 ((SELECT `course_id` FROM `course` WHERE `id`='C003'), (SELECT `course_id` FROM `course` WHERE
                                                                     `id`='C001')),
                                                                 ((SELECT `course_id` FROM `course` WHERE `id`='C003'), (SELECT `course_id` FROM `course` WHERE
                                                                     `id`='C002')),
                                                                 ((SELECT `course_id` FROM `course` WHERE `id`='C004'), (SELECT `course_id` FROM `course` WHERE
                                                                     `id`='C003')),
                                                                 ((SELECT `course_id` FROM `course` WHERE `id`='C005'), (SELECT `course_id` FROM `course` WHERE
                                                                     `id`='C003')),
                                                                 ((SELECT `course_id` FROM `course` WHERE `id`='C007'), (SELECT `course_id` FROM `course` WHERE
                                                                     `id`='C003')),
                                                                 ((SELECT `course_id` FROM `course` WHERE `id`='C008'), (SELECT `course_id` FROM `course` WHERE
                                                                     `id`='C004'));

-- 专业
INSERT INTO `major` (`id`, `name`, `class_size`, `duration`) VALUES
                                                                             ('M001', '计算机科学与技术', 45, 4),
                                                                             ('M002', '软件工程',         40, 4),
                                                                             ('M003', '数据科学与大数据技术', 30, 4);

-- 专业-课程关联
INSERT INTO `major_course` (`major_id`, `course_name`) VALUES
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M001'), '高等数学'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M001'), '数据结构'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M001'), '操作系统'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M001'), '计算机组成原理'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M002'), '高等数学'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M002'), '数据结构'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M002'), '软件工程导论'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M002'), '数据库原理'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M003'), '高等数学'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M003'), '线性代数'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M003'), '机器学习'),
                                                          ((SELECT `major_id` FROM `major` WHERE `id`='M003'), '深度学习');

-- 班级
INSERT INTO `class` (`class_name`, `major_id`, `student_count`, `grade`) VALUES
                                                                             ('计科2023-1班', 'M001', 40, '2023'),
                                                                             ('计科2023-2班', 'M001', 40, '2023'),
                                                                             ('软件2023-1班', 'M002', 35, '2023'),
                                                                             ('数据2023-1班', 'M003', 30, '2023');

-- 排课记录
INSERT INTO `schedule` (`course_id`, `teacher_id`, `class_id`, `semester_id`, `class_time`, `week`,
                        `period`, `status`) VALUES
                                                ((SELECT `course_id` FROM `course` WHERE `id`='C001'), (SELECT `teacher_id` FROM `teacher` WHERE
                                                    `job_number`='T003'), (SELECT `class_id` FROM `class` WHERE `class_name`='计科2023-1班'), (SELECT
                                                                                                                                                   `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第一学期'), '2023-09-04', 1, 1,
                                                 'SCHEDULED'),
                                                ((SELECT `course_id` FROM `course` WHERE `id`='C003'), (SELECT `teacher_id` FROM `teacher` WHERE
                                                    `job_number`='T001'), (SELECT `class_id` FROM `class` WHERE `class_name`='计科2023-1班'), (SELECT
                                                                                                                                                   `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第二学期'), '2024-02-26', 1, 3,
                                                 'SCHEDULED'),
                                                ((SELECT `course_id` FROM `course` WHERE `id`='C004'), (SELECT `teacher_id` FROM `teacher` WHERE
                                                    `job_number`='T002'), (SELECT `class_id` FROM `class` WHERE `class_name`='软件2023-1班'), (SELECT
                                                                                                                                                   `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第二学期'), '2024-02-27', 1, 2,
                                                 'SCHEDULED'),
                                                ((SELECT `course_id` FROM `course` WHERE `id`='C007'), (SELECT `teacher_id` FROM `teacher` WHERE
                                                    `job_number`='T005'), (SELECT `class_id` FROM `class` WHERE `class_name`='计科2023-2班'), (SELECT
                                                                                                                                                   `calendar_id` FROM `semester_calendar` WHERE `semester_name`='2023-2024第二学期'), '2024-02-26', 1, 5,
                                                 'SCHEDULED');