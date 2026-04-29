# 智能排课系统 - 数据库实体关系图 (ER Diagram)

## 图例说明

| 符号 | 含义 |
|------|------|
| `▸` | 主键 (PK) |
| `◈` | 唯一索引 |
| `◆` | 外键 (FK) |
| `├─▶` | 一对多关系 |
| `├─┤` | 多对多关系 (通过关联表) |

---

## 完整 ER 图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        智能排课系统数据库架构                        │
│                     (6大模块 · 16张表)                              │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
  模块一: 基础数据管理 (base-data-api.md)
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐     ┌──────────────────────────────┐
│        course (课程)          │     │  course_setting (课程设置)    │
├──────────────────────────────┤     ├──────────────────────────────┤
│ ▸ db_id          BIGINT  PK  │◀───◆│ course_name      VARCHAR     │
│ ◈ id             VARCHAR UQ  │     │ ▸ db_id          BIGINT  PK  │
│   name           VARCHAR NN  │     │   priority         INT NN     │
│   credits        DECIMAL NN  │     │   prerequisites      TEXT     │
│   type           VARCHAR NN  │     │   semester         VARCHAR NN │
│   total_hours    INT NN      │     │   created_time     DATETIME   │
│   created_time   DATETIME    │     │   updated_time     DATETIME   │
│   updated_time   DATETIME    │     └────────┬───────────────────────┘
└────────┬─────────────────────┘              │
         │                                    │ FK: course_setting.course_name → course.name
         │ 1:N                                │ (先修课程关联到课程表)
         ▼                                    │
┌──────────────────────────────┐              │
│      teacher (教师)           │              │
├──────────────────────────────┤              │
│ ▸ db_id          BIGINT  PK  │              │
│ ◈ id             VARCHAR UQ  │              │
│   name           VARCHAR NN  │              │
│   gender         VARCHAR NN  │              │
│   courses        TEXT         │              │
│   degree         VARCHAR NN  │              │
│   email          VARCHAR     │              │
│   phone          VARCHAR     │              │
│   created_time   DATETIME    │              │
│   updated_time   DATETIME    │              │
└──────────────────────────────┘              │
                                               │
┌──────────────────────────────┐              │
│       major (专业)            │              │
├──────────────────────────────┤              │
│ ▸ db_id          BIGINT  PK  │              │
│ ◈ id             VARCHAR UQ  │              │
│   name           VARCHAR NN  │              │
│   courses        TEXT         │              │
│   class_size     INT NN       │              │
│   duration       INT NN       │              │
│   created_time   DATETIME    │              │
│   updated_time   DATETIME    │              │
└──────────────────────────────┘              │
                                               │
┌──────────────────────────────┐     ┌─────────┴─────────────────────┐
│     calendar (学期日历)        │     │  disabled_date (禁用日期)     │
├──────────────────────────────┤     ├───────────────────────────────┤
│ ▸ calendar_id    BIGINT  PK  │───┐ │ ▸ id              BIGINT  PK  │
│   start_date     DATE NN     │   │ │ ◆ calendar_id     BIGINT  FK  │
│   end_date       DATE NN     │   │ │   date            DATE NN     │
│   created_time   DATETIME    │   │ │   remark          VARCHAR     │
│   updated_time   DATETIME    │   │ └───────────────────────────────┘
└──────────────────────────────┘   │
                                   │ 1:N
                                   ▼
                          ┌──────────────────────────────┐
                          │     disabled_date              │
                          │     (已展开在右侧)              │
                          └──────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
  模块二: 规则配置 (rule-configuration-api.md)
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐     ┌──────────────────────────────┐
│       rule (排课规则)          │     │ unavailable_date (不可用日期)  │
├──────────────────────────────┤     ├──────────────────────────────┤
│ ▸ key            VARCHAR PK  │     │ ▸ key              VARCHAR PK│
│   rule_name      VARCHAR NN  │     │   teacher_id       VARCHAR NN│
│   teachers       TEXT         │     │   teacher_name     VARCHAR NN│
│   description    TEXT NN     │     │   valid_start      BIGINT  NN│
│   valid_start    BIGINT      │     │   valid_end        BIGINT  NN│
│   valid_end      BIGINT      │     │   reason           TEXT NN   │
│   created_time   DATETIME    │     │   type             VARCHAR NN│
│   updated_time   DATETIME    │     │   range_type       VARCHAR   │
└──────────────────────────────┘     └──────────────────────────────┘

┌──────────────────────────────┐     ┌──────────────────────────────┐
│    rule_weight (规则权重)      │──1:N┤  weight_change_record        │
├──────────────────────────────┤     │     (权重变更记录)             │
│ ▸ id             VARCHAR PK  │     ├──────────────────────────────┤
│   name           VARCHAR NN  │     │ ▸ id              BIGINT  PK  │
│   category       VARCHAR NN  │     │ ◆ rule_id         VARCHAR FK  │
│   current_weight INT NN      │     │   rule_name       VARCHAR NN  │
│   default_weight INT NN      │     │   old_value       INT NN      │
│   min_weight     INT NN      │     │   new_value       INT NN      │
│   max_weight     INT NN      │     │   change_time     TIME NN     │
│   enabled        TINYINT NN  │     │   change_date     DATE NN     │
│   description    VARCHAR     │     └──────────────────────────────┘
│   updated_time   DATETIME    │     │
└──────────────────────────────┘     │
                                     │


═══════════════════════════════════════════════════════════════════════
  模块三: 课表管理 (schedule-api.md) + 拖拽排课 (drag-schedule-api.md)
═══════════════════════════════════════════════════════════════════════

         ┌──────────────────────────────┐
         │        course (课程)          │
         │        (展开见模块一)          │
         └──────────┬───────────────────┘
                    │
                    │ 1:N
                    ▼
┌──────────────────────────────┐     ┌──────────────────────────────┐
│    schedule (排课记录)         │◀───◆│ teacher (教师)               │
├──────────────────────────────┤     ├──────────────────────────────┤
│ ▸ schedule_id    BIGINT  PK  │     │ (展开见模块一)                 │
│ ◆ course_id      BIGINT  FK  │◀───◆│                               │
│ ◆ teacher_id     BIGINT  FK  │     └──────────────────────────────┘
│   class_id       BIGINT      │
│ ◆ room_id        BIGINT  FK  │◀───◆│ room (教室)                    │
│   weekday        INT NN      │     ├──────────────────────────────┤
│   start_time     TIME NN     │     │ ▸ db_id          BIGINT  PK  │
│   end_time       TIME NN     │     │ ◈ id             VARCHAR UQ  │
│   duration       INT NN      │     │   name           VARCHAR NN  │
│   weeks          TEXT NN     │     │   capacity       INT NN      │
│   color          VARCHAR     │     │   type           VARCHAR NN  │
│   student_count  INT         │     │   building       VARCHAR     │
│   created_time   DATETIME    │     │   created_time   DATETIME    │
│   updated_time   DATETIME    │     │   updated_time   DATETIME    │
└──────────────────────────────┘     └──────────────────────────────┘


┌──────────────────────────────┐     ┌──────────────────────────────┐
│  time_slot_config (时段配置)   │     │  weekday_config (星期配置)    │
├──────────────────────────────┤     ├──────────────────────────────┤
│ ▸ id             VARCHAR PK  │     │ ▸ id               INT PK    │
│   label          VARCHAR NN  │     │   name             VARCHAR NN│
│   start_time     TIME NN     │     │   is_enabled       TINYINT NN│
│   end_time       TIME NN     │     │   is_schedulable   TINYINT NN│
│   duration       INT NN      │     └──────────────────────────────┘
│   half_day_type  VARCHAR NN  │
│   is_break       TINYINT NN  │
│   break_after    INT         │
│   is_schedulable TINYINT NN  │
└──────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
  模块四: 调课申请审核 (course-adjustment-api.md)
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│          course_adjustment_application (调课申请)                   │
├──────────────────────────────────────────────────────────────────┤
│ ▸ id                   VARCHAR PK                               │
│   teacher_id           VARCHAR NN     (业务ID, 如 T001)          │
│   teacher_name         VARCHAR NN                                 │
│   department           VARCHAR NN                                 │
│ ◆ original_course_id   BIGINT FK      (关联 course.db_id)        │
│   original_course      TEXT                                   │
│   original_detail      JSON                                   │
│   target_course        TEXT                                   │
│   target_detail        JSON                                   │
│   target_weekday       INT                                      │
│   target_slot          INT                                      │
│   reason               VARCHAR(1000) NN                       │
│   status               VARCHAR(20) NN  (pending/approved/rejected/revoked)
│   urgency              VARCHAR(20) NN  (high/normal)           │
│   attachments          JSON                                   │
│   apply_time           DATETIME                                  │
│   review_comment       VARCHAR(1000)                             │
│   reviewer_id          VARCHAR                                  │
│   reviewer_name        VARCHAR(100)                             │
│   review_time          DATETIME                                  │
│   created_time         DATETIME                                  │
│   updated_time         DATETIME                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌──────────────────────────────┐
│   review_history (审核历史)     │
├──────────────────────────────┤
│ ▸ id               BIGINT PK  │
│ ◆ application_id   VARCHAR FK │
│   action           VARCHAR NN │ (submit/review/revoke)
│   action_name      VARCHAR NN │
│   operator_id      VARCHAR NN │
│   operator_name    VARCHAR NN │
│   operator_type    VARCHAR NN │ (teacher/admin)
│   comment          VARCHAR    │
│   timestamp        DATETIME   │
└──────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
  模块五: 智能排课 (smart-scheduling-api.md)
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────┐
│  schedule_history (排课历史)   │
├──────────────────────────────┤
│ ▸ id               BIGINT PK  │
│   action           VARCHAR NN │ (add/remove/update)
│   course_id        BIGINT     │
│   course_name      VARCHAR    │
│   teacher_name     VARCHAR    │
│   class_name       VARCHAR    │
│   day              VARCHAR    │ (monday~friday)
│   slot             INT        │ (1-10)
│   operator         VARCHAR    │
│   timestamp        DATETIME   │
└──────────────────────────────┘
```

---

## 关系汇总

| 关系 | 类型 | 说明 |
|------|------|------|
| `course` ──▶ `course_setting` | 1:N | 一门课程可对应多个设置 (不同学期/优先级) |
| `course_setting` ──▶ `course` | N:1 | 先修课程通过 course_name 关联 |
| `calendar` ──▶ `disabled_date` | 1:N | 一个日历包含多个禁用日期 |
| `rule_weight` ──▶ `weight_change_record` | 1:N | 一个权重配置有多次变更历史 |
| `course` ──▶ `schedule` | 1:N | 一门课程对应多个排课记录 |
| `teacher` ──▶ `schedule` | 1:N | 一位教师对应多个排课记录 |
| `room` ──▶ `schedule` | 1:N | 一间教室对应多个排课记录 |
| `course_adjustment_application` ──▶ `review_history` | 1:N | 一次申请对应多条审核历史 |
| `course` ──▶ `course_adjustment_application` | 1:N | 一门课程可对应多次调课申请 |

---

## 表统计

| 模块 | 表数 | 表名 |
|------|------|------|
| 基础数据管理 | 6 | course, course_setting, teacher, major, calendar, disabled_date |
| 规则配置 | 4 | rule, unavailable_date, rule_weight, weight_change_record |
| 课表管理+拖拽排课 | 4 | schedule, room, time_slot_config, weekday_config |
| 调课审核 | 2 | course_adjustment_application, review_history |
| 智能排课 | 1 | schedule_history |
| **合计** | **17** | |
