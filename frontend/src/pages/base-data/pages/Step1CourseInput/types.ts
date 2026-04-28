/**
 * base-data 模块 - 步骤 1 课程录入 - 数据类型定义
 */

import type { BaseDataItem } from '../../types';

/** 课程数据类型接口 */
export interface CourseData extends BaseDataItem {
  /** 课程 ID */
  id: string;
  /** 课程名称 */
  name: string;
  /** 课程学分 */
  credits: number;
  /** 课程类型：必修/选修/限选 */
  type: string;
  /** 总课时 */
  totalHours: number;
}

/** 课程类型选项（用于下拉选择） */
export const COURSE_TYPE_OPTIONS = [
  { label: '必修', value: '必修' },
  { label: '选修', value: '选修' },
  { label: '限选', value: '限选' },
];
