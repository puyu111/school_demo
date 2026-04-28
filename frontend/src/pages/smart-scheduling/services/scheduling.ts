/**
 * 智能排课系统 - API 服务层
 * 基于 @umijs/max/request 封装
 */

import { request } from '@umijs/max';
import type {
  ApiResponse,
  AutoArrangeResult,
  ClassItem,
  ConflictResult,
  Course,
  Room,
  ScheduleItem,
  ScheduleStats,
  Teacher,
  TimeRecommendation,
} from './types';

const BASE_URL = '/api/smart-scheduling';

// ==================== 基础数据 ====================

/**
 * 获取待排课程池
 * 从 base-data 模块已录入的课程中获取未排课的课程
 */
export async function getCourses(
  semesterId?: string,
): Promise<ApiResponse<Course[]>> {
  return request(`${BASE_URL}/courses`, {
    method: 'GET',
    params: { semesterId },
  });
}

/**
 * 获取教师列表
 */
export async function getTeachers(): Promise<ApiResponse<Teacher[]>> {
  return request(`${BASE_URL}/teachers`, { method: 'GET' });
}

/**
 * 获取班级列表
 */
export async function getClasses(): Promise<ApiResponse<ClassItem[]>> {
  return request(`${BASE_URL}/classes`, { method: 'GET' });
}

/**
 * 获取教室列表（可选功能）
 */
export async function getRooms(): Promise<ApiResponse<Room[]>> {
  return request(`${BASE_URL}/rooms`, { method: 'GET' });
}

// ==================== 排课操作 ====================

/**
 * 获取已排课程列表
 * @param week 周次（可选）
 */
export async function getSchedules(
  week?: number,
): Promise<ApiResponse<ScheduleItem[]>> {
  return request(`${BASE_URL}/schedules`, {
    method: 'GET',
    params: { week },
  });
}

/**
 * 保存单个排课记录
 */
export async function saveSchedule(data: {
  courseId: string;
  day: string;
  slot: number;
  week?: number;
  roomId?: string;
}): Promise<ApiResponse<{ id: string }>> {
  return request(`${BASE_URL}/schedules`, {
    method: 'POST',
    data,
  });
}

/**
 * 批量保存排课结果
 */
export async function batchSaveSchedules(data: {
  courses: { courseId: string; day: string; slot: number; roomId?: string }[];
  week?: number;
  semesterId?: string;
}): Promise<ApiResponse<{ scheduled: number; failed: number }>> {
  return request(`${BASE_URL}/schedules/batch`, {
    method: 'POST',
    data,
  });
}

/**
 * 删除排课记录
 */
export async function removeSchedule(id: string): Promise<ApiResponse> {
  return request(`${BASE_URL}/schedules/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 清空所有排课
 */
export async function clearAllSchedules(
  semesterId?: string,
): Promise<ApiResponse> {
  return request(`${BASE_URL}/schedules/clear`, {
    method: 'POST',
    data: { semesterId },
  });
}

// ==================== 智能排课 ====================

/**
 * 一键智能排课
 * @param strategy 排课策略：priority(优先主课) | balanced(均衡分布)
 */
export async function autoArrange(params?: {
  strategy?: 'priority' | 'balanced';
  week?: number;
}): Promise<ApiResponse<AutoArrangeResult>> {
  return request(`${BASE_URL}/auto-arrange`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 检测冲突
 */
export async function checkConflict(data: {
  courseId: string;
  day: string;
  slot: number;
  week?: number;
}): Promise<ApiResponse<ConflictResult>> {
  return request(`${BASE_URL}/check-conflict`, {
    method: 'POST',
    data,
  });
}

/**
 * 推荐排课时间
 */
export async function recommendTime(data: {
  courseId: string;
}): Promise<ApiResponse<TimeRecommendation[]>> {
  return request(`${BASE_URL}/recommend`, {
    method: 'POST',
    data,
  });
}

// ==================== 统计与导出 ====================

/**
 * 获取统计数据
 */
export async function getStats(
  semesterId?: string,
): Promise<ApiResponse<ScheduleStats>> {
  return request(`${BASE_URL}/stats`, {
    method: 'GET',
    params: { semesterId },
  });
}

/**
 * 导出排课结果（Excel）
 */
export async function exportSchedule(params: {
  format?: 'excel' | 'pdf';
  week?: number;
}): Promise<Blob> {
  const blob = await request(`${BASE_URL}/export`, {
    method: 'GET',
    params,
    responseType: 'blob',
  });

  // 触发浏览器下载
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `排课表_${params.week ? `第${params.week}周` : '全部'}.${params.format || 'excel'}`;
  link.click();
  window.URL.revokeObjectURL(url);

  return blob;
}

/**
 * 获取操作历史
 */
export async function getHistory(params?: {
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ list: any[]; total: number }>> {
  return request(`${BASE_URL}/history`, {
    method: 'GET',
    params,
  });
}
