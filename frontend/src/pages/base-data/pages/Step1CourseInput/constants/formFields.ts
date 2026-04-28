/**
 * Step1 课程录入 - 表单字段配置
 */

import type { FormField } from '../../../hooks';
import { COURSE_TYPE_OPTIONS } from '../types';

/** 课程录入表单字段配置 */
export const COURSE_FORM_FIELDS: FormField[] = [
  { name: 'id', label: '课程 ID', type: 'input', required: true },
  { name: 'name', label: '课程名称', type: 'input', required: true },
  { name: 'credits', label: '课程学分', type: 'number', required: true },
  {
    name: 'type',
    label: '课程类型',
    type: 'select',
    required: true,
    options: COURSE_TYPE_OPTIONS,
  },
  { name: 'totalHours', label: '总课时', type: 'number', required: true },
];
