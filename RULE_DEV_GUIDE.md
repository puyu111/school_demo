# 新增规则开发指南

本文档说明如何为模拟退火排课算法新增一条评估规则。

---

## 目录

1. [规则体系总览](#1-规则体系总览)
2. [开发流程概览](#2-开发流程概览)
3. [完整示例：新增"教师连课限制"规则](#3-完整示例新增教师连课限制规则)
4. [规则类型详解](#4-规则类型详解)
5. [ScheduleSlot 字段扩展](#5-scheduleslot-字段扩展)
6. [规则评估方法编写规范](#6-规则评估方法编写规范)
7. [调试与验证](#7-调试与验证)
8. [附录：现有 8 条规则参考](#8-附录现有-8-条规则参考)

---

## 1. 规则体系总览

### 1.1 规则分类

| 类型 | 说明 | 权重范围 | 影响 |
|------|------|----------|------|
| `hard`（硬规则） | 必须满足的约束，违反即为冲突 | 500 ~ 5000 | 违规数计入硬冲突统计，影响 `message` 字段 |
| `soft`（软规则） | 尽量优化的目标 | 5 ~ 200 | 仅影响总代价，不报告为冲突 |

### 1.2 代价计算公式

```
总代价 = Σ (规则权重[i] × 违规次数[i])
```

- 规则权重从 `rule_weight` 表读取，可通过 `ruleOverrides` 临时覆盖
- 违规次数由 `RuleEvaluator.calculateCost()` 计算
- 退火算法以总代价最小化为目标

### 1.3 涉及的文件

```
需要修改的文件（3 个）：
├── 数据库 / SQL 文件          ── 插入规则权重记录
├── algorithm/RuleEvaluator.java ── 实现评估逻辑
└── service/SimulatedAnnealingService.java ── 仅硬规则需要改

可能需要修改的文件（2 个）：
├── algorithm/ScheduleSlot.java  ── 如果规则需要额外字段
└── service/SimulatedAnnealingService.java ── 如果需要加载额外数据
```

---

## 2. 开发流程概览

```
Step 1  确定规则 ID、名称、类型、权重
   │
Step 2  插入数据库 rule_weight 记录
   │
Step 3  (可选) 扩展 ScheduleSlot 字段
   │
Step 4  (可选) 在 SimulatedAnnealingService 中加载额外数据
   │
Step 5  在 RuleEvaluator 中注册规则 + 实现评估方法
   │
Step 6  (仅硬规则) 在 SimulatedAnnealingService.countHardViolations() 中注册
   │
Step 7  重启应用，测试验证
```

---

## 3. 完整示例：新增"教师连课限制"规则

### 3.1 需求定义

- **规则 ID**：`teacher_consecutive`
- **名称**：教师连课限制
- **类型**：`soft`
- **逻辑**：教师同一天连续上课超过 4 节，每次违规 +1
- **默认权重**：30

### 3.2 Step 1 — 插入数据库记录

```sql
INSERT IGNORE INTO rule_weight
    (id, name, category, current_weight, default_weight, min_weight, max_weight, enabled, description)
VALUES
    ('teacher_consecutive', '教师连课限制', 'soft', 30, 30, 5, 200, 1,
     '教师同一天连续上课超过4节的惩罚');
```

**字段说明：**

| 字段 | 说明 | 示例 |
|------|------|------|
| `id` | 规则唯一标识，代码中用此 key 匹配 | `teacher_consecutive` |
| `name` | 规则中文名，用于前端展示 | `教师连课限制` |
| `category` | `hard` 或 `soft` | `soft` |
| `current_weight` | 当前生效权重 | `30` |
| `default_weight` | 默认权重（重置时恢复） | `30` |
| `min_weight` | 权重下限 | `5` |
| `max_weight` | 权重上限 | `200` |
| `enabled` | 是否启用（1=启用） | `1` |
| `description` | 规则描述 | `教师同一天连续上课超过4节的惩罚` |

### 3.3 Step 2 — 在 RuleEvaluator 中注册规则

打开 `src/main/java/org/example/school_demo/algorithm/RuleEvaluator.java`。

**2a. 在 `calculateCost()` 方法中添加一行（第 61 行之后）：**

```java
public double calculateCost(Solution solution) {
    Map<String, Double> scores = new LinkedHashMap<>();
    List<ScheduleSlot> slots = solution.getSlots();

    // ... 已有规则 ...

    // 8. load_balance
    scores.put("load_balance", calculateLoadBalancePenalty(slots));

    // ========== 新增规则 ==========
    // 9. teacher_consecutive
    scores.put("teacher_consecutive", (double) calculateTeacherConsecutivePenalty(slots));
    // ==============================

    solution.setRuleScores(scores);
    // ... 后续代价计算不变 ...
}
```

**2b. 添加评估方法（在 `// ==================== Soft 规则 ====================` 区域内）：**

```java
/**
 * 教师连课限制：教师同一天连续上课超过 4 节则惩罚。
 * 每出现一次超限 +1。
 */
private int calculateTeacherConsecutivePenalty(List<ScheduleSlot> slots) {
    // 按 teacherId + weekday 分组
    Map<String, List<ScheduleSlot>> keyMap = new HashMap<>();
    for (ScheduleSlot s : slots) {
        String key = s.getTeacherId() + "-" + s.getWeekday();
        keyMap.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }

    int penalty = 0;
    for (List<ScheduleSlot> group : keyMap.values()) {
        if (group.size() <= 1) continue;
        // 按 startSlotIndex 排序
        group.sort(Comparator.comparingInt(ScheduleSlot::getStartSlotIndex));

        // 检测连续段
        int consecutive = group.get(0).getDurationSlots();
        for (int i = 1; i < group.size(); i++) {
            int prevEnd = group.get(i - 1).getStartSlotIndex() + group.get(i - 1).getDurationSlots();
            if (group.get(i).getStartSlotIndex() == prevEnd) {
                // 紧挨着，累加
                consecutive += group.get(i).getDurationSlots();
            } else {
                // 断开，检查上一段
                if (consecutive > 4) penalty++;
                consecutive = group.get(i).getDurationSlots();
            }
        }
        // 检查最后一段
        if (consecutive > 4) penalty++;
    }
    return penalty;
}
```

**2c. 确认需要导入的类**（文件顶部，通常已有）：

```java
import java.util.*;
```

### 3.4 Step 3 — 验证

重启应用后测试：

```bash
# 预览排课，检查新规则是否出现在 ruleScores 中
curl -X POST http://localhost:8081/api/algorithm/preview \
  -H "Content-Type: application/json" \
  -d '{"week": 1}'

# 检查返回的 ruleScores 中是否包含 "teacher_consecutive" 字段
```

---

## 4. 规则类型详解

### 4.1 硬规则（Hard）

硬规则表示**不可违反的约束**。违反硬规则意味着排课方案有严重问题。

**特点：**
- 违规数会被 `countHardViolations()` 统计
- 如果硬冲突 > 0，响应 `message` 会提示"存在 N 个硬冲突"
- 权重通常设为 500 ~ 5000，远高于软规则

**如果新增硬规则，需要额外修改 `SimulatedAnnealingService.java`：**

```java
// 文件：SimulatedAnnealingService.java 第 622 行
private int countHardViolations(Map<String, Double> ruleScores) {
    int count = 0;
    for (String hardRule : new String[]{
            "teacher_conflict",
            "room_conflict",
            "class_conflict",
            "teacher_unavailable",
            "your_new_hard_rule"          // ← 在这里添加
    }) {
        Double v = ruleScores.get(hardRule);
        if (v != null) count += v.intValue();
    }
    return count;
}
```

### 4.2 软规则（Soft）

软规则表示**尽量优化的目标**。违反软规则不影响排课方案的有效性，但会增加代价。

**特点：**
- 不计入硬冲突统计
- 权重通常设为 5 ~ 200
- 仅在 `RuleEvaluator` 中修改即可，不需要改 `SimulatedAnnealingService`

---

## 5. ScheduleSlot 字段扩展

如果新规则需要额外数据（如课程类型、学生人数、教室类型等），需要扩展 `ScheduleSlot`。

### 5.1 修改 ScheduleSlot

```java
// 文件：algorithm/ScheduleSlot.java

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSlot {
    // ... 已有字段 ...

    /** 课程类型（新增，如 "必修"、"选修"、"实验"） */
    private String courseType;

    /** 学生人数（新增） */
    private int studentCount;

    /**
     * 深拷贝 — 必须同步更新！
     */
    public ScheduleSlot deepCopy() {
        return new ScheduleSlot(
            courseId, teacherId, classId, roomId,
            weekday, startSlotIndex, durationSlots,
            courseType, studentCount   // ← 新增字段
        );
    }
}
```

### 5.2 在 SimulatedAnnealingService 中传入数据

修改 `CourseSession` 内部类和 `buildInitialSolution()` 方法：

```java
// SimulatedAnnealingService.java

// 1. 扩展 CourseSession
@Data
private static class CourseSession {
    final Long courseId;
    final Long teacherId;
    final String classId;
    final int durationSlots;
    final String courseType;    // ← 新增
    final int studentCount;     // ← 新增
}

// 2. 在 loadInputData() 构建 CourseSession 时传入
for (CourseEntity course : courses) {
    // ...
    data.courseSessions.add(new CourseSession(
        course.getDbId(), teacherId, null, 1,
        course.getType(),           // ← 课程类型
        40                          // ← 学生人数（或从 course 表读取）
    ));
}

// 3. 在 buildInitialSolution() 构建 ScheduleSlot 时传入
slots.add(new ScheduleSlot(
    session.getCourseId(), session.getTeacherId(),
    session.getClassId(), roomId,
    weekday, slotIdx, session.getDurationSlots(),
    session.getCourseType(),     // ← 新增
    session.getStudentCount()    // ← 新增
));
```

---

## 6. 规则评估方法编写规范

### 6.1 方法签名

```java
// 返回 int（离散违规次数，大多数规则用这个）
private int countXxxViolations(List<ScheduleSlot> slots) { ... }

// 返回 double（连续值惩罚，如标准差）
private double calculateXxxPenalty(List<ScheduleSlot> slots) { ... }
```

### 6.2 常用分组模式

大多数规则需要先按某个维度分组，再检测冲突或计算惩罚：

```java
// 模式 1：按实体 + 星期几分组（用于冲突检测）
Map<String, List<ScheduleSlot>> keyMap = new HashMap<>();
for (ScheduleSlot s : slots) {
    String key = s.getTeacherId() + "-" + s.getWeekday();  // 或 roomId, classId
    keyMap.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
}
// 然后对每组内的 slot 两两检测重叠

// 模式 2：按课程分组（用于课程相关规则）
Map<Long, List<ScheduleSlot>> courseMap = new HashMap<>();
for (ScheduleSlot s : slots) {
    courseMap.computeIfAbsent(s.getCourseId(), k -> new ArrayList<>()).add(s);
}

// 模式 3：按教师分组（用于教师相关规则）
Map<Long, List<ScheduleSlot>> teacherMap = new HashMap<>();
for (ScheduleSlot s : slots) {
    teacherMap.computeIfAbsent(s.getTeacherId(), k -> new ArrayList<>()).add(s);
}
```

### 6.3 时间段重叠检测

复用已有的 `slotsOverlap()` 辅助方法：

```java
private boolean slotsOverlap(ScheduleSlot a, ScheduleSlot b) {
    if (a.getWeekday() != b.getWeekday()) return false;
    int aEnd = a.getStartSlotIndex() + a.getDurationSlots();
    int bEnd = b.getStartSlotIndex() + b.getDurationSlots();
    return a.getStartSlotIndex() < bEnd && aEnd > b.getStartSlotIndex();
}
```

### 6.4 返回值约定

| 返回类型 | 语义 | 示例 |
|----------|------|------|
| `int` 违规次数 | 每次违规 +1 | 冲突对数、违规节数 |
| `double` 惩罚值 | 连续值 | 标准差、平均偏差 |

最终代价 = `getWeight(ruleId) * 返回值`，所以返回值应是**无量纲的数值**。

---

## 7. 调试与验证

### 7.1 检查规则是否被加载

```bash
# 查看 rule_weight 表中的记录
curl http://localhost:8081/api/algorithm/rules
```

确认新规则出现在返回列表中，且 `enabled: true`。

### 7.2 检查规则是否生效

```bash
# 预览排课
curl -X POST http://localhost:8081/api/algorithm/preview \
  -H "Content-Type: application/json" \
  -d '{"week": 1}'
```

检查返回的 `ruleScores` 中是否包含新规则 ID 及其违规数。

### 7.3 临时调高权重验证

```bash
# 临时将新规则权重调高，观察是否影响排课结果
curl -X POST http://localhost:8081/api/algorithm/preview \
  -H "Content-Type: application/json" \
  -d '{
    "week": 1,
    "ruleOverrides": {
      "teacher_consecutive": 500
    }
  }'
```

如果权重调高后排课结果明显变化（如教师连续课减少），说明规则生效。

### 7.4 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| `ruleScores` 中没有新规则 | `calculateCost()` 中没有注册 | 检查 Step 2a |
| 规则违规数始终为 0 | 评估方法逻辑有误 | 用 debug 日志打印中间值 |
| 规则有值但不影响排课 | 权重为 0 | 检查 `rule_weight` 表的 `current_weight` |
| 编译报错 | `ScheduleSlot` 字段扩展后 `deepCopy()` 未同步 | 检查 Step 5 |
| `countHardViolations` 不统计新硬规则 | 未在方法中注册 | 检查 Step 6 |

---

## 8. 附录：现有 8 条规则参考

### 8.1 硬规则实现模式

| 规则 ID | 分组键 | 检测逻辑 |
|---------|--------|----------|
| `teacher_conflict` | `teacherId + weekday` | 组内两两检测 `slotsOverlap()` |
| `room_conflict` | `roomId + weekday` | 组内两两检测 `slotsOverlap()` |
| `class_conflict` | `classId + weekday` | 组内两两检测 `slotsOverlap()` |
| `teacher_unavailable` | 遍历每个 slot | 检查 `teacherUnavailableSlots` 集合 |

### 8.2 软规则实现模式

| 规则 ID | 分组键 | 计算逻辑 |
|---------|--------|----------|
| `room_capacity` | 遍历每个 slot | `room.capacity < 40` → +1 |
| `course_spread` | `courseId` | 排序后检测连续天对数 |
| `time_preference` | — | 预留，当前返回 0 |
| `load_balance` | `teacherId` | 每日课时标准差 × 10 / 教师数 |

### 8.3 完整规则权重默认值

```sql
-- 硬规则
('teacher_conflict',   '教师冲突',   'hard', 1000, 1000, 500,  5000, 1, ...)
('room_conflict',      '教室冲突',   'hard', 1000, 1000, 500,  5000, 1, ...)
('class_conflict',     '班级冲突',   'hard', 1000, 1000, 500,  5000, 1, ...)
('teacher_unavailable','教师不可用', 'hard', 500,  500,  200,  2000, 1, ...)

-- 软规则
('room_capacity',      '教室容量',   'soft', 50,   50,   10,   200,  1, ...)
('course_spread',      '课程分散度', 'soft', 20,   20,   5,    100,  1, ...)
('time_preference',    '时间偏好',   'soft', 10,   10,   0,    50,   1, ...)
('load_balance',       '教师负载',   'soft', 15,   15,   5,    100,  1, ...)
```

---

## 快速参考卡片

```
新增一条规则的最小改动：

1. SQL:    INSERT INTO rule_weight (id, name, category, current_weight, ...)
2. Java:   RuleEvaluator.calculateCost() 中加 scores.put("规则id", ...)
3. Java:   RuleEvaluator 中加 private int/double countXxx(slots) { ... }

如果是硬规则，额外改动：
4. Java:   SimulatedAnnealingService.countHardViolations() 中加 "规则id"

如果需要额外数据：
5. Java:   ScheduleSlot 加字段 + 更新 deepCopy()
6. Java:   SimulatedAnnealingService 中传入数据
```
