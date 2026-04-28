/**
 * Step4 教师录入 - 表单字段配置
 */

import { TEACHER_COURSES } from '../../../constants';
import type { FormField } from '../../../hooks';
import { DEGREE_OPTIONS, GENDER_OPTIONS } from '../types';

const availableCourses = TEACHER_COURSES;

/** 教师录入表单字段配置 */
export const TEACHER_FORM_FIELDS: FormField[] = [
  { name: 'id', label: '教师 ID', type: 'input', required: true },
  { name: 'name', label: '姓名', type: 'input', required: true },
  {
    name: 'gender',
    label: '性别',
    type: 'select',
    required: true,
    options: GENDER_OPTIONS,
  },
  {
    name: 'courses',
    label: '可授课程（多选）',
    type: 'select',
    required: false,
    mode: 'multiple',
    options: availableCourses.map((course) => ({
      label: course,
      value: course,
    })),
  },
  {
    name: 'degree',
    label: '学历',
    type: 'select',
    required: true,
    options: DEGREE_OPTIONS,
  },
];
