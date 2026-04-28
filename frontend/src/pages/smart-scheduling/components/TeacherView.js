import { Card, Table } from 'antd';
import { scheduleStyles } from '../styles/scheduleStyles';
import { mockData } from '../utils/mockData';

const TeacherView = ({ schedule }) => {
  // 生成教师视图数据
  const generateTeacherSchedule = () => {
    const result = [];

    mockData.teachers.forEach((teacher) => {
      const teacherSchedule = {
        key: teacher.id,
        teacher: teacher.name,
        dept: teacher.department,
      };

      mockData.weekDays.forEach((day) => {
        const dayKey = `day_${day.value}`;
        const daySchedule = [];

        mockData.timeSlots.forEach((slot) => {
          const courses =
            schedule[day.value]?.[slot.id]?.filter(
              (course) => course.teacherId === teacher.id,
            ) || [];

          courses.forEach((course) => {
            daySchedule.push({
              ...course,
              slot: slot.id,
              slotLabel: slot.label,
            });
          });
        });

        teacherSchedule[dayKey] = daySchedule;
      });

      result.push(teacherSchedule);
    });

    return result;
  };

  const teacherSchedules = generateTeacherSchedule();

  // 生成列定义
  const columns = [
    {
      title: '教师',
      dataIndex: 'teacher',
      key: 'teacher',
      fixed: 'left',
      width: 150,
      render: (text, record) => (
        <div>
          <div>
            <strong>{text}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.dept}</div>
        </div>
      ),
    },
    ...mockData.weekDays.map((day) => ({
      title: day.label,
      dataIndex: `day_${day.value}`,
      key: `day_${day.value}`,
      width: 200,
      render: (courses) => (
        <div>
          {(courses || []).map((course) => (
            <Card
              key={course.id}
              size="small"
              style={{
                marginBottom: '4px',
                borderLeft: `4px solid ${course.color}`,
                backgroundColor: '#f9f9f9',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  {course.name}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {course.className} | {course.slotLabel}
                </div>
              </div>
            </Card>
          ))}
          {(!courses || courses.length === 0) && (
            <div
              style={{ textAlign: 'center', color: '#ccc', fontSize: '12px' }}
            >
              无课
            </div>
          )}
        </div>
      ),
    })),
  ];

  return (
    <Card style={scheduleStyles.card}>
      <h3>教师排课视图</h3>
      <p style={{ color: '#999', fontSize: '14px', marginBottom: '16px' }}>
        按教师维度展示排课情况
      </p>

      <Table
        dataSource={teacherSchedules}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </Card>
  );
};

export default TeacherView;
