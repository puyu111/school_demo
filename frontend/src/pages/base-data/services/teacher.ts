/**
 * base-data 模块 - 教师相关服务
 * 提供教师录入的 API 接口
 */

import { API_PATHS } from './api';
import { downloadFile, uploadFile } from './request';
import type { ImportResponse } from './types';

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
