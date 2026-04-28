/**
 * Step2 课程设置 - 工厂函数配置
 * 聚合所有配置供 DataStepFactory 使用
 */

import { downloadCourseSettingsTemplate } from '../../services';
import type { DataStepConfig } from '../../types';
import { downloadTemplate } from '../../utils';
import {
  COURSE_SETTING_FORM_FIELDS,
  COURSE_SETTING_TABLE_COLUMNS,
  generateInitialData,
  validateCourseSettingData,
} from './constants';
import type { CourseSettingData } from './types';

/** 课程设置步骤配置 */
export const COURSE_SETTING_STEP_CONFIG: DataStepConfig<CourseSettingData> = {
  // 数据类型标识
  dataType: 'course-setting',
  // 表格标题
  tableTitle: '课程设置表',
  // 搜索框占位符
  searchPlaceholder: '请输入课程名称或开设学期进行搜索',
  // 新建模态框标题
  modalTitleNew: '新建课程设置',
  // 编辑模态框标题
  modalTitleEdit: '编辑课程设置',
  // 生成初始数据
  generateInitialData,
  // 表单字段配置
  formFields: COURSE_SETTING_FORM_FIELDS,
  // 表格列配置
  columns: COURSE_SETTING_TABLE_COLUMNS,
  // 数据验证函数
  validateData: validateCourseSettingData,
  // 下载模板回调
  onDownloadTemplate: async () => {
    await downloadTemplate(downloadCourseSettingsTemplate, '课程设置模板.xlsx');
  },
};
