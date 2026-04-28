import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  SyncOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  message,
  Progress,
  Row,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { useScheduleData } from '../hooks/useScheduleData';
import {
  overviewCardsStyles,
  statCardStyles,
  statisticsHeaderStyles,
} from '../styles';
import type { Course, CourseSchedulingStatisticsProps } from '../types';

/**
 * 获取时间段类型
 */
const getTimeSlotType = (
  startTime: string,
): 'morning' | 'afternoon' | 'evening' => {
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

/**
 * 检测课程冲突
 */
const detectConflicts = (courses: Course[]) => {
  const conflicts = {
    teacherConflict: 0,
    roomConflict: 0,
    classConflict: 0,
    total: 0,
    details: [] as string[],
  };

  // 按周次、星期、时间段分组
  const scheduleMap = new Map<string, Course[]>();

  courses.forEach((course) => {
    course.weeks.forEach((week) => {
      const key = `${week}-${course.weekDay}-${course.startTime}`;
      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, []);
      }
      scheduleMap.get(key)?.push(course);
    });
  });

  // 检测冲突
  scheduleMap.forEach((courseList, _key) => {
    if (courseList.length > 1) {
      // 教师冲突
      const teacherGroups = new Map<string, Course[]>();
      courseList.forEach((course) => {
        if (!teacherGroups.has(course.teacherName)) {
          teacherGroups.set(course.teacherName, []);
        }
        teacherGroups.get(course.teacherName)?.push(course);
      });
      teacherGroups.forEach((group) => {
        if (group.length > 1) {
          conflicts.teacherConflict++;
          conflicts.details.push(
            `教师${group[0].teacherName}在同一时间有${group.length}个课程`,
          );
        }
      });

      // 教室冲突
      const roomGroups = new Map<string, Course[]>();
      courseList.forEach((course) => {
        if (!roomGroups.has(course.roomName)) {
          roomGroups.set(course.roomName, []);
        }
        roomGroups.get(course.roomName)?.push(course);
      });
      roomGroups.forEach((group) => {
        if (group.length > 1) {
          conflicts.roomConflict++;
          conflicts.details.push(
            `教室${group[0].roomName}在同一时间被分配给${group.length}个课程`,
          );
        }
      });

      // 班级冲突
      const classGroups = new Map<string, Course[]>();
      courseList.forEach((course) => {
        if (!classGroups.has(course.className)) {
          classGroups.set(course.className, []);
        }
        classGroups.get(course.className)?.push(course);
      });
      classGroups.forEach((group) => {
        if (group.length > 1) {
          conflicts.classConflict++;
          conflicts.details.push(
            `班级${group[0].className}在同一时间有${group.length}个课程`,
          );
        }
      });

      conflicts.total +=
        conflicts.teacherConflict +
        conflicts.roomConflict +
        conflicts.classConflict;
    }
  });

  return conflicts;
};

/**
 * 排课统计组件
 * 显示和分析排课系统的各项统计数据
 */
const CourseSchedulingStatistics: React.FC<
  CourseSchedulingStatisticsProps
> = () => {
  const [showCharts, setShowCharts] = useState(true);

  // 使用 hook 获取课表数据
  const { courses, loading, refreshSchedule } = useScheduleData(1);

  // 统计数据
  const statistics = useMemo(() => {
    // 使用 hook 提供的课程数据

    // 基础统计
    const uniqueTeachers = new Set(courses.map((c) => c.teacherName));
    const uniqueClasses = new Set(courses.map((c) => c.className));
    const uniqueRooms = new Set(courses.map((c) => c.roomName));
    const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);

    // 时间段分布
    const timeDistribution = {
      morning: courses.filter((c) => getTimeSlotType(c.startTime) === 'morning')
        .length,
      afternoon: courses.filter(
        (c) => getTimeSlotType(c.startTime) === 'afternoon',
      ).length,
      evening: courses.filter((c) => getTimeSlotType(c.startTime) === 'evening')
        .length,
    };

    // 冲突检测
    const conflicts = detectConflicts(courses);

    // 教师工作量
    const teacherWorkload = courses.reduce(
      (acc, course) => {
        if (!acc[course.teacherName]) {
          acc[course.teacherName] = 0;
        }
        acc[course.teacherName] += course.weeks.length;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 教室使用率
    const roomUsage = courses.reduce(
      (acc, course) => {
        if (!acc[course.roomName]) {
          acc[course.roomName] = 0;
        }
        acc[course.roomName] += course.weeks.length;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 周次分布
    const weekDistribution = courses.reduce(
      (acc, course) => {
        course.weeks.forEach((week) => {
          if (!acc[week]) acc[week] = 0;
          acc[week]++;
        });
        return acc;
      },
      {} as Record<number, number>,
    );

    return {
      total: {
        courses: courses.length,
        teachers: uniqueTeachers.size,
        classes: uniqueClasses.size,
        rooms: uniqueRooms.size,
        students: totalStudents,
      },
      timeDistribution,
      conflicts,
      teacherWorkload,
      roomUsage,
      weekDistribution,
    };
  }, [courses]);

  // 处理刷新
  const handleRefresh = useCallback(async () => {
    await refreshSchedule();
  }, [refreshSchedule]);

  // 处理导出
  const handleExport = useCallback(() => {
    message.success('数据导出功能开发中...');
  }, []);

  // 加载状态
  if (loading) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#f7f9fc',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" tip="加载统计数据中..." />
      </div>
    );
  }

  // 教师工作量表格列
  const teacherColumns = [
    {
      title: '教师姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '课程数量',
      dataIndex: 'courseCount',
      key: 'courseCount',
      sorter: (a: { courseCount: number }, b: { courseCount: number }) =>
        a.courseCount - b.courseCount,
    },
    {
      title: '周课时',
      dataIndex: 'weeklyHours',
      key: 'weeklyHours',
      render: (hours: number) => `${hours} 学时`,
    },
    {
      title: '负载状态',
      dataIndex: 'loadStatus',
      key: 'loadStatus',
      render: (status: 'low' | 'normal' | 'high') => {
        const config = {
          low: { color: 'green', text: '轻松', icon: <CheckCircleOutlined /> },
          normal: {
            color: 'blue',
            text: '正常',
            icon: <ClockCircleOutlined />,
          },
          high: {
            color: 'red',
            text: '繁忙',
            icon: <ExclamationCircleOutlined />,
          },
        };
        const { color, text, icon } = config[status];
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
  ];

  const teacherData = Object.entries(statistics.teacherWorkload).map(
    ([name, hours]) => ({
      key: name,
      name,
      courseCount: courses.filter((c: Course) => c.teacherName === name).length,
      weeklyHours: hours,
      loadStatus:
        hours < 10
          ? 'low'
          : hours > 20
            ? 'high'
            : ('normal' as 'low' | 'normal' | 'high'),
    }),
  );

  // 教室使用率表格列
  const roomColumns = [
    {
      title: '教室名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      sorter: (a: { usageCount: number }, b: { usageCount: number }) =>
        a.usageCount - b.usageCount,
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (cap: number) => `${cap}人`,
    },
    {
      title: '使用率',
      dataIndex: 'usageRate',
      key: 'usageRate',
      render: (rate: number) => (
        <Progress
          percent={Math.round(rate)}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          status="active"
          format={(percent?: number) => `${percent}%`}
        />
      ),
    },
  ];

  const roomData = Object.entries(statistics.roomUsage).map(
    ([name, count]) => ({
      key: name,
      name,
      usageCount: count,
      capacity: 50,
      usageRate: (count / (20 * 10)) * 100, // 20 周 x 10 节课
    }),
  );

  // 冲突表格列
  const conflictColumns = [
    {
      title: '冲突类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const config: Record<string, { color: string; text: string }> = {
          teacher: { color: 'red', text: '教师冲突' },
          room: { color: 'orange', text: '教室冲突' },
          class: { color: 'yellow', text: '班级冲突' },
        };
        const { color, text } = config[type] || { color: 'gray', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
    },
  ];

  const conflictData = [
    { key: '1', type: 'teacher', detail: '教师张三在同一时间有 2 个课程' },
    { key: '2', type: 'room', detail: '教室 A101 在同一时间被分配给 2 个课程' },
  ];

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f7f9fc',
        minHeight: '100vh',
      }}
    >
      {/* 头部 */}
      <Card style={statisticsHeaderStyles.card}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <BarChartOutlined style={{ fontSize: '24px' }} />
              </div>
              <div>
                <Typography.Title
                  level={4}
                  style={{ margin: 0, color: '#ffffff', fontWeight: 700 }}
                >
                  排课系统统计
                </Typography.Title>
                <Typography.Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '13px',
                  }}
                >
                  查看和分析排课系统的各项统计数据
                </Typography.Text>
              </div>
            </div>
          </Col>
          <Col>
            <Space>
              <Switch
                checked={showCharts}
                onChange={setShowCharts}
                checkedChildren="图表"
                unCheckedChildren="列表"
                size="small"
              />
              <Button
                icon={<SyncOutlined />}
                loading={loading}
                onClick={handleRefresh}
                style={{ borderRadius: '8px' }}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                style={{
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                导出数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 概览卡片 - 使用渐变色卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        {[
          {
            title: '总课程数',
            value: statistics.total.courses,
            icon: <TeamOutlined />,
            gradient: overviewCardsStyles.gradientCards[0],
          },
          {
            title: '教师数量',
            value: statistics.total.teachers,
            icon: <UserOutlined />,
            gradient: overviewCardsStyles.gradientCards[1],
          },
          {
            title: '班级数量',
            value: statistics.total.classes,
            icon: <TeamOutlined />,
            gradient: overviewCardsStyles.gradientCards[2],
          },
          {
            title: '教室数量',
            value: statistics.total.rooms,
            icon: <HomeOutlined />,
            gradient: overviewCardsStyles.gradientCards[3],
          },
          {
            title: '学生总数',
            value: statistics.total.students,
            icon: <UserOutlined />,
            gradient: overviewCardsStyles.gradientCards[4],
          },
          {
            title: '冲突数量',
            value: statistics.conflicts.total,
            icon: <ExclamationCircleOutlined />,
            gradient: overviewCardsStyles.gradientCards[5],
          },
        ].map((stat) => (
          <Col xs={12} sm={8} md={4} key={stat.title}>
            <Card
              hoverable
              style={{
                ...overviewCardsStyles.card,
                background: stat.gradient.background,
                color: stat.gradient.color,
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 28px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{stat.icon}</div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      opacity: 0.9,
                      marginBottom: '4px',
                    }}
                  >
                    {stat.title}
                  </div>
                  <div
                    style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1 }}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 时间段分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} md={8}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                <ClockCircleOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                时间段分布
              </span>
            }
            style={{
              ...statCardStyles.card,
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <div style={statCardStyles.statItem}>
              <span style={statCardStyles.statLabel}>上午课程</span>
              <span style={{ ...statCardStyles.statValue, color: '#1890ff' }}>
                {statistics.timeDistribution.morning} 节
              </span>
            </div>
            <Progress
              percent={
                (statistics.timeDistribution.morning / (courses.length || 1)) *
                100
              }
              strokeColor="#1890ff"
              format={() => `${statistics.timeDistribution.morning} 节`}
              size="small"
            />
            <div style={{ ...statCardStyles.statItem, marginTop: '16px' }}>
              <span style={statCardStyles.statLabel}>下午课程</span>
              <span style={{ ...statCardStyles.statValue, color: '#52c41a' }}>
                {statistics.timeDistribution.afternoon} 节
              </span>
            </div>
            <Progress
              percent={
                (statistics.timeDistribution.afternoon /
                  (courses.length || 1)) *
                100
              }
              strokeColor="#52c41a"
              format={() => `${statistics.timeDistribution.afternoon} 节`}
              size="small"
            />
            <div style={{ ...statCardStyles.statItem, marginTop: '16px' }}>
              <span style={statCardStyles.statLabel}>晚上课程</span>
              <span style={{ ...statCardStyles.statValue, color: '#faad14' }}>
                {statistics.timeDistribution.evening} 节
              </span>
            </div>
            <Progress
              percent={
                (statistics.timeDistribution.evening / (courses.length || 1)) *
                100
              }
              strokeColor="#faad14"
              format={() => `${statistics.timeDistribution.evening} 节`}
              size="small"
            />
          </Card>
        </Col>

        {/* 教师工作量 Top 5 */}
        <Col xs={24} md={8}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                <TrophyOutlined
                  style={{ marginRight: '8px', color: '#faad14' }}
                />
                教师工作量排行
              </span>
            }
            style={{
              ...statCardStyles.card,
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            {Object.entries(statistics.teacherWorkload)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([teacher, hours], index) => (
                <div
                  key={teacher}
                  style={{
                    ...statCardStyles.statItem,
                    padding: '12px 0',
                    transition: 'background-color 0.2s',
                    borderRadius: '8px',
                    margin: '4px 0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background:
                          index === 0
                            ? '#FFF7E6'
                            : index === 1
                              ? '#F3F4F5'
                              : index === 2
                                ? '#FFF0F6'
                                : '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      {index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `#${index + 1}`}
                    </div>
                    <span
                      style={{ ...statCardStyles.statLabel, fontWeight: 500 }}
                    >
                      {teacher}
                    </span>
                  </div>
                  <Tag
                    color={index < 3 ? 'gold' : 'default'}
                    style={{ fontWeight: 600 }}
                  >
                    {hours} 学时
                  </Tag>
                </div>
              ))}
          </Card>
        </Col>

        {/* 教室使用率 Top 5 */}
        <Col xs={24} md={8}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                <HomeOutlined
                  style={{ marginRight: '8px', color: '#722ed1' }}
                />
                教室使用率排行
              </span>
            }
            style={{
              ...statCardStyles.card,
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            {Object.entries(statistics.roomUsage)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([room, count], index) => (
                <div
                  key={room}
                  style={{
                    ...statCardStyles.statItem,
                    padding: '12px 0',
                    transition: 'background-color 0.2s',
                    borderRadius: '8px',
                    margin: '4px 0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background:
                          index === 0
                            ? '#FFF7E6'
                            : index === 1
                              ? '#F3F4F5'
                              : index === 2
                                ? '#FFF0F6'
                                : '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      {index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `#${index + 1}`}
                    </div>
                    <span
                      style={{ ...statCardStyles.statLabel, fontWeight: 500 }}
                    >
                      {room}
                    </span>
                  </div>
                  <Tag
                    color={index < 3 ? 'purple' : 'default'}
                    style={{ fontWeight: 600 }}
                  >
                    {count} 次
                  </Tag>
                </div>
              ))}
          </Card>
        </Col>
      </Row>

      {/* 详细数据表格 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                <UserOutlined
                  style={{ marginRight: '8px', color: '#1890ff' }}
                />
                教师工作量统计
              </span>
            }
            style={{
              ...statCardStyles.card,
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <Table
              columns={teacherColumns}
              dataSource={teacherData}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
              onRow={(_record) => ({
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(24, 144, 255, 0.05)';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                },
              })}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: '15px' }}>
                <HomeOutlined
                  style={{ marginRight: '8px', color: '#722ed1' }}
                />
                教室使用率统计
              </span>
            }
            style={{
              ...statCardStyles.card,
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <Table
              columns={roomColumns}
              dataSource={roomData}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
              onRow={(_record) => ({
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(114, 46, 209, 0.05)';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                },
              })}
            />
          </Card>
        </Col>
      </Row>

      {/* 冲突分析 */}
      {statistics.conflicts.total > 0 && (
        <Card
          title={
            <span style={{ fontWeight: 600, fontSize: '15px' }}>
              <ExclamationCircleOutlined
                style={{ marginRight: '8px', color: '#f5222d' }}
              />
              冲突分析
            </span>
          }
          style={{
            ...statCardStyles.card,
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            marginTop: '16px',
            background: 'linear-gradient(180deg, #fff1f0 0%, #ffffff 100%)',
          }}
        >
          <Alert
            message={`发现 ${statistics.conflicts.total} 处冲突`}
            description="请检查以下冲突详情并及时调整"
            type="warning"
            showIcon
            style={{ marginBottom: '16px', borderRadius: '8px' }}
          />
          <Table
            columns={conflictColumns}
            dataSource={conflictData}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default CourseSchedulingStatistics;
