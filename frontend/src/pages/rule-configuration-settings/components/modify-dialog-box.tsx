import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  message,
  Space,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import type { RuleData, RuleEditDialogProps } from '../types';

const RuleEditDialog: React.FC<RuleEditDialogProps> = ({
  open,
  title,
  record,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Partial<RuleData>>({
    key: '',
    ruleName: '',
    description: '',
    validDate: undefined,
  });
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // 初始化表单数据
  useEffect(() => {
    if (record) {
      const initialData: RuleData = {
        key: record.key || '',
        ruleName: record.ruleName || '',
        description: record.description || '',
        validDate: record.validDate,
      };

      const formValues: any = {
        ruleName: record.ruleName,
        description: record.description,
      };

      if (record.validDate) {
        formValues.validDate = [
          dayjs(record.validDate[0]),
          dayjs(record.validDate[1]),
        ];
      }

      setFormData(initialData);
      form.setFieldsValue(formValues);
      setChangedFields(new Set());
    }
  }, [record, form]);

  // 处理字段值变化
  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
    setChangedFields((prev) => new Set(prev).add(fieldKey));
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      await form.validateFields();

      const values = form.getFieldsValue();
      const processedData: Partial<RuleData> = {
        ...formData,
        ruleName: values.ruleName,
        description: values.description,
        teachers: record?.teachers,
      };

      if (values.validDate) {
        processedData.validDate = [
          values.validDate[0].valueOf(),
          values.validDate[1].valueOf(),
        ];
      } else {
        processedData.validDate = undefined;
      }

      onSave(processedData as RuleData);
      message.success('保存成功');
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('请检查输入数据');
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFormData({
      key: record?.key || '',
      ruleName: record?.ruleName || '',
      description: record?.description || '',
      validDate: record?.validDate,
    });
    setChangedFields(new Set());
  };

  // 检查是否有修改
  const hasChanges = changedFields.size > 0;

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>{title}</span>
          {hasChanges && (
            <Tag color="orange" icon={<FileTextOutlined />}>
              已修改
            </Tag>
          )}
        </Space>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="reset" onClick={handleReset} disabled={!hasChanges}>
          重置
        </Button>,
        <Button key="back" onClick={onCancel}>
          <CloseCircleOutlined />
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={!hasChanges}
        >
          <SaveOutlined />
          保存更改
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div
          style={{
            background: '#fafafa',
            padding: 20,
            borderRadius: 8,
            maxHeight: 600,
            overflowY: 'auto',
          }}
        >
          <Descriptions
            title="规则信息"
            bordered
            column={2}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="规则 ID">{record?.key}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {record?.key ? new Date().toLocaleDateString() : '-'}
            </Descriptions.Item>
          </Descriptions>

          <Form.Item
            label="规则名称"
            name="ruleName"
            rules={[{ required: true, message: '请输入规则名称' }]}
            style={{ marginBottom: 16 }}
          >
            <Input
              placeholder="请输入规则名称"
              onChange={(e) => handleFieldChange('ruleName', e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="规则描述"
            name="description"
            rules={[{ required: true, message: '请输入规则描述' }]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入规则描述"
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="有效期"
            name="validDate"
            style={{ marginBottom: 16 }}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => {
                if (dates?.[0] && dates[1]) {
                  handleFieldChange('validDate', [
                    dates[0].valueOf(),
                    dates[1].valueOf(),
                  ]);
                } else {
                  handleFieldChange('validDate', undefined);
                }
              }}
            />
          </Form.Item>
        </div>
      </Form>

      {/* 修改提示 */}
      {hasChanges && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: 6,
          }}
        >
          <Space>
            <CheckCircleOutlined style={{ color: '#1890ff' }} />
            <span>检测到修改：{Array.from(changedFields).join(', ')}</span>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default RuleEditDialog;
