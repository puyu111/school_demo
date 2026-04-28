/**
 * base-data 模块 - 课程相关服务
 * 提供课程录入和课程设置的 API 接口
 */

import { API_PATHS } from './api';
import { downloadFile, uploadFile } from './request';
import type { ImportResponse } from './types';

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
 * 下载课程录入模板
 * 获取课程批量导入的 Excel 模板文件
 * @returns Excel 文件 Blob
 */
export async function downloadCoursesTemplate() {
  return downloadFile(API_PATHS.COURSES.TEMPLATE);
}

/**
 * 下载课程设置模板
 * 获取课程设置批量导入的 Excel 模板文件
 * @returns Excel 文件 Blob
 */
export async function downloadCourseSettingsTemplate() {
  return downloadFile(API_PATHS.COURSE_SETTINGS.TEMPLATE);
}
