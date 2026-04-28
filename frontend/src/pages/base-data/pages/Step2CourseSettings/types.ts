/**
 * base-data 模块 - 步骤 2 课程设置 - 数据类型定义
 */

import type { BaseDataItem } from '../../types';

/** 课程设置数据类型接口 */
export interface CourseSettingData extends BaseDataItem {
  /** 课程名称 */
  name: string;
  /** 课程优先等级（数字越小优先级越高） */
  priority: number;
  /** 前置课程列表 */
  prerequisites: string[];
  /** 开设学期 */
  semester: string;
}

/** 学期选项（用于下拉选择） */
export const SEMESTER_OPTIONS = [
  { label: '第一学期', value: '第一学期' },
  { label: '第二学期', value: '第二学期' },
  { label: '第三学期', value: '第三学期' },
  { label: '第四学期', value: '第四学期' },
];
