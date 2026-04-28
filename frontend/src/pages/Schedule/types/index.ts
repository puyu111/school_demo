import type { Dayjs } from 'dayjs';

// 课程数据
export interface Course {
  id: string;
  courseName: string;
  teacherName: string;
  teacherId: string;
  className: string;
  classId: string;
  roomName: string;
  roomId: string;
  weekDay: number;
  startTime: string;
  endTime: string;
  duration?: number; // 课程时长（分钟）
  color: string;
  weeks: number[];
  studentCount: number;
}

// 筛选选项
export interface FilterOptions {
  class?: string;
  teacher?: string;
  week?: number;
}

// 视图配置
export interface ViewConfig {
  mode: 'week' | 'day' | 'list';
  currentWeek: number;
  currentDay: number;
}

// 周选项
export interface WeekOption {
  label: string;
  value: number;
}

// 筛选选项通用结构
export interface SelectOption {
  label: string;
  value: string;
}

// 课程操作类型
export type CourseAction = 'view' | 'edit' | 'delete';

// 视图模式类型
export type ViewMode = 'week' | 'day' | 'list';

// 步骤组件 props
export interface StepsComponentProps {
  current?: number;
  items?: Array<{
    title: string;
    icon?: React.ReactNode;
    status?: 'wait' | 'process' | 'finish' | 'error';
  }>;
}

// Tabs 组件 props
export interface TabItem {
  label: React.ReactNode;
  key: string;
  children: React.ReactNode;
}

export interface MyTabsProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  tabItems?: TabItem[];
}

// 统计数据结构
export interface StatisticsData {
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

// 课表预览组件 props
export interface CourseSchedulePreviewProps {
  initialWeek?: number;
}

// 排课统计组件 props
export interface CourseSchedulingStatisticsProps {
  initialFilters?: StatisticsFilterParams;
}

// 统计筛选参数
export interface StatisticsFilterParams {
  timeRange: [Dayjs, Dayjs];
  class: string;
  teacher: string;
  room: string;
}
