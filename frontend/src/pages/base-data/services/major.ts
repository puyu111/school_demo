/**
 * base-data 模块 - 专业相关服务
 * 提供专业设置的 API 接口
 */

import { API_PATHS } from './api';
import { downloadFile, uploadFile } from './request';
import type { ImportResponse } from './types';

/**
 * 获取专业列表
 * @param params - 请求参数
 * @returns 专业列表响应
 */
export async function getMajors(params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}): Promise<{
  code: number;
  message: string;
  data?: { list: any[]; total: number };
  timestamp: number;
}> {
  return (await import('@umijs/max')).request(API_PATHS.MAJORS.LIST, {
    method: 'GET',
    params,
  });
}

/**
 * 创建专业
 * @param data - 专业数据
 * @returns 创建结果
 */
export async function createMajor(data: {
  name: string;
  courses: string[];
  classSize: number;
  duration: number;
}): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(API_PATHS.MAJORS.LIST, {
    method: 'POST',
    data,
  });
}

/**
 * 删除专业
 * @param dbIds - 数据库 ID 数组
 * @returns 删除结果
 */
export async function deleteMajors(
  dbIds: string[],
): Promise<{ code: number; message: string; data?: any; timestamp: number }> {
  return (await import('@umijs/max')).request(API_PATHS.MAJORS.BATCH_DELETE, {
    method: 'POST',
    data: { dbIds },
  });
}

/**
 * 专业设置 - 批量导入
 * 将 Excel 文件中的专业数据批量导入系统
 * @param file - Excel 文件
 * @returns 导入结果
 */
export async function importMajors(file: File): Promise<ImportResponse> {
  return uploadFile(API_PATHS.MAJORS.IMPORT, file);
}

/**
 * 下载专业设置模板
 * 获取专业批量导入的 Excel 模板文件
 * @returns Excel 文件 Blob
 */
export async function downloadMajorsTemplate() {
  return downloadFile(API_PATHS.MAJORS.TEMPLATE);
}
