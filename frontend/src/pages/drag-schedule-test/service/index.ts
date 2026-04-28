import { request } from "@umijs/max";
import type {
  ConflictCheckRequest,
  ConflictCheckResponse,
  CopyWeekOptions,
  Course,
  DailyScheduleConfig,
  ExportRequest,
  ExportResponse,
  HalfDayConfig,
  ImportResponse,
  MoveRequest,
  TimeSlotConfig,
  WeekDayConfig,
} from "../services";

// ==================== 基础配置 ====================

// 基础 API 路径，后续可以修改为实际后端地址
const BASE_URL = "/api/drag-schedule";

// 通用响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// ==================== 课程管理接口 ====================

/**
 * 获取指定周次的课程列表
 */
export async function getCourses(params: {
  week: number;
  classId?: string;
  teacherId?: string;
  roomId?: string;
}): Promise<ApiResponse<Course[]>> {
  return request(`${BASE_URL}/courses`, {
    method: "GET",
    params,
  });
}

/**
 * 获取单个课程详情
 */
export async function getCourse(
  courseId: string
): Promise<ApiResponse<Course>> {
  return request(`${BASE_URL}/courses/${courseId}`, {
    method: "GET",
  });
}

/**
 * 创建课程
 */
export async function createCourse(
  data: Partial<Course>
): Promise<ApiResponse<Course>> {
  return request(`${BASE_URL}/courses`, {
    method: "POST",
    data,
  });
}

/**
 * 更新课程
 */
export async function updateCourse(
  courseId: string,
  data: Partial<Course>
): Promise<ApiResponse<Course>> {
  return request(`${BASE_URL}/courses/${courseId}`, {
    method: "PUT",
    data,
  });
}

/**
 * 批量移动课程（拖拽操作）
 */
export async function moveCourses(
  moves: MoveRequest[]
): Promise<ApiResponse<{ success: any[]; failed: any[]; conflicts: any[] }>> {
  return request(`${BASE_URL}/courses/move`, {
    method: "POST",
    data: { moves },
  });
}

/**
 * 删除课程
 */
export async function deleteCourse(
  courseId: string
): Promise<ApiResponse<{ deletedId: string; courseName: string }>> {
  return request(`${BASE_URL}/courses/${courseId}`, {
    method: "DELETE",
  });
}

/**
 * 批量删除课程
 */
export async function batchDeleteCourses(courseIds: string[]): Promise<
  ApiResponse<{
    deletedCount: number;
    deletedIds: string[];
    failedIds: string[];
  }>
> {
  return request(`${BASE_URL}/courses/batch-delete`, {
    method: "POST",
    data: { courseIds },
  });
}

// ==================== 时段配置接口 ====================

/**
 * 获取时段配置
 */
export async function getTimeSlots(params?: { dayOfWeek?: number }): Promise<
  ApiResponse<{
    halfDayConfigs: HalfDayConfig[];
    timeSlots: TimeSlotConfig[];
    dailyConfig: DailyScheduleConfig;
  }>
> {
  return request(`${BASE_URL}/time-slots`, {
    method: "GET",
    params,
  });
}

/**
 * 更新时段配置
 */
export async function updateTimeSlots(data: {
  halfDayConfigs?: HalfDayConfig[];
  timeSlots?: TimeSlotConfig[];
  dailyConfig?: DailyScheduleConfig;
}): Promise<
  ApiResponse<{
    updatedFields: string[];
    dailyConfig: DailyScheduleConfig;
    halfDayConfigs: HalfDayConfig[];
  }>
> {
  return request(`${BASE_URL}/time-slots`, {
    method: "PUT",
    data,
  });
}

/**
 * 重置时段配置为默认值
 */
export async function resetTimeSlots(): Promise<
  ApiResponse<{
    dailyConfig: DailyScheduleConfig;
    timeSlots: TimeSlotConfig[];
    halfDayConfigs: HalfDayConfig[];
  }>
> {
  return request(`${BASE_URL}/time-slots/reset`, {
    method: "POST",
  });
}

// ==================== 星期配置接口 ====================

/**
 * 获取星期配置
 */
export async function getWeekDays(): Promise<ApiResponse<WeekDayConfig[]>> {
  return request(`${BASE_URL}/week-days`, {
    method: "GET",
  });
}

/**
 * 更新星期配置
 */
export async function updateWeekDays(data: {
  weekDays: WeekDayConfig[];
}): Promise<ApiResponse<{ weekDays: WeekDayConfig[] }>> {
  return request(`${BASE_URL}/week-days`, {
    method: "PUT",
    data,
  });
}

// ==================== 周次管理接口 ====================

/**
 * 获取周次信息
 */
export async function getWeek(weekNumber: number): Promise<
  ApiResponse<{
    weekNumber: number;
    startDate: string;
    endDate: string;
    courseCount: number;
    isCurrentWeek: boolean;
    hasUnsavedChanges: boolean;
    config: any;
  }>
> {
  return request(`${BASE_URL}/weeks/${weekNumber}`, {
    method: "GET",
  });
}

/**
 * 批量复制周次数据
 */
export async function copyWeekData(
  sourceWeek: number,
  targetWeeks: number[],
  options?: CopyWeekOptions
): Promise<
  ApiResponse<{
    sourceWeek: number;
    copiedWeeks: number[];
    copiedCourseCount: number;
    skippedWeeks: number[];
    failedWeeks: number[];
  }>
> {
  return request(`${BASE_URL}/weeks/copy`, {
    method: "POST",
    data: { sourceWeek, targetWeeks, options },
  });
}

/**
 * 清空周次数据
 */
export async function clearWeek(
  weekNumber: number,
  preserveConfig: boolean = true
): Promise<
  ApiResponse<{
    weekNumber: number;
    deletedCourseCount: number;
    configPreserved: boolean;
  }>
> {
  return request(`${BASE_URL}/weeks/${weekNumber}`, {
    method: "DELETE",
    params: { preserveConfig },
  });
}

// ==================== 冲突检测接口 ====================

/**
 * 检测课程冲突
 */
export async function checkConflicts(
  data: ConflictCheckRequest
): Promise<ApiResponse<ConflictCheckResponse>> {
  return request(`${BASE_URL}/conflicts/check`, {
    method: "POST",
    data,
  });
}

/**
 * 获取冲突类型枚举
 */
export async function getConflictTypes(): Promise<
  ApiResponse<
    {
      type: string;
      name: string;
      description: string;
    }[]
  >
> {
  return request(`${BASE_URL}/conflicts/types`, {
    method: "GET",
  });
}

// ==================== 数据导出/导入接口 ====================

/**
 * 导出课表数据
 */
export async function exportSchedule(
  params: ExportRequest
): Promise<ApiResponse<ExportResponse>> {
  return request(`${BASE_URL}/export`, {
    method: "GET",
    params,
  });
}

/**
 * 导入课表数据
 */
export async function importSchedule(
  file: File,
  options?: {
    overrideExisting?: boolean;
    skipConflicting?: boolean;
    startWeek?: number;
  }
): Promise<ApiResponse<ImportResponse>> {
  const formData = new FormData();
  formData.append("file", file);
  if (options) {
    formData.append("options", JSON.stringify(options));
  }

  return request(`${BASE_URL}/import`, {
    method: "POST",
    data: formData,
    requestType: "form",
  });
}

// ==================== 保存/提交接口 ====================

/**
 * 保存周次课表数据
 */
export async function saveWeekSchedule(data: {
  week: number;
  courses: Course[];
  timeSlots?: TimeSlotConfig[];
  weekDays?: WeekDayConfig[];
  dailyConfig?: DailyScheduleConfig;
  halfDayConfig?: HalfDayConfig[];
}): Promise<
  ApiResponse<{ week: number; savedCount: number; message: string }>
> {
  return request(`${BASE_URL}/save`, {
    method: "POST",
    data,
  });
}

/**
 * 刷新周次数据
 */
export async function refreshWeekData(week: number): Promise<
  ApiResponse<{
    week: number;
    courses: Course[];
    timeSlots: TimeSlotConfig[];
    weekDays: WeekDayConfig[];
  }>
> {
  return request(`${BASE_URL}/refresh`, {
    method: "GET",
    params: { week },
  });
}
