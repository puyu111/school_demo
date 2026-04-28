import { Empty, List } from 'antd';
import React from 'react';
import { scheduleStyles } from '../styles/scheduleStyles';
import CourseCard from './CourseCard';

const CoursePool = ({ courses, selectedCourse, onSelectCourse }) => {
  if (!courses || courses.length === 0) {
    return (
      <Empty
        description="暂无待排课程"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={scheduleStyles.coursePool}
      />
    );
  }

  return (
    <List
      size="small"
      dataSource={courses}
      style={scheduleStyles.coursePool}
      renderItem={(course) => (
        <List.Item
          style={{
            padding: '4px',
            cursor: 'pointer',
            backgroundColor:
              selectedCourse && selectedCourse.id === course.id
                ? '#e6f7ff'
                : 'transparent',
            borderRadius: '4px',
          }}
          onClick={() => onSelectCourse(course)}
        >
          <CourseCard
            course={course}
            isSelected={selectedCourse && selectedCourse.id === course.id}
          />
        </List.Item>
      )}
    />
  );
};

export default CoursePool;
