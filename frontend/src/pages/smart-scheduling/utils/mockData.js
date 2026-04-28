// 模拟数据 - 纯前端演示用（无教室）
export const mockData = {
  // 时间配置
  timeSlots: [
    { id: 1, label: '1-2节', time: '08:00-09:40' },
    { id: 2, label: '3-4节', time: '10:00-11:40' },
    { id: 3, label: '5-6节', time: '14:00-15:40' },
    { id: 4, label: '7-8节', time: '16:00-17:40' },
    { id: 5, label: '9-10节', time: '19:00-20:40' },
  ],

  // 星期
  weekDays: [
    { id: 1, label: '周一', value: 'monday' },
    { id: 2, label: '周二', value: 'tuesday' },
    { id: 3, label: '周三', value: 'wednesday' },
    { id: 4, label: '周四', value: 'thursday' },
    { id: 5, label: '周五', value: 'friday' },
  ],

  // 教师列表
  teachers: [
    { id: 'T001', name: '张教授', department: '数学系', maxDailyCourses: 3 },
    { id: 'T002', name: '李教授', department: '计算机系', maxDailyCourses: 4 },
    { id: 'T003', name: '王老师', department: '物理系', maxDailyCourses: 3 },
    { id: 'T004', name: '赵老师', department: '英语系', maxDailyCourses: 3 },
    { id: 'T005', name: '孙老师', department: '化学系', maxDailyCourses: 4 },
  ],

  // 班级列表
  classes: [
    { id: 'C001', name: '计算机21级1班', studentCount: 45, maxDailyCourses: 4 },
    { id: 'C002', name: '计算机21级2班', studentCount: 48, maxDailyCourses: 4 },
    { id: 'C003', name: '数学21级1班', studentCount: 40, maxDailyCourses: 4 },
    { id: 'C004', name: '物理21级1班', studentCount: 35, maxDailyCourses: 4 },
    { id: 'C005', name: '英语21级1班', studentCount: 42, maxDailyCourses: 4 },
  ],

  // 待排课程池
  pendingCourses: [
    {
      id: 'COURSE001',
      name: '高等数学',
      teacherId: 'T001',
      teacherName: '张教授',
      classId: 'C001',
      className: '计算机21级1班',
      duration: 2,
      priority: 1,
      courseType: '必修',
      preferredTimes: [
        { day: 'monday', slot: 1 },
        { day: 'wednesday', slot: 1 },
      ],
    },
    {
      id: 'COURSE002',
      name: '数据结构',
      teacherId: 'T002',
      teacherName: '李教授',
      classId: 'C001',
      className: '计算机21级1班',
      duration: 2,
      priority: 1,
      courseType: '必修',
      preferredTimes: [
        { day: 'tuesday', slot: 2 },
        { day: 'thursday', slot: 2 },
      ],
    },
    {
      id: 'COURSE003',
      name: '大学物理',
      teacherId: 'T003',
      teacherName: '王老师',
      classId: 'C004',
      className: '物理21级1班',
      duration: 2,
      priority: 2,
      courseType: '必修',
    },
    {
      id: 'COURSE004',
      name: '英语精读',
      teacherId: 'T004',
      teacherName: '赵老师',
      classId: 'C005',
      className: '英语21级1班',
      duration: 2,
      priority: 3,
      courseType: '必修',
    },
    {
      id: 'COURSE005',
      name: '线性代数',
      teacherId: 'T001',
      teacherName: '张教授',
      classId: 'C003',
      className: '数学21级1班',
      duration: 2,
      priority: 2,
      courseType: '必修',
    },
    {
      id: 'COURSE006',
      name: '算法设计',
      teacherId: 'T002',
      teacherName: '李教授',
      classId: 'C002',
      className: '计算机21级2班',
      duration: 3,
      priority: 1,
      courseType: '必修',
    },
    {
      id: 'COURSE007',
      name: '大学英语',
      teacherId: 'T004',
      teacherName: '赵老师',
      classId: 'C001',
      className: '计算机21级1班',
      duration: 2,
      priority: 3,
      courseType: '必修',
    },
    {
      id: 'COURSE008',
      name: '离散数学',
      teacherId: 'T001',
      teacherName: '张教授',
      classId: 'C002',
      className: '计算机21级2班',
      duration: 2,
      priority: 2,
      courseType: '必修',
    },
  ],

  // 教师约束（不可用时间）
  teacherConstraints: [
    {
      teacherId: 'T001',
      unavailableTimes: [
        { day: 'tuesday', slots: [1, 2] },
        { day: 'thursday', slots: [4] },
      ],
    },
    {
      teacherId: 'T002',
      unavailableTimes: [
        { day: 'monday', slots: [1] },
        { day: 'friday', slots: [5] },
      ],
    },
    {
      teacherId: 'T003',
      unavailableTimes: [{ day: 'wednesday', slots: [3, 4] }],
    },
  ],

  // 班级约束（特殊要求）
  classConstraints: [
    {
      classId: 'C001',
      unavailableTimes: [{ day: 'friday', slots: [4, 5] }],
    },
    {
      classId: 'C004',
      unavailableTimes: [{ day: 'monday', slots: [1, 2] }],
    },
  ],
};

// 生成初始排课表
export const generateEmptySchedule = () => {
  const schedule = {};
  mockData.weekDays.forEach((day) => {
    schedule[day.value] = {};
    mockData.timeSlots.forEach((slot) => {
      schedule[day.value][slot.id] = [];
    });
  });
  return schedule;
};

// 生成示例排课结果（演示用）
export const generateDemoSchedule = () => {
  const schedule = generateEmptySchedule();

  // 添加几个示例排课
  schedule.monday[1] = [
    {
      id: 'COURSE001',
      name: '高等数学',
      teacher: '张教授',
      className: '计算机21级1班',
      duration: 2,
      color: '#1890ff',
      teacherId: 'T001',
      classId: 'C001',
    },
  ];

  schedule.tuesday[2] = [
    {
      id: 'COURSE002',
      name: '数据结构',
      teacher: '李教授',
      className: '计算机21级1班',
      duration: 2,
      color: '#52c41a',
      teacherId: 'T002',
      classId: 'C001',
    },
  ];

  schedule.wednesday[1] = [
    {
      id: 'COURSE003',
      name: '大学物理',
      teacher: '王老师',
      className: '物理21级1班',
      duration: 2,
      color: '#fa8c16',
      teacherId: 'T003',
      classId: 'C004',
    },
  ];

  schedule.thursday[3] = [
    {
      id: 'COURSE004',
      name: '英语精读',
      teacher: '赵老师',
      className: '英语21级1班',
      duration: 2,
      color: '#722ed1',
      teacherId: 'T004',
      classId: 'C005',
    },
  ];

  return schedule;
};
