/**
 * Step3 专业设置 - 表单字段配置
 */

import { MAJOR_COURSES } from '../../../constants';
import type { FormField } from '../../../hooks';

const availableCourses = MAJOR_COURSES;

/** 专业设置表单字段配置 */
export const MAJOR_FORM_FIELDS: FormField[] = [
  { name: 'id', label: '专业 ID', type: 'input', required: true },
  { name: 'name', label: '专业名称', type: 'input', required: true },
  {
    name: 'courses',
    label: '开设课程（多选）',
    type: 'select',
    required: false,
    mode: 'multiple',
    options: availableCourses.map((course) => ({
      label: course,
      value: course,
    })),
  },
  { name: 'classSize', label: '班级数', type: 'number', required: true },
  { name: 'duration', label: '年制', type: 'number', required: true },
];
