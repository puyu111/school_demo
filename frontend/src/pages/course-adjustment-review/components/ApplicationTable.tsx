import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Button, Space, Table, Tag } from 'antd';
import React from 'react';
import type { ApplicationTableProps, CourseAdjustmentRecord } from '../types';

/**
 * 申请表格组件
 * 显示调课申请列表，支持行选择、查看详情、审核操作
 */
const ApplicationTable: React.FC<ApplicationTableProps> = ({
  data,
  selectedRowKeys,
  onSelectionChange,
  onViewDetail,
  onReview,
  loading = false,
}) => {
  // 表格列定义
  const columns = [
    {
      title: '教师姓名',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: '所在院系',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '原课程',
      dataIndex: 'originalCourse',
      key: 'originalCourse',
      width: 200,
      ellipsis: true,
    },
    {
      title: '调整后',
      dataIndex: 'targetCourse',
      key: 'targetCourse',
      width: 200,
      ellipsis: true,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 150,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency: 'high' | 'normal') => (
        <Tag color={urgency === 'high' ? 'red' : 'blue'}>
          {urgency === 'high' ? '紧急' : '一般'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'pending' | 'approved' | 'rejected') => {
        const statusConfig = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已驳回' },
        };
        const config = statusConfig[status] || {
          color: 'default',
          text: '未知',
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CourseAdjustmentRecord) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => onReview(record, 'approved')}
              >
                通过
              </Button>
              <Button
                type="link"
                icon={<CloseCircleOutlined />}
                style={{ color: '#ff4d4f' }}
                onClick={() => onReview(record, 'rejected')}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectionChange,
        getCheckboxProps: (record) => ({
          disabled: record.status !== 'pending',
          name: record.teacherName,
        }),
      }}
      loading={loading}
      pagination={{
        pageSize: 10,
        showTotal: (total) => `共 ${total} 条申请`,
        showSizeChanger: true,
        showQuickJumper: true,
      }}
    />
  );
};

export default ApplicationTable;
