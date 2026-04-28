/**
 * Step1 课程录入 - 工厂函数配置
 * 聚合所有配置供 DataStepFactory 使用
 */

import { downloadCoursesTemplate } from '../../services';
import type { DataStepConfig } from '../../types';
import { downloadTemplate } from '../../utils';
import {
  COURSE_FORM_FIELDS,
  COURSE_TABLE_COLUMNS,
  generateInitialData,
  validateCourseData,
} from './constants';
import type { CourseData } from './types';

/** 课程录入步骤配置 */
export const COURSE_STEP_CONFIG: DataStepConfig<CourseData> = {
  // 数据类型标识
  dataType: 'course',
  // 表格标题
  tableTitle: '课程录入表',
  // 搜索框占位符
  searchPlaceholder: '请输入课程 ID 或课程名称进行搜索',
  // 新建模态框标题
  modalTitleNew: '新建课程',
  // 编辑模态框标题
  modalTitleEdit: '编辑课程',
  // 生成初始数据
  generateInitialData,
  // 表单字段配置
  formFields: COURSE_FORM_FIELDS,
  // 表格列配置
  columns: COURSE_TABLE_COLUMNS,
  // 数据验证函数
  validateData: validateCourseData,
  // 下载模板回调
  onDownloadTemplate: async () => {
    await downloadTemplate(downloadCoursesTemplate, '课程录入模板.xlsx');
  },
};
