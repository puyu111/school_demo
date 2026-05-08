/**
 * base-data 模块 - 数据管理步骤工厂函数
 * 通过配置对象快速创建各步骤的数据管理组件
 */

import { message } from 'antd';
import React from 'react';
import type { BaseDataItem, DataStepConfig } from '../types';
import CommonDataManager from './CommonDataManager';

/** 步骤组件的 Props 类型 */
export interface DataManagementStepProps {
  /** 更新步骤状态回调 */
  onUpdateStatus?: (completed: boolean) => void;
  /** 表格标题 */
  tableTitle?: string;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 初始数据 */
  initialData?: any[];
  /** 批量导入回调 */
  onBatchImport?: (file: File) => Promise<void>;
  /** 下载模板回调 */
  onDownloadTemplate?: () => void;
  /** 新建保存回调 */
  onSaveItem?: (formData: any) => Promise<any>;
  /** 批量删除回调 */
  onDeleteItems?: (items: any[]) => Promise<any>;
  /** 课程名称选项（覆盖多选下拉的默认选项） */
  courseNameOptions?: { label: string; value: string }[];
}

/**
 * 创建数据管理步骤组件的工厂函数
 * @param config - 步骤配置对象（包含数据类型、表单字段、表格列等）
 * @returns React 组件
 */
export function createDataManagementStep<T extends BaseDataItem>(
  config: DataStepConfig<T>,
): React.FC<DataManagementStepProps> {
  /** 数据管理步骤组件 */
  const DataManagementStep: React.FC<DataManagementStepProps> = ({
    onUpdateStatus,
    tableTitle,
    searchPlaceholder,
    initialData,
    onBatchImport,
    onDownloadTemplate,
    onSaveItem,
    onDeleteItems,
    courseNameOptions,
  }) => {
    // 生成初始数据（使用配置中的默认数据或传入的数据）
    const presetInitialData = config.generateInitialData(initialData);

    // 处理提交：更新步骤状态并显示成功提示
    const handleManagerSubmit = () => {
      onUpdateStatus?.(true);
      message.success(`${tableTitle || config.tableTitle}提交成功！`);
    };

    // 用真实课程名覆盖多选下拉的默认选项
    const formFields = courseNameOptions?.length
      ? config.formFields.map((field) =>
          field.type === 'select' && field.mode === 'multiple'
            ? { ...field, options: courseNameOptions }
            : field,
        )
      : config.formFields;

    return (
      <CommonDataManager<T>
        initialData={presetInitialData}
        tableTitle={tableTitle || config.tableTitle}
        columns={config.columns}
        formFields={formFields}
        searchPlaceholder={searchPlaceholder || config.searchPlaceholder}
        modalTitleNew={config.modalTitleNew}
        modalTitleEdit={config.modalTitleEdit}
        batchImportExample={config.batchImportExample}
        total={config.total}
        validateData={config.validateData}
        onSubmit={handleManagerSubmit}
        onBatchImport={onBatchImport || config.onBatchImport}
        onDownloadTemplate={onDownloadTemplate || config.onDownloadTemplate}
        onSaveItem={onSaveItem || config.onSaveItem}
        onDeleteItems={onDeleteItems || config.onDeleteItems}
      />
    );
  };

  return DataManagementStep;
}

// 导出共享类型
export type { BaseDataItem, DataStepConfig };
