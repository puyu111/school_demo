import { UserOutlined } from '@ant-design/icons';
import { Avatar, Space, Tag } from 'antd';
import React from 'react';
import type { Teacher } from '../types';

interface TeacherCardProps {
  teacher: Teacher;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * 教师选择卡片组件
 */
const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: 200,
        margin: 8,
        padding: '12px',
        border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0',
        borderRadius: '8px',
        background: isSelected ? '#e6f7ff' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span style={{ fontWeight: 500 }}>{teacher.name}</span>
          {isSelected && <Tag color="blue">已选</Tag>}
        </Space>
        <div style={{ fontSize: 12, color: '#666' }}>
          <div>{teacher.id}</div>
          <div style={{ fontSize: 11, color: '#999' }}>
            {teacher.employeeId}
          </div>
        </div>
      </Space>
    </div>
  );
};

export default TeacherCard;
