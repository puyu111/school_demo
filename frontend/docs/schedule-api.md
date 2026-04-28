# 课表管理模块 API 文档

## 概述

本文档描述课表管理模块（Schedule）的所有 API 接口。

### 基础信息

- **Base URL**: `/api/schedule`
- **认证方式**: Bearer Token（通过请求拦截器自动添加）
- **响应格式**: 统一 JSON 格式

### 统一响应格式

```typescript
interface ApiResponse<T> {
  code: number;        // 200 成功，其他为错误码
  message: string;     // 响应消息
  data: T;             // 实际数据
  timestamp: number;   // 时间戳
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

## 一、课程管理接口

### 1.1 获取课表数据

**接口**: `GET /api/schedule/courses`

**描述**: 获取指定周次的课程安排

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| week | number | 是 | 周次（1-20） |
| classId | string | 否 | 班级 ID 过滤 |
| teacherId | string | 否 | 教师 ID 过滤 |
| roomId | string | 否 | 教室 ID 过滤 |

**请求示例**:
```
GET /api/schedule/courses?week=5&classId=C001
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "1",
      "courseName": "高等数学",
      "teacherName": "张三",
      "teacherId": "T001",
      "className": "计算机 1 班",
      "classId": "C001",
      "roomName": "A-101",
      "roomId": "R001",
      "weekDay": 1,
      "startTime": "08:00",
      "endTime": "09:40",
      "duration": 100,
      "color": "#1890ff",
      "weeks": [1, 2, 3, 4, 5],
      "studentCount": 45
    }
  ],
  "timestamp": 1712649600000
}
```

---

### 1.2 获取单个课程详情

**接口**: `GET /api/schedule/courses/:courseId`

**描述**: 获取单个课程的详细信息

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| courseId | string | 课程 ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "1",
    "courseName": "高等数学",
    "teacherName": "张三",
    "teacherId": "T001",
    "className": "计算机 1 班",
    "classId": "C001",
    "roomName": "A-101",
    "roomId": "R001",
    "weekDay": 1,
    "startTime": "08:00",
    "endTime": "09:40",
    "duration": 100,
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

### 1.3 创建课程

**接口**: `POST /api/schedule/courses`

**描述**: 创建新的课程安排

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseName | string | 是 | 课程名称 |
| teacherId | string | 是 | 教师 ID |
| teacherName | string | 是 | 教师姓名 |
| classId | string | 是 | 班级 ID |
| className | string | 是 | 班级名称 |
| roomId | string | 是 | 教室 ID |
| roomName | string | 是 | 教室名称 |
| weekDay | number | 是 | 星期（1-7） |
| startTime | string | 是 | 开始时间（HH:mm） |
| endTime | string | 是 | 结束时间（HH:mm） |
| duration | number | 是 | 课程时长（分钟） |
| weeks | number[] | 是 | 开课周次数组 |
| color | string | 否 | 显示颜色（默认随机） |
| studentCount | number | 否 | 学生人数 |

**请求示例**:
```json
{
  "courseName": "数据结构",
  "teacherId": "T002",
  "teacherName": "李四",
  "classId": "C001",
  "className": "计算机 1 班",
  "roomId": "R002",
  "roomName": "B-201",
  "weekDay": 2,
  "startTime": "10:10",
  "endTime": "11:50",
  "duration": 100,
  "weeks": [1, 2, 3, 4, 5],
  "color": "#52c41a",
  "studentCount": 45
}
```

---

### 1.4 更新课程

**接口**: `PUT /api/schedule/courses/:courseId`

**描述**: 更新课程的完整信息

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| courseId | string | 课程 ID |

**请求体**: 所有字段可选

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "1",
    "courseName": "高等数学",
    "weekDay": 3,
    "startTime": "10:10",
    "endTime": "11:50",
    "duration": 100,
    "weeks": [1, 2, 3, 4]
  },
  "timestamp": 1712649600000
}
```

---

### 1.5 删除课程

**接口**: `DELETE /api/schedule/courses/:courseId`

**描述**: 删除指定的课程安排

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| courseId | string | 课程 ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "deletedId": "1",
    "courseName": "高等数学"
  },
  "timestamp": 1712649600000
}
```

---

### 1.6 批量删除课程

**接口**: `POST /api/schedule/courses/batch-delete`

**描述**: 批量删除多个课程

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseIds | string[] | 是 | 课程 ID 数组 |

**响应示例**:
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "deletedCount": 3,
    "deletedIds": ["1", "2", "3"]
  },
  "timestamp": 1712649600000
}
```

---

### 1.7 批量移动课程（拖拽操作）

**接口**: `POST /api/schedule/courses/move`

**描述**: 批量移动课程到新的时间段或星期

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| moves | MoveRequest[] | 是 | 移动操作数组 |

**MoveRequest 结构**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courseId | string | 是 | 课程 ID |
| newWeekDay | number | 是 | 新星期（1-7） |
| newStartTime | string | 否 | 新开始时间（可选） |

**请求示例**:
```json
{
  "moves": [
    {
      "courseId": "1",
      "newWeekDay": 2,
      "newStartTime": "08:00"
    },
    {
      "courseId": "2",
      "newWeekDay": 3
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "移动成功",
  "data": {
    "success": [
      {
        "courseId": "1",
        "oldWeekDay": 1,
        "newWeekDay": 2
      }
    ],
    "failed": [],
    "conflicts": []
  },
  "timestamp": 1712649600000
}
```

---

### 1.8 保存课表数据

**接口**: `POST /api/schedule/save`

**描述**: 保存指定周次的课表数据

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| week | number | 是 | 周次 |
| courses | Course[] | 是 | 课程数组 |

**响应示例**:
```json
{
  "code": 200,
  "message": "保存成功",
  "data": {
    "week": 5,
    "savedCount": 12
  },
  "timestamp": 1712649600000
}
```

---

### 1.9 刷新课表数据

**接口**: `GET /api/schedule/refresh`

**描述**: 刷新指定周次的课表数据

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| week | number | 是 | 周次 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [...],
  "timestamp": 1712649600000
}
```

---

## 二、统计数据接口

### 2.1 获取统计数据

**接口**: `GET /api/schedule/statistics`

**描述**: 获取指定周次的统计数据

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| week | number | 是 | 周次 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": {
      "courses": 10,
      "teachers": 8,
      "classes": 5,
      "rooms": 6,
      "students": 450
    },
    "timeDistribution": {
      "morning": 4,
      "afternoon": 5,
      "evening": 1
    },
    "conflicts": {
      "teacherConflict": 0,
      "roomConflict": 0,
      "classConflict": 0,
      "total": 0
    }
  },
  "timestamp": 1712649600000
}
```

---

## 三、冲突检测接口

### 3.1 检测课程冲突

**接口**: `POST /api/schedule/conflicts/check`

**描述**: 检测课程安排是否存在冲突

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| course | Course | 否 | 待检测的课程 |
| week | number | 是 | 周次 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "hasConflicts": true,
    "conflicts": [
      {
        "type": "teacher",
        "message": "教师张三在周一 08:00-10:00 已有课程安排",
        "existingCourse": {
          "id": "1",
          "courseName": "线性代数",
          "weekDay": 1,
          "startTime": "08:00"
        }
      }
    ],
    "recommendations": [
      {
        "weekDay": 2,
        "startTime": "14:00",
        "roomId": "R005",
        "reason": "该时间段教师和教室均可用"
      }
    ]
  },
  "timestamp": 1712649600000
}
```

---

## 四、导出/导入接口

### 4.1 导出课表数据

**接口**: `GET /api/schedule/export`

**描述**: 导出指定范围的课表数据

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startWeek | number | 是 | 起始周次 |
| endWeek | number | 是 | 结束周次 |
| classId | string | 否 | 班级 ID 过滤 |
| format | string | 否 | 导出格式（json/csv/xlsx） |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "exportInfo": {
      "exportedAt": "2026-04-10T10:30:00Z",
      "startWeek": 1,
      "endWeek": 20,
      "totalCourses": 240
    },
    "courses": [...],
    "timeSlots": [],
    "weekDays": []
  },
  "timestamp": 1712649600000
}
```

---

### 4.2 导入课表数据

**接口**: `POST /api/schedule/import`

**描述**: 从外部文件导入课表数据

**请求体**: Multipart/form-data

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 数据文件 |
| options | ImportOptions | 否 | 导入选项 |

**响应示例**:
```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "importedCount": 120,
    "skippedCount": 5,
    "failedCount": 2,
    "conflictCount": 3
  },
  "timestamp": 1712649600000
}
```

---

## 五、数据结构定义

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

### StatisticsData（统计数据）

```typescript
interface StatisticsData {
  total: {
    courses: number;
    teachers: number;
    classes: number;
    rooms: number;
    students: number;
  };
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  conflicts: {
    teacherConflict: number;
    roomConflict: number;
    classConflict: number;
    total: number;
  };
}
```

---

## 六、前端使用示例

### 使用 useScheduleData Hook

```typescript
import { useScheduleData } from '@/pages/Schedule/hooks/useScheduleData';

function SchedulePage() {
  const currentWeek = 5;
  const {
    courses,
    loading,
    error,
    loadSchedule,
    refreshSchedule,
    addCourse,
    updateCourse,
    removeCourse,
    moveCourses,
    saveSchedule,
  } = useScheduleData(currentWeek);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <div>
      <Button onClick={refreshSchedule}>刷新</Button>
      <Button onClick={saveSchedule}>保存</Button>
      <ScheduleTable courses={courses} />
    </div>
  );
}
```

### 直接调用 API

```typescript
import * as scheduleApi from '@/pages/Schedule/services/api';

// 获取课表数据
const courses = await scheduleApi.getScheduleData({ week: 5 });

// 创建课程
const newCourse = await scheduleApi.createCourse({
  courseName: '新课程',
  teacherId: 'T001',
  // ...其他字段
});

// 更新课程
await scheduleApi.updateCourse('1', { weekDay: 2 });

// 删除课程
await scheduleApi.deleteCourse('1');

// 批量移动课程
await scheduleApi.batchMoveCourses({
  moves: [
    { courseId: '1', newWeekDay: 2 },
    { courseId: '2', newWeekDay: 3 },
  ]
});

// 保存课表
await scheduleApi.saveSchedule({
  week: 5,
  courses,
});
```

---

## 七、Mock 数据支持

开发环境可使用 Mock 数据进行测试：

```typescript
import { USE_MOCK } from '@/pages/Schedule/constants';
import * as mockApi from '@/pages/Schedule/services/mockData';
import * as realApi from '@/pages/Schedule/services/api';

// 根据环境自动选择
const api = USE_MOCK ? mockApi : realApi;

// 使用
const courses = await api.getScheduleData({ week: 5 });
```

---

**文档版本**: v1.0
**最后更新**: 2026-04-10
