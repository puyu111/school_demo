/**
 * base-data 模块 - 步骤 4：教师录入
 * 管理教师的基本信息、可授课程、学历等数据
 */

import { createDataManagementStep } from '../../components/DataStepFactory';
import { TEACHER_STEP_CONFIG } from './config';
import type { TeacherData } from './types';
import { DEGREE_OPTIONS, GENDER_OPTIONS } from './types';

// 导出教师类型和选项供其他文件使用
export type { TeacherData };
export { GENDER_OPTIONS, DEGREE_OPTIONS };

/** 教师录入步骤组件 */
export default createDataManagementStep<TeacherData>(TEACHER_STEP_CONFIG);
