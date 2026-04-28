import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Space } from 'antd';
import React from 'react';
import type { ReviewFormProps } from '../types';

const { TextArea } = Input;

/**
 * 审核表单组件
 * 用于审核调课申请，可选择通过/驳回并填写审核意见
 */
const ReviewForm: React.FC<ReviewFormProps> = ({
  record,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [status, setStatus] = React.useState<'approved' | 'rejected'>(
    'approved',
  );

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(status, values.reviewComment || '');
      form.resetFields();
    });
  };

  return (
    <div>
      {/* 申请信息摘要 */}
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 4,
        }}
      >
        <p style={{ margin: '4px 0' }}>
          <strong>教师：</strong>
          {record.teacherName}（{record.department}）
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>原课程：</strong>
          {record.originalCourse}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>调整后：</strong>
          {record.targetCourse}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>原因：</strong>
          {record.reason}
        </p>
      </div>

      {/* 审核状态选择 */}
      <Form form={form} layout="vertical">
        <Form.Item label="审核结果" required>
          <Radio.Group
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            style={{ width: '100%' }}
          >
            <Radio.Button value="approved">
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> 通过
            </Radio.Button>
            <Radio.Button value="rejected">
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 驳回
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="审核意见"
          name="reviewComment"
          rules={[
            {
              required: status === 'rejected',
              message: '驳回时请填写审核意见',
            },
          ]}
        >
          <TextArea
            placeholder={
              status === 'approved'
                ? '可选，填写审核意见'
                : '必填，说明驳回原因'
            }
            rows={3}
          />
        </Form.Item>
      </Form>

      {/* 底部按钮 */}
      <Space style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" onClick={handleSubmit}>
          确认{status === 'approved' ? '通过' : '驳回'}
        </Button>
      </Space>
    </div>
  );
};

export default ReviewForm;
