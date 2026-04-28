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
  duration: number;
  color: string;
  weeks: number[];
  studentCount: number;
}

// ==================== 时段配置类型 ====================

export type HalfDayType = 'morning' | 'afternoon' | 'evening';

export interface HalfDayConfig {
  type: HalfDayType;
  name: string;
  startTime: string;
  endTime: string;
  isSchedulable: boolean;
}

export interface TimeSlotConfig {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  duration: number;
  halfDayType: HalfDayType;
  isBreak: boolean;
  breakAfter?: number;
  isSchedulable: boolean;
}

export interface DailyScheduleConfig {
  totalPeriods: number;
  defaultDuration: number;
  defaultBreakDuration: number;
}

// ==================== 星期配置类型 ====================

export interface WeekDayConfig {
  id: number;
  name: string;
  isEnabled: boolean;
  isSchedulable: boolean;
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

// ==================== API 请求/响应类型 ====================

/**
 * 移动课程请求
 */
export interface MoveRequest {
  courseId: string;
  newWeekDay: number;
  newStartTime?: string;
}

/**
 * 复制周次选项
 */
export interface CopyWeekOptions {
  copyCourses?: boolean;
  copyConfig?: boolean;
  overrideExisting?: boolean;
}

/**
 * 冲突检测请求
 */
export interface ConflictCheckRequest {
  week: number;
  course?: Partial<Course>;
}

/**
 * 冲突检测结果
 */
export interface ConflictCheckResponse {
  hasConflicts: boolean;
  conflicts: {
    type: 'teacher' | 'room' | 'class' | 'duration';
    message: string;
    existingCourse?: Course;
  }[];
  recommendations: {
    weekDay: number;
    startTime: string;
    roomId: string;
    reason: string;
  }[];
}

/**
 * 导出请求参数
 */
export interface ExportRequest {
  startWeek: number;
  endWeek: number;
  classId?: string;
  format?: 'json' | 'csv' | 'xlsx';
}

/**
 * 导出响应数据
 */
export interface ExportResponse {
  exportInfo: {
    exportedAt: string;
    startWeek: number;
    endWeek: number;
    totalCourses: number;
  };
  courses: Course[];
  timeSlots: TimeSlotConfig[];
  weekDays: WeekDayConfig[];
  halfDayConfigs: HalfDayConfig[];
}

/**
 * 导入请求参数
 */
export interface ImportRequest {
  file: File;
  overrideExisting?: boolean;
  skipConflicting?: boolean;
  startWeek?: number;
}

/**
 * 导入响应数据
 */
export interface ImportResponse {
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  conflictCount: number;
  details: {
    skipped: { courseName: string; reason: string }[];
    failed: { courseName: string; reason: string }[];
    conflicts: {
      courseName: string;
      conflictType: string;
      suggestion: string;
    }[];
  };
}

// ==================== 组件 Props 类型 ====================

export interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
  isMobile?: boolean;
}

export interface DraggableCourseCardProps {
  course: Course;
  weekDay: number;
  timeSlotIndex: number;
  isDragDisabled?: boolean;
  spanCount?: number;
  isMobile?: boolean;
}

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

export interface WeekDayConfigPanelProps {
  config: WeekDayConfig[];
  onChange: (config: WeekDayConfig[]) => void;
}

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
