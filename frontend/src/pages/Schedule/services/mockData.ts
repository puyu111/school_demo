import type { Course, StatisticsData } from '../types';

/**
 * 模拟课程数据 - 用于开发和测试
 */
export const mockCourses: Course[] = [
  {
    id: '1',
    courseName: '高等数学',
    teacherName: '张三',
    teacherId: 'T001',
    className: '计算机 1 班',
    classId: 'C001',
    roomName: 'A-101',
    roomId: 'R001',
    weekDay: 1,
    startTime: '08:00',
    endTime: '09:40',
    duration: 100,
    color: '#1890ff',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 45,
  },
  {
    id: '2',
    courseName: '数据结构',
    teacherName: '李四',
    teacherId: 'T002',
    className: '计算机 1 班',
    classId: 'C001',
    roomName: 'B-201',
    roomId: 'R002',
    weekDay: 2,
    startTime: '10:10',
    endTime: '11:50',
    duration: 100,
    color: '#52c41a',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 45,
  },
  {
    id: '3',
    courseName: '大学英语',
    teacherName: '王五',
    teacherId: 'T003',
    className: '计算机 1 班',
    classId: 'C001',
    roomName: 'C-301',
    roomId: 'R003',
    weekDay: 3,
    startTime: '14:00',
    endTime: '15:40',
    duration: 100,
    color: '#fa8c16',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 50,
  },
  {
    id: '4',
    courseName: '计算机网络',
    teacherName: '赵六',
    teacherId: 'T004',
    className: '计算机 2 班',
    classId: 'C002',
    roomName: 'A-102',
    roomId: 'R004',
    weekDay: 4,
    startTime: '08:00',
    endTime: '09:40',
    duration: 100,
    color: '#722ed1',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 42,
  },
  {
    id: '5',
    courseName: '操作系统',
    teacherName: '钱七',
    teacherId: 'T005',
    className: '计算机 2 班',
    classId: 'C002',
    roomName: 'B-202',
    roomId: 'R005',
    weekDay: 5,
    startTime: '14:00',
    endTime: '15:40',
    duration: 100,
    color: '#13c2c2',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 42,
  },
  {
    id: '6',
    courseName: '数据库原理',
    teacherName: '孙八',
    teacherId: 'T006',
    className: '软件工程 1 班',
    classId: 'C003',
    roomName: 'C-302',
    roomId: 'R006',
    weekDay: 1,
    startTime: '10:10',
    endTime: '11:50',
    duration: 100,
    color: '#eb2f96',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 48,
  },
  {
    id: '7',
    courseName: '软件工程',
    teacherName: '周九',
    teacherId: 'T007',
    className: '软件工程 1 班',
    classId: 'C003',
    roomName: 'A-103',
    roomId: 'R007',
    weekDay: 3,
    startTime: '16:10',
    endTime: '17:50',
    duration: 100,
    color: '#fadb14',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 48,
  },
  {
    id: '8',
    courseName: '体育',
    teacherName: '刘十',
    teacherId: 'T008',
    className: '计算机 1 班',
    classId: 'C001',
    roomName: '操场',
    roomId: 'R008',
    weekDay: 5,
    startTime: '08:00',
    endTime: '09:40',
    duration: 100,
    color: '#52c41a',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 45,
  },
  {
    id: '9',
    courseName: '编译原理',
    teacherName: '吴十一',
    teacherId: 'T009',
    className: '软件工程 2 班',
    classId: 'C004',
    roomName: 'B-203',
    roomId: 'R009',
    weekDay: 2,
    startTime: '14:00',
    endTime: '15:40',
    duration: 100,
    color: '#2fc25d',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 40,
  },
  {
    id: '10',
    courseName: '人工智能导论',
    teacherName: '郑十二',
    teacherId: 'T010',
    className: '智能科学 1 班',
    classId: 'C005',
    roomName: 'A-104',
    roomId: 'R010',
    weekDay: 4,
    startTime: '19:00',
    endTime: '20:40',
    duration: 100,
    color: '#8c52ff',
    weeks: Array.from({ length: 20 }, (_, i) => i + 1),
    studentCount: 38,
  },
];

/**
 * 模拟统计数据
 */
export const mockStatistics: StatisticsData = {
  total: {
    courses: mockCourses.length,
    teachers: new Set(mockCourses.map((c) => c.teacherName)).size,
    classes: new Set(mockCourses.map((c) => c.className)).size,
    rooms: new Set(mockCourses.map((c) => c.roomName)).size,
    students: mockCourses.reduce((sum, c) => sum + c.studentCount, 0),
  },
  timeDistribution: {
    morning: mockCourses.filter((c) => parseInt(c.startTime, 10) < 12).length,
    afternoon: mockCourses.filter(
      (c) => parseInt(c.startTime, 10) >= 12 && parseInt(c.startTime, 10) < 18,
    ).length,
    evening: mockCourses.filter((c) => parseInt(c.startTime, 10) >= 18).length,
  },
  conflicts: {
    teacherConflict: 0,
    roomConflict: 0,
    classConflict: 0,
    total: 0,
  },
};

/**
 * 延迟函数 - 模拟网络延迟
 */
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 模拟获取课表数据
 */
export const mockGetScheduleData = async (week: number): Promise<Course[]> => {
  await delay();
  return mockCourses.filter((course) => course.weeks.includes(week));
};

/**
 * 模拟获取统计数据
 */
export const mockGetStatistics = async (
  week: number,
): Promise<StatisticsData> => {
  await delay();
  return {
    ...mockStatistics,
    total: {
      ...mockStatistics.total,
      courses: mockCourses.filter((c) => c.weeks.includes(week)).length,
    },
  };
};

/**
 * 模拟创建课程
 */
export const mockCreateCourse = async (
  course: Omit<Course, 'id'>,
): Promise<Course> => {
  await delay();
  const newCourse: Course = {
    ...course,
    id: `${Date.now()}`,
  };
  mockCourses.push(newCourse);
  return newCourse;
};

/**
 * 模拟更新课程
 */
export const mockUpdateCourse = async (
  id: string,
  updates: Partial<Course>,
): Promise<Course> => {
  await delay();
  const index = mockCourses.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('课程不存在');
  }
  mockCourses[index] = { ...mockCourses[index], ...updates };
  return mockCourses[index];
};

/**
 * 模拟删除课程
 */
export const mockDeleteCourse = async (id: string): Promise<boolean> => {
  await delay();
  const index = mockCourses.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error('课程不存在');
  }
  mockCourses.splice(index, 1);
  return true;
};

/**
 * 模拟批量移动课程
 */
export const mockBatchMoveCourses = async (
  moves: Array<{
    courseId: string;
    newWeekDay: number;
    newStartTime?: string;
  }>,
) => {
  await delay();
  const success: any[] = [];
  const failed: any[] = [];

  moves.forEach((move) => {
    const course = mockCourses.find((c) => c.id === move.courseId);
    if (course) {
      course.weekDay = move.newWeekDay;
      if (move.newStartTime) {
        course.startTime = move.newStartTime;
      }
      success.push({ courseId: move.courseId });
    } else {
      failed.push({ courseId: move.courseId, reason: '课程不存在' });
    }
  });

  return { success, failed, conflicts: [] };
};

/**
 * 模拟保存课表
 */
export const mockSaveSchedule = async (week: number, courses: Course[]) => {
  await delay();
  return { week, savedCount: courses.length };
};

/**
 * 模拟冲突检测
 */
export const mockCheckConflict = async (
  course: Partial<Course>,
  _week: number,
) => {
  await delay();
  // 简单模拟：如果课程名为"冲突课程"则返回冲突
  if (course.courseName?.includes('冲突')) {
    return {
      hasConflicts: true,
      conflicts: [
        {
          type: 'teacher',
          message: `教师${course.teacherName}在周${course.weekDay} ${course.startTime}已有课程安排`,
          existingCourse: mockCourses[0],
        },
      ],
      recommendations: [
        {
          weekDay: ((course.weekDay || 1) % 7) + 1,
          startTime: '14:00',
          roomId: 'R011',
          reason: '该时间段教师和教室均可用',
        },
      ],
    };
  }
  return {
    hasConflicts: false,
    conflicts: [],
    recommendations: [],
  };
};
