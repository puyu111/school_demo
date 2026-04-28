/**
 * base-data 模块 - 课程相关服务
 * 提供课程录入和课程设置的 API 接口
 */

import { API_PATHS } from './api';
import { downloadFile, uploadFile } from './request';
import type { ImportResponse } from './types';

// ==================== 课程管理接口 ====================

/**
 * 获取课程列表
 * @param params - 请求参数
 * @returns 课程列表响应
 */
export async function getCourses(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
}): Promise<{
  code: number;
  message: string;
  data?: { list: any[]; total: number };
  timestamp: number;
}> {
  return (await import('@umijs/max')).request(API_PATHS.COURSES.LIST, {
    method: 'GET',
    params,
  });
}

/**
 * 创建课程
 * @param data - 课程数据
 * @returns 创建结果
 */
export async function createCourse(data: {
  name: string;
  credits: number;
  type: string;
  totalHours: number;
}): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(API_PATHS.COURSES.LIST, {
    method: 'POST',
    data,
  });
}

/**
 * 删除课程
 * @param dbIds - 数据库 ID 数组
 * @returns 删除结果
 */
export async function deleteCourses(
  dbIds: string[],
): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(API_PATHS.COURSES.BATCH_DELETE, {
    method: 'POST',
    data: { dbIds },
  });
}

/**
 * 课程录入 - 批量导入
 * 将 Excel 文件中的课程数据批量导入系统
 * @param file - Excel 文件
 * @returns 导入结果
 */
export async function importCourses(file: File): Promise<ImportResponse> {
  return uploadFile(API_PATHS.COURSES.IMPORT, file);
}

/**
 * 下载课程录入模板
 * 获取课程批量导入的 Excel 模板文件
 * @returns Excel 文件 Blob
 */
export async function downloadCoursesTemplate() {
  return downloadFile(API_PATHS.COURSES.TEMPLATE);
}

// ==================== 课程设置接口 ====================

/**
 * 获取课程设置列表
 * @param params - 请求参数
 * @returns 课程设置列表响应
 */
export async function getCourseSettings(params?: {
  page?: number;
  pageSize?: number;
  semester?: string;
}): Promise<{
  code: number;
  message: string;
  data?: { list: any[]; total: number };
  timestamp: number;
}> {
  return (await import('@umijs/max')).request(API_PATHS.COURSE_SETTINGS.LIST, {
    method: 'GET',
    params,
  });
}

/**
 * 创建课程设置
 * @param data - 课程设置数据
 * @returns 创建结果
 */
export async function createCourseSetting(data: {
  name: string;
  priority: number;
  prerequisites: string[];
  semester: string;
}): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(API_PATHS.COURSE_SETTINGS.LIST, {
    method: 'POST',
    data,
  });
}

/**
 * 删除课程设置
 * @param dbIds - 数据库 ID 数组
 * @returns 删除结果
 */
export async function deleteCourseSettings(
  dbIds: string[],
): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(
    API_PATHS.COURSE_SETTINGS.BATCH_DELETE,
    {
      method: 'POST',
      data: { dbIds },
    },
  );
}

/**
 * 课程设置 - 批量导入
 * 将 Excel 文件中的课程设置数据批量导入系统
 * @param file - Excel 文件
 * @returns 导入结果
 */
export async function importCourseSettings(
  file: File,
): Promise<ImportResponse> {
  return uploadFile(API_PATHS.COURSE_SETTINGS.IMPORT, file);
}

/**
 * 下载课程设置模板
 * 获取课程设置批量导入的 Excel 模板文件
 * @returns Excel 文件 Blob
 */
export async function downloadCourseSettingsTemplate() {
  return downloadFile(API_PATHS.COURSE_SETTINGS.TEMPLATE);
}
