# drag-schedule-test 网络请求模块

## 文件结构

```
drag-schedule-test/
├── service/              # API 请求服务层
│   └── index.ts          # 所有 API 请求函数
├── services/             # 类型定义
│   └── index.ts          # 数据类型和接口定义
├── hooks/                # 自定义 Hooks
│   ├── useApi.ts         # API 请求 Hooks
│   └── useScheduleData.ts # 排课数据管理 Hook
└── components/           # UI 组件
    └── index.ts          # 统一导出
```

## 快速开始

### 1. 使用 API 请求函数

```typescript
import * as scheduleApi from './service';

// 获取课程列表
const response = await scheduleApi.getCourses({ week: 1, classId: 'c001' });
console.log(response.data); // 课程数组

// 创建课程
const newCourse = await scheduleApi.createCourse({
  courseName: '高等数学',
  teacherId: 't001',
  classId: 'c001',
  roomId: 'r001',
  weekDay: 1,
  startTime: '08:00',
  endTime: '10:00',
  duration: 120,
  weeks: [1, 2, 3],
});

// 移动课程（拖拽后调用）
await scheduleApi.moveCourses([
  { courseId: 'w1-1', newWeekDay: 2 },
  { courseId: 'w1-2', newWeekDay: 3, newStartTime: '10:10' },
]);
```

### 2. 使用 umi useRequest Hook

```typescript
import { useRequest } from '@umijs/max';
import * as scheduleApi from './service';

function MyComponent() {
  const { data, loading, error } = useRequest(
    () => scheduleApi.getCourses({ week: currentWeek }),
    {
      formatResult: (res) => res.data,
      onError: (err) => message.error('加载失败'),
    },
  );

  return <div>{loading ? '加载中...' : JSON.stringify(data)}</div>;
}
```

### 3. 使用封装的 Hooks

```typescript
import {
  useWeekCourses,
  useTimeSlots,
  useWeekDays,
  useCourseActions,
  useScheduleDataFull,
} from './hooks/useApi';

function SchedulePage() {
  const currentWeek = 5;

  // 获取课程数据
  const { courses, loading, refresh } = useWeekCourses(currentWeek);

  // 获取配置数据
  const { timeSlots, halfDayConfigs, dailyConfig } = useTimeSlots();
  const { weekDays } = useWeekDays();

  // 使用整合 Hook（推荐）
  const {
    courses,
    timeSlots,
    weekDays,
    halfDayConfigs,
    dailyConfig,
    coursesLoading,
    configLoading,
    submitLoading,
    moveCourses,
    saveSchedule,
    refreshSchedule,
    checkConflicts,
  } = useScheduleDataFull(currentWeek);

  return <ScheduleTable courses={courses} timeSlots={timeSlots} ... />;
}
```

### 4. 使用操作类 Hooks

```typescript
import { useCourseActions, useConfigActions, useScheduleSubmit } from './hooks/useApi';

function ScheduleActions() {
  const { createCourse, updateCourse, deleteCourse, moveCourses } = useCourseActions();
  const { updateTimeSlots, updateWeekDays } = useConfigActions();
  const { saveSchedule, refreshSchedule } = useScheduleSubmit();

  const handleSave = async () => {
    const result = await saveSchedule({
      week: currentWeek,
      courses: currentCourses,
    });

    if (result.success) {
      message.success(result.message);
    } else {
      message.error('保存失败');
    }
  };

  return <button onClick={handleSave}>保存</button>;
}
```

## API 列表

### 课程管理

| 函数 | 说明 | 参数 |
|------|------|------|
| `getCourses` | 获取课程列表 | `{ week, classId?, teacherId?, roomId? }` |
| `getCourse` | 获取单个课程 | `courseId` |
| `createCourse` | 创建课程 | `Partial<Course>` |
| `updateCourse` | 更新课程 | `courseId, Partial<Course>` |
| `moveCourses` | 批量移动课程 | `MoveRequest[]` |
| `deleteCourse` | 删除课程 | `courseId` |
| `batchDeleteCourses` | 批量删除 | `string[]` |

### 配置管理

| 函数 | 说明 | 参数 |
|------|------|------|
| `getTimeSlots` | 获取时段配置 | 无 |
| `updateTimeSlots` | 更新时段配置 | `{ halfDayConfigs?, timeSlots?, dailyConfig? }` |
| `resetTimeSlots` | 重置时段配置 | 无 |
| `getWeekDays` | 获取星期配置 | 无 |
| `updateWeekDays` | 更新星期配置 | `{ weekDays: WeekDayConfig[] }` |

### 周次管理

| 函数 | 说明 | 参数 |
|------|------|------|
| `getWeek` | 获取周次信息 | `weekNumber` |
| `copyWeekData` | 复制周次数据 | `sourceWeek, targetWeeks, options?` |
| `clearWeek` | 清空周次数据 | `weekNumber, preserveConfig?` |

### 冲突检测

| 函数 | 说明 | 参数 |
|------|------|------|
| `checkConflicts` | 检测冲突 | `{ week, course? }` |
| `getConflictTypes` | 获取冲突类型 | 无 |

### 导入导出

| 函数 | 说明 | 参数 |
|------|------|------|
| `exportSchedule` | 导出数据 | `{ startWeek, endWeek, classId?, format? }` |
| `importSchedule` | 导入数据 | `File, options?` |

### 保存/提交

| 函数 | 说明 | 参数 |
|------|------|------|
| `saveWeekSchedule` | 保存周次课表 | `{ week, courses, timeSlots?, weekDays?, dailyConfig?, halfDayConfig? }` |
| `refreshWeekData` | 刷新周次数据 | `week` |

## 配置后端地址

当前使用 umi 的 `request` 插件，默认请求到同一域名下的 `/api` 路径。

### 方式一：修改 `service/index.ts`

```typescript
// 修改 BASE_URL 为实际后端地址
const BASE_URL = 'http://localhost:8080/api/schedule';
```

### 方式二：使用 umi 代理配置

在 `config/proxy.ts` 或 `.umirc.ts` 中配置：

```typescript
export default {
  proxy: {
    '/api/schedule': {
      target: 'http://localhost:8080/',
      changeOrigin: true,
    },
  },
};
```

### 方式三：使用环境变量

```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

```typescript
// service/index.ts
const BASE_URL = process.env.REACT_APP_API_BASE_URL + '/schedule';
```

## 响应格式

所有 API 返回统一格式：

```typescript
interface ApiResponse<T> {
  code: number;   // 200 成功，其他为错误码
  message: string; // 响应消息
  data: T;        // 实际数据
  timestamp: number; // 时间戳
}
```

## 错误处理

```typescript
try {
  const res = await scheduleApi.getCourses({ week: 1 });
  if (res.code === 200) {
    // 成功
  }
} catch (err) {
  // 网络错误或服务器错误
  console.error('请求失败:', err);
  message.error('加载失败');
}
```

## 类型定义

所有类型定义在 `services/index.ts` 中：

```typescript
import type { Course, TimeSlotConfig, WeekDayConfig } from './services';

const course: Course = {
  id: 'w1-1',
  courseName: '高等数学',
  teacherId: 't001',
  // ...
};
```
