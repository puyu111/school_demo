import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Space, Table, Tag } from "antd";
import React from "react";
import { DATE_TYPE_MAP, REASON_TYPE_MAP } from "../constants";
import type { Teacher, UnavailableDate } from "../types";

interface UnavailableDateTableProps {
  data: UnavailableDate[];
  teachers: Teacher[];
  onDelete: (key: string) => void;
  pageSize?: number;
}

/**
 * 不可排日期表格组件
 */
const UnavailableDateTable: React.FC<UnavailableDateTableProps> = ({
  data,
  teachers,
  onDelete,
  pageSize = 8,
}) => {
  const columns: any = [
    {
      title: "教师",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 120,
      render: (name: string, record: UnavailableDate) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{name}</span>
          <Tag color="blue">
            {teachers.find((t) => t.id === record.teacherId)?.id}
          </Tag>
        </Space>
      ),
    },
    {
      title: "日期/范围",
      dataIndex: "validDate",
      key: "validDate",
      width: 200,
      render: (validDate?: [number, number]) => {
        if (!validDate || validDate.length !== 2) return "-";
        const start = new Date(validDate[0]).toLocaleDateString();
        const end = new Date(validDate[1]).toLocaleDateString();
        return start === end ? start : `${start} ~ ${end}`;
      },
    },
    {
      title: "类型",
      dataIndex: "rangeType",
      key: "rangeType",
      width: 100,
      render: (type: string) => {
        const config = DATE_TYPE_MAP[type] || { color: "default", text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "原因",
      dataIndex: "reason",
      key: "reason",
      width: 150,
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => {
        const config = REASON_TYPE_MAP[type] || {
          color: "default",
          text: type,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 80,
      render: (_: any, record: UnavailableDate) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(record.key)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{
        pageSize,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      rowKey="key"
      size="middle"
      bordered
      locale={{
        emptyText: "暂无不可排日期，请添加",
      }}
    />
  );
};

export default UnavailableDateTable;
