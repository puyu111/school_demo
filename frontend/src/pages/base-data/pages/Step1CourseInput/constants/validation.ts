/**
 * Step1 课程录入 - 数据验证规则
 */

/**
 * 课程数据验证函数
 * @param formData - 表单数据
 * @returns 错误信息，无错误返回 null
 */
export function validateCourseData(formData: any): string | null {
  if (
    !formData.name ||
    !formData.id ||
    !formData.credits ||
    !formData.totalHours
  ) {
    return '请填写所有必填字段';
  }
  return null;
}
