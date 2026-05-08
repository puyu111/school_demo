/**
 * Step3 专业设置 - 工厂函数配置
 * 聚合所有配置供 DataStepFactory 使用
 */

import { createMajor, deleteMajors, downloadMajorsTemplate, importMajors } from '../../services';
import type { DataStepConfig } from '../../types';
import { downloadTemplate } from '../../utils';
import {
  generateInitialData,
  MAJOR_FORM_FIELDS,
  MAJOR_TABLE_COLUMNS,
  validateMajorData,
} from './constants';
import type { MajorData } from './types';

/** 专业设置步骤配置 */
export const MAJOR_STEP_CONFIG: DataStepConfig<MajorData> = {
  // 数据类型标识
  dataType: 'major',
  // 表格标题
  tableTitle: '专业设置表',
  // 搜索框占位符
  searchPlaceholder: '请输入专业名称或 ID 进行搜索',
  // 新建模态框标题
  modalTitleNew: '新建专业',
  // 编辑模态框标题
  modalTitleEdit: '编辑专业',
  // 生成初始数据
  generateInitialData,
  // 表单字段配置
  formFields: MAJOR_FORM_FIELDS,
  // 表格列配置
  columns: MAJOR_TABLE_COLUMNS,
  // 数据验证函数
  validateData: validateMajorData,
  // 下载模板回调
  onDownloadTemplate: async () => {
    await downloadTemplate(downloadMajorsTemplate, '专业设置模板.xlsx');
  },
  onBatchImport: async (file) => importMajors(file),
  onSaveItem: async (formData) => createMajor(formData as any),
  onDeleteItems: async (items) => {
    const dbIds = items.map((i: any) => String(i.dbId));
    return deleteMajors(dbIds);
  },
};
