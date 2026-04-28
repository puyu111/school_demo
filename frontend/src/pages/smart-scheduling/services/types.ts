/**
 * 智能排课系统 - TypeScript 类型定义
 */

// 待排课程
export interface Course {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  duration: number; // 课时数（连上几节）
  priority: number; // 优先级 1-3
  courseType: string; // 必修/选修
  preferredTimes?: { day: string; slot: number }[]; // 偏好时间
}

// 教师
export interface Teacher {
  id: string;
  name: string;
  department: string;
  maxDailyCourses: number; // 每日最大课程数
  unavailableTimes?: { day: string; slots: number[] }[]; // 不可用时间
}

// 班级
export interface ClassItem {
  id: string;
  name: string;
  studentCount: number;
  maxDailyCourses: number;
  unavailableTimes?: { day: string; slots: number[] }[];
}

// 教室（可选）
export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: string;
  availableTimes?: any[];
}

// 排课记录
export interface ScheduleItem {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  roomId?: string;
  roomName?: string;
  day: string; // monday, tuesday...
  slot: number; // 1, 2, 3...
  week?: number; // 第几周
  semesterId?: string;
}

// 统一 API 响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

// 冲突检测结果
export interface ConflictResult {
  hasConflict: boolean;
  conflicts: {
    type: 'teacher' | 'class' | 'room' | 'course';
    message: string;
    course?: ScheduleItem;
  }[];
}

// 推荐时间
export interface TimeRecommendation {
  day: string;
  slot: number;
  score: number;
  reason: string;
}

// 智能排课结果
export interface AutoArrangeResult {
  scheduled: ScheduleItem[];
  failed: { course: Course; reason: string }[];
  stats: {
    total: number;
    scheduled: number;
    failed: number;
    successRate: string;
  };
}

// 统计数据
export interface ScheduleStats {
  teacherUtilization: number;
  classCoverage: number;
  roomUtilization?: number;
  completionRate: number;
}
