-- =====================================================
-- 智能排课系统 - 完整数据库设计
-- 基于前端 6 个 API 文档设计
-- 版本: v2.0
-- 创建日期: 2026-04-28
-- =====================================================

-- =====================================================
-- 一、基础数据模块 (base-data-api.md)
-- =====================================================

-- 1. 课程表 (已有)
-- 表名: course
-- 来源: base-data-api.md 课程管理 + 现有 CourseEntity

-- 2. 课程设置表
-- 来源: base-data-api.md 课程设置管理
CREATE TABLE IF NOT EXISTS course_setting (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_name     VARCHAR(200)  NOT NULL COMMENT '课程名称',
    priority        INT           NOT NULL DEFAULT 1 COMMENT '优先级（越小越高）',
    semester        VARCHAR(50)   NOT NULL COMMENT '开课学期（如：第 1 学期）',
    created_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course_name (course_name)
) COMMENT = '课程设置表';

-- 3. 课程先修关系表（M:N）
-- 来源: base-data-api.md 课程设置的 prerequisites 字段
CREATE TABLE IF NOT EXISTS course_prerequisite (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_setting_id BIGINT    NOT NULL COMMENT '课程设置 ID',
    prerequisite_name VARCHAR(200) NOT NULL COMMENT '先修课程名称',
    UNIQUE KEY uk_course_prereq (course_setting_id, prerequisite_name),
    CONSTRAINT fk_prereq_setting FOREIGN KEY (course_setting_id) REFERENCES course_setting(id) ON DELETE CASCADE
) COMMENT = '课程先修关系表';

-- 4. 专业表
-- 来源: base-data-api.md 专业管理 + 现有 ClassEntity 的 major_id 关联
CREATE TABLE IF NOT EXISTS major (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    major_id        VARCHAR(50)   NOT NULL UNIQUE COMMENT '专业业务 ID（如 M001）',
    major_name      VARCHAR(200)  NOT NULL COMMENT '专业名称',
    class_size      INT           NOT NULL DEFAULT 45 COMMENT '默认班级人数',
    duration        INT           NOT NULL DEFAULT 4 COMMENT '学制（年）',
    created_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_major_name (major_name)
) COMMENT = '专业表';

-- 5. 专业必修课程关联表（M:N）
-- 来源: base-data-api.md 专业的 courses 字段
CREATE TABLE IF NOT EXISTS major_required_course (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    major_id        BIGINT        NOT NULL COMMENT '专业 ID',
    course_name     VARCHAR(200)  NOT NULL COMMENT '必修课程名称',
    UNIQUE KEY uk_major_course (major_id, course_name),
    CONSTRAINT fk_major_req_course FOREIGN KEY (major_id) REFERENCES major(id) ON DELETE CASCADE
) COMMENT = '专业必修课程关联表';

-- 6. 教师表 (已有)
-- 表名: teacher
-- 来源: base-data-api.md 教师管理 + 现有 TeacherEntity

-- 7. 教师可授课程关联表（M:N）
-- 来源: base-data-api.md 教师的 courses 字段
CREATE TABLE IF NOT EXISTS teacher_teachable_course (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id      BIGINT        NOT NULL,
    course_name     VARCHAR(200)  NOT NULL COMMENT '可授课程名称',
    UNIQUE KEY uk_teacher_course (teacher_id, course_name),
    CONSTRAINT fk_teacher_course FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE
) COMMENT = '教师可授课程关联表';


-- =====================================================
-- 二、课表管理模块 (schedule-api.md + drag-schedule-api.md)
-- =====================================================

-- 8. 学期表 (已有)
-- 表名: semester
-- 来源: 现有 SemesterEntity

-- 9. 班级表 (已有)
-- 表名: class
-- 来源: 现有 ClassEntity

-- 10. 教室表 (已有)
-- 表名: room
-- 来源: 现有 RoomEntity

-- 11. 时间段表 (已有)
-- 表名: time_slot
-- 来源: 现有 TimeSlotEntity

-- 12. 排课记录表 (已有)
-- 表名: schedule
-- 来源: 现有 ScheduleEntity

-- 13. 教师可用时间段 (已有)
-- 表名: teacher_available_slot_v2
-- 来源: 现有 TeacherAvailableSlot

-- 14. 教师偏好时间段 (已有)
-- 表名: teacher_preferred_slot_v2
-- 来源: 现有 TeacherPreferredSlot


-- =====================================================
-- 三、调课申请审核模块 (course-adjustment-api.md)
-- =====================================================

-- 15. 调课申请表
-- 来源: course-adjustment-api.md 申请管理
CREATE TABLE IF NOT EXISTS course_adjustment (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_no      VARCHAR(50)   NOT NULL UNIQUE COMMENT '申请编号（如 T2026001）',
    teacher_id          BIGINT        NOT NULL COMMENT '教师 ID',
    teacher_name        VARCHAR(100)  NOT NULL COMMENT '教师姓名',
    department          VARCHAR(100)  NOT NULL COMMENT '所在院系',
    original_course_id  VARCHAR(50)   NOT NULL COMMENT '原课程业务 ID',
    original_course     VARCHAR(500)  NOT NULL COMMENT '原课程信息（简短描述）',
    target_course       VARCHAR(500)  NOT NULL COMMENT '调整后课程信息',
    target_week_day     TINYINT       NOT NULL COMMENT '目标星期（1-7）',
    target_slot         INT           NOT NULL COMMENT '目标节次',
    reason              VARCHAR(1000) NOT NULL COMMENT '调课原因',
    urgency             VARCHAR(20)   NOT NULL DEFAULT 'normal' COMMENT '紧急程度：high/normal',
    status              VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT '状态：pending/approved/rejected/revoked',
    review_comment      VARCHAR(1000) NULL COMMENT '审核意见',
    reviewer_id         VARCHAR(50)   NULL COMMENT '审核人 ID',
    reviewer_name       VARCHAR(100)  NULL COMMENT '审核人姓名',
    review_time         DATETIME      NULL COMMENT '审核时间',
    attachments         JSON          NULL COMMENT '附件列表 JSON',
    created_time        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teacher (teacher_id),
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_apply_time (created_time),
    CONSTRAINT fk_adjust_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
) COMMENT = '调课申请表';

-- 16. 调课申请审核历史表
-- 来源: course-adjustment-api.md 审核历史记录
CREATE TABLE IF NOT EXISTS adjustment_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id  BIGINT        NOT NULL COMMENT '调课申请 ID',
    action          VARCHAR(50)   NOT NULL COMMENT '操作类型：submit/review/revoke',
    action_name     VARCHAR(100)  NOT NULL COMMENT '操作名称',
    operator_id     VARCHAR(50)   NOT NULL COMMENT '操作人 ID',
    operator_name   VARCHAR(100)  NOT NULL COMMENT '操作人姓名',
    operator_type   VARCHAR(20)   NOT NULL COMMENT '操作人类型：teacher/admin',
    comment         VARCHAR(500)  NULL COMMENT '备注/意见',
    timestamp       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_application (application_id),
    CONSTRAINT fk_hist_application FOREIGN KEY (application_id) REFERENCES course_adjustment(id) ON DELETE CASCADE
) COMMENT = '调课申请审核历史表';


-- =====================================================
-- 四、规则配置模块 (rule-configuration-api.md)
-- =====================================================

-- 17. 排课规则表
-- 来源: rule-configuration-api.md 规则管理
CREATE TABLE IF NOT EXISTS scheduling_rule (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_key        VARCHAR(50)   NOT NULL UNIQUE COMMENT '规则业务 Key',
    rule_name       VARCHAR(255)  NOT NULL COMMENT '规则名称',
    description     TEXT          NULL COMMENT '规则描述',
    valid_date_start BIGINT      NULL COMMENT '有效期开始（毫秒时间戳）',
    valid_date_end   BIGINT      NULL COMMENT '有效期结束（毫秒时间戳）',
    created_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT = '排课规则表';

-- 18. 规则-教师关联表（M:N）
-- 来源: rule-configuration-api.md 规则的 teachers 字段
CREATE TABLE IF NOT EXISTS rule_teacher (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_key        VARCHAR(50)   NOT NULL COMMENT '规则 Key',
    teacher_name    VARCHAR(100)  NOT NULL COMMENT '教师姓名',
    UNIQUE KEY uk_rule_teacher (rule_key, teacher_name),
    CONSTRAINT fk_rule_teacher_rule FOREIGN KEY (rule_key) REFERENCES scheduling_rule(rule_key) ON DELETE CASCADE
) COMMENT = '规则-教师关联表';

-- 19. 不可用日期表
-- 来源: rule-configuration-api.md 不可用日期管理
CREATE TABLE IF NOT EXISTS unavailable_date (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    date_key        VARCHAR(50)   NOT NULL UNIQUE COMMENT '记录 Key',
    teacher_id      BIGINT        NOT NULL COMMENT '教师 ID',
    teacher_name    VARCHAR(100)  NOT NULL COMMENT '教师姓名',
    valid_date_start BIGINT      NOT NULL COMMENT '开始日期（毫秒时间戳）',
    valid_date_end   BIGINT      NOT NULL COMMENT '结束日期（毫秒时间戳）',
    reason          VARCHAR(255)  NULL COMMENT '原因',
    type            VARCHAR(20)   NOT NULL COMMENT '类型：personal/holiday/other',
    range_type      VARCHAR(20)   NOT NULL COMMENT '范围类型：single/week/month/quarter/range',
    created_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_teacher (teacher_id),
    INDEX idx_type (type),
    CONSTRAINT fk_unavail_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id)
) COMMENT = '教师不可用日期表';

-- 20. 规则权重配置表
-- 来源: rule-configuration-api.md 权重管理
CREATE TABLE IF NOT EXISTS rule_weight_config (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    weight_key      VARCHAR(50)   NOT NULL UNIQUE COMMENT '权重业务 Key',
    name            VARCHAR(255)  NOT NULL COMMENT '规则名称',
    category        VARCHAR(100)  NOT NULL COMMENT '分类（teacher/class/room/conflict）',
    current_weight  INT           NOT NULL DEFAULT 8 COMMENT '当前权重（1-10）',
    default_weight  INT           NOT NULL DEFAULT 8 COMMENT '默认权重',
    min_weight      INT           NOT NULL DEFAULT 1 COMMENT '最小值',
    max_weight      INT           NOT NULL DEFAULT 10 COMMENT '最大值',
    enabled         TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '是否启用',
    description     TEXT          NULL COMMENT '描述',
    created_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
) COMMENT = '规则权重配置表';

-- 21. 权重变更记录表
-- 来源: rule-configuration-api.md 权重变更历史
CREATE TABLE IF NOT EXISTS weight_change_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    weight_config_id BIGINT       NOT NULL COMMENT '权重配置 ID',
    rule_name       VARCHAR(255)  NOT NULL COMMENT '规则名称',
    old_value       INT           NOT NULL COMMENT '原权重',
    new_value       INT           NOT NULL COMMENT '新权重',
    change_time     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
    operator_id     VARCHAR(50)   NULL COMMENT '操作人 ID',
    operator_name   VARCHAR(100)  NULL COMMENT '操作人姓名',
    INDEX idx_config (weight_config_id),
    INDEX idx_change_time (change_time),
    CONSTRAINT fk_weight_hist_config FOREIGN KEY (weight_config_id) REFERENCES rule_weight_config(id) ON DELETE CASCADE
) COMMENT = '权重变更记录表';


-- =====================================================
-- 五、智能排课模块 (smart-scheduling-api.md)
-- =====================================================
-- （以下功能主要基于已有表的查询/组合，无需新建核心表）

-- 22. 排课操作历史表
-- 来源: smart-scheduling-api.md 操作历史
CREATE TABLE IF NOT EXISTS schedule_operation_history (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    action          VARCHAR(50)   NOT NULL COMMENT '操作类型：add/remove/move/clear',
    course_id       VARCHAR(50)   NULL COMMENT '课程业务 ID',
    course_name     VARCHAR(200)  NULL COMMENT '课程名称',
    teacher_name    VARCHAR(100)  NULL COMMENT '教师姓名',
    class_name      VARCHAR(100)  NULL COMMENT '班级名称',
    day_of_week     TINYINT       NULL COMMENT '星期（1-7）',
    period          INT           NULL COMMENT '节次',
    week            INT           NULL COMMENT '周次',
    schedule_id     BIGINT        NULL COMMENT '关联的排课记录 ID',
    operator        VARCHAR(50)   NOT NULL COMMENT '操作人',
    timestamp       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_schedule (schedule_id),
    INDEX idx_timestamp (timestamp),
    CONSTRAINT fk_hist_schedule FOREIGN KEY (schedule_id) REFERENCES schedule(schedule_id) ON DELETE SET NULL
) COMMENT = '排课操作历史表';


-- =====================================================
-- 六、初始化数据
-- =====================================================

-- 初始化时间段数据（周一~周日，每天 10 节课）
INSERT INTO time_slot (id, day_of_week, period, display_name) VALUES
('Mon-1',  1, 1, '周一第 1 节'),  ('Mon-2',  1, 2, '周一第 2 节'),
('Mon-3',  1, 3, '周一第 3 节'),  ('Mon-4',  1, 4, '周一第 4 节'),
('Mon-5',  1, 5, '周一第 5 节'),  ('Mon-6',  1, 6, '周一第 6 节'),
('Mon-7',  1, 7, '周一第 7 节'),  ('Mon-8',  1, 8, '周一第 8 节'),
('Mon-9',  1, 9, '周一第 9 节'),  ('Mon-10', 1, 10, '周一第 10 节'),

('Tue-1',  2, 1, '周二第 1 节'),  ('Tue-2',  2, 2, '周二第 2 节'),
('Tue-3',  2, 3, '周二第 3 节'),  ('Tue-4',  2, 4, '周二第 4 节'),
('Tue-5',  2, 5, '周二第 5 节'),  ('Tue-6',  2, 6, '周二第 6 节'),
('Tue-7',  2, 7, '周二第 7 节'),  ('Tue-8',  2, 8, '周二第 8 节'),
('Tue-9',  2, 9, '周二第 9 节'),  ('Tue-10', 2, 10, '周二第 10 节'),

('Wed-1',  3, 1, '周三第 1 节'),  ('Wed-2',  3, 2, '周三第 2 节'),
('Wed-3',  3, 3, '周三第 3 节'),  ('Wed-4',  3, 4, '周三第 4 节'),
('Wed-5',  3, 5, '周三第 5 节'),  ('Wed-6',  3, 6, '周三第 6 节'),
('Wed-7',  3, 7, '周三第 7 节'),  ('Wed-8',  3, 8, '周三第 8 节'),
('Wed-9',  3, 9, '周三第 9 节'),  ('Wed-10', 3, 10, '周三第 10 节'),

('Thu-1',  4, 1, '周四第 1 节'),  ('Thu-2',  4, 2, '周四第 2 节'),
('Thu-3',  4, 3, '周四第 3 节'),  ('Thu-4',  4, 4, '周四第 4 节'),
('Thu-5',  4, 5, '周四第 5 节'),  ('Thu-6',  4, 6, '周四第 6 节'),
('Thu-7',  4, 7, '周四第 7 节'),  ('Thu-8',  4, 8, '周四第 8 节'),
('Thu-9',  4, 9, '周四第 9 节'),  ('Thu-10', 4, 10, '周四第 10 节'),

('Fri-1',  5, 1, '周五第 1 节'),  ('Fri-2',  5, 2, '周五第 2 节'),
('Fri-3',  5, 3, '周五第 3 节'),  ('Fri-4',  5, 4, '周五第 4 节'),
('Fri-5',  5, 5, '周五第 5 节'),  ('Fri-6',  5, 6, '周五第 6 节'),
('Fri-7',  5, 7, '周五第 7 节'),  ('Fri-8',  5, 8, '周五第 8 节'),
('Fri-9',  5, 9, '周五第 9 节'),  ('Fri-10', 5, 10, '周五第 10 节'),

('Sat-1',  6, 1, '周六第 1 节'),  ('Sat-2',  6, 2, '周六第 2 节'),
('Sat-3',  6, 3, '周六第 3 节'),  ('Sat-4',  6, 4, '周六第 4 节'),
('Sat-5',  6, 5, '周六第 5 节'),  ('Sat-6',  6, 6, '周六第 6 节'),
('Sat-7',  6, 7, '周六第 7 节'),  ('Sat-8',  6, 8, '周六第 8 节'),
('Sat-9',  6, 9, '周六第 9 节'),  ('Sat-10', 6, 10, '周六第 10 节'),

('Sun-1',  7, 1, '周日第 1 节'),  ('Sun-2',  7, 2, '周日第 2 节'),
('Sun-3',  7, 3, '周日第 3 节'),  ('Sun-4',  7, 4, '周日第 4 节'),
('Sun-5',  7, 5, '周日第 5 节'),  ('Sun-6',  7, 6, '周日第 6 节'),
('Sun-7',  7, 7, '周日第 7 节'),  ('Sun-8',  7, 8, '周日第 8 节'),
('Sun-9',  7, 9, '周日第 9 节'),  ('Sun-10', 7, 10, '周日第 10 节');


-- =====================================================
-- 七、初始化规则权重默认数据
-- =====================================================
INSERT INTO rule_weight_config (weight_key, name, category, current_weight, default_weight, min_weight, max_weight, enabled, description) VALUES
('teacher_time_pref',   '教师时间偏好',   'teacher', 8, 8, 1, 10, 1, '尊重教师的时间偏好'),
('teacher_gap',         '教师课间间隔',   'teacher', 7, 7, 1, 10, 1, '避免教师连续上课无休息'),
('class_gap',           '班级课间间隔',   'class',   7, 7, 1, 10, 1, '避免学生连续上课无休息'),
('room_utilization',    '教室利用率',     'room',    6, 6, 1, 10, 1, '优先使用合适容量的教室'),
('teacher_no_overlap',  '教师时间不冲突', 'conflict',10, 10, 1, 10, 1, '同一教师不能同时上多节课'),
('class_no_overlap',    '班级时间不冲突', 'conflict',10, 10, 1, 10, 1, '同一班级不能同时上多节课'),
('room_no_overlap',     '教室时间不冲突', 'conflict',10, 10, 1, 10, 1, '同一教室不能同时被多课程占用'),
('prefer_morning',      '偏好上午排课',   'teacher', 5, 5, 1, 10, 1, '优先在上午安排课程');
