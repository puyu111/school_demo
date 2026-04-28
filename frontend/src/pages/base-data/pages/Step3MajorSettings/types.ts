/**
 * base-data 模块 - 步骤 3 专业设置 - 数据类型定义
 */

import type { BaseDataItem } from '../../types';

/** 专业设置数据类型接口 */
export interface MajorData extends BaseDataItem {
  /** 专业 ID */
  id: string;
  /** 专业名称 */
  name: string;
  /** 开设课程列表 */
  courses: string[];
  /** 班级数 */
  classSize: number;
  /** 年制（如 3 年制、4 年制） */
  duration: number;
}
