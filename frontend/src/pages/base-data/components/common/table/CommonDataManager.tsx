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
import React, { useEffect, useRef, useState } from 'react';
import TableWithSelection from './TableWithSelection';

export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'number' | 'email';
  required?: boolean;
  mode?: 'multiple';
  options?: { label: string; value: string }[];
}

export interface CommonDataManagerProps<T = any> {
  initialData: T[];
  tableTitle: string;
  columns: any[];
  formFields: FormField[];
  searchPlaceholder?: string;
  submitButtonText?: string;
  modalTitleNew?: string;
  modalTitleEdit?: string;
  batchImportTitle?: string;
  batchImportFormat?: string;
  batchImportExample?: string;
  validateData?: (formData: any) => string | null | undefined;
  onDataChanged?: (data: T[]) => void;
  onSubmit?: () => void;
}

interface DynamicFormProps {
  formFields: FormField[];
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  formFields,
  formData,
  onFormDataChange,
}) => {
  const handleFieldChange = (name: string, value: any) => {
    onFormDataChange({ ...formData, [name]: value });
  };

  const renderField = (field: FormField) => {
    const { name, label, type, options } = field;
    const value = formData[name];

    if (type === 'input' || type === 'email') {
      return (
        <Input
          type={type}
          value={value}
          onChange={(e) => handleFieldChange(name, e.target.value)}
          placeholder={`请输入${label}`}
        />
      );
    }

    if (type === 'number') {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            handleFieldChange(name, parseInt(e.target.value, 10) || 0)
          }
          placeholder={`请输入${label}`}
        />
      );
    }

    if (type === 'select') {
      const isMultiple = field.mode === 'multiple';
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
};

interface BatchImportModalProps {
  open: boolean;
  title: string;
  format: string;
  example: string;
  onImport: (data: string) => void;
  onCancel: () => void;
}

const BatchImportModal: React.FC<BatchImportModalProps> = ({
  open,
  title,
  format,
  example,
  onImport,
  onCancel,
}) => {
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (open) {
      setInputText('');
    }
  }, [open]);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => message.success('文件上传成功！请确认数据并导入。');
    reader.onerror = () => message.error('文件读取失败');
    reader.readAsText(file);
    return false;
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
        <Upload
          beforeUpload={handleUpload}
          accept=".xlsx,.xls,.csv"
          maxCount={1}
          showUploadList
        >
          <Button icon={<UploadOutlined />}>上传 Excel 文件</Button>
        </Upload>

        <div style={{ margin: '16px 0' }}>
          <p>或者直接粘贴数据：</p>
          <textarea
            rows={8}
            style={{ width: '100%', marginTop: 8 }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="粘贴 Excel 数据或手动输入，每行一条记录，用逗号分隔各字段"
          />
        </div>
      </Space>

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          取消
        </Button>
        <Button type="primary" onClick={() => onImport(inputText)}>
          导入
        </Button>
      </div>
    </Modal>
  );
};

const CommonDataManager = <T extends { key?: React.Key }>({
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
  validateData,
  onDataChanged,
  onSubmit,
}: CommonDataManagerProps<T>) => {
  const onDataChangedRef = useRef(onDataChanged);

  useEffect(() => {
    onDataChangedRef.current = onDataChanged;
  }, [onDataChanged]);

  const [data, setData] = useState<T[]>(initialData);
  const [_selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [filteredData, setFilteredData] = useState<T[]>(data);

  useEffect(() => {
    setFilteredData(data);
    onDataChangedRef.current?.(data);
  }, [data]);

  useEffect(() => {
    const initialFormData: Record<string, any> = {};
    formFields.forEach((field) => {
      initialFormData[field.name] = field.type === 'number' ? 0 : '';
    });
    setFormData(initialFormData);
  }, [formFields]);

  const handleSearch = (value: string) => {
    const filtered = value
      ? data.filter((item) =>
          Object.values(item)
            .filter((val) => typeof val === 'string')
            .some((val) => val.toLowerCase().includes(value.toLowerCase())),
        )
      : data;
    setFilteredData(filtered);
    message.info(`找到 ${filtered.length} 条匹配的记录`);
  };

  const handleAdd = () => {
    const emptyFormData: Record<string, any> = {};
    formFields.forEach((field) => {
      emptyFormData[field.name] = field.type === 'number' ? 0 : '';
    });
    setFormData(emptyFormData);
    setCurrentRecord(null);
    setModalVisible(true);
  };

  const _handleEdit = (record: T) => {
    setFormData({ ...(record as any) });
    setCurrentRecord(record);
    setModalVisible(true);
  };

  const handleSave = () => {
    // 验证数据
    const hasEmptyRequired = formFields
      .filter((field) => field.required)
      .some(
        (field) =>
          !formData[field.name] || String(formData[field.name]).trim() === '',
      );

    if (validateData) {
      const error = validateData(formData);
      if (error) {
        message.error(error);
        return;
      }
    } else if (hasEmptyRequired) {
      message.error('请填写所有必填字段');
      return;
    }

    if (currentRecord) {
      setData(
        (prevData) =>
          prevData.map((item) =>
            (item as any).key === (currentRecord as any).key
              ? { ...item, ...formData }
              : item,
          ) as T[],
      );
    } else {
      const newKey =
        Math.max(...data.map((item) => Number((item as any).key)), 0) + 1;
      const newData = [...data, { key: newKey, ...formData }] as T[];
      setData(newData);
      setFilteredData(newData);
    }

    setModalVisible(false);
    message.success(
      currentRecord ? `${tableTitle}更新成功！` : `${tableTitle}添加成功！`,
    );
  };

  const handleDelete = (keysToDelete: React.Key[]) => {
    if (keysToDelete.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    const newData = data.filter(
      (item) => !keysToDelete.includes((item as any).key),
    );
    setData(newData);
    setFilteredData(newData);
    setSelectedRowKeys([]);
    message.success('删除成功！');
  };

  const handleSubmit = () => {
    if (data.length === 0) {
      message.error('没有数据可提交！');
      return;
    }
    message.success('提交成功！');
    onSubmit?.();
  };

  const handleBatchImport = () => {
    setBatchModalVisible(true);
  };

  const handleBatchImportConfirm = (inputText: string) => {
    if (!inputText.trim()) {
      message.error('请输入要导入的数据');
      return;
    }

    try {
      const lines = inputText.split('\n').filter((line) => line.trim());
      if (lines.length === 0) {
        message.error('没有有效的数据行');
        return;
      }

      const newRecords = lines.map((line, index) => {
        const parts = line.split(',').map((part) => part.trim());
        if (parts.length < formFields.length) {
          throw new Error(`第${index + 1}行数据格式不正确`);
        }

        const record: Record<string, any> = {};
        formFields.forEach((field, idx) => {
          if (field.type === 'number') {
            record[field.name] = parseInt(parts[idx], 10) || 0;
          } else if (field.type === 'select' && field.mode === 'multiple') {
            record[field.name] = parts[idx]
              .split(',')
              .map((item) => item.trim());
          } else {
            record[field.name] = parts[idx];
          }
        });

        return {
          key:
            Math.max(...data.map((item) => Number((item as any).key)), 0) +
            index +
            1,
          ...record,
        };
      });

      const newData = [...data, ...newRecords] as T[];
      setData(newData);
      setFilteredData(newData);
      setBatchModalVisible(false);
      message.success(`成功导入${newRecords.length}条记录！`);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '批量导入失败，请检查数据格式',
      );
    }
  };

  return (
    <>
      <TableWithSelection
        columns={columns as ColumnsType<T>}
        dataSource={filteredData}
        tableTitle={tableTitle}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onBatchImport={handleBatchImport}
        onSearch={handleSearch}
        searchPlaceholder={searchPlaceholder}
        onSubmit={handleSubmit}
        onSelectChange={setSelectedRowKeys}
      />

      <Modal
        title={currentRecord ? modalTitleEdit : modalTitleNew}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
      >
        <DynamicForm
          formFields={formFields}
          formData={formData}
          onFormDataChange={setFormData}
        />
      </Modal>

      <BatchImportModal
        open={batchModalVisible}
        title={batchImportTitle}
        format={batchImportFormat}
        example={batchImportExample}
        onImport={handleBatchImportConfirm}
        onCancel={() => setBatchModalVisible(false)}
      />
    </>
  );
};

export default CommonDataManager;
