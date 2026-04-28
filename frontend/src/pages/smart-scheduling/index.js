import {
  CheckCircleOutlined,
  HistoryOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Card,
  Col,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import ConflictAlert from './components/ConflictAlert';
import CoursePool from './components/CoursePool';
import SchedulePanel from './components/SchedulePanel';
import ScheduleTable from './components/ScheduleTable';
import TeacherView from './components/TeacherView';
import { useScheduleData } from './hooks/useScheduleData';
import { scheduleStyles } from './styles/scheduleStyles';

const { Title, Text } = Typography;

const SmartSchedulingPage = () => {
  const {
    schedule,
    pendingCourses,
    teachers,
    classes,
    selectedCourse,
    conflicts,
    history,
    recommendations,
    mockData,
    setSelectedCourse,
    addCourseToSchedule,
    removeCourseFromSchedule,
    autoSchedule,
    clearAllSchedule,
    resetData,
    setConflicts,
    loading,
  } = useScheduleData();

  const [activeView, setActiveView] = useState('schedule');

  // 加载状态
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Spin size="large" tip="加载排课数据中..." />
      </div>
    );
  }

  const handleAutoSchedule = () => {
    const result = autoSchedule();
    message.success(
      `自动排课完成：成功 ${result.scheduled} 门，失败 ${result.failed} 门`,
    );
  };

  const handleClearAll = () => {
    clearAllSchedule();
    message.success('已清空所有排课');
  };

  const handleReset = () => {
    resetData();
    message.success('已重置数据');
  };

  // 统计已排课程数
  const scheduledCount = Object.values(schedule).reduce((total, day) => {
    return (
      total +
      Object.values(day).reduce((dayTotal, slot) => dayTotal + slot.length, 0)
    );
  }, 0);

  return (
    <div style={scheduleStyles.container}>
      {/* 标题区域 */}
      <Card style={scheduleStyles.card}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="center">
              <ScheduleOutlined
                style={{ fontSize: '24px', color: '#1890ff' }}
              />
              <Title level={3} style={{ margin: 0 }}>
                智能排课系统
              </Title>
            </Space>
            <Text type="secondary" style={{ marginLeft: '32px' }}>
              基于约束的智能课程安排系统（无教室因素）
            </Text>
          </Col>
          <Col>
            <Space>
              <Statistic
                title="待排课程"
                value={pendingCourses.length}
                valueStyle={{
                  color: pendingCourses.length > 5 ? '#fa8c16' : '#52c41a',
                }}
              />
              <Statistic
                title="已排课程"
                value={scheduledCount}
                valueStyle={{ color: '#1890ff' }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* 左侧：控制面板和课程池 */}
        <Col span={6}>
          <Card title="排课控制面板" style={scheduleStyles.card}>
            <SchedulePanel
              onAutoSchedule={handleAutoSchedule}
              onClearAll={handleClearAll}
              onReset={handleReset}
              selectedCourse={selectedCourse}
              pendingCount={pendingCourses.length}
              recommendations={recommendations}
            />
          </Card>

          <Card
            title="待排课程池"
            style={{ ...scheduleStyles.card, marginTop: '16px' }}
            extra={
              <Space>
                <Text type="secondary">{pendingCourses.length}门</Text>
                <CheckCircleOutlined
                  style={{
                    color: pendingCourses.length === 0 ? '#52c41a' : '#d9d9d9',
                    fontSize: '16px',
                  }}
                />
              </Space>
            }
          >
            <CoursePool
              courses={pendingCourses}
              selectedCourse={selectedCourse}
              onSelectCourse={setSelectedCourse}
            />
          </Card>

          {/* 冲突提示 */}
          {conflicts.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <ConflictAlert
                conflicts={conflicts}
                onClose={() => setConflicts([])}
              />
            </div>
          )}
        </Col>

        {/* 右侧：主内容区 */}
        <Col span={18}>
          <Card style={scheduleStyles.card}>
            <Tabs
              activeKey={activeView}
              onChange={setActiveView}
              items={[
                {
                  key: 'schedule',
                  label: (
                    <span>
                      <ScheduleOutlined />
                      课表视图
                    </span>
                  ),
                  children: (
                    <div>
                      <Alert
                        message="操作提示"
                        description={
                          <div>
                            <div>
                              1. 从左侧选择课程后，点击课表单元格进行安排
                            </div>
                            <div>2. 点击已排课程可以移除</div>
                            <div>3. 使用一键智能排课快速安排所有课程</div>
                          </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: '16px' }}
                      />

                      {/* 推荐时间提示 */}
                      {selectedCourse && recommendations.length > 0 && (
                        <Alert
                          message={
                            <Space>
                              <ScheduleOutlined />
                              <span>推荐排课时间：</span>
                            </Space>
                          }
                          description={
                            <Space wrap>
                              {recommendations.slice(0, 3).map((rec) => {
                                const dayLabel = mockData.weekDays.find(
                                  (d) => d.value === rec.day,
                                )?.label;
                                return (
                                  <Tag
                                    key={`${rec.day}-${rec.slot}`}
                                    color="blue"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      message.info(
                                        `建议安排到：${dayLabel} 第${rec.slot}节`,
                                      );
                                    }}
                                  >
                                    {dayLabel} 第{rec.slot}节
                                  </Tag>
                                );
                              })}
                              {recommendations.length > 3 && (
                                <Text type="secondary">
                                  等{recommendations.length}个推荐
                                </Text>
                              )}
                            </Space>
                          }
                          type="success"
                          style={{ marginBottom: '16px' }}
                        />
                      )}

                      <ScheduleTable
                        schedule={schedule}
                        timeSlots={mockData.timeSlots}
                        weekDays={mockData.weekDays}
                        selectedCourse={selectedCourse}
                        onDropCourse={addCourseToSchedule}
                        onRemoveCourse={removeCourseFromSchedule}
                      />
                    </div>
                  ),
                },
                {
                  key: 'teacher',
                  label: (
                    <span>
                      <TeamOutlined />
                      教师视图
                    </span>
                  ),
                  children: <TeacherView schedule={schedule} />,
                },
                {
                  key: 'history',
                  label: (
                    <span>
                      <HistoryOutlined />
                      操作历史
                    </span>
                  ),
                  children: (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {history.length === 0 ? (
                        <EmptyHistory />
                      ) : (
                        <HistoryList
                          history={history}
                          weekDays={mockData.weekDays}
                        />
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>

          {/* 快速统计数据 */}
          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={6}>
              <StatCard
                title="排课完成度"
                value={`${Math.round((scheduledCount / (scheduledCount + pendingCourses.length)) * 100)}%`}
                color="#1890ff"
                icon={<ScheduleOutlined />}
              />
            </Col>
            <Col span={6}>
              <StatCard
                title="教师使用率"
                value={`${Math.round(
                  (teachers?.filter((t) => {
                    // 检查教师是否有排课
                    return Object.values(schedule).some((day) =>
                      Object.values(day).some((slot) =>
                        slot.some((course) => course.teacherId === t.id),
                      ),
                    );
                  }).length /
                    (teachers?.length || 1)) *
                    100,
                )}%`}
                color="#52c41a"
                icon={<TeamOutlined />}
              />
            </Col>
            <Col span={6}>
              <StatCard
                title="班级覆盖率"
                value={`${Math.round(
                  (classes?.filter((c) => {
                    // 检查班级是否有排课
                    return Object.values(schedule).some((day) =>
                      Object.values(day).some((slot) =>
                        slot.some((course) => course.classId === c.id),
                      ),
                    );
                  }).length /
                    (classes?.length || 1)) *
                    100,
                )}%`}
                color="#fa8c16"
                icon={<UnorderedListOutlined />}
              />
            </Col>
            <Col span={6}>
              <StatCard
                title="时间利用率"
                value={`${Math.round(
                  (Object.values(schedule).reduce(
                    (total, day) =>
                      total +
                      Object.values(day).reduce(
                        (dayTotal, slot) =>
                          dayTotal + (slot.length > 0 ? 1 : 0),
                        0,
                      ),
                    0,
                  ) /
                    (mockData.weekDays.length * mockData.timeSlots.length)) *
                    100,
                )}%`}
                color="#722ed1"
                icon={<HistoryOutlined />}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({ title, value, color, icon }) => (
  <Card size="small" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '24px', color, marginBottom: '8px' }}>
      {React.cloneElement(icon, { style: { fontSize: '24px' } })}
    </div>
    <Title level={3} style={{ margin: '0 0 4px 0', color }}>
      {value}
    </Title>
    <Text type="secondary" style={{ fontSize: '12px' }}>
      {title}
    </Text>
  </Card>
);

// 空历史组件
const EmptyHistory = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      color: '#999',
    }}
  >
    <HistoryOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
    <Text type="secondary">暂无操作记录</Text>
    <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px' }}>
      开始排课操作后，这里会显示历史记录
    </Text>
  </div>
);

// 历史列表组件
const HistoryList = ({ history, weekDays }) => (
  <div>
    {history.map((item, _index) => (
      <Card
        key={item.id}
        size="small"
        style={{
          marginBottom: '8px',
          borderLeft: `4px solid ${item.action === 'removed' ? '#ff4d4f' : '#52c41a'}`,
        }}
      >
        <Row align="middle">
          <Col span={2}>
            <div
              style={{
                background: item.action === 'removed' ? '#fff1f0' : '#f6ffed',
                color: item.action === 'removed' ? '#ff4d4f' : '#52c41a',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {item.action === 'removed' ? '移除' : '安排'}
            </div>
          </Col>
          <Col span={16}>
            <div>
              <Text strong>{item.courseName}</Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>
                {item.teacher} | {item.className}
              </Text>
            </div>
            {item.day && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {weekDays.find((d) => d.value === item.day)?.label} 第
                {item.slot}节
              </Text>
            )}
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {item.timestamp}
            </Text>
          </Col>
        </Row>
      </Card>
    ))}
  </div>
);

export default SmartSchedulingPage;
