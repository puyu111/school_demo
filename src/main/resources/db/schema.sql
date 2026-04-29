-- ===========================================================
-- 智能排课系统数据库建表语句 (MySQL 8.0+)
-- 基于前端 API 文档逆向设计的完整数据库架构
-- 涵盖: 基础数据管理、规则配置、课表管理、拖拽排课、
--       调课审核、智能排课 六大模块
-- ===========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================================
-- 模块一: 基础数据管理 (base-data-api.md)
-- ===========================================================

-- -----------------------------------------------------------
-- 1.1 课程表 (Course)
-- 来源: base-data-api.md - 课程管理 API
-- 字段: dbId, id(展示ID如C001), name, credits, type, totalHours
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course` (
    `db_id`         BIGINT          NOT NULL AUTO_INCREMENT COMMENT '数据库主键ID',
    `id`            VARCHAR(50)     DEFAULT NULL        COMMENT '业务展示ID (如 C001)',
    `name`          VARCHAR(200)    NOT NULL            COMMENT '课程名称',
    `credits`       DECIMAL(3,1)    NOT NULL            COMMENT '学分',
    `type`          VARCHAR(20)     NOT NULL            COMMENT '课程类型: 必修/选修/限选',
    `total_hours`   INT             NOT NULL            COMMENT '总课时',
    `created_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`db_id`),
    UNIQUE KEY `uk_course_id` (`id`),
    KEY `idx_course_name` (`name`),
    KEY `idx_course_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程信息表';

-- -----------------------------------------------------------
-- 1.2 课程设置表 (CourseSetting)
-- 来源: base-data-api.md - 课程设置 API
-- 字段: dbId, name(关联课程), priority, prerequisites, semester
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_setting` (
    `db_id`             BIGINT          NOT NULL AUTO_INCREMENT COMMENT '数据库主键ID',
    `course_name`       VARCHAR(200)    NOT NULL            COMMENT '关联课程名称',
    `priority`          INT             NOT NULL            COMMENT '排课优先级 (数字越小优先级越高)',
    `prerequisites`     TEXT            DEFAULT NULL        COMMENT '先修课程列表 (JSON数组)',
    `semester`          VARCHAR(50)     NOT NULL            COMMENT '开课学期 (如: 第 1 学期)',
    `created_time`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`db_id`),
    KEY `idx_cs_course_name` (`course_name`),
    KEY `idx_cs_semester` (`semester`),
    KEY `idx_cs_priority` (`priority`),
    CONSTRAINT `fk_cs_course_name` FOREIGN KEY (`course_name`) REFERENCES `course` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程设置表 (排课专用)';

-- -----------------------------------------------------------
-- 1.3 专业表 (Major)
-- 来源: base-data-api.md - 专业管理 API
-- 字段: dbId, id(展示ID如M001), name, courses, classSize, duration
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `major` (
    `db_id`         BIGINT          NOT NULL AUTO_INCREMENT COMMENT '数据库主键ID',
    `id`            VARCHAR(50)     DEFAULT NULL        COMMENT '业务展示ID (如 M001)',
    `name`          VARCHAR(200)    NOT NULL            COMMENT '专业名称',
    `courses`       TEXT            DEFAULT NULL        COMMENT '必修课程列表 (JSON数组)',
    `class_size`    INT             NOT NULL            COMMENT '班级人数',
    `duration`      INT             NOT NULL            COMMENT '学制 (年)',
    `created_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`db_id`),
    UNIQUE KEY `uk_major_id` (`id`),
    KEY `idx_major_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专业信息表';

-- -----------------------------------------------------------
-- 1.4 教师表 (Teacher)
-- 来源: base-data-api.md - 教师管理 API
-- 字段: dbId, id(展示ID如T001), name, gender, courses, degree, email, phone
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teacher` (
    `db_id`         BIGINT          NOT NULL AUTO_INCREMENT COMMENT '数据库主键ID',
    `id`            VARCHAR(50)     DEFAULT NULL        COMMENT '业务展示ID (如 T001)',
    `name`          VARCHAR(100)    NOT NULL            COMMENT '教师姓名',
    `gender`        VARCHAR(10)     NOT NULL            COMMENT '性别: 男/女',
    `courses`       TEXT            DEFAULT NULL        COMMENT '可授课程列表 (JSON数组)',
    `degree`        VARCHAR(50)     NOT NULL            COMMENT '学历 (如: 博士研究生)',
    `email`         VARCHAR(200)    DEFAULT NULL        COMMENT '邮箱',
    `phone`         VARCHAR(50)     DEFAULT NULL        COMMENT '电话',
    `created_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`db_id`),
    UNIQUE KEY `uk_teacher_id` (`id`),
    KEY `idx_teacher_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师信息表';

-- -----------------------------------------------------------
-- 1.5 学期日历表 (Calendar)
-- 来源: base-data-api.md - 学期日历 API
-- 字段: calendarId, startDate, endDate, disabledDates
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `calendar` (
    `calendar_id`   BIGINT          NOT NULL AUTO_INCREMENT COMMENT '日历主键ID',
    `start_date`    DATE            NOT NULL            COMMENT '学期开始日期',
    `end_date`      DATE            NOT NULL            COMMENT '学期结束日期',
    `created_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`calendar_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学期日历表';

-- -----------------------------------------------------------
-- 1.6 禁用日期表 (DisabledDate)
-- 来源: base-data-api.md - 学期日历 API (disabledDates[])
-- 字段: id, calendarId, date, remark
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `disabled_date` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `calendar_id`   BIGINT          NOT NULL            COMMENT '关联日历ID',
    `date`          DATE            NOT NULL            COMMENT '禁用日期',
    `remark`        VARCHAR(200)    DEFAULT NULL        COMMENT '备注 (如: 国庆节、春节)',
    PRIMARY KEY (`id`),
    KEY `idx_dd_calendar_id` (`calendar_id`),
    KEY `idx_dd_date` (`date`),
    CONSTRAINT `fk_dd_calendar` FOREIGN KEY (`calendar_id`) REFERENCES `calendar` (`calendar_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='禁用日期表';

-- ===========================================================
-- 模块二: 规则配置 (rule-configuration-api.md)
-- ===========================================================

-- -----------------------------------------------------------
-- 2.1 规则表 (Rule)
-- 来源: rule-configuration-api.md - 规则管理 API
-- 字段: key, ruleName, teachers[], description, validDate
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rule` (
    `key`           VARCHAR(50)     NOT NULL            COMMENT '规则唯一标识',
    `rule_name`     VARCHAR(200)    NOT NULL            COMMENT '规则名称',
    `teachers`      TEXT            DEFAULT NULL        COMMENT '适用教师名单 (JSON数组)',
    `description`   TEXT            NOT NULL            COMMENT '规则描述',
    `valid_start`   BIGINT          DEFAULT NULL        COMMENT '有效期开始 (Unix 毫秒时间戳)',
    `valid_end`     BIGINT          DEFAULT NULL        COMMENT '有效期结束 (Unix 毫秒时间戳)',
    `created_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排课规则表';

-- -----------------------------------------------------------
-- 2.2 教师不可用日期表 (UnavailableDate)
-- 来源: rule-configuration-api.md - 教师不可用日期 API
-- 字段: key, teacherId, teacherName, validDate, reason, type, rangeType
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `unavailable_date` (
    `key`           VARCHAR(50)     NOT NULL            COMMENT '记录唯一标识',
    `teacher_id`    VARCHAR(50)     NOT NULL            COMMENT '教师ID',
    `teacher_name`  VARCHAR(100)    NOT NULL            COMMENT '教师姓名',
    `valid_start`   BIGINT          NOT NULL            COMMENT '开始时间 (Unix 毫秒时间戳)',
    `valid_end`     BIGINT          NOT NULL            COMMENT '结束时间 (Unix 毫秒时间戳)',
    `reason`        VARCHAR(500)    NOT NULL            COMMENT '原因说明',
    `type`          VARCHAR(20)     NOT NULL            COMMENT '类型: personal/holiday/other',
    `range_type`    VARCHAR(20)     DEFAULT NULL        COMMENT '范围类型: single/week/month/quarter/range',
    PRIMARY KEY (`key`),
    KEY `idx_ud_teacher_id` (`teacher_id`),
    KEY `idx_ud_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师不可用日期表';

-- -----------------------------------------------------------
-- 2.3 规则权重表 (RuleWeight)
-- 来源: rule-configuration-api.md - 规则权重管理 API
-- 字段: id, name, category, currentWeight, defaultWeight, minWeight, maxWeight, enabled, description
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rule_weight` (
    `id`                VARCHAR(50)     NOT NULL            COMMENT '权重配置ID',
    `name`              VARCHAR(200)    NOT NULL            COMMENT '规则名称',
    `category`          VARCHAR(50)     NOT NULL            COMMENT '分类 (如: teacher)',
    `current_weight`    INT             NOT NULL            COMMENT '当前权重值',
    `default_weight`    INT             NOT NULL            COMMENT '默认权重值',
    `min_weight`        INT             NOT NULL            COMMENT '最小权重',
    `max_weight`        INT             NOT NULL            COMMENT '最大权重',
    `enabled`           TINYINT(1)      NOT NULL DEFAULT 1  COMMENT '是否启用: 1=启用, 0=禁用',
    `description`       VARCHAR(500)    DEFAULT NULL        COMMENT '描述',
    `updated_time`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `rw_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='规则权重配置表';

-- -----------------------------------------------------------
-- 2.4 权重变更记录表 (WeightChangeRecord)
-- 来源: rule-configuration-api.md - 获取权重变更历史 API
-- 字段: id, ruleId, ruleName, oldValue, newValue, time
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `weight_change_record` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `rule_id`       VARCHAR(50)     NOT NULL            COMMENT '规则ID',
    `rule_name`     VARCHAR(200)    NOT NULL            COMMENT '规则名称',
    `old_value`     INT             NOT NULL            COMMENT '原权重值',
    `new_value`     INT             NOT NULL            COMMENT '新权重值',
    `change_time`   TIME            NOT NULL            COMMENT '变更时间',
    `change_date`   DATE            NOT NULL            COMMENT '变更日期',
    PRIMARY KEY (`id`),
    KEY `idx_wcr_rule_id` (`rule_id`),
    KEY `idx_wcr_change_date` (`change_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权重变更记录表';

-- ===========================================================
-- 模块三: 课表管理 (schedule-api.md) + 拖拽排课 (drag-schedule-api.md)
-- ===========================================================

-- -----------------------------------------------------------
-- 3.1 时段配置表 (TimeSlotConfig)
-- 来源: drag-schedule-api.md - 时段配置 API
-- 字段: id, label, startTime, endTime, duration, halfDayType, isBreak, breakAfter, isSchedulable
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `time_slot_config` (
    `id`                VARCHAR(50)     NOT NULL            COMMENT '时段ID',
    `label`             VARCHAR(50)     NOT NULL            COMMENT '节次标签 (如: 第 1 节)',
    `start_time`        TIME            NOT NULL            COMMENT '开始时间 (HH:mm)',
    `end_time`          TIME            NOT NULL            COMMENT '结束时间 (HH:mm)',
    `duration`          INT             NOT NULL            COMMENT '时长 (分钟)',
    `half_day_type`     VARCHAR(20)     NOT NULL            COMMENT '半天类型: morning/afternoon/evening',
    `is_break`          TINYINT(1)      NOT NULL DEFAULT 0  COMMENT '是否休息时段',
    `break_after`       INT             DEFAULT NULL        COMMENT '课后休息时长 (分钟)',
    `is_schedulable`    TINYINT(1)      NOT NULL DEFAULT 1  COMMENT '是否可排课',
    PRIMARY KEY (`id`),
    KEY `tsc_half_day_type` (`half_day_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='时段配置表';

-- -----------------------------------------------------------
-- 3.2 星期配置表 (WeekDayConfig)
-- 来源: drag-schedule-api.md - 星期配置 API
-- 字段: id, name, isEnabled, isSchedulable
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `weekday_config` (
    `id`              INT             NOT NULL            COMMENT '星期ID (1-7)',
    `name`            VARCHAR(20)     NOT NULL            COMMENT '显示名称 (如: 周一)',
    `is_enabled`      TINYINT(1)      NOT NULL DEFAULT 1  COMMENT '是否启用',
    `is_schedulable`  TINYINT(1)      NOT NULL DEFAULT 1  COMMENT '是否可排课',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='星期配置表';

-- -----------------------------------------------------------
-- 3.3 排课记录表 (Schedule)
-- 来源: schedule-api.md + drag-schedule-api.md - 课程/排课管理 API
-- 字段: id, courseName, teacherId, classId, roomId, weekDay, startTime, endTime,
--        duration, weeks[], color, studentCount, semester/week info
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `schedule` (
    `schedule_id`     BIGINT          NOT NULL AUTO_INCREMENT COMMENT '排课记录ID',
    `course_id`       BIGINT          NOT NULL            COMMENT '课程ID (关联 course.db_id)',
    `teacher_id`      BIGINT          NOT NULL            COMMENT '教师ID (关联 teacher.db_id)',
    `class_id`        VARCHAR(20)       DEFAULT NULL        COMMENT '班级ID',
    `room_id`         BIGINT          DEFAULT NULL        COMMENT '教室ID (关联 room.db_id)',
    `weekday`         INT             NOT NULL            COMMENT '星期 (1-7)',
    `start_time`      TIME            NOT NULL            COMMENT '开始时间 (HH:mm)',
    `end_time`        TIME            NOT NULL            COMMENT '结束时间 (HH:mm)',
    `duration`        INT             NOT NULL            COMMENT '课程时长 (分钟)',
    `weeks`           TEXT            NOT NULL            COMMENT '开课周次 (JSON数组)',
    `color`           VARCHAR(20)     DEFAULT NULL        COMMENT '显示颜色 (如: #1890ff)',
    `student_count`   INT             DEFAULT NULL        COMMENT '学生人数',
    `created_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`schedule_id`),
    KEY `idx_schedule_course_id` (`course_id`),
    KEY `idx_schedule_teacher_id` (`teacher_id`),
    KEY `idx_schedule_class_id` (`class_id`),
    KEY `idx_schedule_room_id` (`room_id`),
    KEY `idx_schedule_weekday` (`weekday`),
    CONSTRAINT `fk_schedule_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`db_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_schedule_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`db_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排课记录表';

-- -----------------------------------------------------------
-- 3.4 教室表 (Room)
-- 来源: schedule-api.md / drag-schedule-api.md / smart-scheduling-api.md
-- 字段: id, name, capacity, type, building
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `room` (
    `db_id`         BIGINT          NOT NULL AUTO_INCREMENT COMMENT '数据库主键ID',
    `id`            VARCHAR(50)     DEFAULT NULL        COMMENT '业务展示ID (如 R001)',
    `name`          VARCHAR(200)    NOT NULL            COMMENT '教室名称',
    `capacity`      INT             NOT NULL            COMMENT '容纳人数',
    `type`          VARCHAR(50)     NOT NULL DEFAULT 'NORMAL' COMMENT '教室类型: NORMAL/LAB/COMPUTER/MULTIMEDIA/LECTURE_HALL',
    `building`      VARCHAR(100)    DEFAULT NULL        COMMENT '所在楼宇',
    `created_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`db_id`),
    UNIQUE KEY `uk_room_id` (`id`),
    KEY `idx_room_building` (`building`),
    KEY `idx_room_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教室信息表';

-- ===========================================================
-- 模块四: 调课申请审核 (course-adjustment-api.md)
-- ===========================================================

-- -----------------------------------------------------------
-- 4.1 调课申请表 (CourseAdjustmentApplication)
-- 来源: course-adjustment-api.md - 申请管理 API
-- 字段: id, teacherId, teacherName, department, originalCourseId,
--        originalCourseDetail, targetCourseDetail, reason, status, urgency,
--        reviewComment, reviewerId, reviewerName, reviewTime, attachments
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_adjustment_application` (
    `id`                    VARCHAR(50)     NOT NULL            COMMENT '申请唯一标识 (如 T2026001)',
    `teacher_id`            VARCHAR(50)     NOT NULL            COMMENT '教师ID',
    `teacher_name`          VARCHAR(100)    NOT NULL            COMMENT '教师姓名',
    `department`            VARCHAR(100)    NOT NULL            COMMENT '所在院系',
    `original_course_id`    BIGINT          DEFAULT NULL        COMMENT '原课程ID (关联 course.db_id)',
    `original_course`       TEXT            DEFAULT NULL        COMMENT '原课程信息 (简短描述)',
    `original_detail`       JSON            DEFAULT NULL        COMMENT '原课程详细信息 (JSON)',
    `target_course`         TEXT            DEFAULT NULL        COMMENT '调整后课程信息 (简短描述)',
    `target_detail`         JSON            DEFAULT NULL        COMMENT '目标课程详细信息 (JSON)',
    `target_weekday`        INT             DEFAULT NULL        COMMENT '目标星期 (1-7)',
    `target_slot`           INT             DEFAULT NULL        COMMENT '目标节次',
    `reason`                VARCHAR(1000)   NOT NULL            COMMENT '调课原因',
    `status`                VARCHAR(20)     NOT NULL DEFAULT 'pending' COMMENT '审核状态: pending/approved/rejected/revoked',
    `urgency`               VARCHAR(20)     NOT NULL DEFAULT 'normal' COMMENT '紧急程度: high/normal',
    `attachments`           JSON            DEFAULT NULL        COMMENT '附件列表 (JSON数组)',
    `apply_time`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    `review_comment`        VARCHAR(1000)   DEFAULT NULL        COMMENT '审核意见',
    `reviewer_id`           VARCHAR(50)     DEFAULT NULL        COMMENT '审核人ID',
    `reviewer_name`         VARCHAR(100)    DEFAULT NULL        COMMENT '审核人姓名',
    `review_time`           DATETIME        DEFAULT NULL        COMMENT '审核时间',
    `created_time`          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_time`          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_caa_teacher_id` (`teacher_id`),
    KEY `idx_caa_status` (`status`),
    KEY `idx_caa_urgency` (`urgency`),
    KEY `idx_caa_department` (`department`),
    KEY `idx_caa_apply_time` (`apply_time`),
    CONSTRAINT `fk_caa_course` FOREIGN KEY (`original_course_id`) REFERENCES `course` (`db_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='调课申请表';

-- -----------------------------------------------------------
-- 4.2 审核历史记录表 (ReviewHistory)
-- 来源: course-adjustment-api.md - 审核历史记录 API
-- 字段: id, applicationId, action, actionName, operatorId, operatorName,
--        operatorType, comment, timestamp
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `review_history` (
    `id`                BIGINT          NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `application_id`    VARCHAR(50)     NOT NULL            COMMENT '关联申请ID',
    `action`            VARCHAR(20)     NOT NULL            COMMENT '操作类型: submit/review/revoke',
    `action_name`       VARCHAR(50)     NOT NULL            COMMENT '操作名称 (如: 提交申请/审核通过)',
    `operator_id`       VARCHAR(50)     NOT NULL            COMMENT '操作人ID',
    `operator_name`     VARCHAR(100)    NOT NULL            COMMENT '操作人姓名',
    `operator_type`     VARCHAR(20)     NOT NULL            COMMENT '操作人类型: teacher/admin',
    `comment`           VARCHAR(1000)   DEFAULT NULL        COMMENT '备注/意见',
    `timestamp`         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    KEY `idx_rh_application_id` (`application_id`),
    KEY `idx_rh_timestamp` (`timestamp`),
    CONSTRAINT `fk_rh_application` FOREIGN KEY (`application_id`) REFERENCES `course_adjustment_application` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核历史记录表';

-- ===========================================================
-- 模块五: 智能排课 (smart-scheduling-api.md)
-- ===========================================================

-- -----------------------------------------------------------
-- 5.1 排课操作历史表 (ScheduleHistory)
-- 来源: smart-scheduling-api.md - 获取操作历史 API
-- 字段: id, action, courseId, courseName, teacherName, className,
--        day, slot, timestamp, operator
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `schedule_history` (
    `id`                BIGINT          NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `action`            VARCHAR(20)     NOT NULL            COMMENT '操作类型: add/remove/update',
    `course_id`         BIGINT          DEFAULT NULL        COMMENT '课程ID',
    `course_name`       VARCHAR(200)    DEFAULT NULL        COMMENT '课程名称',
    `teacher_name`      VARCHAR(100)    DEFAULT NULL        COMMENT '教师姓名',
    `class_name`        VARCHAR(100)    DEFAULT NULL        COMMENT '班级名称',
    `day`               VARCHAR(20)     DEFAULT NULL        COMMENT '星期: monday/tuesday/wednesday/thursday/friday',
    `slot`              INT             DEFAULT NULL        COMMENT '节次 (1-10)',
    `operator`          VARCHAR(50)     DEFAULT NULL        COMMENT '操作人',
    `timestamp`         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    KEY `idx_sh_action` (`action`),
    KEY `idx_sh_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排课操作历史表';

SET FOREIGN_KEY_CHECKS = 1;
