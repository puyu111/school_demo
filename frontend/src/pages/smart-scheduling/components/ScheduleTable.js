import { Card, Table } from 'antd';
import { scheduleStyles } from '../styles/scheduleStyles';
import CourseCard from './CourseCard';

const ScheduleTable = ({
  schedule,
  timeSlots,
  weekDays,
  selectedCourse,
  onDropCourse,
  onRemoveCourse,
}) => {
  // 创建表格数据
  const tableData = weekDays.map((day) => {
    const dayData = { key: day.id, day: day.label };

    timeSlots.forEach((slot) => {
      const slotKey = `slot_${slot.id}`;
      const courses = schedule[day.value]?.[slot.id] || [];

      dayData[slotKey] = (
        <div
          style={{
            ...scheduleStyles.courseCell,
            ...(selectedCourse && courses.length > 0
              ? { backgroundColor: '#e6f7ff' }
              : {}),
          }}
          onClick={() => {
            if (selectedCourse) {
              onDropCourse(selectedCourse, day.value, slot.id);
            }
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={(e) => {
                e.stopPropagation(); // 阻止冒泡到单元格
                if (selectedCourse) {
                  onRemoveCourse(course.id);
                }
              }}
            >
              <CourseCard course={course} showDuration={false} />
            </div>
          ))}
          {courses.length === 0 && selectedCourse && (
            <div
              style={{ textAlign: 'center', color: '#ccc', fontSize: '12px' }}
            >
              点击安排
            </div>
          )}
        </div>
      );
    });

    return dayData;
  });

  // 创建列定义
  const columns = [
    {
      title: '时间',
      dataIndex: 'day',
      key: 'day',
      fixed: 'left',
      width: 100,
      render: (text) => (
        <div style={scheduleStyles.timeSlotCell}>
          <strong>{text}</strong>
        </div>
      ),
    },
    ...timeSlots.map((slot) => ({
      title: (
        <div style={scheduleStyles.tableHeader}>
          <div>{slot.label}</div>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
            {slot.time}
          </div>
        </div>
      ),
      dataIndex: `slot_${slot.id}`,
      key: `slot_${slot.id}`,
      width: 180,
    })),
  ];

  return (
    <Card style={scheduleStyles.scheduleTable}>
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
        size="middle"
      />
    </Card>
  );
};

export default ScheduleTable;
