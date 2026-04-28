/**
 * Step3 专业设置 - 数据验证规则
 */

import type { MajorData } from '../types';

/**
 * 专业设置数据验证函数
 * @param formData - 表单数据
 * @returns 错误信息，无错误返回 null
 */
export function validateMajorData(formData: Partial<MajorData>): string | null {
  if (
    !formData.id ||
    !formData.name ||
    !formData.classSize ||
    !formData.duration
  ) {
    return '请填写所有必填字段';
  }
  return null;
}
