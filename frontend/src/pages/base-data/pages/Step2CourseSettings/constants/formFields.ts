/**
 * Step2 课程设置 - 表单字段配置
 */

import { DEFAULT_COURSE_NAMES } from '../../../constants';
import type { FormField } from '../../../hooks';
import { SEMESTER_OPTIONS } from '../types';

const allCourseNames = DEFAULT_COURSE_NAMES;

/** 课程设置表单字段配置 */
export const COURSE_SETTING_FORM_FIELDS: FormField[] = [
  { name: 'name', label: '课程名称', type: 'input', required: true },
  { name: 'priority', label: '课程优先等级', type: 'number', required: true },
  {
    name: 'prerequisites',
    label: '前置课程（可多选）',
    type: 'select',
    required: false,
    mode: 'multiple',
    options: allCourseNames.map((courseName) => ({
      label: courseName,
      value: courseName,
    })),
  },
  {
    name: 'semester',
    label: '开设学期',
    type: 'select',
    required: true,
    options: SEMESTER_OPTIONS,
  },
];
