/**
 * base-data 模块 - 步骤 1：课程录入
 * 提供课程数据的增删改查功能
 */

import { createDataManagementStep } from '../../components/DataStepFactory';
import { COURSE_STEP_CONFIG } from './config';
import type { CourseData } from './types';
import { COURSE_TYPE_OPTIONS } from './types';

// 导出课程数据类型和选项供其他文件使用
export type { CourseData };
export { COURSE_TYPE_OPTIONS };

/** 课程录入步骤组件 */
export default createDataManagementStep<CourseData>(COURSE_STEP_CONFIG);
