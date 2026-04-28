import { Card, Table } from 'antd';
import React from 'react';
import type { WeightChangeRecord } from '../types';

interface WeightHistoryTableProps {
  data: WeightChangeRecord[];
}

const WeightHistoryTable: React.FC<WeightHistoryTableProps> = ({ data }) => {
  const columns = [
    { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName' },
    {
      title: '原权重',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (val: number) => `${val}%`,
    },
    {
      title: '新权重',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (val: number) => `${val}%`,
    },
    { title: '变更时间', dataIndex: 'time', key: 'time' },
  ];

  return (
    <Card size="small">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default WeightHistoryTable;
