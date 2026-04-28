/**
 * Step4 教师录入 - 数据验证规则
 */

import type { TeacherData } from '../types';

/**
 * 教师录入数据验证函数
 * @param formData - 表单数据
 * @returns 错误信息，无错误返回 null
 */
export function validateTeacherData(
  formData: Partial<TeacherData>,
): string | null {
  if (!formData.id || !formData.name || !formData.gender || !formData.degree) {
    return '请填写所有必填字段';
  }
  return null;
}
