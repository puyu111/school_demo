-- 初始化算法规则权重
-- 使用 INSERT IGNORE 避免重复插入

INSERT IGNORE INTO rule_weight (id, name, category, current_weight, default_weight, min_weight, max_weight, enabled, description)
VALUES
    ('teacher_conflict', '教师冲突', 'hard', 1000, 1000, 500, 5000, 1, '同一教师在同一时间段有多门课的冲突惩罚'),
    ('room_conflict', '教室冲突', 'hard', 1000, 1000, 500, 5000, 1, '同一教室在同一时间段有多门课的冲突惩罚'),
    ('class_conflict', '班级冲突', 'hard', 1000, 1000, 500, 5000, 1, '同一班级在同一时间段有多门课的冲突惩罚'),
    ('teacher_unavailable', '教师不可用', 'hard', 500, 500, 200, 2000, 1, '教师在不可用时段排课的惩罚'),
    ('room_capacity', '教室容量', 'soft', 50, 50, 10, 200, 1, '学生数超过教室容量的惩罚'),
    ('course_spread', '课程分散度', 'soft', 20, 20, 5, 100, 1, '同一课程的不同课时安排在连续天的惩罚'),
    ('time_preference', '时间偏好', 'soft', 10, 10, 0, 50, 1, '课程类型与时间段匹配度惩罚'),
    ('load_balance', '教师负载', 'soft', 15, 15, 5, 100, 1, '教师每日课时分布不均匀的惩罚');
