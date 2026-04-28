import {
  Button,
  Col,
  InputNumber,
  Row,
  Slider,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd';
import React from 'react';
import type { RuleWeight } from '../types';

interface RuleWeightTableProps {
  data: RuleWeight[];
  isEditing: boolean;
  onWeightChange: (id: string, value: number) => void;
  onToggleRule: (id: string, enabled: boolean) => void;
  onResetRule: (id: string, defaultWeight: number) => void;
}

const RuleWeightTable: React.FC<RuleWeightTableProps> = ({
  data,
  isEditing,
  onWeightChange,
  onToggleRule,
  onResetRule,
}) => {
  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: RuleWeight) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: RuleWeight) => (
        <Switch
          size="small"
          checked={enabled}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => onToggleRule(record.id, checked)}
        />
      ),
    },
    {
      title: '权重范围',
      key: 'range',
      width: 120,
      render: (_: any, record: RuleWeight) => (
        <div>
          {record.minWeight} - {record.maxWeight}
        </div>
      ),
    },
    {
      title: '默认权重',
      dataIndex: 'defaultWeight',
      key: 'defaultWeight',
      width: 100,
      render: (value: number) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: '当前权重',
      dataIndex: 'currentWeight',
      key: 'currentWeight',
      width: 180,
      render: (value: number, record: RuleWeight) => (
        <div>
          <Row gutter={8}>
            <Col flex="auto">
              <Slider
                min={record.minWeight}
                max={record.maxWeight}
                value={value}
                onChange={(val) => onWeightChange(record.id, val)}
                disabled={!isEditing || !record.enabled}
              />
            </Col>
            <Col span={6}>
              <InputNumber
                min={record.minWeight}
                max={record.maxWeight}
                value={value}
                onChange={(val) =>
                  val !== null && onWeightChange(record.id, val)
                }
                disabled={!isEditing || !record.enabled}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: RuleWeight) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => onResetRule(record.id, record.defaultWeight)}
            disabled={!isEditing}
          >
            重置
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      size="middle"
      scroll={{ y: 400 }}
      rowClassName={(record) => (!record.enabled ? 'disabled-row' : '')}
    />
  );
};

export default RuleWeightTable;
