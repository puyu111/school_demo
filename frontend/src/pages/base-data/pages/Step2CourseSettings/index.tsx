/**
 * base-data 模块 - 步骤 2：课程设置
 * 管理课程的优先级、前置课程、开设学期等设置
 */

import { createDataManagementStep } from '../../components/DataStepFactory';
import { COURSE_SETTING_STEP_CONFIG } from './config';
import type { CourseSettingData } from './types';
import { SEMESTER_OPTIONS } from './types';

// 导出课程设置类型和选项供其他文件使用
export type { CourseSettingData };
export { SEMESTER_OPTIONS };

/** 课程设置步骤组件 */
export default createDataManagementStep<CourseSettingData>(
  COURSE_SETTING_STEP_CONFIG,
);
