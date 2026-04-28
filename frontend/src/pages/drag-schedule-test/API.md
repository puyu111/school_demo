# drag-schedule-test 接口文档

## 目录

- [数据结构](#数据结构)
- [组件接口](#组件接口)
- [工具函数](#工具函数)
- [自定义 Hooks](#自定义-hooks)
- [常量配置](#常量配置)

---

## 数据结构

### Course（课程）

课程数据的核心接口，用于描述一门课程的所有信息。

```typescript
interface Course {
  // 唯一标识
  id: string;

  // 课程基本信息
  courseName: string;      // 课程名称
  teacherName: string;     // 教师姓名
  teacherId: string;       // 教师 ID
  className: string;       // 班级名称
  classId: string;         // 班级 ID
  roomName: string;        // 教室名称
  roomId: string;          // 教室 ID

  // 时间安排
  weekDay: number;         // 星期（1-7，1 为周一）
  startTime: string;       // 开始时间（HH:mm 格式）
  endTime: string;         // 结束时间（HH:mm 格式）
  duration: number;        // 课程时长（分钟）

  // 显示和范围
  color: string;           // 课程卡片显示颜色
  weeks: number[];         // 开课周次数组
  studentCount: number;    // 学生人数
}
```

**示例数据：**

```typescript
{
  id: 'w1-1',
  courseName: '高等数学',
  teacherName: '张教授',
  teacherId: 't001',
  className: '计算机科学与技术 1 班',
  classId: 'c001',
  roomName: '教学楼 A-301',
  roomId: 'r001',
  weekDay: 1,
  startTime: '08:00',
  endTime: '10:00',
  duration: 120,
  color: '#1890ff',
  weeks: [1],
  studentCount: 45
}
```

---

### HalfDayType（半天类型）

```typescript
type HalfDayType = 'morning' | 'afternoon' | 'evening';
```

| 值 | 说明 | 时间范围 |
|----|------|----------|
| `morning` | 上午 | 08:00 - 12:00 |
| `afternoon` | 下午 | 14:00 - 18:00 |
| `evening` | 晚上 | 19:00 - 21:00 |

---

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

---

### TimeSlotConfig（时段配置）

```typescript
interface TimeSlotConfig {
  id: string;              // 时段唯一标识
  label: string;           // 节次标签（如"第 1 节"）
  startTime: string;       // 开始时间
  endTime: string;         // 结束时间
  duration: number;        // 时长（分钟）
  halfDayType: HalfDayType; // 所属半天类型
  isBreak: boolean;        // 是否为休息时段
  breakAfter?: number;     // 课后休息时长（分钟）
  isSchedulable: boolean;  // 是否可排课
}
```

---

### DailyScheduleConfig（每日配置）

```typescript
interface DailyScheduleConfig {
  totalPeriods: number;        // 每日总节数
  defaultDuration: number;     // 默认每节课时长（分钟）
  defaultBreakDuration: number; // 默认课间休息时长（分钟）
}
```

---

### WeekDayConfig（星期配置）

```typescript
interface WeekDayConfig {
  id: number;              // 星期 ID（1-7）
  name: string;            // 显示名称（如"周一"）
  isEnabled: boolean;      // 是否启用
  isSchedulable: boolean;  // 是否可排课
}
```

---

### 拖拽相关类型

```typescript
// 拖拽数据项
interface DragItem {
  type: string;
  courseId: string;
  fromWeekDay: number;
  fromTimeSlotIndex: number;
  course: Course;
}

// 放置结果
interface DropResult {
  success: boolean;
}
```

---

## 组件接口

### WeekSelector（周次选择器）

**功能：** 用于切换当前查看的周次。

```typescript
interface WeekSelectorProps {
  currentWeek: number;           // 当前周次
  totalWeeks: number;            // 总周数
  onWeekChange: (week: number) => void;  // 周次变化回调
  isMobile?: boolean;            // 是否移动端模式
}
```

**使用示例：**

```tsx
<WeekSelector
  currentWeek={currentWeek}
  totalWeeks={20}
  onWeekChange={handleWeekChange}
  isMobile={isMobileDevice}
/>
```

---

### DraggableCourseCard（可拖拽课程卡片）

**功能：** 显示课程信息并支持拖拽操作。

```typescript
interface DraggableCourseCardProps {
  course: Course;                // 课程数据
  weekDay: number;               // 星期
  timeSlotIndex: number;         // 时段索引
  isDragDisabled?: boolean;      // 是否禁用拖拽
  spanCount?: number;            // 占据时段数
  isMobile?: boolean;            // 是否移动端模式
}
```

---

### DroppableCell（可放置单元格）

**功能：** 课表中的单元格，支持放置课程。

```typescript
interface DroppableCellProps {
  weekDay: number;                           // 星期
  timeSlotIndex: number;                     // 时段索引
  cellCourse: Course | null;                 // 当前单元格课程
  isOccupied: boolean;                       // 是否被占用
  timeSlot: TimeSlotConfig;                  // 时段配置
  weekDayConfig: WeekDayConfig;              // 星期配置
  halfDayConfigs: HalfDayConfig[];           // 半天配置数组
  onMoveCourse: (courseId: string, newWeekDay: number, newTimeSlotIndex: number) => void;
  isFirstCell: boolean;                      // 是否为首单元格
  spanCount?: number;                        // 占据时段数
  isRowSpanned?: boolean;                    // 是否被连堂课程跨越
  isMobile?: boolean;                        // 是否移动端模式
}
```

---

### ScheduleTable（课表主体）

**功能：** 显示完整的课表网格。

```typescript
interface ScheduleTableProps {
  courses: Course[];             // 课程数组
  timeSlots: TimeSlotConfig[];   // 时段配置数组
  weekDays: WeekDayConfig[];     // 星期配置数组
  halfDayConfigs: HalfDayConfig[]; // 半天配置数组
  currentWeek: number;           // 当前周次
  totalWeeks?: number;           // 总周数
  onCourseUpdate: (courses: Course[]) => void; // 课程更新回调
  onWeekChange?: (week: number) => void;       // 周次变化回调
}
```

---

### ScheduleToolbar（工具栏）

**功能：** 顶部操作工具栏。

```typescript
interface ScheduleToolbarProps {
  currentWeek: number;           // 当前周次
  totalWeeks: number;            // 总周数
  hasUnsavedChanges: boolean;    // 是否有未保存更改
  loading: boolean;              // 是否加载中
  showConfigPanel: boolean;      // 是否显示配置面板
  onWeekChange: (week: number) => void;       // 周次变化回调
  onToggleConfigPanel: () => void;            // 切换配置面板
  onUndo: () => void;            // 撤销操作
  onRefresh: () => void;         // 刷新操作
  onSave: () => void;            // 保存操作
  isMobile?: boolean;            // 是否移动端模式
}
```

---

### TimeSlotConfigPanel（时段配置面板）

**功能：** 配置每节课的时间和时长。

```typescript
interface TimeSlotConfigPanelProps {
  config: TimeSlotConfig[];                          // 时段配置数组
  dailyConfig: DailyScheduleConfig;                  // 每日配置
  halfDayConfig: HalfDayConfig[];                    // 半天配置数组
  onChange: (
    config: TimeSlotConfig[],
    dailyConfig: DailyScheduleConfig,
    halfDayConfig: HalfDayConfig[]
  ) => void;
}
```

---

### WeekDayConfigPanel（星期配置面板）

**功能：** 配置工作日起用状态。

```typescript
interface WeekDayConfigPanelProps {
  config: WeekDayConfig[];       // 星期配置数组
  onChange: (config: WeekDayConfig[]) => void; // 配置变化回调
}
```

---

## 工具函数

### 设备检测

```typescript
// 检测是否为移动设备
function isMobile(): boolean;

// 获取设备类型
function getDeviceType(): 'mobile' | 'desktop';
```

---

### 时间转换

```typescript
// 时间字符串转分钟数
// 例："08:30" => 510
function timeToMinutes(time: string): number;

// 分钟数转时间字符串
// 例：510 => "08:30"
function minutesToTime(minutes: number): string;

// 获取时间所属的半天类型
function getHalfDayType(time: string): HalfDayType;

// 计算课程结束时间
function calculateEndTime(startTime: string, duration: number): string;
```

---

### 课程计算

```typescript
// 获取课程起始时段索引
function getCourseStartTimeSlotIndex(
  course: Course,
  timeSlots: TimeSlotConfig[]
): number;

// 获取课程占据的时段数量
function getCourseSpanCount(
  course: Course,
  timeSlots: TimeSlotConfig[]
): number;

// 检查时间段是否在可排课的半天内
function isTimeInSchedulableHalfDay(
  startTime: string,
  halfDayConfigs: HalfDayConfig[]
): boolean;
```

---

### 配置生成器

```typescript
// 生成默认时段配置
function generateDefaultTimeSlots(
  totalPeriods?: number,      // 默认 10
  duration?: number,          // 默认 45 分钟
  breakDuration?: number,     // 默认 10 分钟
  startHour?: number          // 默认 8 点
): TimeSlotConfig[];
```

---

## 自定义 Hooks

### useScheduleData

**功能：** 排课数据管理的完整状态和操作方法。

```typescript
interface UseScheduleData {
  // 状态
  courses: Course[];                    // 所有课程
  pendingCourses: Course[];             // 待排课程
  selectedCourse: Course | null;        // 当前选中课程
  conflicts: any[];                     // 冲突列表
  history: any[];                       // 操作历史
  recommendations: any[];               // 推荐排课时间
  mockData: any;                        // 模拟数据

  // 操作方法
  setSelectedCourse: (course: Course | null) => void;
  addCourseToSchedule: (course: Course) => void;
  removeCourseFromSchedule: (courseId: string) => void;
  autoSchedule: () => { scheduled: number; failed: number };
  clearAllSchedule: () => void;
  resetData: () => void;
  setConflicts: (conflicts: any[]) => void;
}

// 使用方式
const hook = useScheduleData(totalWeeks?: number);
```

**使用示例：**

```tsx
import { useScheduleData } from './hooks/useScheduleData';

function MyComponent() {
  const {
    courses,
    pendingCourses,
    selectedCourse,
    setSelectedCourse,
    addCourseToSchedule,
    removeCourseFromSchedule
  } = useScheduleData(20);

  return (
    // ... 组件内容
  );
}
```

---

## 常量配置

### TOTAL_WEEKS

```typescript
const TOTAL_WEEKS = 20;  // 总周数
```

---

### DEFAULT_HALF_DAY_CONFIG

```typescript
const DEFAULT_HALF_DAY_CONFIG: HalfDayConfig[] = [
  { type: 'morning', name: '上午', startTime: '08:00', endTime: '12:00', isSchedulable: true },
  { type: 'afternoon', name: '下午', startTime: '14:00', endTime: '18:00', isSchedulable: true },
  { type: 'evening', name: '晚上', startTime: '19:00', endTime: '21:00', isSchedulable: true }
];
```

---

### defaultWeekDays

```typescript
const defaultWeekDays: WeekDayConfig[] = [
  { id: 1, name: '周一', isEnabled: true, isSchedulable: true },
  { id: 2, name: '周二', isEnabled: true, isSchedulable: true },
  { id: 3, name: '周三', isEnabled: true, isSchedulable: true },
  { id: 4, name: '周四', isEnabled: true, isSchedulable: true },
  { id: 5, name: '周五', isEnabled: true, isSchedulable: true },
  { id: 6, name: '周六', isEnabled: false, isSchedulable: false },
  { id: 7, name: '周日', isEnabled: false, isSchedulable: false }
];
```

---

### defaultDailyConfig

```typescript
const defaultDailyConfig: DailyScheduleConfig = {
  totalPeriods: 10,
  defaultDuration: 45,
  defaultBreakDuration: 10
};
```

---

### generateDefaultTimeSlots

```typescript
function generateDefaultTimeSlots(): TimeSlotConfig[];
```

**返回示例：**

```typescript
[
  {
    id: 'slot-1',
    label: '第 1 节',
    startTime: '08:00',
    endTime: '08:45',
    duration: 45,
    halfDayType: 'morning',
    isBreak: false,
    breakAfter: 10,
    isSchedulable: true
  },
  // ... 更多时段
]
```

---

### generateMockCourses

```typescript
function generateMockCourses(totalWeeks?: number): Course[];
```

**参数：**
- `totalWeeks` - 生成的周次数，默认 20

**返回：** 包含模拟课程数据的数组

---

## 导入路径汇总

```typescript
// 导入组件
import { ScheduleTable, ScheduleToolbar, WeekSelector } from './components';

// 导入类型
import type { Course, TimeSlotConfig, WeekDayConfig } from './types';

// 导入工具函数
import { timeToMinutes, getHalfDayType } from './utils';

// 导入 Hook
import { useScheduleData } from './hooks/useScheduleData';

// 导入常量
import { TOTAL_WEEKS, generateMockCourses } from './constants';
```
