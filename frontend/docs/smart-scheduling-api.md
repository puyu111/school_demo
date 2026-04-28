# 智能排课系统接口文档 (smart-scheduling)

## 概述

本文档描述智能排课系统（smart-scheduling）的所有 API 接口。该模块基于约束条件进行智能课程排课，支持手动排课、自动排课、冲突检测等功能。

### 基础信息

- **Base URL**: `/api/smart-scheduling`
- **认证方式**: 暂无（请求拦截器中预留了 token 添加位置）
- **响应格式**: 统一返回 JSON 格式

### 统一响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;        // 请求是否成功
  data?: T;                // 实际数据
  message?: string;        // 响应消息
  errorCode?: string;      // 错误码
}
```

### 错误码说明

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

## 一、基础数据接口

### 1.1 获取待排课程池

**接口**: `GET /api/smart-scheduling/courses`

**描述**: 获取待排课程池，包含所有尚未安排时间的课程。这些课程通常来自基础数据模块已录入但未排课的课程。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| semesterId | string | 否 | 学期 ID 过滤 |

**请求示例**:
```
GET /api/smart-scheduling/courses?semesterId=2026-spring
```

**响应数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 课程唯一标识 |
| name | string | 课程名称 |
| teacherId | string | 教师 ID |
| teacherName | string | 教师姓名 |
| classId | string | 班级 ID |
| className | string | 班级名称 |
| duration | number | 课程时长（节数，如 2 表示 2 节连上） |
| priority | number | 优先级（1-最高，数字越大优先级越低） |
| courseType | string | 课程类型（必修/选修） |
| preferredTimes | array | 偏好时间段（可选） |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "COURSE001",
      "name": "高等数学",
      "teacherId": "T001",
      "teacherName": "张教授",
      "classId": "C001",
      "className": "计算机 21 级 1 班",
      "duration": 2,
      "priority": 1,
      "courseType": "必修",
      "preferredTimes": [
        { "day": "monday", "slot": 1 },
        { "day": "wednesday", "slot": 1 }
      ]
    },
    {
      "id": "COURSE002",
      "name": "数据结构",
      "teacherId": "T002",
      "teacherName": "李教授",
      "classId": "C001",
      "className": "计算机 21 级 1 班",
      "duration": 2,
      "priority": 1,
      "courseType": "必修",
      "preferredTimes": [
        { "day": "tuesday", "slot": 2 },
        { "day": "thursday", "slot": 2 }
      ]
    },
    {
      "id": "COURSE003",
      "name": "大学物理",
      "teacherId": "T003",
      "teacherName": "王老师",
      "classId": "C004",
      "className": "物理 21 级 1 班",
      "duration": 2,
      "priority": 2,
      "courseType": "必修"
    }
  ],
  "message": "success"
}
```

---

### 1.2 获取教师列表

**接口**: `GET /api/smart-scheduling/teachers`

**描述**: 获取所有可用教师列表，包含教师的基本信息和排课约束。

**请求参数**: 无

**响应数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 教师唯一标识 |
| name | string | 教师姓名 |
| department | string | 所属院系 |
| maxDailyCourses | number | 每日最大课程数（可选） |
| unavailableTimes | array | 不可用时间段（可选） |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "T001",
      "name": "张教授",
      "department": "数学系",
      "maxDailyCourses": 3,
      "unavailableTimes": [
        { "day": "tuesday", "slots": [1, 2] },
        { "day": "thursday", "slots": [4] }
      ]
    },
    {
      "id": "T002",
      "name": "李教授",
      "department": "计算机系",
      "maxDailyCourses": 4,
      "unavailableTimes": [
        { "day": "monday", "slots": [1] },
        { "day": "friday", "slots": [5] }
      ]
    },
    {
      "id": "T003",
      "name": "王老师",
      "department": "物理系",
      "maxDailyCourses": 3,
      "unavailableTimes": [
        { "day": "wednesday", "slots": [3, 4] }
      ]
    }
  ],
  "message": "success"
}
```

---

### 1.3 获取班级列表

**接口**: `GET /api/smart-scheduling/classes`

**描述**: 获取所有可用班级列表，包含班级基本信息和排课约束。

**请求参数**: 无

**响应数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 班级唯一标识 |
| name | string | 班级名称 |
| studentCount | number | 学生人数 |
| maxDailyCourses | number | 每日最大课程数（可选） |
| unavailableTimes | array | 不可用时间段（可选） |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "C001",
      "name": "计算机 21 级 1 班",
      "studentCount": 45,
      "maxDailyCourses": 4,
      "unavailableTimes": [
        { "day": "friday", "slots": [4, 5] }
      ]
    },
    {
      "id": "C002",
      "name": "计算机 21 级 2 班",
      "studentCount": 48,
      "maxDailyCourses": 4,
      "unavailableTimes": []
    },
    {
      "id": "C003",
      "name": "数学 21 级 1 班",
      "studentCount": 40,
      "maxDailyCourses": 4,
      "unavailableTimes": []
    }
  ],
  "message": "success"
}
```

---

### 1.4 获取教室列表（可选功能）

**接口**: `GET /api/smart-scheduling/rooms`

**描述**: 获取所有可用教室列表（如果系统需要考虑教室因素）。

**请求参数**: 无

**响应数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 教室唯一标识 |
| name | string | 教室名称 |
| capacity | number | 容纳人数 |
| type | string | 教室类型（普通/多媒体/实验室） |
| building | string | 所在楼宇 |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "R001",
      "name": "教学楼 A-101",
      "capacity": 50,
      "type": "普通教室",
      "building": "教学楼 A"
    },
    {
      "id": "R002",
      "name": "教学楼 B-203",
      "capacity": 80,
      "type": "多媒体教室",
      "building": "教学楼 B"
    },
    {
      "id": "R003",
      "name": "实验楼 -305",
      "capacity": 40,
      "type": "实验室",
      "building": "实验楼"
    }
  ],
  "message": "success"
}
```

---

## 二、排课操作接口

### 2.1 获取已排课程列表

**接口**: `GET /api/smart-scheduling/schedules`

**描述**: 获取已排课程列表，返回所有已安排的课程数据。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| week | number | 否 | 周次过滤 |

**响应数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 排课记录 ID |
| courseId | string | 课程 ID |
| courseName | string | 课程名称 |
| teacherId | string | 教师 ID |
| teacherName | string | 教师姓名 |
| classId | string | 班级 ID |
| className | string | 班级名称 |
| roomId | string | 教室 ID（可选） |
| roomName | string | 教室名称（可选） |
| day | string | 星期（monday/tuesday/wednesday/thursday/friday） |
| slot | number | 节次（1-10） |
| week | number | 周次 |
| duration | number | 课程时长（节数） |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "SCH001",
      "courseId": "COURSE001",
      "courseName": "高等数学",
      "teacherId": "T001",
      "teacherName": "张教授",
      "classId": "C001",
      "className": "计算机 21 级 1 班",
      "day": "monday",
      "slot": 1,
      "week": 1,
      "duration": 2
    },
    {
      "id": "SCH002",
      "courseId": "COURSE002",
      "courseName": "数据结构",
      "teacherId": "T002",
      "teacherName": "李教授",
      "classId": "C001",
      "className": "计算机 21 级 1 班",
      "day": "tuesday",
      "slot": 2,
      "week": 1,
      "duration": 2
    }
  ],
  "message": "success"
}
```

---

### 2.2 保存单个排课记录

**接口**: `POST /api/smart-scheduling/schedules`

**描述**: 保存单个课程的排课记录。

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseId | string | 是 | 课程 ID |
| day | string | 是 | 星期（monday/tuesday/wednesday/thursday/friday） |
| slot | number | 是 | 节次（1-10） |
| week | number | 否 | 周次（默认 1） |
| roomId | string | 否 | 教室 ID（可选） |

**请求示例**:
```json
POST /api/smart-scheduling/schedules
{
  "courseId": "COURSE001",
  "day": "monday",
  "slot": 1,
  "week": 1,
  "roomId": "R001"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "SCH003",
    "courseId": "COURSE001",
    "day": "monday",
    "slot": 1,
    "week": 1
  },
  "message": "保存成功"
}
```

---

### 2.3 批量保存排课结果

**接口**: `POST /api/smart-scheduling/schedules/batch`

**描述**: 批量保存多个课程的排课结果，通常用于自动排课后的批量保存。

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courses | array | 是 | 课程数组 |
| week | number | 否 | 周次 |
| semesterId | string | 否 | 学期 ID |

**CourseItem 结构**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseId | string | 是 | 课程 ID |
| day | string | 是 | 星期 |
| slot | number | 是 | 节次 |
| roomId | string | 否 | 教室 ID |

**请求示例**:
```json
POST /api/smart-scheduling/schedules/batch
{
  "courses": [
    {
      "courseId": "COURSE001",
      "day": "monday",
      "slot": 1
    },
    {
      "courseId": "COURSE002",
      "day": "tuesday",
      "slot": 2
    },
    {
      "courseId": "COURSE003",
      "day": "wednesday",
      "slot": 1
    }
  ],
  "week": 1,
  "semesterId": "2026-spring"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "scheduled": 3,
    "failed": 0,
    "details": [
      {
        "courseId": "COURSE001",
        "status": "success",
        "scheduleId": "SCH001"
      },
      {
        "courseId": "COURSE002",
        "status": "success",
        "scheduleId": "SCH002"
      },
      {
        "courseId": "COURSE003",
        "status": "success",
        "scheduleId": "SCH003"
      }
    ]
  },
  "message": "批量保存成功"
}
```

---

### 2.4 删除排课记录

**接口**: `DELETE /api/smart-scheduling/schedules/:id`

**描述**: 删除指定的排课记录。

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 排课记录 ID |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "deletedId": "SCH001",
    "courseId": "COURSE001",
    "courseName": "高等数学"
  },
  "message": "删除成功"
}
```

---

### 2.5 清空所有排课

**接口**: `POST /api/smart-scheduling/schedules/clear`

**描述**: 清空所有排课记录，可选择按学期清空。

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| semesterId | string | 否 | 学期 ID（不传则清空所有） |

**请求示例**:
```json
POST /api/smart-scheduling/schedules/clear
{
  "semesterId": "2026-spring"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "deletedCount": 24,
    "semesterId": "2026-spring"
  },
  "message": "清空成功"
}
```

---

## 三、智能排课接口

### 3.1 一键智能排课

**接口**: `POST /api/smart-scheduling/auto-arrange`

**描述**: 使用智能算法自动安排所有待排课程。

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| strategy | string | 否 | 排课策略（priority/balanced，默认 priority） |
| week | number | 否 | 周次（默认 1） |

**策略说明**:

| 策略 | 说明 |
|------|------|
| priority | 优先排主课（优先级高的课程），适合核心课程优先安排 |
| balanced | 均衡分布，尽量将课程均匀分布在一周各天 |

**请求示例**:
```json
POST /api/smart-scheduling/auto-arrange
{
  "strategy": "priority",
  "week": 1
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "scheduled": [
      {
        "courseId": "COURSE001",
        "courseName": "高等数学",
        "day": "monday",
        "slot": 1,
        "week": 1,
        "duration": 2
      },
      {
        "courseId": "COURSE002",
        "courseName": "数据结构",
        "day": "tuesday",
        "slot": 2,
        "week": 1,
        "duration": 2
      }
    ],
    "failed": [
      {
        "course": {
          "id": "COURSE008",
          "name": "离散数学",
          "teacherId": "T001",
          "teacherName": "张教授"
        },
        "reason": "教师时间冲突，无可用时间段"
      }
    ],
    "stats": {
      "scheduled": 7,
      "failed": 1,
      "total": 8,
      "successRate": 87.5
    }
  },
  "message": "自动排课完成"
}
```

---

### 3.2 检测时间冲突

**接口**: `POST /api/smart-scheduling/check-conflict`

**描述**: 检测指定时间段是否存在冲突，包括教师冲突、班级冲突、教室冲突。

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseId | string | 是 | 课程 ID |
| day | string | 是 | 星期 |
| slot | number | 是 | 节次 |
| week | number | 否 | 周次 |

**请求示例**:
```json
POST /api/smart-scheduling/check-conflict
{
  "courseId": "COURSE001",
  "day": "monday",
  "slot": 1,
  "week": 1
}
```

**响应示例（有冲突）**:
```json
{
  "success": true,
  "data": {
    "hasConflict": true,
    "conflicts": [
      {
        "type": "teacher",
        "message": "教师张教授在周一第 1 节已有课程安排",
        "existingCourse": {
          "courseId": "COURSE005",
          "courseName": "线性代数",
          "day": "monday",
          "slot": 1
        }
      },
      {
        "type": "class",
        "message": "班级计算机 21 级 1 班在周一第 1 节已有课程",
        "existingCourse": {
          "courseId": "COURSE007",
          "courseName": "大学英语",
          "day": "monday",
          "slot": 1
        }
      }
    ]
  },
  "message": "检测到冲突"
}
```

**响应示例（无冲突）**:
```json
{
  "success": true,
  "data": {
    "hasConflict": false,
    "conflicts": []
  },
  "message": "该时间段可用"
}
```

---

### 3.3 推荐排课时间

**接口**: `POST /api/smart-scheduling/recommend`

**描述**: 为指定课程推荐合适的排课时间。

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseId | string | 是 | 课程 ID |

**请求示例**:
```json
POST /api/smart-scheduling/recommend
{
  "courseId": "COURSE001"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "day": "monday",
      "slot": 1,
      "reason": "符合偏好时间",
      "score": 95
    },
    {
      "day": "wednesday",
      "slot": 1,
      "reason": "符合偏好时间",
      "score": 95
    },
    {
      "day": "tuesday",
      "slot": 2,
      "reason": "上午时段，教师可用",
      "score": 85
    },
    {
      "day": "thursday",
      "slot": 2,
      "reason": "上午时段，教师可用",
      "score": 85
    },
    {
      "day": "friday",
      "slot": 3,
      "reason": "下午时段，可用",
      "score": 70
    }
  ],
  "message": "推荐成功"
}
```

---

## 四、统计与导出接口

### 4.1 获取统计数据

**接口**: `GET /api/smart-scheduling/stats`

**描述**: 获取排课统计数据，包括排课进度、教师使用情况、班级覆盖率等。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| semesterId | string | 否 | 学期 ID |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalCourses": 50,
    "scheduledCourses": 42,
    "pendingCourses": 8,
    "completionRate": 84.0,
    "teacherStats": {
      "totalTeachers": 15,
      "activeTeachers": 12,
      "utilizationRate": 80.0
    },
    "classStats": {
      "totalClasses": 10,
      "coveredClasses": 9,
      "coverageRate": 90.0
    },
    "timeSlotStats": {
      "totalSlots": 50,
      "usedSlots": 35,
      "utilizationRate": 70.0
    }
  },
  "message": "success"
}
```

---

### 4.2 导出排课表

**接口**: `GET /api/smart-scheduling/export`

**描述**: 导出排课表，支持 Excel、PDF 等格式。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| format | string | 否 | 导出格式（excel/pdf，默认 excel） |
| week | number | 否 | 周次（不传则导出全部） |
| type | string | 否 | 导出类型（teacher/class/room，默认全部） |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "/downloads/schedule_2026_spring.xlsx",
    "fileName": "排课表_2026 春季学期.xlsx",
    "format": "excel",
    "exportedAt": "2026-04-13T10:30:00Z",
    "totalCourses": 42
  },
  "message": "导出成功"
}
```

---

### 4.3 获取操作历史

**接口**: `GET /api/smart-scheduling/history`

**描述**: 获取排课操作历史记录。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 20） |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "HIS001",
        "action": "add",
        "courseId": "COURSE001",
        "courseName": "高等数学",
        "teacherName": "张教授",
        "className": "计算机 21 级 1 班",
        "day": "monday",
        "slot": 1,
        "timestamp": "2026-04-13T09:15:00Z",
        "operator": "admin"
      },
      {
        "id": "HIS002",
        "action": "remove",
        "courseId": "COURSE005",
        "courseName": "线性代数",
        "teacherName": "张教授",
        "className": "数学 21 级 1 班",
        "day": "wednesday",
        "slot": 2,
        "timestamp": "2026-04-13T08:30:00Z",
        "operator": "admin"
      }
    ],
    "total": 156,
    "page": 1,
    "pageSize": 20
  },
  "message": "success"
}
```

---

## 五、数据结构定义

### Course（待排课程）

```typescript
interface Course {
  id: string;              // 课程唯一标识
  name: string;            // 课程名称
  teacherId: string;       // 教师 ID
  teacherName: string;     // 教师姓名
  classId: string;         // 班级 ID
  className: string;       // 班级名称
  duration: number;        // 课程时长（节数）
  priority: number;        // 优先级（1-最高）
  courseType: string;      // 课程类型（必修/选修）
  preferredTimes?: {       // 偏好时间（可选）
    day: string;
    slot: number;
  }[];
}
```

### Teacher（教师）

```typescript
interface Teacher {
  id: string;              // 教师唯一标识
  name: string;            // 教师姓名
  department?: string;     // 所属院系
  maxDailyCourses?: number; // 每日最大课程数
  unavailableTimes?: {     // 不可用时间（可选）
    day: string;
    slots: number[];
  }[];
}
```

### ClassItem（班级）

```typescript
interface ClassItem {
  id: string;              // 班级唯一标识
  name: string;            // 班级名称
  studentCount?: number;   // 学生人数
  maxDailyCourses?: number; // 每日最大课程数
  unavailableTimes?: {     // 不可用时间（可选）
    day: string;
    slots: number[];
  }[];
}
```

### Room（教室）

```typescript
interface Room {
  id: string;              // 教室唯一标识
  name: string;            // 教室名称
  capacity: number;        // 容纳人数
  type: string;            // 教室类型
  building?: string;       // 所在楼宇
}
```

### ScheduleItem（排课记录）

```typescript
interface ScheduleItem {
  id: string;              // 排课记录 ID
  courseId: string;        // 课程 ID
  courseName: string;      // 课程名称
  teacherId: string;       // 教师 ID
  teacherName: string;     // 教师姓名
  classId: string;         // 班级 ID
  className: string;       // 班级名称
  roomId?: string;         // 教室 ID（可选）
  roomName?: string;       // 教室名称（可选）
  day: string;             // 星期（monday/tuesday/wednesday/thursday/friday）
  slot: number;            // 节次（1-10）
  week: number;            // 周次
  duration: number;        // 课程时长（节数）
}
```

### ConflictResult（冲突检测结果）

```typescript
interface ConflictResult {
  hasConflict: boolean;    // 是否存在冲突
  conflicts: {             // 冲突详情
    type: 'teacher' | 'class' | 'room';
    message: string;
    existingCourse?: {
      courseId: string;
      courseName: string;
      day: string;
      slot: number;
    };
  }[];
}
```

### TimeRecommendation（时间推荐）

```typescript
interface TimeRecommendation {
  day: string;             // 星期
  slot: number;            // 节次
  reason: string;          // 推荐理由
  score: number;           // 推荐分数（0-100）
}
```

### AutoArrangeResult（自动排课结果）

```typescript
interface AutoArrangeResult {
  scheduled: {             // 成功安排的课程
    courseId: string;
    courseName: string;
    day: string;
    slot: number;
    week: number;
    duration: number;
  }[];
  failed: {                // 安排失败的课程
    course: Course;
    reason: string;
  }[];
  stats: {
    scheduled: number;     // 成功数量
    failed: number;        // 失败数量
    total: number;         // 总数
    successRate: number;   // 成功率
  };
}
```

### ScheduleStats（统计数据）

```typescript
interface ScheduleStats {
  totalCourses: number;        // 总课程数
  scheduledCourses: number;    // 已排课程数
  pendingCourses: number;      // 待排课程数
  completionRate: number;      // 完成率（百分比）
  teacherStats: {
    totalTeachers: number;
    activeTeachers: number;
    utilizationRate: number;
  };
  classStats: {
    totalClasses: number;
    coveredClasses: number;
    coverageRate: number;
  };
  timeSlotStats: {
    totalSlots: number;
    usedSlots: number;
    utilizationRate: number;
  };
}
```

### WeekDay（星期枚举）

```typescript
type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
```

### TimeSlot（节次枚举）

```typescript
// 节次范围：1-10
// 1-2: 第 1-2 节（08:00-09:40）
// 3-4: 第 3-4 节（10:00-11:40）
// 5-6: 第 5-6 节（14:00-15:40）
// 7-8: 第 7-8 节（16:00-17:40）
// 9-10: 第 9-10 节（19:00-20:40）
```

---

## 六、前端使用示例

### 使用 useRequest Hook

```typescript
import { useRequest } from '@umijs/max';
import * as scheduleApi from '@/pages/smart-scheduling/services';

function SmartSchedulingPage() {
  const { data: courses, loading: coursesLoading } = useRequest(
    () => scheduleApi.getCourses(),
    {
      formatResult: (res) => res.data,
      onError: (err) => message.error('加载课程失败'),
    },
  );

  const { data: teachers, loading: teachersLoading } = useRequest(
    () => scheduleApi.getTeachers(),
    {
      formatResult: (res) => res.data,
    },
  );

  return (
    <div>
      {coursesLoading ? '加载课程中...' : JSON.stringify(courses)}
      {teachersLoading ? '加载教师中...' : JSON.stringify(teachers)}
    </div>
  );
}
```

### 使用封装的 Hooks

```typescript
import { useScheduleData } from '@/pages/smart-scheduling/hooks/useScheduleData';

function SmartSchedulingPage() {
  const {
    schedule,
    pendingCourses,
    teachers,
    classes,
    selectedCourse,
    loading,
    error,
    addCourseToSchedule,
    removeCourseFromSchedule,
    autoSchedule,
  } = useScheduleData();

  const handleAddCourse = async (course, day, slot) => {
    const success = await addCourseToSchedule(course, day, slot);
    if (success) {
      message.success('排课成功');
    }
  };

  const handleAutoSchedule = async () => {
    const result = await autoSchedule();
    message.success(`自动排课完成：成功${result.scheduled}门，失败${result.failed}门`);
  };

  return (
    <div>
      <CoursePool courses={pendingCourses} />
      <ScheduleTable 
        schedule={schedule}
        onDropCourse={handleAddCourse}
        onRemoveCourse={removeCourseFromSchedule}
      />
      <button onClick={handleAutoSchedule}>一键智能排课</button>
    </div>
  );
}
```

### 调用 API 示例

```typescript
import { 
  getCourses, 
  saveSchedule, 
  autoArrange,
  checkConflict 
} from '@/pages/smart-scheduling/services';

// 获取课程列表
const coursesRes = await getCourses();
if (coursesRes.success) {
  console.log('课程列表:', coursesRes.data);
}

// 保存排课记录
const saveRes = await saveSchedule({
  courseId: 'COURSE001',
  day: 'monday',
  slot: 1,
  week: 1
});

// 检测冲突
const conflictRes = await checkConflict({
  courseId: 'COURSE001',
  day: 'monday',
  slot: 1
});
if (conflictRes.data.hasConflict) {
  console.log('冲突:', conflictRes.data.conflicts);
}

// 自动排课
const autoRes = await autoArrange({ strategy: 'priority' });
if (autoRes.success) {
  console.log('排课结果:', autoRes.data);
}
```

---

## 七、常见问题

### Q1: 课程时长如何处理？
A: 课程时长通过 `duration` 字段表示，单位为节数。例如 `duration: 2` 表示该课程占用 2 个连续节次。排课时从指定的 `slot` 开始，连续占用 `duration` 个时间段。

### Q2: 如何处理教师的不可用时间？
A: 教师信息中包含 `unavailableTimes` 字段，列出教师不可用的时间段。排课时需要避开这些时间段。

### Q3: 如何处理班级/教师的每日课程上限？
A: 教师和班级信息中包含 `maxDailyCourses` 字段。排课时需要检查当天已排课程数量，不超过上限。

### Q4: 偏好时间如何使用？
A: 课程的 `preferredTimes` 字段包含偏好的时间段。推荐接口会优先返回这些时间段，并给出更高的推荐分数。

### Q5: 冲突检测的优先级？
A: 冲突检测顺序为：教师冲突 > 班级冲突 > 教室冲突（如果启用）。检测到任一冲突即返回冲突信息。

---

## 八、版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-13 | 初始版本，包含基础排课功能 |
