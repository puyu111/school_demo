import { Card, Space, Tag } from 'antd';
import React from 'react';
import { scheduleStyles } from '../styles/scheduleStyles';

const CourseCard = ({ course, isSelected, onClick, showDuration = true }) => {
  const priorityMap = {
    1: 'high',
    2: 'medium',
    3: 'low',
  };

  const priority = priorityMap[course.priority] || 'low';

  return (
    <Card
      size="small"
      style={{
        ...scheduleStyles.courseCard,
        borderLeftColor: course.color || '#1890ff',
        backgroundColor: isSelected ? 'rgba(24, 144, 255, 0.1)' : '#fff',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div>
        <div
          style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}
        >
          {course.name}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          {course.teacherName}
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          {course.className}
        </div>
        <Space size="small" wrap>
          <Tag
            color={scheduleStyles.courseTypeTag[course.courseType] || 'default'}
          >
            {course.courseType}
          </Tag>
          <Tag style={scheduleStyles.priorityTag[priority]}>
            {priority === 'high'
              ? '高优'
              : priority === 'medium'
                ? '中优'
                : '低优'}
          </Tag>
          {showDuration && (
            <Tag color="geekblue">时长: {course.duration}节</Tag>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default CourseCard;
