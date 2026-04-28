/**
 * base-data 模块 - 下载模板工具函数
 * 提供通用的 Excel 模板下载功能
 */

import { message } from 'antd';

/**
 * 下载 Excel 模板文件
 * @param downloadFn - 下载 API 函数
 * @param fileName - 保存的文件名
 */
export async function downloadTemplate(
  downloadFn: () => Promise<Blob>,
  fileName: string,
): Promise<void> {
  try {
    message.loading('正在下载模板文件...');

    const blob = await downloadFn();

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    message.success('模板下载成功！');
  } catch (error) {
    console.error('模板下载失败:', error);
    message.error('模板下载失败，请重试');
  }
}
