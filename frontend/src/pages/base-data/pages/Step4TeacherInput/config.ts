/**
 * Step4 教师录入 - 工厂函数配置
 * 聚合所有配置供 DataStepFactory 使用
 */

import { downloadTeachersTemplate } from '../../services';
import type { DataStepConfig } from '../../types';
import { downloadTemplate } from '../../utils';
import {
  generateInitialData,
  TEACHER_FORM_FIELDS,
  TEACHER_TABLE_COLUMNS,
  validateTeacherData,
} from './constants';
import type { TeacherData } from './types';

/** 教师录入步骤配置 */
export const TEACHER_STEP_CONFIG: DataStepConfig<TeacherData> = {
  // 数据类型标识
  dataType: 'teacher',
  // 表格标题
  tableTitle: '教师录入表',
  // 搜索框占位符
  searchPlaceholder: '请输入教师姓名或 ID 进行搜索',
  // 新建模态框标题
  modalTitleNew: '新建教师',
  // 编辑模态框标题
  modalTitleEdit: '编辑教师',
  // 生成初始数据
  generateInitialData,
  // 表单字段配置
  formFields: TEACHER_FORM_FIELDS,
  // 表格列配置
  columns: TEACHER_TABLE_COLUMNS,
  // 数据验证函数
  validateData: validateTeacherData,
  // 下载模板回调
  onDownloadTemplate: async () => {
    await downloadTemplate(downloadTeachersTemplate, '教师录入模板.xlsx');
  },
};
