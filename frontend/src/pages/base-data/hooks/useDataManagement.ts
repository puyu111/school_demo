/**
 * base-data 模块 - 统一数据管理 Hook
 * 合并数据 CRUD 和文件上传功能，提供完整的数据管理逻辑
 */

import { message } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BaseDataItem, FormField } from '../types';

/** Hook 配置接口 */
export interface UseDataManagementConfig<T extends BaseDataItem> {
  /** 初始数据 */
  initialData: T[];
  /** 表单字段配置 */
  formFields: FormField[];
  /** 数据验证函数 */
  validateData?: (formData: Partial<T>) => string | null | undefined;
  /** 数据变化回调 */
  onDataChanged?: (data: T[]) => void;
  /** 批量导入回调 */
  onBatchImport?: (file: File) => Promise<void>;
}

/** Hook 返回值接口 */
export interface UseDataManagementReturn<T extends BaseDataItem> {
  // 数据状态
  /** 原始数据 */
  data: T[];
  /** 筛选后的数据 */
  filteredData: T[];
  /** 已选中的行键值 */
  selectedRowKeys: (number | string)[];

  // 表单状态
  /** 模态框显示状态 */
  modalVisible: boolean;
  /** 当前编辑的记录 */
  currentRecord: T | null;
  /** 表单数据 */
  formData: Partial<T>;

  // 文件上传状态
  /** 当前选中的文件 */
  uploadFile: File | null;
  /** 批量导入模态框显示状态 */
  batchModalVisible: boolean;

  // 数据操作方法
  /** 搜索处理 */
  handleSearch: (value: string) => void;
  /** 添加新记录 */
  handleAdd: () => void;
  /** 编辑记录 */
  handleEdit: (record: T) => void;
  /** 保存记录 */
  handleSave: () => { success: boolean; message?: string };
  /** 删除记录 */
  handleDelete: () => { success: boolean; message?: string };

  // 文件上传操作方法
  /** 选择文件 */
  handleFileSelect: (file: File) => void;
  /** 打开批量导入弹窗 */
  handleBatchImport: () => void;
  /** 确认批量导入 */
  handleBatchImportConfirm: () => Promise<void>;
  /** 取消批量导入 */
  handleBatchImportCancel: () => void;

  // 状态设置方法
  /** 设置模态框显示状态 */
  setModalVisible: (open: boolean) => void;
  /** 设置表单数据 */
  setFormData: (data: Partial<T>) => void;
  /** 设置选中行键值 */
  setSelectedRowKeys: (keys: (number | string)[]) => void;
}

/**
 * 统一数据管理 Hook
 * @param config - 配置项
 * @returns 数据状态和操作方法
 */
export function useDataManagement<T extends BaseDataItem>({
  initialData,
  formFields,
  validateData,
  onDataChanged,
  onBatchImport,
}: UseDataManagementConfig<T>): UseDataManagementReturn<T> {
  // 使用 ref 存储回调，避免依赖循环
  const onDataChangedRef = useRef(onDataChanged);

  // 同步回调到 ref
  useEffect(() => {
    onDataChangedRef.current = onDataChanged;
  }, [onDataChanged]);

  // ============== 数据状态 ==============
  const [data, setData] = useState<T[]>(initialData);
  const [filteredData, setFilteredData] = useState<T[]>(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(number | string)[]>(
    [],
  );

  // 从父组件同步初始数据（父组件异步加载数据后更新 initialData）
  useEffect(() => {
    setData(initialData);
    setFilteredData(initialData);
  }, [initialData]);

  // ============== 表单状态 ==============
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<T | null>(null);
  const [formData, setFormData] = useState<Partial<T>>({});

  // ============== 文件上传状态 ==============
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [batchModalVisible, setBatchModalVisible] = useState(false);

  // ============== 副作用 ==============
  // 数据变化时同步筛选数据并通知父组件
  useEffect(() => {
    setFilteredData(data);
    onDataChangedRef.current?.(data);
  }, [data]);

  // 根据表单字段初始化表单数据
  useEffect(() => {
    const initialFormData: Partial<T> = {} as Partial<T>;
    formFields.forEach((field) => {
      (initialFormData as any)[field.name] = field.type === 'number' ? 0 : '';
    });
    setFormData(initialFormData);
  }, [formFields]);

  // ============== 数据操作方法 ==============
  /** 搜索：根据关键词筛选数据 */
  const handleSearch = useCallback(
    (value: string) => {
      if (!value) {
        setFilteredData(data);
        message.info(`找到 ${data.length} 条匹配的记录`);
        return;
      }

      const filtered = data.filter((item) =>
        Object.values(item)
          .filter((val) => typeof val === 'string')
          .some((val) => val.toLowerCase().includes(value.toLowerCase())),
      );

      setFilteredData(filtered);
      message.info(`找到 ${filtered.length} 条匹配的记录`);
    },
    [data],
  );

  /** 添加：清空表单并打开新建模态框 */
  const handleAdd = useCallback(() => {
    const emptyFormData: Partial<T> = {} as Partial<T>;
    formFields.forEach((field) => {
      (emptyFormData as any)[field.name] = field.type === 'number' ? 0 : '';
    });
    setFormData(emptyFormData);
    setCurrentRecord(null);
    setModalVisible(true);
  }, [formFields]);

  /** 编辑：填充表单并打开编辑模态框 */
  const handleEdit = useCallback((record: T) => {
    setFormData({ ...record });
    setCurrentRecord(record);
    setModalVisible(true);
  }, []);

  /** 保存：验证表单并执行新增/更新 */
  const handleSave = useCallback((backendRecord?: T) => {
    // 检查必填字段
    const hasEmptyRequired = formFields
      .filter((field) => field.required)
      .some(
        (field) =>
          !(formData as any)[field.name] ||
          String((formData as any)[field.name] || '').trim() === '',
      );

    // 执行自定义验证
    if (validateData) {
      const error = validateData(formData);
      if (error) {
        return { success: false, message: error };
      }
    } else if (hasEmptyRequired) {
      return { success: false, message: '请填写所有必填字段' };
    }

    // 更新或新增数据
    if (currentRecord) {
      setData((prevData) =>
        prevData.map((item) =>
          item.key === currentRecord.key
            ? ({ ...item, ...formData } as T)
            : item,
        ),
      );
    } else {
      const record = backendRecord
        ? { ...backendRecord, key: (backendRecord as any)?.dbId ?? (backendRecord as any)?.id } as T
        : ({ ...formData } as T);
      const newData = [...data, record];
      setData(newData);
      setFilteredData(newData);
    }

    setModalVisible(false);
    return {
      success: true,
      message: currentRecord ? '更新成功！' : '添加成功！',
    };
  }, [currentRecord, data, formData, formFields, validateData]);

  /** 删除：移除选中的记录 */
  const handleDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      return { success: false, message: '请选择要删除的记录' };
    }

    const newData = data.filter((item) => !selectedRowKeys.includes(item.key));
    setData(newData);
    setFilteredData(newData);
    setSelectedRowKeys([]);
    return { success: true, message: '删除成功！' };
  }, [data, selectedRowKeys]);

  // ============== 文件上传操作方法 ==============
  /** 选择文件：存储待上传的文件 */
  const handleFileSelect = useCallback((file: File) => {
    setUploadFile(file);
  }, []);

  /** 打开批量导入弹窗 */
  const handleBatchImport = useCallback(() => {
    setBatchModalVisible(true);
  }, []);

  /** 确认批量导入：调用后端接口上传文件 */
  const handleBatchImportConfirm = useCallback(async () => {
    if (!uploadFile) {
      message.warning('请先选择要上传的文件');
      return;
    }

    message.loading('正在上传文件...');

    try {
      await onBatchImport?.(uploadFile);
      setBatchModalVisible(false);
      setUploadFile(null);
      message.success('文件上传成功，等待后端处理');
    } catch (error) {
      message.error('上传失败: ' + (error?.message || error || '未知错误'));
      console.error('文件上传错误:', error);
    }
  }, [uploadFile, onBatchImport]);

  /** 取消批量导入：清空文件并关闭弹窗 */
  const handleBatchImportCancel = useCallback(() => {
    setBatchModalVisible(false);
    setUploadFile(null);
  }, []);

  // ============== 返回值 ==============
  return {
    data,
    filteredData,
    selectedRowKeys,
    modalVisible,
    currentRecord,
    formData,
    uploadFile,
    batchModalVisible,
    handleSearch,
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    handleFileSelect,
    handleBatchImport,
    handleBatchImportConfirm,
    handleBatchImportCancel,
    setModalVisible,
    setFormData,
    setSelectedRowKeys,
  };
}
