/**
 * Step2 课程设置 - 数据验证规则
 */

import type { CourseSettingData } from '../types';

/**
 * 课程设置数据验证函数
 * @param formData - 表单数据
 * @returns 错误信息，无错误返回 null
 */
export function validateCourseSettingData(
  formData: Partial<CourseSettingData>,
): string | null {
  if (!formData.name || !formData.priority || !formData.semester) {
    return '请填写所有必填字段';
  }
  return null;
}
