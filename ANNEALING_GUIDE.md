# 模拟退火自动排课算法 — 调用逻辑与使用说明

## 目录

1. [算法概述](#1-算法概述)
2. [核心组件架构](#2-核心组件架构)
3. [算法调用流程](#3-算法调用流程)
4. [数据流转详解](#4-数据流转详解)
5. [规则评估体系](#5-规则评估体系)
6. [API 接口参考](#6-api-接口参考)
7. [请求/响应数据结构](#7-请求响应数据结构)
8. [退火参数调优指南](#8-退火参数调优指南)
9. [使用示例](#9-使用示例)
10. [前端集成指南](#10-前端集成指南)
11. [数据库初始化](#11-数据库初始化)
12. [常见问题与排查](#12-常见问题与排查)

---

## 1. 算法概述

### 1.1 什么是模拟退火

模拟退火（Simulated Annealing, SA）是一种受金属退火过程启发的全局优化算法。在排课问题中，SA 能在合理时间内找到接近最优的课表方案，有效平衡多条排课约束。

### 1.2 核心思想

```
初始解 → 随机微调(邻域解) → 评估代价 → Metropolis准则接受/拒绝 → 降温 → 重复
```

- **接受更优解**：新解代价更低时，一定接受
- **以概率接受劣解**：`P = exp(-ΔCost / T)`，避免陷入局部最优
- **温度递减**：随温度降低，接受劣解的概率逐渐减小，最终收敛
- **多次重启**：执行多次退火取最优解，提高全局搜索能力

### 1.3 排课问题建模

将排课问题建模为**约束优化问题**：

- **解空间**：所有可能的课程-时间段-教室分配方案
- **目标函数**：`总代价 = Σ(规则权重[i] × 违规次数[i])`，越小越好
- **约束**：分为硬规则（必须满足）和软规则（尽量优化）

---

## 2. 核心组件架构

### 2.1 文件结构

```
src/main/java/org/example/school_demo/
├── algorithm/                          # 算法核心层
│   ├── ScheduleSlot.java              # 排课单元（课程-时间-教室分配）
│   ├── Solution.java                  # 解的表示（排课单元列表 + 代价值）
│   ├── SAConfig.java                  # 退火参数配置
│   └── RuleEvaluator.java            # 规则评估器（8条规则，含 time_preference）
├── service/
│   └── SimulatedAnnealingService.java # 退火服务（主入口 + 数据加载 + 持久化）
├── controller/
│   └── ScheduleAlgorithmController.java # REST API 控制器
├── entity/                            # JPA 实体（含以下算法相关表）
│   ├── CourseEntity.java              # 课程（含 type 字段用于时间偏好）
│   ├── TeacherEntity.java             # 教师（含 courses JSON 用于课程-教师映射）
│   ├── RoomEntity.java                # 教室（含 capacity 用于容量检测）
│   ├── CourseSettingEntity.java       # 课程设置（含 priority 排课优先级）
│   ├── MajorEntity.java               # 专业（含 class_size 学生数、courses 课程列表）
│   ├── CalendarEntity.java            # 学期日历
│   ├── DisabledDateEntity.java        # 禁用日期（节假日等）
│   ├── TimeSlotConfigEntity.java      # 时段配置
│   ├── WeekDayConfigEntity.java       # 工作日配置
│   ├── RuleWeightEntity.java          # 规则权重
│   └── UnavailableDateEntity.java     # 教师不可用日期
├── repository/                        # JPA 数据访问层
├── controller/
│   └── ScheduleAlgorithmController.java # REST API 控制器
└── dto/algorithm/
    ├── request/AutoScheduleRequest.java   # 请求 DTO
    └── response/AutoScheduleResultVO.java # 响应 VO
```

### 2.2 组件职责

| 组件 | 职责 | 关键方法 |
|------|------|----------|
| `ScheduleSlot` | 表示一个排课单元：课程+教师+班级+教室+时间段 | `deepCopy()` |
| `Solution` | 一组排课单元的集合，附带总代价和各规则得分 | `deepCopy()` |
| `SAConfig` | 退火参数：初始温度、冷却率、终止温度等 | `defaults()` |
| `RuleEvaluator` | 评估解的代价，计算8条规则的违规数 | `calculateCost(Solution)` |
| `SimulatedAnnealingService` | 编排整个流程：数据加载→初始解→退火→持久化 | `autoSchedule(request, persist)` |
| `ScheduleAlgorithmController` | REST 接口层，暴露3个API端点 | `autoSchedule()`, `preview()`, `getRules()` |

### 2.3 依赖关系

```
Controller
    │
    ▼
SimulatedAnnealingService
    │
    ├──► RuleEvaluator ◄── SAConfig, ScheduleSlot, Solution
    │
    ├──► Repository 层 (ScheduleRepository, CourseRepository, TeacherRepository, RoomRepository, ...)
    │
    └──► Entity 层 (ScheduleEntity, CourseEntity, TeacherEntity, RoomEntity, TimeSlotConfigEntity, ...)
```

---

## 3. 算法调用流程

### 3.1 完整调用链

```
前端/API 调用
    │
    ▼
POST /api/algorithm/auto-schedule
    │
    ▼
ScheduleAlgorithmController.autoSchedule()
    │
    ▼
SimulatedAnnealingService.autoSchedule(request, persist=true)
    │
    ├── [1] 参数校验 ──── week >= 1
    │
    ├── [2] 加载输入数据 ──── loadInputData()
    │       ├── 从 time_slot_config 表加载时间段（仅可排课、非课间休息）
    │       ├── 从 weekday_config 表加载启用的工作日
    │       ├── 从 calendar + disabled_date 表排除禁用日期对应的工作日
    │       ├── 从 room 表加载所有教室
    │       ├── 从 course 表加载课程（可指定 courseIds）
    │       ├── 从 course_setting 表加载优先级（决定排课顺序）
    │       ├── 从 major 表加载专业数据（class_size→学生数, courses→班级关联）
    │       ├── 构建课程-教师映射（优先使用 teacher.courses JSON 字段）
    │       ├── 生成 CourseSession 列表（含 priority/studentCount/courseType）
    │       ├── 从 rule_weight 表加载规则权重（可被 ruleOverrides 覆盖）
    │       ├── 从 unavailable_date + calendar 表精确计算教师不可用时段
    │       └── 创建 RuleEvaluator 实例（传入 courseTypeMap + courseStudentCountMap）
    │
    ├── [3] 多次重启退火 ──── for restart in 1..restartCount
    │       ├── 构建初始解（贪心策略）
    │       │       ├── 按优先级(course_setting.priority) + 课时长度降序排列
    │       │       ├── 为每个 CourseSession 寻找无冲突的时间+教室
    │       │       └── 无法放置时强制随机放置（会产生冲突）
    │       │
    │       └── 运行退火循环 ──── runAnnealing()
    │               ├── while 温度 > minTemp 且 迭代 < maxIterations:
    │               │       ├── 生成邻域解（70%换时间, 30%换教室）
    │               │       ├── 计算新解代价
    │               │       ├── Metropolis 准则判断接受/拒绝
    │               │       ├── 更新全局最优解
    │               │       └── 降温: temperature *= coolingRate
    │               └── 返回最优解 + 统计信息
    │
    ├── [4] 选择所有重启中的最优解
    │
    ├── [5] 持久化（persist=true 时）
    │       ├── 删除该周旧排课记录
    │       └── 分批保存新记录（每批50条）
    │
    └── [6] 构建响应 ──── 转换为 CourseVO 列表 + 统计信息
```

### 3.2 退火循环伪代码

```python
function runAnnealing(initial_solution, config):
    current = initial_solution.copy()
    best = initial_solution.copy()
    temperature = config.initialTemp

    while temperature > config.minTemp and iterations < config.maxIterations:
        # 1. 生成邻域解
        neighbor = current.copy()
        random_slot = neighbor.slots[random_index]
        if random() < 0.7:
            # 70% 概率：换时间段
            random_slot.weekday = random_enabled_weekday()
            random_slot.startSlotIndex = random_slot_index()
        else:
            # 30% 概率：换教室
            random_slot.roomId = random_room_id()

        # 2. 计算代价差
        delta_cost = evaluate(neighbor) - evaluate(current)

        # 3. Metropolis 准则
        if delta_cost < 0:           # 更优解 → 一定接受
            current = neighbor
        elif random() < exp(-δ/T):   # 劣解 → 以概率接受
            current = neighbor
        # 否则拒绝，保持 current 不变

        # 4. 更新全局最优
        if current.cost < best.cost:
            best = current.copy()

        # 5. 降温
        temperature *= config.coolingRate
        iterations++

    return best
```

### 3.3 邻域解生成策略

| 操作 | 概率 | 说明 |
|------|------|------|
| 换时间段 | 70% | 随机选择一个排课单元，更改其星期几和起始时段索引 |
| 换教室 | 30% | 随机选择一个排课单元，更改其教室 ID |

---

## 4. 数据流转详解

### 4.1 输入数据

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────────────┐
│ time_slot_config │     │ weekday_config   │     │    room     │     │   calendar +      │
│ (时间段配置)      │     │ (工作日配置)       │     │  (教室表)    │     │  disabled_date   │
└────────┬────────┘     └────────┬─────────┘     └──────┬──────┘     └────────┬─────────┘
         │                       │                       │                      │
         ▼                       ▼                       ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           InputData (内存数据结构)                                         │
│  - timeSlots: 可排课的时间段列表                                                           │
│  - enabledWeekdays: 启用的工作日列表（已排除禁用日期对应的工作日）                            │
│  - roomMap: 教室ID → RoomEntity                                                         │
│  - roomIds: 教室ID列表                                                                   │
│  - courseSessions: 待排课的 CourseSession 列表（含 priority/studentCount/courseType）      │
│  - evaluator: RuleEvaluator 实例（含 courseTypeMap + courseStudentCountMap）               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
         ▲               ▲               ▲               ▲               ▲
         │               │               │               │               │
┌────────┴───┐   ┌───────┴──────┐  ┌─────┴──────────┐  ┌┴────────┐  ┌───┴────────┐
│   course    │   │   teacher    │  │ rule_weight     │  │ course  │  │   major    │
│  (课程表)    │   │  (教师表)     │  │ (规则权重表)     │  │_setting │  │  (专业表)   │
└─────────────┘   └──────────────┘  └────────────────┘  └─────────┘  └────────────┘
```

### 4.2 CourseSession 生成逻辑

每门课程根据 `totalHours / 16`（每周学时常数）计算每周需要排几次课：

```
课程 "高等数学" (totalHours=90, 16周学期) → 每周 90/16 ≈ 5 课时 → 生成 5 个 CourseSession
课程 "大学英语" (totalHours=45, 16周学期) → 每周 45/16 ≈ 2 课时 → 生成 2 个 CourseSession
```

每个 CourseSession 包含：

| 字段 | 来源 | 说明 |
|------|------|------|
| `courseId` | course.dbId | 课程数据库 ID |
| `courseName` | course.name | 课程名称 |
| `teacherId` | teacher.dbId | 教师 ID（详见 11.3 课程-教师映射） |
| `classId` | major.courses | 班级 ID（当前为 null，预留） |
| `durationSlots` | 固定为 1 | 占用连续时间段数 |
| `priority` | course_setting.priority | 排课优先级（值越小越优先） |
| `courseType` | course.type | 课程类型（必修/选修/实验等，用于 time_preference 规则） |
| `studentCount` | major.class_size | 学生人数（用于 room_capacity 规则评估） |

### 4.3 输出数据

```
Solution (最优解)
    │
    ├── slots: List<ScheduleSlot>
    │       ├── courseId, teacherId, classId, roomId
    │       ├── weekday (1-7)
    │       ├── startSlotIndex (0-based)
    │       └── durationSlots
    │
    ├── cost: double (总代价)
    │
    └── ruleScores: Map<String, Double> (各规则违规数)

    ▼ 转换

AutoScheduleResultVO
    ├── schedules: List<CourseVO> (排课记录列表)
    ├── totalCost: double
    ├── iterations: int
    ├── ruleScores: Map<String, Double>
    ├── executionTimeMs: long
    ├── acceptedCount: int
    ├── rejectedCount: int
    └── message: String
```

---

## 5. 规则评估体系

### 5.1 规则总览

规则评估器 (`RuleEvaluator`) 对一个解评估 8 条规则，计算每条规则的违规次数，然后加权求和得到总代价。

```
总代价 = Σ (规则权重[ruleId] × 违规次数[ruleId])
```

### 5.2 硬规则（Hard）— 必须满足

| 规则 ID | 名称 | 默认权重 | 评估逻辑 |
|---------|------|----------|----------|
| `teacher_conflict` | 教师冲突 | 1000 | 同一教师在同一 weekday 的时间段有重叠 → 每对冲突 +1 |
| `room_conflict` | 教室冲突 | 1000 | 同一教室在同一 weekday 的时间段有重叠 → 每对冲突 +1 |
| `class_conflict` | 班级冲突 | 1000 | 同一班级在同一 weekday 的时间段有重叠 → 每对冲突 +1 |
| `teacher_unavailable` | 教师不可用 | 500 | 教师在不可用时段排课 → 每个重叠时段 +1 |

**教师不可用时段计算（日期范围相交，而非全标记）：**
```java
// 1. 从 calendar 表获取学期起始日，计算排课周的实际日期范围
LocalDate weekStart = semesterStart.plusWeeks(week - 1);
LocalDate weekEnd = weekStart.plusDays(6);

// 2. 从 unavailable_date 表读取教师不可用日期段
//    与排课周取交集，仅标记重叠日期内对应的 weekday 时段
LocalDate intersectStart = max(udStart, weekStart);
LocalDate intersectEnd   = min(udEnd, weekEnd);
if (intersectStart.isAfter(intersectEnd)) continue;  // 无交集，跳过

// 3. 交集内的每一天对应一个 weekday，标记该天所有 slot 为不可用
for (LocalDate d = intersectStart; d <= intersectEnd; d = d.plusDays(1)) {
    int weekday = d.getDayOfWeek().getValue();  // Mon=1 ... Sun=7
    for (int slotIdx = 0; slotIdx < totalSlots; slotIdx++) {
        unavailableSlots.add(weekday * 100 + slotIdx);
    }
}
```

**冲突检测逻辑**（时间段重叠判断）：
```java
// 两个 slot 时间重叠的条件：
// 1. 同一 weekday
// 2. [startSlotIndex, startSlotIndex + durationSlots) 有交集
boolean overlap = (a.startSlotIndex < bEnd) && (aEnd > b.startSlotIndex);
```

### 5.3 软规则（Soft）— 尽量优化

| 规则 ID | 名称 | 默认权重 | 评估逻辑 |
|---------|------|----------|----------|
| `room_capacity` | 教室容量 | 50 | 教室容量 < 该课程学生数（来自 `major.class_size`）→ 每节 +1 |
| `course_spread` | 课程分散度 | 20 | 同一课程的不同课时排在连续天 → 每对连续天 +1 |
| `time_preference` | 时间偏好 | 10 | 课程类型与时段匹配度惩罚（见下方详细逻辑） |
| `load_balance` | 教师负载 | 15 | 教师每日课时标准差 × 10 / 教师数 |

**`room_capacity` 详细逻辑：**
```java
int studentCount = courseStudentCountMap.getOrDefault(courseId, 40);
if (room.getCapacity() < studentCount) {
    penalty += 1;  // 教室容量不足该课程的学生数
}
```
学生数来源优先级：`major.class_size` → 默认 40

**`time_preference` 详细逻辑（已实现）：**
```java
// 根据课程类型匹配时段特征（halfDayType: "morning" / "afternoon"）
String courseType = courseTypeMap.get(courseId);

if (courseType.contains("必修")) {
    if ("morning".equals(halfDayType)) penalty -= 1;   // 必修课偏好上午
    else penalty += 1;                                    // 下午排必修课受罚
} else if (courseType.contains("实验") || courseType.contains("实践")) {
    if ("afternoon".equals(halfDayType)) penalty -= 1; // 实验课偏好下午
    else penalty += 1;                                    // 上午排实验课受罚
} else if (courseType.contains("选修")) {
    if ("morning".equals(halfDayType)) penalty += 1;   // 选修课偏好下午
    else penalty -= 1;
}
```

### 5.4 教师不可用时段编码

教师不可用时段使用复合键编码：`weekday * 100 + slotIndex`

例如：周三（weekday=3）第 2 个时段（slotIndex=2）→ 编码为 `302`

---

## 6. API 接口参考

### 6.1 执行自动排课

**POST** `/api/algorithm/auto-schedule`

执行模拟退火排课并将结果写入数据库。**会清除目标周次的所有旧排课记录。**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `week` | Integer | 是 | 排课周次（≥1） |
| `courseIds` | List\<Long\> | 否 | 指定课程 ID 列表，为空则排全部课程 |
| `config` | SAConfig | 否 | 自定义退火参数，为空则使用默认值 |
| `ruleOverrides` | Map\<String, Integer\> | 否 | 临时覆盖规则权重（不影响数据库） |

### 6.2 预览排课结果

**POST** `/api/algorithm/preview`

与 `auto-schedule` 相同的请求格式，但**不写入数据库**。建议在正式排课前先预览。

### 6.3 获取规则列表

**GET** `/api/algorithm/rules`

返回当前所有算法规则及其权重配置（从 `rule_weight` 表读取）。

---

## 7. 请求/响应数据结构

### 7.1 请求体 (AutoScheduleRequest)

```json
{
    "week": 1,
    "courseIds": [1, 2, 3],
    "config": {
        "initialTemp": 100,
        "coolingRate": 0.995,
        "minTemp": 0.1,
        "maxIterations": 100000,
        "restartCount": 3,
        "seed": null
    },
    "ruleOverrides": {
        "teacher_conflict": 2000,
        "load_balance": 30
    }
}
```

**config (SAConfig) 参数说明：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `initialTemp` | double | 100.0 | 初始温度，越大搜索范围越广 |
| `coolingRate` | double | 0.995 | 冷却速率 (0,1)，越接近 1 冷却越慢 |
| `minTemp` | double | 0.1 | 终止温度，低于此值停止迭代 |
| `maxIterations` | int | 100000 | 最大迭代次数（保底限制） |
| `restartCount` | int | 3 | 重启次数，取所有重启中的最优解 |
| `seed` | Long | null | 随机种子，null 表示完全随机 |

### 7.2 响应体 (AutoScheduleResultVO)

```json
{
    "code": 200,
    "message": "自动排课完成",
    "data": {
        "schedules": [
            {
                "courseName": "高等数学",
                "teacherName": "张老师",
                "teacherId": "1",
                "classId": null,
                "className": "未分配",
                "roomName": "A101",
                "roomId": "1",
                "weekDay": 1,
                "startTime": "08:00",
                "endTime": "08:45",
                "duration": 45,
                "color": "#4FC3F7",
                "studentCount": 40
            }
        ],
        "totalCost": 0.0,
        "iterations": 50000,
        "ruleScores": {
            "teacher_conflict": 0.0,
            "room_conflict": 0.0,
            "class_conflict": 0.0,
            "teacher_unavailable": 0.0,
            "room_capacity": 0.0,
            "course_spread": 2.0,
            "time_preference": 0.0,
            "load_balance": 1.5
        },
        "executionTimeMs": 3500,
        "acceptedCount": 25000,
        "rejectedCount": 25000,
        "message": "排课完成，无硬冲突，共 48 条排课记录"
    },
    "timestamp": 1714500000000
}
```

**响应字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `schedules` | List\<CourseVO\> | 排课结果列表 |
| `totalCost` | double | 最终总代价（越小越好，0 表示无任何违规） |
| `iterations` | int | 所有重启的总迭代次数 |
| `ruleScores` | Map | 各规则的违规次数（ruleId → violationCount） |
| `executionTimeMs` | long | 执行耗时（毫秒） |
| `acceptedCount` | int | 被接受的邻域解数量 |
| `rejectedCount` | int | 被拒绝的邻域解数量 |
| `message` | String | 结果描述（含硬冲突数量提示） |

---

## 8. 退火参数调优指南

### 8.1 参数影响

| 参数 | 增大效果 | 减小效果 |
|------|----------|----------|
| `initialTemp` | 搜索范围更广，接受更多劣解 | 收敛更快，但可能陷入局部最优 |
| `coolingRate` | 冷却更慢，解质量更好，耗时更长 | 冷却更快，速度快但质量下降 |
| `minTemp` | 迭代次数更多 | 提前终止 |
| `maxIterations` | 更多搜索机会 | 可能未收敛就停止 |
| `restartCount` | 更高概率找到全局最优 | 速度快但可能错过最优解 |

### 8.2 推荐配置

**快速预览（开发调试）**
```json
{
    "config": {
        "initialTemp": 50,
        "coolingRate": 0.95,
        "maxIterations": 20000,
        "restartCount": 1
    }
}
```

**标准排课（日常使用）**
```json
{
    "config": {
        "initialTemp": 100,
        "coolingRate": 0.995,
        "maxIterations": 100000,
        "restartCount": 3
    }
}
```

**高质量排课（正式排课）**
```json
{
    "config": {
        "initialTemp": 200,
        "coolingRate": 0.998,
        "maxIterations": 200000,
        "restartCount": 5
    }
}
```

### 8.3 冷却速率与迭代次数的关系

冷却速率决定了温度从初始值降到终止值需要多少次迭代：

```
迭代次数 ≈ ln(minTemp / initialTemp) / ln(coolingRate)
```

| coolingRate | 从 100 降到 0.1 所需迭代数 |
|-------------|---------------------------|
| 0.95 | ~90 次 |
| 0.99 | ~459 次 |
| 0.995 | ~919 次 |
| 0.998 | ~2300 次 |
| 0.999 | ~4603 次 |

---

## 9. 使用示例

### 9.1 一键排课（最简调用）

```bash
curl -X POST http://localhost:8081/api/algorithm/auto-schedule \
  -H "Content-Type: application/json" \
  -d '{"week": 1}'
```

### 9.2 排指定课程

```bash
curl -X POST http://localhost:8081/api/algorithm/auto-schedule \
  -H "Content-Type: application/json" \
  -d '{"week": 1, "courseIds": [1, 2, 3]}'
```

### 9.3 预览（不写库）

```bash
curl -X POST http://localhost:8081/api/algorithm/preview \
  -H "Content-Type: application/json" \
  -d '{"week": 1}'
```

### 9.4 高质量排课 + 自定义规则权重

```bash
curl -X POST http://localhost:8081/api/algorithm/auto-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "week": 1,
    "config": {
        "initialTemp": 200,
        "coolingRate": 0.998,
        "maxIterations": 200000,
        "restartCount": 5
    },
    "ruleOverrides": {
        "teacher_conflict": 5000,
        "room_conflict": 5000,
        "class_conflict": 5000,
        "load_balance": 30
    }
}'
```

### 9.5 查看当前规则配置

```bash
curl http://localhost:8081/api/algorithm/rules
```

---

## 10. 前端集成指南

### 10.1 推荐调用流程

```
1. 用户点击"自动排课"按钮
2. 前端调用 POST /api/algorithm/preview 预览结果
3. 展示预览结果，显示规则得分和冲突数
4. 用户确认后，调用 POST /api/algorithm/auto-schedule 写入数据库
5. 刷新课表页面
```

### 10.2 JavaScript 调用示例

```javascript
// 预览排课结果
async function previewSchedule(week) {
    const response = await fetch('/api/algorithm/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week })
    });
    const result = await response.json();

    if (result.code === 200) {
        const data = result.data;
        console.log(`排课完成，共 ${data.schedules.length} 条记录`);
        console.log(`总代价: ${data.totalCost}`);
        console.log(`执行耗时: ${data.executionTimeMs}ms`);

        // 检查硬冲突
        const hardRules = ['teacher_conflict', 'room_conflict', 'class_conflict', 'teacher_unavailable'];
        const hardViolations = hardRules.reduce((sum, rule) =>
            sum + (data.ruleScores[rule] || 0), 0);

        if (hardViolations > 0) {
            alert(`存在 ${hardViolations} 个硬冲突，建议调整参数后重试`);
        } else {
            // 确认后写入数据库
            if (confirm('预览结果无硬冲突，是否写入数据库？')) {
                await commitSchedule(week);
            }
        }
    }
}

// 写入数据库
async function commitSchedule(week) {
    const response = await fetch('/api/algorithm/auto-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week })
    });
    const result = await response.json();
    if (result.code === 200) {
        alert('排课已保存');
        refreshScheduleTable(); // 刷新课表
    }
}
```

### 10.3 结果展示建议

| 展示项 | 数据来源 | 说明 |
|--------|----------|------|
| 课表 | `data.schedules` | 渲染到课表组件 |
| 总代价 | `data.totalCost` | 越小越好，0 = 完美 |
| 硬冲突数 | `data.ruleScores` 中 hard 规则之和 | 0 = 无冲突 |
| 执行耗时 | `data.executionTimeMs` | 供用户参考 |
| 规则详情 | `data.ruleScores` | 可展示为柱状图或表格 |

---

## 11. 数据库初始化

### 11.1 规则权重初始化

首次使用前，需要执行以下 SQL 初始化规则权重数据：

```sql
-- 文件: src/main/resources/db/algorithm-rule-weights.sql

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
```

### 11.2 前置数据要求

自动排课依赖以下数据表的正确配置：

| 表 | 要求 | 说明 |
|----|------|------|
| `course` | 至少 1 条记录 | 课程信息，`totalHours` 决定每周排课次数，`type` 用于时间偏好规则 |
| `teacher` | 至少 1 条记录 | 教师信息，`courses`（JSON 字段）用于课程-教师映射 |
| `room` | 至少 1 条记录 | 教室信息，`capacity` 用于容量检查 |
| `time_slot_config` | 已配置时间段 | `is_schedulable=true` 且 `is_break=false` 的时段才会被使用 |
| `weekday_config` | 已配置工作日 | `is_enabled=true` 且 `is_schedulable=true` 的工作日才会被使用 |
| `rule_weight` | 已初始化权重 | 执行上述 SQL 或通过 API 配置 |
| `course_setting` | 已配置优先级 | `priority` 字段决定排课先后顺序（值越小越优先） |
| `major` | 已配置专业 | `class_size` 提供学生人数，`courses` 用于班级-课程关联 |
| `calendar` | 至少 1 条记录 | 提供学期起始日期，用于计算排课周的实际日期范围和教师不可用时段 |
| `disabled_date` | 可选 | 排除节假日对应的工作日，使其不被用于排课 |

### 11.3 课程-教师映射

算法通过以下逻辑确定每门课由哪位教师授课：

1. **优先从已有排课记录推断**：如果某课程在 `schedule` 表中已有排课记录，则使用该记录的 `teacherId`
2. **其次从 teacher.courses JSON 字段匹配**：解析 `TeacherEntity.courses`（JSON 格式的课程名称列表），与课程名称匹配，找到对应教师
   ```java
   // teacher.courses 示例: ["高等数学", "线性代数"]
   List<String> teacherCourseNames = objectMapper.readValue(
       teacher.getCourses(), new TypeReference<List<String>>() {});
   for (String tcn : teacherCourseNames) {
       Long cid = courseNameToId.get(tcn);  // 课程名称 → 课程 ID
       if (cid != null) courseTeacherMap.putIfAbsent(cid, teacher.getDbId());
   }
   ```
3. **回退到轮询分配**：如果以上都无法确定，则按课程 `dbId % 教师数量` 轮询分配

---

## 12. 常见问题与排查

### Q1: 执行很慢怎么办？

**原因**：迭代次数过多或课程数量过大。

**解决方案**：
1. 减少 `maxIterations`（如 20000）
2. 减少 `restartCount`（如 1）
3. 增大 `coolingRate`（如 0.99）
4. 使用 `courseIds` 减少排课课程数量
5. 使用"快速预览"配置

### Q2: 结果有硬冲突怎么办？

**排查步骤**：
1. 检查响应中 `ruleScores` 的 hard 规则值
2. 如果 `teacher_conflict > 0`：教师资源不足或课程安排过密
3. 如果 `room_conflict > 0`：教室资源不足
4. 如果 `class_conflict > 0`：班级课程安排冲突

**解决方案**：
1. 增大 hard 规则权重（如 `teacher_conflict: 5000`）
2. 增加 `restartCount` 和 `maxIterations`
3. 检查是否有足够的教室和时间段资源
4. 减少同时排课的课程数量

### Q3: 排课会覆盖已有排课吗？

**会。** `auto-schedule` 接口会先删除目标周次的所有排课记录，然后写入新结果。

**建议**：先用 `/api/algorithm/preview` 预览，确认结果满意后再调用 `auto-schedule`。

### Q4: 如何让某门课固定在某个时段？

当前版本**不支持**固定时段。变通方案：
1. 通过 `ruleOverrides` 增大特定规则权重间接影响
2. 在自动排课后通过拖拽接口手动调整
3. 使用 `courseIds` 排除该课程，手动安排后再排其他课程

### Q5: 如何调整规则权重？

1. **临时覆盖**（不影响数据库）：在请求中使用 `ruleOverrides`
   ```json
   { "ruleOverrides": { "teacher_conflict": 2000 } }
   ```
2. **持久化修改**（影响所有后续排课）：通过规则管理 API
   ```bash
   GET  /api/rule-weights          # 查看当前权重
   PUT  /api/rule-weights/{id}     # 修改权重
   POST /api/rule-weights/reset    # 恢复默认权重
   ```

### Q6: `time_preference` 时间偏好规则如何工作？

**该规则已实现**，根据课程类型与时段匹配度计算惩罚：

- **必修课**：偏好上午（`halfDayType="morning"`），安排在下午会受罚
- **实验/实践课**：偏好下午（`halfDayType="afternoon"`），安排在上午会受罚
- **选修课**：偏好下午，安排在上午会受罚

时段的上/下午划分由 `time_slot_config.start_time` 决定：早于 12:00 为 `morning`，否则为 `afternoon`。

惩罚计算公式：`Σ penalty(每个 slot 的课程类型-时段匹配度)`，完美匹配时总分为负值（降低总代价），不匹配时为正值。

### Q7: 算法端口是 8080 还是 8081？

本项目配置端口为 **8081**（见 `application.yml` 中 `server.port: 8081`）。文档中的 curl 示例使用 8081。
