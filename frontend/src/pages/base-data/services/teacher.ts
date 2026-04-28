/**
 * base-data 模块 - 教师相关服务
 * 提供教师录入的 API 接口
 */

import { API_PATHS } from './api';
import { downloadFile, uploadFile } from './request';
import type { ImportResponse } from './types';

/**
 * 获取教师列表
 * @param params - 请求参数
 * @returns 教师列表响应
 */
export async function getTeachers(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  degree?: string;
}): Promise<{
  code: number;
  message: string;
  data?: { list: any[]; total: number };
  timestamp: number;
}> {
  return (await import('@umijs/max')).request(API_PATHS.TEACHERS.LIST, {
    method: 'GET',
    params,
  });
}

/**
 * 创建教师
 * @param data - 教师数据
 * @returns 创建结果
 */
export async function createTeacher(data: {
  name: string;
  gender: string;
  courses: string[];
  degree: string;
  email?: string;
  phone?: string;
}): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(API_PATHS.TEACHERS.LIST, {
    method: 'POST',
    data,
  });
}

/**
 * 删除教师
 * @param dbIds - 数据库 ID 数组
 * @returns 删除结果
 */
export async function deleteTeachers(
  dbIds: string[],
): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(API_PATHS.TEACHERS.BATCH_DELETE, {
    method: 'POST',
    data: { dbIds },
  });
}

/**
 * 教师录入 - 批量导入
 * 将 Excel 文件中的教师数据批量导入系统
 * @param file - Excel 文件
 * @returns 导入结果
 */
export async function importTeachers(file: File): Promise<ImportResponse> {
  return uploadFile(API_PATHS.TEACHERS.IMPORT, file);
}

/**
 * 下载教师录入模板
 * 获取教师批量导入的 Excel 模板文件
 * @returns Excel 文件 Blob
 */
export async function downloadTeachersTemplate() {
  return downloadFile(API_PATHS.TEACHERS.TEMPLATE);
}
