SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================================
-- 清空已有数据 (按外键依赖逆序删除)
-- ===========================================================
DELETE FROM `review_history`;
DELETE FROM `schedule_history`;
DELETE FROM `course_adjustment_application`;
DELETE FROM `weight_change_record`;
DELETE FROM `rule_weight`;
DELETE FROM `unavailable_date`;
DELETE FROM `rule`;
DELETE FROM `schedule`;
DELETE FROM `disabled_date`;
DELETE FROM `calendar`;
DELETE FROM `course_setting`;
DELETE FROM `course`;
DELETE FROM `major`;
DELETE FROM `teacher`;
DELETE FROM `room`;
DELETE FROM `weekday_config`;
DELETE FROM `time_slot_config`;
ALTER TABLE `course` AUTO_INCREMENT = 1;
ALTER TABLE `teacher` AUTO_INCREMENT = 1;
ALTER TABLE `room` AUTO_INCREMENT = 1;
ALTER TABLE `schedule` AUTO_INCREMENT = 1;
ALTER TABLE `calendar` AUTO_INCREMENT = 1;
ALTER TABLE `review_history` AUTO_INCREMENT = 1;
ALTER TABLE `schedule_history` AUTO_INCREMENT = 1;
ALTER TABLE `weight_change_record` AUTO_INCREMENT = 1;

-- ===========================================================
-- 示例数据 (基于 schema.sql 所有表)
-- ===========================================================

-- -----------------------------------------------------------
-- 模块一: 基础数据管理
-- -----------------------------------------------------------

-- 1.1 课程表
INSERT INTO `course` (`id`, `name`, `credits`, `type`, `total_hours`) VALUES
    ('C001', '高等数学',      5.0, '必修', 80),
    ('C002', '线性代数',      3.0, '必修', 48),
    ('C003', '数据结构',      4.0, '必修', 64),
    ('C004', '数据库原理',    3.5, '必修', 56),
    ('C005', '算法设计',      3.0, '限选', 48),
    ('C006', '计算机网络',    3.0, '必修', 48),
    ('C007', '操作系统',      4.0, '必修', 64),
    ('C008', '软件工程',      2.5, '限选', 40);

-- 1.2 课程设置表
INSERT INTO `course_setting` (`course_name`, `priority`, `prerequisites`, `semester`) VALUES
    ('高等数学',      1, '[]',              '第 1 学期'),
    ('线性代数',      2, '[]',              '第 1 学期'),
    ('数据结构',      1, '["高等数学", "线性代数"]', '第 2 学期'),
    ('数据库原理',    2, '["数据结构"]',    '第 2 学期'),
    ('算法设计',      3, '["数据结构"]',    '第 3 学期'),
    ('计算机网络',    2, '["数据结构"]',    '第 3 学期'),
    ('操作系统',      1, '["数据结构"]',    '第 2 学期'),
    ('软件工程',      4, '["数据库原理"]',  '第 4 学期');

-- 1.3 专业表
INSERT INTO `major` (`id`, `name`, `courses`, `class_size`, `duration`) VALUES
    ('M001', '计算机科学与技术', '["高等数学", "数据结构", "操作系统", "计算机网络"]', 45, 4),
    ('M002', '软件工程',         '["高等数学", "数据结构", "软件工程", "数据库原理"]', 40, 4),
    ('M003', '数据科学与大数据技术', '["高等数学", "线性代数", "算法设计"]',           30, 4);

-- 1.4 教师表
INSERT INTO `teacher` (`id`, `name`, `gender`, `courses`, `degree`, `email`, `phone`) VALUES
    ('T001', '张三', '男', '["数据结构", "算法设计"]',      '博士研究生', 'zhangsan@school.edu.cn',  '13800000001'),
    ('T002', '李四', '女', '["数据库原理", "软件工程"]',     '硕士研究生', 'lisi@school.edu.cn',      '13800000002'),
    ('T003', '王五', '男', '["高等数学", "线性代数"]',       '博士研究生', 'wangwu@school.edu.cn',    '13800000003'),
    ('T004', '赵六', '男', '["计算机网络", "操作系统"]',     '博士研究生', 'zhaoliu@school.edu.cn',   '13800000004'),
    ('T005', '孙七', '女', '["数据结构", "数据库原理"]',     '硕士研究生', 'sunqi@school.edu.cn',     '13800000005');

-- 1.5 学期日历表
INSERT INTO `calendar` (`calendar_id`, `start_date`, `end_date`) VALUES
    (1, '2026-02-23', '2026-07-10'),
    (2, '2026-09-01', '2027-01-15');

-- 1.6 禁用日期表
INSERT INTO `disabled_date` (`calendar_id`, `date`, `remark`) VALUES
    (1, '2026-05-01', '劳动节'),
    (1, '2026-05-02', '劳动节'),
    (1, '2026-05-03', '劳动节'),
    (2, '2026-10-01', '国庆节'),
    (2, '2026-10-02', '国庆节'),
    (2, '2026-10-03', '国庆节');

-- -----------------------------------------------------------
-- 模块二: 规则配置
-- -----------------------------------------------------------

-- 2.1 规则表
INSERT INTO `rule` (`key`, `rule_name`, `teachers`, `description`, `valid_start`, `valid_end`) VALUES
    ('RULE_NO_CONFLICT',     '教师时间不冲突',        '[]',          '同一教师不能在同一时间段排两门课',  NULL, NULL),
    ('RULE_NO_ROOM_CONFLICT','教室时间不冲突',        '[]',          '同一教室不能在同一时间段被重复占用', NULL, NULL),
    ('RULE_MAX_DAILY',       '每日最大课时限制',       '["T001","T002"]', '教师每天排课不超过指定节数',       NULL, NULL),
    ('RULE_PREFERENCE',      '教师时间偏好',          '["T003","T005"]', '优先在指定时间段排课',              NULL, NULL);

-- 2.2 教师不可用日期表
INSERT INTO `unavailable_date` (`key`, `teacher_id`, `teacher_name`, `valid_start`, `valid_end`, `reason`, `type`, `range_type`) VALUES
    ('UA001', 'T001', '张三', 1767254400000, 1767427200000, '参加学术会议', 'personal', 'single'),
    ('UA002', 'T003', '王五', 1767686400000, 1768291200000, '出差一周',     'other',    'week'),
    ('UA003', 'T005', '孙七', 1769846400000, 1770451200000, '病假',         'personal', 'range');

-- 2.3 规则权重表
INSERT INTO `rule_weight` (`id`, `name`, `category`, `current_weight`, `default_weight`, `min_weight`, `max_weight`, `enabled`, `description`) VALUES
    ('RW01', '教师不冲突',        'teacher', 10, 10, 0, 10, 1, '硬性约束：教师时间绝对不可冲突'),
    ('RW02', '教室不冲突',        'room',    10, 10, 0, 10, 1, '硬性约束：教室时间绝对不可冲突'),
    ('RW03', '班级不冲突',        'class',   10, 10, 0, 10, 1, '硬性约束：班级时间绝对不可冲突'),
    ('RW04', '教师时间偏好',      'teacher',  5,  5, 0, 10, 1, '软性约束：优先满足教师时间偏好'),
    ('RW05', '最大日均课时',      'teacher',  7,  7, 0, 10, 1, '软性约束：控制每日最大课时数'),
    ('RW06', '课程优先级',        'course',   6,  6, 0, 10, 1, '软性约束：高优先级课程优先排课'),
    ('RW07', '教室容量匹配',      'room',     8,  8, 0, 10, 1, '软性约束：教室容量应满足学生人数');

-- 2.4 权重变更记录表
INSERT INTO `weight_change_record` (`rule_id`, `rule_name`, `old_value`, `new_value`, `change_time`, `change_date`) VALUES
    ('RW04', '教师时间偏好', 3, 5, '14:30:00', '2026-03-01'),
    ('RW07', '教室容量匹配', 5, 8, '10:15:00', '2026-03-15');

-- -----------------------------------------------------------
-- 模块三: 课表管理 + 拖拽排课
-- -----------------------------------------------------------

-- 3.1 时段配置表
INSERT INTO `time_slot_config` (`id`, `label`, `start_time`, `end_time`, `duration`, `half_day_type`, `is_break`, `break_after`, `is_schedulable`) VALUES
    ('SLOT01', '第 1 节',  '08:00', '08:45', 45, 'morning',   0, NULL, 1),
    ('SLOT02', '第 2 节',  '08:55', '09:40', 45, 'morning',   0, 10,   1),
    ('SLOT03', '第 3 节',  '10:00', '10:45', 45, 'morning',   0, NULL, 1),
    ('SLOT04', '第 4 节',  '10:55', '11:40', 45, 'morning',   0, 20,   1),
    ('SLOT05', '第 5 节',  '14:00', '14:45', 45, 'afternoon', 0, NULL, 1),
    ('SLOT06', '第 6 节',  '14:55', '15:40', 45, 'afternoon', 0, 10,   1),
    ('SLOT07', '第 7 节',  '16:00', '16:45', 45, 'afternoon', 0, NULL, 1),
    ('SLOT08', '第 8 节',  '16:55', '17:40', 45, 'afternoon', 0, 0,    1),
    ('SLOT09', '第 9 节',  '19:00', '19:45', 45, 'evening',   0, NULL, 1),
    ('SLOT10', '第 10 节', '19:55', '20:40', 45, 'evening',   0, 0,    1);

-- 3.2 星期配置表
INSERT INTO `weekday_config` (`id`, `name`, `is_enabled`, `is_schedulable`) VALUES
    (1, '周一', 1, 1),
    (2, '周二', 1, 1),
    (3, '周三', 1, 1),
    (4, '周四', 1, 1),
    (5, '周五', 1, 1),
    (6, '周六', 1, 0),
    (7, '周日', 1, 0);

-- 3.4 教室表 (先于排课记录插入，因为有外键)
INSERT INTO `room` (`id`, `name`, `capacity`, `type`, `building`) VALUES
    ('R001', 'A101', 60,  'NORMAL',        'A教学楼'),
    ('R002', 'A102', 80,  'NORMAL',        'A教学楼'),
    ('R003', 'A201', 45,  'MULTIMEDIA',    'A教学楼'),
    ('R004', 'B101', 60,  'COMPUTER',      'B实验楼'),
    ('R005', 'B102', 40,  'LAB',           'B实验楼'),
    ('R006', 'C101', 150, 'LECTURE_HALL',  'C综合楼'),
    ('R007', 'C102', 120, 'LECTURE_HALL',  'C综合楼');

-- 3.3 排课记录表
INSERT INTO `schedule` (`course_id`, `teacher_id`, `class_id`, `room_id`, `weekday`, `start_time`, `end_time`, `duration`, `weeks`, `color`, `student_count`) VALUES
    (3, 1, 'CL01', 1, 1, '08:00', '08:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#1890ff', 40),
    (1, 3, 'CL01', 2, 1, '10:00', '10:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#52c41a', 40),
    (3, 1, 'CL01', 1, 2, '08:00', '08:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#1890ff', 40),
    (4, 2, 'CL03', 4, 2, '14:00', '14:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#fa8c16', 35),
    (7, 4, 'CL02', 3, 3, '08:00', '08:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#722ed1', 40),
    (2, 3, 'CL02', 2, 3, '10:00', '10:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#13c2c2', 40),
    (6, 4, 'CL01', 1, 4, '08:00', '08:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#eb2f96', 40),
    (1, 3, 'CL02', 2, 4, '14:00', '14:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#52c41a', 40),
    (5, 1, 'CL01', 1, 5, '08:00', '08:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#f5222d', 40),
    (8, 2, 'CL03', 6, 5, '19:00', '19:45',  45, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]', '#faad14', 35);

-- -----------------------------------------------------------
-- 模块四: 调课申请审核
-- -----------------------------------------------------------

-- 4.1 调课申请表
INSERT INTO `course_adjustment_application` (`id`, `teacher_id`, `teacher_name`, `department`, `original_course_id`,
    `original_course`, `original_detail`, `target_course`, `target_detail`, `target_weekday`, `target_slot`,
    `reason`, `status`, `urgency`, `attachments`, `apply_time`, `review_comment`, `reviewer_id`, `reviewer_name`, `review_time`) VALUES
    ('T2026001', 'T001', '张三', '计算机学院', 3,
     '数据结构 周一 第1节',
     '{"weekday":1,"startTime":"08:00","endTime":"08:45","weeks":[1,2,3],"room":"A101","teacher":"张三","course":"数据结构"}',
     '数据结构 周二 第5节',
     '{"weekday":2,"startTime":"14:00","endTime":"14:45","weeks":[1,2,3],"room":"B101","teacher":"张三","course":"数据结构"}',
     2, 5, '原时间段与全国学术会议冲突，需参会汇报论文，申请将前三周的数据结构调至周二下午',
     'approved', 'high',
     '["会议邀请函.pdf", "出差审批表.pdf"]',
     '2026-03-01 09:00:00', '同意调课，已协调B101教室', 'ADMIN001', '教务处管理员', '2026-03-01 14:00:00'),
    ('T2026002', 'T003', '王五', '数学学院', 1,
     '高等数学 周一 第3节',
     '{"weekday":1,"startTime":"10:00","endTime":"10:45","weeks":[4,5,6],"room":"A102","teacher":"王五","course":"高等数学"}',
     '高等数学 周三 第5节',
     '{"weekday":3,"startTime":"14:00","endTime":"14:45","weeks":[4,5,6],"room":"A102","teacher":"王五","course":"高等数学"}',
     3, 5, '突发身体不适需就医治疗，预计休养一周，申请将第4-6周高等数学调至周三下午',
     'pending', 'normal',
     '["医院诊断证明.pdf"]',
     '2026-03-10 08:30:00', NULL, NULL, NULL, NULL),
    ('T2026003', 'T002', '李四', '计算机学院', 4,
     '数据库原理 周二 第5节',
     '{"weekday":2,"startTime":"14:00","endTime":"14:45","weeks":[7,8,9],"room":"B101","teacher":"李四","course":"数据库原理"}',
     '数据库原理 周四 第3节',
     '{"weekday":4,"startTime":"10:00","endTime":"10:45","weeks":[7,8,9],"room":"A201","teacher":"李四","course":"数据库原理"}',
     4, 3, 'B101教室投影仪损坏维修中，申请更换至A201多媒体教室并调整时间段',
     'rejected', 'normal',
     '["教室设备故障报告.pdf"]',
     '2026-03-15 16:00:00', '新时间段A201教室已被占用，请重新选择时间段或教室', 'ADMIN001', '教务处管理员', '2026-03-16 09:00:00');

-- 4.2 审核历史记录表
INSERT INTO `review_history` (`application_id`, `action`, `action_name`, `operator_id`, `operator_name`, `operator_type`, `comment`, `timestamp`) VALUES
    ('T2026001', 'submit', '提交申请', 'T001', '张三', 'teacher', '因学术会议申请调课', '2026-03-01 09:00:00'),
    ('T2026001', 'review', '审核通过', 'ADMIN001', '教务处管理员', 'admin', '同意调课', '2026-03-01 14:00:00'),
    ('T2026002', 'submit', '提交申请', 'T003', '王五', 'teacher', '身体不适需要请假', '2026-03-10 08:30:00'),
    ('T2026003', 'submit', '提交申请', 'T002', '李四', 'teacher', '教室设备故障', '2026-03-15 16:00:00'),
    ('T2026003', 'review', '审核拒绝', 'ADMIN001', '教务处管理员', 'admin', '新时间段教室已被占用', '2026-03-16 09:00:00');

-- -----------------------------------------------------------
-- 模块五: 智能排课 - 排课操作历史
-- -----------------------------------------------------------

-- 5.1 排课操作历史表
INSERT INTO `schedule_history` (`action`, `course_id`, `course_name`, `teacher_name`, `class_name`, `day`, `slot`, `operator`, `timestamp`) VALUES
    ('add',   3, '数据结构', '张三', 'CL01', 'monday',    1, '系统', '2026-03-01 08:00:00'),
    ('add',   1, '高等数学', '王五', 'CL01', 'monday',    3, '系统', '2026-03-01 08:00:00'),
    ('add',   7, '操作系统', '赵六', 'CL02', 'wednesday', 1, '系统', '2026-03-01 08:00:00'),
    ('update',3, '数据结构', '张三', 'CL01', 'tuesday',   1, '张三', '2026-03-02 10:00:00'),
    ('add',   4, '数据库原理', '李四', 'CL03', 'tuesday',  5, '系统', '2026-03-01 08:00:00'),
    ('remove',8, '软件工程', '李四', 'CL03', 'friday',    9, '李四', '2026-03-05 14:00:00');

SET FOREIGN_KEY_CHECKS = 1;
