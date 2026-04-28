/**
 * base-data 模块 - 专业相关服务
 * 提供专业设置的 API 接口
 */

import { API_PATHS } from './api';
import { downloadFile, uploadFile } from './request';
import type { ImportResponse } from './types';

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
