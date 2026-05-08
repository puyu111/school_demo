/**
 * base-data 模块 - 通用数据管理器组件
 * 使用统一 Hook 管理数据，组件本身只负责 UI 渲染
 * 提供表格展示、增删改查、批量导入等功能
 */

import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  message,
  Select,
  Space,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { type FormField, useDataManagement } from '../../hooks';
import type { BaseDataItem } from '../../types';
import TableWithSelection from '../CommonTable';

/** 组件 Props 接口 */
export interface CommonDataManagerProps<T extends BaseDataItem> {
  /** 初始数据 */
  initialData: T[];
  /** 表格标题 */
  tableTitle: string;
  /** 表格列配置 */
  columns: ColumnsType<T>;
  /** 表单字段配置 */
  formFields: FormField[];
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 提交按钮文本 */
  submitButtonText?: string;
  /** 新建模态框标题 */
  modalTitleNew?: string;
  /** 编辑模态框标题 */
  modalTitleEdit?: string;
  /** 批量导入标题 */
  batchImportTitle?: string;
  /** 批量导入格式说明 */
  batchImportFormat?: string;
  /** 批量导入示例 */
  batchImportExample?: string;
  /** 数据总数（用于后端分页） */
  total?: number;
  /** 数据验证函数 */
  validateData?: (formData: Partial<T>) => string | null | undefined;
  /** 数据变化回调 */
  onDataChanged?: (data: T[]) => void;
  /** 提交回调 */
  onSubmit?: () => void;
  /** 批量导入回调 */
  onBatchImport?: (file: File) => Promise<void>;
  /** 下载模板回调 */
  onDownloadTemplate?: () => void;
  /** 新建保存回调（先调后端） */
  onSaveItem?: (formData: Partial<T>) => Promise<any>;
  /** 批量删除回调（先调后端） */
  onDeleteItems?: (items: T[]) => Promise<any>;
}

/** 动态表单组件 Props */
interface DynamicFormProps<T extends BaseDataItem> {
  /** 表单字段配置 */
  formFields: FormField[];
  /** 当前表单数据 */
  formData: Partial<T>;
  /** 表单数据变化回调 */
  onFormDataChange: (data: Partial<T>) => void;
}

/**
 * 动态表单组件
 * 根据 formFields 配置动态生成不同类型的表单项
 */
function DynamicForm<T extends BaseDataItem>({
  formFields,
  formData,
  onFormDataChange,
}: DynamicFormProps<T>) {
  /** 处理字段值变化 */
  const handleFieldChange = (name: string, value: any) => {
    onFormDataChange({ ...formData, [name]: value });
  };

  /** 根据字段类型渲染不同的表单项 */
  const renderField = (field: FormField) => {
    const { name, label, type, options, mode } = field;
    const value = formData[name] as string | number | string[] | undefined;

    // 文本/邮箱输入框
    if (type === 'input' || type === 'email') {
      return (
        <Input
          type={type}
          value={value as string | undefined}
          onChange={(e) => handleFieldChange(name, e.target.value)}
          placeholder={`请输入${label}`}
        />
      );
    }

    // 数字输入框
    if (type === 'number') {
      return (
        <Input
          type="number"
          value={value as number | undefined}
          onChange={(e) =>
            handleFieldChange(name, parseInt(e.target.value, 10) || 0)
          }
          placeholder={`请输入${label}`}
        />
      );
    }

    // 下拉选择框（支持单选/多选）
    if (type === 'select') {
      const isMultiple = mode === 'multiple';
      const selectValue = isMultiple
        ? value
          ? Array.isArray(value)
            ? value
            : String(value).split(',')
          : []
        : value;

      return (
        <Select
          mode={isMultiple ? 'multiple' : undefined}
          allowClear
          style={{ width: '100%' }}
          placeholder={`请选择${label}`}
          value={selectValue}
          onChange={(values) =>
            handleFieldChange(name, isMultiple ? values || [] : values)
          }
          options={options}
        />
      );
    }

    return null;
  };

  return (
    <Form layout="vertical">
      {formFields.map((field) => (
        <Form.Item
          key={field.name}
          label={field.label}
          required={field.required}
        >
          {renderField(field)}
        </Form.Item>
      ))}
    </Form>
  );
}

/** 批量导入弹窗组件 Props */
interface BatchImportModalProps {
  /** 弹窗显示状态 */
  open: boolean;
  /** 弹窗标题 */
  title: string;
  /** 数据格式说明 */
  format: string;
  /** 数据示例 */
  example: string;
  /** 导入确认回调 */
  onImport: () => Promise<void>;
  /** 取消回调 */
  onCancel: () => void;
  /** 下载模板回调 */
  onDownloadTemplate?: () => void;
  /** 当前选中的文件 */
  uploadFile: File | null;
  /** 文件选择回调 */
  onFileSelect: (file: File) => void;
}

/**
 * 批量导入弹窗组件
 * 提供 Excel 文件上传和批量导入功能
 */
const BatchImportModal: React.FC<BatchImportModalProps> = ({
  open,
  title,
  format,
  example,
  onImport,
  onCancel,
  onDownloadTemplate,
  uploadFile,
  onFileSelect,
}) => {
  /** 处理文件上传前逻辑 */
  const handleUpload = (file: File) => {
    onFileSelect(file);
    return false; // 阻止自动上传
  };

  return (
    <Modal title={title} open={open} onCancel={onCancel} footer={null}>
      <p>{format}</p>
      {example && (
        <p>
          <strong>示例:</strong> {example}
        </p>
      )}

      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        {onDownloadTemplate && (
          <Button onClick={onDownloadTemplate} icon={<UploadOutlined />}>
            下载 Excel 模板
          </Button>
        )}

        <Upload
          beforeUpload={handleUpload}
          accept=".xlsx,.xls,.csv"
          maxCount={1}
          showUploadList
        >
          <Button icon={<UploadOutlined />}>上传 Excel 文件</Button>
        </Upload>
      </Space>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          取消
        </Button>
        <Button type="primary" onClick={onImport} disabled={!uploadFile}>
          导入
        </Button>
      </div>
    </Modal>
  );
};

/**
 * 通用数据管理器组件
 * 整合表格、表单、批量导入功能于一体
 */
const CommonDataManager = <T extends BaseDataItem>({
  initialData,
  tableTitle,
  columns,
  formFields,
  searchPlaceholder = '请输入关键词进行搜索',
  modalTitleNew = '新建',
  modalTitleEdit = '编辑',
  batchImportTitle = '批量导入',
  batchImportFormat = '请按以下格式准备数据（每行一条记录，用逗号分隔）：',
  batchImportExample = '',
  total,
  validateData,
  onDataChanged,
  onSubmit,
  onBatchImport,
  onDownloadTemplate,
  onSaveItem,
  onDeleteItems,
}: CommonDataManagerProps<T>) => {
  // 使用统一数据管理 Hook
  const {
    data,
    filteredData,
    modalVisible,
    currentRecord,
    formData,
    selectedRowKeys,
    uploadFile,
    batchModalVisible,
    handleSearch,
    handleAdd,
    handleSave,
    handleDelete,
    handleBatchImport,
    handleBatchImportConfirm,
    handleBatchImportCancel,
    handleFileSelect,
    setModalVisible,
    setFormData,
    setSelectedRowKeys,
  } = useDataManagement<T>({
    initialData,
    formFields,
    validateData,
    onDataChanged,
    onBatchImport,
  });

  // 提交处理：验证数据并调用提交回调
  const handleSubmit = () => {
    if (filteredData.length === 0) {
      message.error('没有数据可提交！');
      return;
    }
    message.success('提交成功！');
    onSubmit?.();
  };

  // 保存处理：新建时先调后端，成功后本地更新
  const handleSaveWithMessage = async () => {
    if (!currentRecord && onSaveItem) {
      try {
        const res = await onSaveItem(formData);
        if (res?.code !== 200) {
          message.error(res?.message || '保存失败');
          return;
        }
        const result = handleSave(res.data);
        if (result.success) {
          message.success(`${tableTitle}添加成功！`);
        }
        return;
      } catch (e: any) {
        message.error('保存失败: ' + (e?.message || '网络错误'));
        return;
      }
    }
    const result = handleSave();
    if (result.success) {
      message.success(
        currentRecord ? `${tableTitle}更新成功！` : `${tableTitle}添加成功！`,
      );
    } else if (result.message) {
      message.error(result.message);
    }
  };

  // 删除处理：先调后端删 dbId 的记录，成功后本地删除
  const handleDeleteWithMessage = async () => {
    if (onDeleteItems && selectedRowKeys.length > 0) {
      const itemsToDelete = data.filter((item) =>
        selectedRowKeys.includes(item.key),
      );
      const dbItems = itemsToDelete.filter((i: any) => i.dbId != null);
      if (dbItems.length > 0) {
        try {
          const res = await onDeleteItems(dbItems);
          if (res?.code !== 200) {
            message.error(res?.message || '删除失败');
            return;
          }
        } catch (e: any) {
          message.error('删除失败: ' + (e?.message || '网络错误'));
          return;
        }
      }
    }
    const result = handleDelete();
    if (result.success) {
      message.success(result.message);
    } else {
      message.warning(result.message);
    }
  };

  return (
    <>
      {/* 数据表格 */}
      <TableWithSelection
        columns={columns as ColumnsType<T>}
        dataSource={filteredData}
        total={total}
        tableTitle={tableTitle}
        onAdd={handleAdd}
        onDelete={handleDeleteWithMessage}
        onBatchImport={handleBatchImport}
        onSearch={handleSearch}
        searchPlaceholder={searchPlaceholder}
        onSubmit={handleSubmit}
        onSelectChange={(keys: React.Key[]) =>
          setSelectedRowKeys(keys as (number | string)[])
        }
      />

      {/* 新建/编辑模态框 */}
      <Modal
        title={currentRecord ? modalTitleEdit : modalTitleNew}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSaveWithMessage}
      >
        <DynamicForm
          formFields={formFields}
          formData={formData}
          onFormDataChange={setFormData}
        />
      </Modal>

      {/* 批量导入模态框 */}
      <BatchImportModal
        open={batchModalVisible}
        title={batchImportTitle}
        format={batchImportFormat}
        example={batchImportExample}
        onImport={handleBatchImportConfirm}
        onCancel={handleBatchImportCancel}
        onDownloadTemplate={onDownloadTemplate}
        uploadFile={uploadFile}
        onFileSelect={handleFileSelect}
      />
    </>
  );
};

export default CommonDataManager;
