// ==================== 课程类型 ====================

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
  duration: number; // 课程时长（分钟）
  color: string;
  weeks: number[];
  studentCount: number;
}

// ==================== 时段配置类型 ====================

// 半天时段类型
export type HalfDayType = 'morning' | 'afternoon' | 'evening';

// 半天时段配置
export interface HalfDayConfig {
  type: HalfDayType;
  name: string;
  startTime: string; // 半天开始时间
  endTime: string; // 半天结束时间
  isSchedulable: boolean; // 是否可排课
}

// 时段配置
export interface TimeSlotConfig {
  id: string;
  label: string; // 节次标签
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  duration: number; // 时长（分钟）
  halfDayType: HalfDayType; // 所属半天类型
  isBreak: boolean; // 是否为休息时段
  breakAfter?: number; // 课后休息时长（分钟）
  isSchedulable: boolean; // 是否可排课
}

// 每日节数配置
export interface DailyScheduleConfig {
  totalPeriods: number; // 每日总节数
  defaultDuration: number; // 默认每节课时长（分钟）
  defaultBreakDuration: number; // 默认课间休息时长（分钟）
}

// 星期配置
export interface WeekDayConfig {
  id: number;
  name: string;
  isEnabled: boolean; // 是否启用该天
  isSchedulable: boolean; // 是否可排课
}

// ==================== 拖拽相关类型 ====================

export interface DragItem {
  type: string;
  courseId: string;
  fromWeekDay: number;
  fromTimeSlotIndex: number;
  course: Course;
}

export interface DropResult {
  success: boolean;
}

// ==================== 组件 Props 类型 ====================

// WeekSelector Props
export interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
  isMobile?: boolean;
}

// DraggableCourseCard Props
export interface DraggableCourseCardProps {
  course: Course;
  weekDay: number;
  timeSlotIndex: number;
  isDragDisabled?: boolean;
  spanCount?: number;
  isMobile?: boolean;
}

// DroppableCell Props
export interface DroppableCellProps {
  weekDay: number;
  timeSlotIndex: number;
  cellCourse: Course | null;
  isOccupied: boolean;
  timeSlot: TimeSlotConfig;
  weekDayConfig: WeekDayConfig;
  halfDayConfigs: HalfDayConfig[];
  onMoveCourse: (
    courseId: string,
    newWeekDay: number,
    newTimeSlotIndex: number,
  ) => void;
  isFirstCell: boolean;
  spanCount?: number;
  isRowSpanned?: boolean;
  isMobile?: boolean;
}

// ScheduleTable Props
export interface ScheduleTableProps {
  courses: Course[];
  timeSlots: TimeSlotConfig[];
  weekDays: WeekDayConfig[];
  halfDayConfigs: HalfDayConfig[];
  currentWeek: number;
  totalWeeks?: number;
  onCourseUpdate: (courses: Course[]) => void;
  onWeekChange?: (week: number) => void;
}

// TimeSlotConfigPanel Props
export interface TimeSlotConfigPanelProps {
  config: TimeSlotConfig[];
  dailyConfig: DailyScheduleConfig;
  halfDayConfig: HalfDayConfig[];
  onChange: (
    config: TimeSlotConfig[],
    dailyConfig: DailyScheduleConfig,
    halfDayConfig: HalfDayConfig[],
  ) => void;
}

// WeekDayConfigPanel Props
export interface WeekDayConfigPanelProps {
  config: WeekDayConfig[];
  onChange: (config: WeekDayConfig[]) => void;
}

// Header Toolbar Props
export interface ScheduleToolbarProps {
  currentWeek: number;
  totalWeeks: number;
  hasUnsavedChanges: boolean;
  loading: boolean;
  showConfigPanel: boolean;
  onWeekChange: (week: number) => void;
  onToggleConfigPanel: () => void;
  onUndo: () => void;
  onRefresh: () => void;
  onSave: () => void;
  isMobile?: boolean;
}

// Course occupying map entry
export interface CourseOccupancyEntry {
  courseId: string;
  isFirstCell: boolean;
  spanCount: number;
  course: Course;
}

export interface CellCourseInfo {
  course: Course | null;
  isOccupied: boolean;
  isFirstCell: boolean;
  spanCount: number;
  isRowSpanned: boolean;
}
