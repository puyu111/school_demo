# drag-schedule-test 后端接口文档

## 目录

- [接口概览](#接口概览)
- [公共响应格式](#公共响应格式)
- [课程管理接口](#课程管理接口)
- [时段配置接口](#时段配置接口)
- [星期配置接口](#星期配置接口)
- [周次管理接口](#周次管理接口)
- [冲突检测接口](#冲突检测接口)
- [数据导出/导入](#数据导出导入)

---

## 接口概览

| 模块 | 接口数量 | 基础路径 |
|------|----------|----------|
| 课程管理 | 6 | `/api/schedule/courses` |
| 时段配置 | 4 | `/api/schedule/time-slots` |
| 星期配置 | 2 | `/api/schedule/week-days` |
| 周次管理 | 3 | `/api/schedule/weeks` |
| 冲突检测 | 2 | `/api/schedule/conflicts` |
| 数据导出/导入 | 2 | `/api/schedule/export` |

### HTTP 方法规范

| 方法 | 用途 |
|------|------|
| `GET` | 获取资源/列表 |
| `POST` | 创建资源/执行操作 |
| `PUT` | 更新资源（全量） |
| `PATCH` | 更新资源（部分） |
| `DELETE` | 删除资源 |

---

## 公共响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1712649600000
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "courseName",
      "message": "课程名称不能为空"
    }
  ],
  "timestamp": 1712649600000
}
```

### 分页响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  },
  "timestamp": 1712649600000
}
```

---

## 课程管理接口

### 1. 获取指定周次的课程列表

**接口：** `GET /api/schedule/courses`

**描述：** 获取指定周次、班级或教室的课程安排。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `week` | number | 是 | 周次（1-20） |
| `classId` | string | 否 | 班级 ID 过滤 |
| `teacherId` | string | 否 | 教师 ID 过滤 |
| `roomId` | string | 否 | 教室 ID 过滤 |

**请求示例：**

```bash
GET /api/schedule/courses?week=5&classId=c001
```

**响应数据：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "w5-1",
      "courseName": "高等数学",
      "teacherName": "张教授",
      "teacherId": "t001",
      "className": "计算机科学与技术 1 班",
      "classId": "c001",
      "roomName": "教学楼 A-301",
      "roomId": "r001",
      "weekDay": 1,
      "startTime": "08:00",
      "endTime": "10:00",
      "duration": 120,
      "color": "#1890ff",
      "weeks": [1, 2, 3, 4, 5],
      "studentCount": 45
    }
  ],
  "timestamp": 1712649600000
}
```

---

### 2. 获取单个课程详情

**接口：** `GET /api/schedule/courses/:courseId`

**描述：** 获取单个课程的详细信息。

**请求参数：**

| 参数 | 类型 | 位置 | 说明 |
|------|------|------|------|
| `courseId` | string | path | 课程 ID |

**请求示例：**

```bash
GET /api/schedule/courses/w5-1
```

**响应数据：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "w5-1",
    "courseName": "高等数学",
    "teacherName": "张教授",
    "teacherId": "t001",
    "className": "计算机科学与技术 1 班",
    "classId": "c001",
    "roomName": "教学楼 A-301",
    "roomId": "r001",
    "weekDay": 1,
    "startTime": "08:00",
    "endTime": "10:00",
    "duration": 120,
    "color": "#1890ff",
    "weeks": [1, 2, 3, 4, 5],
    "studentCount": 45,
    "createdAt": "2026-03-01T08:00:00Z",
    "updatedAt": "2026-03-15T10:30:00Z"
  },
  "timestamp": 1712649600000
}
```

---

### 3. 创建课程

**接口：** `POST /api/schedule/courses`

**描述：** 创建新的课程安排。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courseName` | string | 是 | 课程名称 |
| `teacherId` | string | 是 | 教师 ID |
| `classId` | string | 是 | 班级 ID |
| `roomId` | string | 是 | 教室 ID |
| `weekDay` | number | 是 | 星期（1-7） |
| `startTime` | string | 是 | 开始时间（HH:mm） |
| `endTime` | string | 是 | 结束时间（HH:mm） |
| `duration` | number | 是 | 课程时长（分钟） |
| `weeks` | number[] | 是 | 开课周次数组 |
| `color` | string | 否 | 显示颜色（默认随机） |

**请求示例：**

```json
POST /api/schedule/courses
{
  "courseName": "数据结构",
  "teacherId": "t003",
  "classId": "c001",
  "roomId": "r003",
  "weekDay": 2,
  "startTime": "08:00",
  "endTime": "08:45",
  "duration": 45,
  "weeks": [1, 2, 3],
  "color": "#52c41a"
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "w1-3",
    "courseName": "数据结构",
    "teacherName": "王教授",
    "teacherId": "t003",
    "className": "计算机科学与技术 1 班",
    "classId": "c001",
    "roomName": "实验楼 C-401",
    "roomId": "r003",
    "weekDay": 2,
    "startTime": "08:00",
    "endTime": "08:45",
    "duration": 45,
    "color": "#52c41a",
    "weeks": [1, 2, 3],
    "studentCount": 42
  },
  "timestamp": 1712649600000
}
```

---

### 4. 更新课程

**接口：** `PUT /api/schedule/courses/:courseId`

**描述：** 更新课程的完整信息。

**请求参数：**

| 参数 | 类型 | 位置 | 说明 |
|------|------|------|------|
| `courseId` | string | path | 课程 ID |

**请求体：** 同创建课程，所有字段可选。

**请求示例：**

```json
PUT /api/schedule/courses/w1-3
{
  "weekDay": 3,
  "startTime": "10:10",
  "endTime": "10:55",
  "weeks": [1, 2, 3, 4]
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "w1-3",
    "courseName": "数据结构",
    "weekDay": 3,
    "startTime": "10:10",
    "endTime": "10:55",
    "duration": 45,
    "weeks": [1, 2, 3, 4],
    "updatedAt": "2026-03-20T14:30:00Z"
  },
  "timestamp": 1712649600000
}
```

---

### 5. 批量移动课程（拖拽操作）

**接口：** `POST /api/schedule/courses/move`

**描述：** 批量移动课程到新的时间段或星期，用于处理前端拖拽操作。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `moves` | MoveRequest[] | 是 | 移动操作数组 |

**MoveRequest 结构：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courseId` | string | 是 | 课程 ID |
| `newWeekDay` | number | 是 | 新星期（1-7） |
| `newStartTime` | string | 否 | 新开始时间（可选，保持原时间可不传） |

**请求示例：**

```json
POST /api/schedule/courses/move
{
  "moves": [
    {
      "courseId": "w1-1",
      "newWeekDay": 2,
      "newStartTime": "08:00"
    },
    {
      "courseId": "w1-2",
      "newWeekDay": 3
    }
  ]
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "移动成功",
  "data": {
    "success": [
      {
        "courseId": "w1-1",
        "oldWeekDay": 1,
        "newWeekDay": 2,
        "oldStartTime": "08:00",
        "newStartTime": "08:00"
      }
    ],
    "failed": [],
    "conflicts": []
  },
  "timestamp": 1712649600000
}
```

---

### 6. 删除课程

**接口：** `DELETE /api/schedule/courses/:courseId`

**描述：** 删除指定的课程安排。

**请求参数：**

| 参数 | 类型 | 位置 | 说明 |
|------|------|------|------|
| `courseId` | string | path | 课程 ID |

**请求示例：**

```bash
DELETE /api/schedule/courses/w1-1
```

**响应数据：**

```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "deletedId": "w1-1",
    "courseName": "高等数学"
  },
  "timestamp": 1712649600000
}
```

---

### 7. 批量删除课程

**接口：** `POST /api/schedule/courses/batch-delete`

**描述：** 批量删除多个课程。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courseIds` | string[] | 是 | 课程 ID 数组 |

**请求示例：**

```json
POST /api/schedule/courses/batch-delete
{
  "courseIds": ["w1-1", "w1-2", "w1-3"]
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "deletedCount": 3,
    "deletedIds": ["w1-1", "w1-2", "w1-3"],
    "failedIds": []
  },
  "timestamp": 1712649600000
}
```

---

## 时段配置接口

### 1. 获取时段配置

**接口：** `GET /api/schedule/time-slots`

**描述：** 获取当前的时段配置，包括每节课的时间、时长和休息设置。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `dayOfWeek` | number | 否 | 星期（1-7），不传则返回所有配置 |

**请求示例：**

```bash
GET /api/schedule/time-slots
```

**响应数据：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "halfDayConfigs": [
      {
        "type": "morning",
        "name": "上午",
        "startTime": "08:00",
        "endTime": "12:00",
        "isSchedulable": true
      },
      {
        "type": "afternoon",
        "name": "下午",
        "startTime": "14:00",
        "endTime": "18:00",
        "isSchedulable": true
      },
      {
        "type": "evening",
        "name": "晚上",
        "startTime": "19:00",
        "endTime": "21:00",
        "isSchedulable": true
      }
    ],
    "timeSlots": [
      {
        "id": "slot-1",
        "label": "第 1 节",
        "startTime": "08:00",
        "endTime": "08:45",
        "duration": 45,
        "halfDayType": "morning",
        "isBreak": false,
        "breakAfter": 10,
        "isSchedulable": true
      },
      {
        "id": "slot-2",
        "label": "第 2 节",
        "startTime": "08:50",
        "endTime": "09:35",
        "duration": 45,
        "halfDayType": "morning",
        "isBreak": false,
        "breakAfter": 15,
        "isSchedulable": true
      }
    ],
    "dailyConfig": {
      "totalPeriods": 10,
      "defaultDuration": 45,
      "defaultBreakDuration": 10
    }
  },
  "timestamp": 1712649600000
}
```

---

### 2. 更新时段配置

**接口：** `PUT /api/schedule/time-slots`

**描述：** 更新时段配置，包括课时设置、休息时间等。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `halfDayConfigs` | HalfDayConfig[] | 否 | 半天配置数组 |
| `timeSlots` | TimeSlotConfig[] | 否 | 时段配置数组 |
| `dailyConfig` | DailyScheduleConfig | 否 | 每日配置 |

**请求示例：**

```json
PUT /api/schedule/time-slots
{
  "dailyConfig": {
    "totalPeriods": 12,
    "defaultDuration": 40,
    "defaultBreakDuration": 10
  },
  "halfDayConfigs": [
    {
      "type": "morning",
      "name": "上午",
      "startTime": "08:00",
      "endTime": "12:00",
      "isSchedulable": true
    },
    {
      "type": "afternoon",
      "name": "下午",
      "startTime": "14:00",
      "endTime": "18:00",
      "isSchedulable": false
    }
  ]
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "配置更新成功",
  "data": {
    "updatedFields": ["dailyConfig", "halfDayConfigs"],
    "dailyConfig": {
      "totalPeriods": 12,
      "defaultDuration": 40,
      "defaultBreakDuration": 10
    },
    "halfDayConfigs": [ ... ]
  },
  "timestamp": 1712649600000
}
```

---

### 3. 重置时段配置为默认值

**接口：** `POST /api/schedule/time-slots/reset`

**描述：** 将时段配置重置为系统默认值。

**请求体：** 无

**响应数据：**

```json
{
  "code": 200,
  "message": "配置已重置为默认值",
  "data": {
    "dailyConfig": {
      "totalPeriods": 10,
      "defaultDuration": 45,
      "defaultBreakDuration": 10
    },
    "timeSlots": [ ... ],
    "halfDayConfigs": [ ... ]
  },
  "timestamp": 1712649600000
}
```

---

## 星期配置接口

### 1. 获取星期配置

**接口：** `GET /api/schedule/week-days`

**描述：** 获取星期配置，包括每天的启用状态和可排课状态。

**请求示例：**

```bash
GET /api/schedule/week-days
```

**响应数据：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "周一",
      "isEnabled": true,
      "isSchedulable": true
    },
    {
      "id": 2,
      "name": "周二",
      "isEnabled": true,
      "isSchedulable": true
    },
    {
      "id": 3,
      "name": "周三",
      "isEnabled": true,
      "isSchedulable": true
    },
    {
      "id": 4,
      "name": "周四",
      "isEnabled": true,
      "isSchedulable": true
    },
    {
      "id": 5,
      "name": "周五",
      "isEnabled": true,
      "isSchedulable": true
    },
    {
      "id": 6,
      "name": "周六",
      "isEnabled": false,
      "isSchedulable": false
    },
    {
      "id": 7,
      "name": "周日",
      "isEnabled": false,
      "isSchedulable": false
    }
  ],
  "timestamp": 1712649600000
}
```

---

### 2. 更新星期配置

**接口：** `PUT /api/schedule/week-days`

**描述：** 更新星期配置，可以启用/禁用特定日期。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `weekDays` | WeekDayConfig[] | 是 | 星期配置数组 |

**请求示例：**

```json
PUT /api/schedule/week-days
{
  "weekDays": [
    { "id": 1, "name": "周一", "isEnabled": true, "isSchedulable": true },
    { "id": 2, "name": "周二", "isEnabled": true, "isSchedulable": true },
    { "id": 3, "name": "周三", "isEnabled": true, "isSchedulable": true },
    { "id": 4, "name": "周四", "isEnabled": true, "isSchedulable": true },
    { "id": 5, "name": "周五", "isEnabled": true, "isSchedulable": true },
    { "id": 6, "name": "周六", "isEnabled": true, "isSchedulable": true },
    { "id": 7, "name": "周日", "isEnabled": false, "isSchedulable": false }
  ]
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "星期配置更新成功",
  "data": {
    "weekDays": [ ... ]
  },
  "timestamp": 1712649600000
}
```

---

## 周次管理接口

### 1. 获取周次信息

**接口：** `GET /api/schedule/weeks/:weekNumber`

**描述：** 获取指定周次的详细信息，包括课程数量、配置状态等。

**请求参数：**

| 参数 | 类型 | 位置 | 说明 |
|------|------|------|------|
| `weekNumber` | number | path | 周次（1-20） |

**请求示例：**

```bash
GET /api/schedule/weeks/5
```

**响应数据：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "weekNumber": 5,
    "startDate": "2026-03-30",
    "endDate": "2026-04-05",
    "courseCount": 12,
    "isCurrentWeek": false,
    "hasUnsavedChanges": false,
    "config": {
      "timeSlots": [ ... ],
      "weekDays": [ ... ]
    }
  },
  "timestamp": 1712649600000
}
```

---

### 2. 批量复制周次数据

**接口：** `POST /api/schedule/weeks/copy`

**描述：** 将一个周次的课程配置复制到另一个或多个周次。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `sourceWeek` | number | 是 | 源周次 |
| `targetWeeks` | number[] | 是 | 目标周次数组 |
| `options` | CopyOptions | 否 | 复制选项 |

**CopyOptions 结构：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `copyCourses` | boolean | 否 | 是否复制课程（默认 true） |
| `copyConfig` | boolean | 否 | 是否复制配置（默认 false） |
| `overrideExisting` | boolean | 否 | 是否覆盖已存在的课程（默认 false） |

**请求示例：**

```json
POST /api/schedule/weeks/copy
{
  "sourceWeek": 1,
  "targetWeeks": [2, 3, 4, 5],
  "options": {
    "copyCourses": true,
    "copyConfig": false,
    "overrideExisting": false
  }
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "复制成功",
  "data": {
    "sourceWeek": 1,
    "copiedWeeks": [2, 3, 4, 5],
    "copiedCourseCount": 12,
    "skippedWeeks": [],
    "failedWeeks": []
  },
  "timestamp": 1712649600000
}
```

---

### 3. 清空周次数据

**接口：** `DELETE /api/schedule/weeks/:weekNumber`

**描述：** 清空指定周次的所有课程数据。

**请求参数：**

| 参数 | 类型 | 位置 | 说明 |
|------|------|------|------|
| `weekNumber` | number | path | 周次（1-20） |
| `preserveConfig` | boolean | query | 是否保留配置（默认 true） |

**请求示例：**

```bash
DELETE /api/schedule/weeks/5?preserveConfig=true
```

**响应数据：**

```json
{
  "code": 200,
  "message": "清空成功",
  "data": {
    "weekNumber": 5,
    "deletedCourseCount": 12,
    "configPreserved": true
  },
  "timestamp": 1712649600000
}
```

---

## 冲突检测接口

### 1. 检测课程冲突

**接口：** `POST /api/schedule/conflicts/check`

**描述：** 检测课程安排是否存在冲突，包括教师、教室、班级时间冲突。

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `course` | Course | 否 | 待检测的课程（创建前检测） |
| `week` | number | 是 | 周次 |

**请求示例：**

```json
POST /api/schedule/conflicts/check
{
  "week": 5,
  "course": {
    "courseName": "高等数学",
    "teacherId": "t001",
    "classId": "c001",
    "roomId": "r001",
    "weekDay": 1,
    "startTime": "08:00",
    "endTime": "10:00",
    "duration": 120,
    "weeks": [5]
  }
}
```

**响应数据：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "hasConflicts": true,
    "conflicts": [
      {
        "type": "teacher",
        "message": "教师张教授在周一 08:00-10:00 已有课程安排",
        "existingCourse": {
          "id": "w5-001",
          "courseName": "线性代数",
          "weekDay": 1,
          "startTime": "08:00",
          "endTime": "09:30"
        }
      },
      {
        "type": "room",
        "message": "教室教学楼 A-301 在周一 08:00-10:00 已被占用",
        "existingCourse": {
          "id": "w5-002",
          "courseName": "大学物理",
          "weekDay": 1,
          "startTime": "09:00",
          "endTime": "10:30"
        }
      }
    ],
    "recommendations": [
      {
        "weekDay": 2,
        "startTime": "14:00",
        "roomId": "r005",
        "reason": "该时间段教师和教室均可用"
      }
    ]
  },
  "timestamp": 1712649600000
}
```

---

### 2. 获取冲突类型枚举

**接口：** `GET /api/schedule/conflicts/types`

**描述：** 获取所有支持的冲突类型说明。

**响应数据：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "type": "teacher",
      "name": "教师冲突",
      "description": "同一教师在同一时间有多个课程安排"
    },
    {
      "type": "room",
      "name": "教室冲突",
      "description": "同一教室在同一时间被多个课程占用"
    },
    {
      "type": "class",
      "name": "班级冲突",
      "description": "同一班级在同一时间有多个课程"
    },
    {
      "type": "duration",
      "name": "时长冲突",
      "description": "课程时长超出一天的可排课时间范围"
    }
  ],
  "timestamp": 1712649600000
}
```

---

## 数据导出/导入

### 1. 导出课表数据

**接口：** `GET /api/schedule/export`

**描述：** 导出指定范围（周次/班级）的课表数据。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `startWeek` | number | 是 | 起始周次 |
| `endWeek` | number | 是 | 结束周次 |
| `classId` | string | 否 | 班级 ID 过滤 |
| `format` | string | 否 | 导出格式（json/csv/xlsx，默认 json） |

**请求示例：**

```bash
GET /api/schedule/export?startWeek=1&endWeek=20&format=json
```

**响应数据（JSON 格式）：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "exportInfo": {
      "exportedAt": "2026-04-09T10:30:00Z",
      "startWeek": 1,
      "endWeek": 20,
      "totalCourses": 240
    },
    "courses": [ ... ],
    "timeSlots": [ ... ],
    "weekDays": [ ... ],
    "halfDayConfigs": [ ... ]
  },
  "timestamp": 1712649600000
}
```

---

### 2. 导入课表数据

**接口：** `POST /api/schedule/import`

**描述：** 从外部文件导入课表数据。

**请求体：** Multipart/form-data

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | 数据文件（支持 JSON/CSV/XLSX） |
| `options` | ImportOptions | 否 | 导入选项 |

**ImportOptions 结构：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `overrideExisting` | boolean | 否 | 是否覆盖已存在数据 |
| `skipConflicting` | boolean | 否 | 跳过冲突课程 |
| `startWeek` | number | 否 | 导入起始周次 |

**响应数据：**

```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "importedCount": 120,
    "skippedCount": 5,
    "failedCount": 2,
    "conflictCount": 3,
    "details": {
      "skipped": [
        {
          "courseName": "高等数学",
          "reason": "已存在相同时间段的课程"
        }
      ],
      "failed": [
        {
          "courseName": "数据结构",
          "reason": "教室 ID 不存在"
        }
      ],
      "conflicts": [
        {
          "courseName": "计算机网络",
          "conflictType": "teacher",
          "suggestion": "建议调整到周二 14:00"
        }
      ]
    }
  },
  "timestamp": 1712649600000
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如课程时间冲突） |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

---

## 数据类型定义

### Course（课程）

```typescript
interface Course {
  id: string;              // 课程唯一标识
  courseName: string;      // 课程名称
  teacherName: string;     // 教师姓名
  teacherId: string;       // 教师 ID
  className: string;       // 班级名称
  classId: string;         // 班级 ID
  roomName: string;        // 教室名称
  roomId: string;          // 教室 ID
  weekDay: number;         // 星期（1-7）
  startTime: string;       // 开始时间（HH:mm）
  endTime: string;         // 结束时间（HH:mm）
  duration: number;        // 课程时长（分钟）
  color: string;           // 显示颜色
  weeks: number[];         // 开课周次
  studentCount: number;    // 学生人数
}
```

### TimeSlotConfig（时段配置）

```typescript
interface TimeSlotConfig {
  id: string;              // 时段 ID
  label: string;           // 节次标签
  startTime: string;       // 开始时间
  endTime: string;         // 结束时间
  duration: number;        // 时长（分钟）
  halfDayType: HalfDayType; // 半天类型
  isBreak: boolean;        // 是否休息时段
  breakAfter?: number;     // 课后休息时长
  isSchedulable: boolean;  // 是否可排课
}
```

### WeekDayConfig（星期配置）

```typescript
interface WeekDayConfig {
  id: number;              // 星期 ID（1-7）
  name: string;            // 显示名称
  isEnabled: boolean;      // 是否启用
  isSchedulable: boolean;  // 是否可排课
}
```

### HalfDayConfig（半天配置）

```typescript
interface HalfDayConfig {
  type: HalfDayType;       // 半天类型
  name: string;            // 显示名称
  startTime: string;       // 开始时间
  endTime: string;         // 结束时间
  isSchedulable: boolean;  // 是否可排课
}
```

### HalfDayType（半天类型枚举）

```typescript
type HalfDayType = 'morning' | 'afternoon' | 'evening';
```

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2026-04-09 | 初始版本，包含课程管理、配置管理、冲突检测等基础接口 |
