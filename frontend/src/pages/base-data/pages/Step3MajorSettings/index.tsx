/**
 * base-data 模块 - 步骤 3：专业设置
 * 管理各专业的开设课程、班级数、学制等信息
 */

import { createDataManagementStep } from '../../components/DataStepFactory';
import { MAJOR_STEP_CONFIG } from './config';
import type { MajorData } from './types';

// 导出专业设置类型供其他文件使用
export type { MajorData };

/** 专业设置步骤组件 */
export default createDataManagementStep<MajorData>(MAJOR_STEP_CONFIG);
