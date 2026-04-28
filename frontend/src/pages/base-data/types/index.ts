/**
 * base-data 模块 - 共享类型定义
 */

import type { ColumnsType } from 'antd/es/table';

/** 表单字段配置 */
export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'number' | 'email';
  required?: boolean;
  mode?: 'multiple';
  options?: { label: string; value: string }[];
}

/** 数据项基础接口 */
export interface BaseDataItem {
  key: number | string;
  [key: string]: unknown;
}

/** 表单字段配置类型（工厂函数用） */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'input' | 'select' | 'number' | 'email';
  required?: boolean;
  mode?: 'multiple';
  options?: { label: string; value: string }[];
}

/** 步骤配置 */
export interface DataStepConfig<T extends BaseDataItem> {
  /** 数据类型名称 */
  dataType: string;
  /** 表格标题 */
  tableTitle: string;
  /** 搜索占位符 */
  searchPlaceholder: string;
  /** 新建模态框标题 */
  modalTitleNew: string;
  /** 编辑模态框标题 */
  modalTitleEdit: string;
  /** 批量导入示例（可选） */
  batchImportExample?: string;
  /** 生成初始数据 */
  generateInitialData: (initialData?: T[]) => T[];
  /** 表单字段配置 */
  formFields: FormFieldConfig[];
  /** 表格列配置 */
  columns: ColumnsType<T>;
  /** 验证函数 */
  validateData: (formData: Partial<T>) => string | null;
  /** 更新状态回调 */
  onUpdateStatus?: (completed: boolean) => void;
  /** 批量导入回调（可选） */
  onBatchImport?: (file: File) => Promise<void>;
  /** 下载模板回调（可选） */
  onDownloadTemplate?: () => void;
  /** 数据总数（用于后端分页） */
  total?: number;
}
