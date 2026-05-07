import { request } from '@umijs/max';
import type { Course, StatisticsData } from '../types';

/**
 * API 基础路径
 */
const API_BASE = '/api/schedule';

/**
 * 统一响应结构
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * 请求参数 - 获取课表
 */
export interface ScheduleRequestParams {
  week: number;
  classId?: string;
  teacherId?: string;
  roomId?: string;
}

/**
 * 课程保存参数
 */
export interface CourseSaveParams {
  week: number;
  courses: Course[];
}

/**
 * 课程移动参数
 */
export interface CourseMoveParams {
  courseId: string;
  newWeekDay: number;
  newStartTime?: string;
}

/**
 * 批量移动参数
 */
export interface BatchMoveParams {
  moves: CourseMoveParams[];
}

/**
 * ===========================================
 * 课表数据 API
 * ===========================================
 */

/**
 * 获取课表数据
 * @param params 请求参数
 */
/**
 * 后端字段名 -> 前端字段名映射
 */
const FIELD_MAP: Record<string, string> = {
  weekday: 'weekDay',
};

/**
 * 后端字段 -> 前端字段的映射表
 */
const REVERSE_FIELD_MAP: Record<string, string> = {
  weekDay: 'weekday',
};

/**
 * 递归转换对象字段名（后端 -> 前端）
 */
function transformFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformFields);
  }
  if (obj !== null && typeof obj === 'object') {
    const transformed: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const newKey = FIELD_MAP[key] || key;
      transformed[newKey] = transformFields(obj[key]);
    }
    return transformed;
  }
  return obj;
}

/**
 * 递归转换对象字段名（前端 -> 后端）
 */
function reverseTransformFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(reverseTransformFields);
  }
  if (obj !== null && typeof obj === 'object') {
    const transformed: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const newKey = REVERSE_FIELD_MAP[key] || key;
      transformed[newKey] = reverseTransformFields(obj[key]);
    }
    return transformed;
  }
  return obj;
}

export const getScheduleData = async (
  params: ScheduleRequestParams,
): Promise<Course[]> => {
  const { week, ...rest } = params;
  return request<ApiResponse<any[]>>(`${API_BASE}/courses`, {
    method: 'GET',
    params: { week, ...rest },
  }).then((res) => transformFields(res.data) as Course[]);
};

/**
 * 获取单个课程详情
 * @param courseId 课程 ID
 */
export const getCourseDetail = async (courseId: string): Promise<Course> => {
  return request<ApiResponse<any>>(`${API_BASE}/courses/${courseId}`, {
    method: 'GET',
  }).then((res) => transformFields(res.data) as Course);
};

/**
 * 创建课程
 * @param course 课程数据
 */
export const createCourse = async (
  course: Omit<Course, 'id'>,
): Promise<Course> => {
  return request<ApiResponse<any>>(`${API_BASE}/courses`, {
    method: 'POST',
    data: reverseTransformFields(course),
  }).then((res) => transformFields(res.data) as Course);
};

/**
 * 更新课程
 * @param id 课程 ID
 * @param updates 更新数据
 */
export const updateCourse = async (
  id: string,
  updates: Partial<Course>,
): Promise<Course> => {
  return request<ApiResponse<any>>(`${API_BASE}/courses/${id}`, {
    method: 'PUT',
    data: reverseTransformFields(updates),
  }).then((res) => transformFields(res.data) as Course);
};

/**
 * 删除课程
 * @param id 课程 ID
 */
export const deleteCourse = async (id: string): Promise<boolean> => {
  return request<ApiResponse<{ deletedId: string }>>(
    `${API_BASE}/courses/${id}`,
    {
      method: 'DELETE',
    },
  ).then((_res) => true);
};

/**
 * 批量删除课程
 * @param courseIds 课程 ID 数组
 */
export const batchDeleteCourses = async (
  courseIds: string[],
): Promise<number> => {
  return request<ApiResponse<{ deletedCount: number }>>(
    `${API_BASE}/courses/batch-delete`,
    {
      method: 'POST',
      data: { courseIds },
    },
  ).then((res) => res.data.deletedCount);
};

/**
 * 批量移动课程（拖拽操作）
 * @param params 移动参数
 */
export const batchMoveCourses = async (params: BatchMoveParams) => {
  return request<
    ApiResponse<{
      success: any[];
      failed: any[];
      conflicts: any[];
    }>
  >(`${API_BASE}/courses/move`, {
    method: 'POST',
    data: params,
  }).then((res) => res.data);
};

/**
 * 保存课表数据
 * @param params 保存参数
 */
export const saveSchedule = async (params: CourseSaveParams) => {
  return request<ApiResponse<{ week: number; savedCount: number }>>(
    `${API_BASE}/save`,
    {
      method: 'POST',
      data: params,
    },
  ).then((res) => res.data);
};

/**
 * 刷新课表数据
 * @param week 周次
 */
export const refreshSchedule = async (week: number): Promise<Course[]> => {
  return request<ApiResponse<any[]>>(`${API_BASE}/refresh`, {
    method: 'GET',
    params: { week },
  }).then((res) => transformFields(res.data) as Course[]);
};

/**
 * ===========================================
 * 统计数据 API
 * ===========================================
 */

/**
 * 获取统计数据
 * @param week 周次
 */
export const getStatistics = async (week: number): Promise<StatisticsData> => {
  return request<ApiResponse<StatisticsData>>(`${API_BASE}/statistics`, {
    method: 'GET',
    params: { week },
  }).then((res) => res.data);
};

/**
 * 检测课程冲突
 * @param course 待检测的课程
 * @param week 周次
 */
export const checkConflict = async (course: Partial<Course>, week: number) => {
  return request<
    ApiResponse<{
      hasConflicts: boolean;
      conflicts: Array<{
        type: string;
        message: string;
        existingCourse?: Course;
      }>;
      recommendations: Array<{
        weekDay: number;
        startTime: string;
        roomId: string;
        reason: string;
      }>;
    }>
  >(`${API_BASE}/conflicts/check`, {
    method: 'POST',
    data: { course, week },
  }).then((res) => res.data);
};

/**
 * ===========================================
 * 导出/导入 API
 * ===========================================
 */

/**
 * 导出课表数据
 * @param startWeek 起始周次
 * @param endWeek 结束周次
 * @param classId 班级 ID（可选）
 */
export const exportSchedule = async (
  startWeek: number,
  endWeek: number,
  classId?: string,
) => {
  return request<ApiResponse<any>>(`${API_BASE}/export`, {
    method: 'GET',
    params: { startWeek, endWeek, classId },
  }).then((res) => res.data);
};

/**
 * 导入课表数据
 * @param file 数据文件
 * @param options 导入选项
 */
export const importSchedule = async (
  file: File,
  options?: {
    overrideExisting?: boolean;
    skipConflicting?: boolean;
    startWeek?: number;
  },
) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options) {
    formData.append('options', JSON.stringify(options));
  }

  return request<
    ApiResponse<{
      importedCount: number;
      skippedCount: number;
      failedCount: number;
      conflictCount: number;
    }>
  >(`${API_BASE}/import`, {
    method: 'POST',
    data: formData,
    requestType: 'form',
  }).then((res) => res.data);
};
