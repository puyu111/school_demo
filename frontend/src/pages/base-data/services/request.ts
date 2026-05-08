/**
 * base-data 模块 - 请求工具
 * 基于 @umijs/max 的 request 封装常用方法
 */

import { request } from '@umijs/max';
import type { ImportResponse } from './types';

/**
 * 文件上传请求
 * @param url - 请求路径
 * @param file - 要上传的文件
 * @returns 导入响应
 */
export async function uploadFile(
  url: string,
  file: File,
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message || '上传失败');
  return data.data;
}

/**
 * 下载文件请求
 * @param url - 请求路径
 * @returns Blob 对象
 */
export async function downloadFile(url: string): Promise<Blob> {
  return request(url, {
    method: 'GET',
    responseType: 'blob',
  });
}
