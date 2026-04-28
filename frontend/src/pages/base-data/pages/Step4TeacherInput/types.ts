/**
 * base-data 模块 - 步骤 4 教师录入 - 数据类型定义
 */

import type { BaseDataItem } from '../../types';

/** 教师数据类型接口 */
export interface TeacherData extends BaseDataItem {
  /** 教师 ID */
  id: string;
  /** 姓名 */
  name: string;
  /** 性别 */
  gender: string;
  /** 可授课程列表 */
  courses: string[];
  /** 学历 */
  degree: string;
}

/** 性别选项（用于下拉选择） */
export const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
];

/** 学历选项（用于下拉选择） */
export const DEGREE_OPTIONS = [
  { label: '专科', value: '专科' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' },
];
