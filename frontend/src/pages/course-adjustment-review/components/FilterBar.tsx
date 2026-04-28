import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button, Select, Space } from 'antd';
import React from 'react';
import type { FilterBarProps } from '../types';

const { Option } = Select;

/**
 * 筛选区域组件
 * 用于筛选申请状态、紧急程度，并提供批量操作按钮
 */
const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onBatchAction,
  selectedCount,
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Space size="middle" wrap>
        {/* 状态筛选 */}
        <div>
          <span style={{ marginRight: 8 }}>状态筛选：</span>
          <Select
            style={{ width: 120 }}
            value={filters.status}
            onChange={(value) => onFilterChange({ ...filters, status: value })}
          >
            <Option value="all">全部</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已驳回</Option>
          </Select>
        </div>

        {/* 紧急程度筛选 */}
        <div>
          <span style={{ marginRight: 8 }}>紧急程度：</span>
          <Select
            style={{ width: 120 }}
            value={filters.urgency}
            onChange={(value) => onFilterChange({ ...filters, urgency: value })}
          >
            <Option value="all">全部</Option>
            <Option value="high">紧急</Option>
            <Option value="normal">一般</Option>
          </Select>
        </div>

        {/* 院系筛选（可选） */}
        {filters.department !== undefined && (
          <div>
            <span style={{ marginRight: 8 }}>院系：</span>
            <Select
              style={{ width: 150 }}
              value={filters.department || 'all'}
              onChange={(value) =>
                onFilterChange({ ...filters, department: value })
              }
              allowClear
              placeholder="选择院系"
            >
              <Option value="math">数学系</Option>
              <Option value="physics">物理系</Option>
              <Option value="computer">计算机系</Option>
              <Option value="chemistry">化学系</Option>
              <Option value="english">英语系</Option>
            </Select>
          </div>
        )}

        {/* 批量操作按钮 */}
        <Space style={{ marginLeft: 16 }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => onBatchAction('approve')}
            disabled={selectedCount === 0}
          >
            批量通过
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => onBatchAction('reject')}
            disabled={selectedCount === 0}
          >
            批量驳回
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default FilterBar;
