# drag-schedule-test 可拖拽课表组件

## 功能特性

- 支持拖拽课程卡片调整时间和星期
- 支持按周次查看和管理课表
- 支持时段配置（课时、休息时间）
- 支持星期配置（工作日/全周模式）
- 支持冲突检测
- 支持数据保存和刷新
- 响应式设计，支持移动端

## 目录结构

```
drag-schedule-test/
├── index.tsx                 # 主入口组件
├── components/               # 可复用组件
│   ├── index.ts             # 组件统一导出
│   ├── WeekSelector.tsx     # 周次选择器
│   ├── DraggableCourseCard.tsx  # 可拖拽课程卡片
│   ├── DroppableCell.tsx    # 可放置单元格
│   ├── ScheduleTable.tsx    # 课表主体表格
│   ├── ScheduleToolbar.tsx  # 顶部工具栏
│   ├── TimeSlotConfigPanel.tsx  # 时段配置面板
│   └── WeekDayConfigPanel.tsx   # 星期配置面板
├── service/                  # API 请求服务层
│   └── index.ts             # 所有 API 请求函数
├── services/                 # 类型定义
│   └── index.ts             # 数据类型和接口定义
├── hooks/                    # 自定义 Hooks
│   ├── useApi.ts            # API 请求 Hooks
│   └── useScheduleData.ts   # 排课数据管理 Hook
├── types/                    # 类型定义
│   └── index.ts             # 统一类型导出
├── utils/                    # 工具函数
│   └── index.ts             # 工具函数导出
├── constants/                # 常量配置
│   └── index.ts             # 常量导出
├── README.md                 # 组件化改造说明（本文档）
├── API.md                    # 详细 API 接口文档
├── BACKEND_API.md            # 后端接口文档
└── REQUEST.md                # 网络请求模块使用说明
```

## 快速开始

### 1. 导入组件

```typescript
import {
  ScheduleTable,
  ScheduleToolbar,
  WeekSelector,
  DraggableCourseCard,
  DroppableCell,
  useScheduleDataFull,
} from './drag-schedule-test';
```

### 2. 使用整合 Hook 获取数据

```typescript
function MySchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(1);

  const {
    courses,
    timeSlots,
    weekDays,
    halfDayConfigs,
    dailyConfig,
    coursesLoading,
    moveCourses,
    saveSchedule,
  } = useScheduleDataFull(currentWeek);

  return (
    <ScheduleTable
      courses={courses}
      timeSlots={timeSlots}
      weekDays={weekDays}
      halfDayConfigs={halfDayConfigs}
      currentWeek={currentWeek}
      onCourseUpdate={async (updated) => {
        await saveSchedule({ week: currentWeek, courses: updated });
      }}
    />
  );
}
```

## 网络请求

### 使用 API 服务

```typescript
import * as scheduleApi from './service';

// 获取课程
const courses = await scheduleApi.getCourses({ week: 1 });

// 创建课程
await scheduleApi.createCourse({
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

// 移动课程（拖拽后）
await scheduleApi.moveCourses([
  { courseId: 'w1-1', newWeekDay: 2 },
]);

// 保存课表
await scheduleApi.saveWeekSchedule({
  week: 1,
  courses: currentCourses,
});
```

### 配置后端地址

在 `service/index.ts` 中修改 `BASE_URL`：

```typescript
// 方式一：直接修改
const BASE_URL = 'http://your-api-server.com/api/schedule';

// 方式二：使用环境变量
const BASE_URL = process.env.REACT_APP_API_BASE_URL + '/schedule';
```

## 文档

| 文档 | 说明 |
|------|------|
| [README.md](./README.md) | 组件结构和架构说明 |
| [API.md](./API.md) | 前端组件、类型、工具函数详细文档 |
| [BACKEND_API.md](./BACKEND_API.md) | 后端接口文档 |
| [REQUEST.md](./REQUEST.md) | 网络请求模块使用说明 |
