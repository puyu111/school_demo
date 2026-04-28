/**
 * base-data 模块 - 批量提交服务
 * 提供基础数据批量提交的 API 接口
 */

import { API_PATHS } from './api';
import type { SubmitRequest, SubmitResponse } from './types';

/**
 * 提交所有基础数据
 * 将课程、课程设置、专业、教师数据打包提交
 * @param data - 提交数据
 * @returns 提交结果
 */
export async function submitAll(data: SubmitRequest): Promise<{
  code: number;
  message: string;
  data?: SubmitResponse;
  timestamp: number;
}> {
  return (await import('@umijs/max')).request(API_PATHS.SUBMIT, {
    method: 'POST',
    data,
  });
}
