// 步骤配置常量
export const STEP_CONFIG = [
  {
    title: '教师不可用时间',
    icon: 'UserOutlined',
  },
  {
    title: '权重设置',
    icon: 'SolutionOutlined',
  },
];

// 树形数据
export const TREE_DATA = [
  {
    title: '天津大学软件学院',
    key: '0-0',
    children: [
      {
        title: '软件工程',
        key: '0-0-0',
        children: [
          {
            title: '教师 A',
            key: '0-0-0-0',
          },
          {
            title: '教师 B',
            key: '0-0-0-1',
          },
        ],
      },
    ],
  },
];

// 默认规则数据
export const DEFAULT_RULES = [
  {
    key: '1',
    ruleName: '英语教师周末不排课',
    teachers: ['张三', '李四', '王老师', '赵老师'],
    description: '英语教研组的教师周末不安排课程',
    validDate: [1704067200000, 1735689600000] as [number, number],
  },
  {
    key: '2',
    ruleName: '物理实验课时间限制',
    teachers: ['王五'],
    description: '物理实验课只能在上午 9:00-11:00 进行',
  },
  {
    key: '3',
    ruleName: '新教师课时限制',
    teachers: ['赵六', '钱七'],
    description: '新入职教师每周不超过 20 课时',
    validDate: [1706745600000, 1722441600000] as [number, number],
  },
  {
    key: '4',
    ruleName: '多媒体教室优先排课',
    teachers: [] as string[],
    description: '优先安排多媒体教室进行公开课',
  },
  {
    key: '5',
    ruleName: '高三重点课程优先',
    teachers: ['张三', '李四', '王五', '孙老师', '周老师'],
    description: '高三重点课程优先安排在黄金时间段',
    validDate: [1707945600000, 1717084800000] as [number, number],
  },
  {
    key: '6',
    ruleName: '体育课室外安排',
    teachers: ['刘教练', '陈教练'],
    description: '天气良好时体育课优先安排室外场地',
  },
  {
    key: '7',
    ruleName: '晚自习值班安排',
    teachers: ['李老师', '张老师', '王老师'],
    description: '晚自习必须有教师在教室值班',
  },
];

// 教师数据
export const TEACHER_DATA = [
  { id: '1', name: '张三', employeeId: 'T001' },
  { id: '2', name: '李四', employeeId: 'T002' },
  { id: '3', name: '王五', employeeId: 'T003' },
  { id: '4', name: '赵六', employeeId: 'T004' },
  { id: '5', name: '刘七', employeeId: 'T005' },
  { id: '6', name: '陈八', employeeId: 'T006' },
  { id: '7', name: '杨九', employeeId: 'T007' },
  { id: '8', name: '周十', employeeId: 'T008' },
];

// 不可排日期初始数据
export const INITIAL_UNAVAILABLE_DATES = [
  {
    key: '1',
    teacherId: '1',
    teacherName: '张三',
    validDate: [1705276800000, 1705363200000] as [number, number],
    reason: '个人事务',
    type: 'personal' as const,
    rangeType: 'single' as const,
  },
  {
    key: '2',
    teacherId: '1',
    teacherName: '张三',
    validDate: [1705708800000, 1706140800000] as [number, number],
    reason: '年度会议',
    type: 'other' as const,
    rangeType: 'range' as const,
  },
  {
    key: '3',
    teacherId: '2',
    teacherName: '李四',
    validDate: [1704067200000, 1704672000000] as [number, number],
    reason: '培训周',
    type: 'other' as const,
    rangeType: 'week' as const,
  },
  {
    key: '4',
    teacherId: '2',
    teacherName: '李四',
    validDate: [1706745600000, 1709251200000] as [number, number],
    reason: '春节假期',
    type: 'holiday' as const,
    rangeType: 'month' as const,
  },
];

// 日期类型映射
export const DATE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  single: { color: 'blue', text: '单日' },
  week: { color: 'green', text: '整周' },
  month: { color: 'orange', text: '整月' },
  quarter: { color: 'purple', text: '季度' },
  range: { color: 'cyan', text: '日期区间' },
};

// 原因类型映射
export const REASON_TYPE_MAP: Record<string, { color: string; text: string }> =
  {
    personal: { color: 'blue', text: '个人事务' },
    holiday: { color: 'green', text: '节假日' },
    other: { color: 'orange', text: '其他' },
  };

// 月份选项
export const MONTH_OPTIONS = [
  { label: '1 月', value: '1' },
  { label: '2 月', value: '2' },
  { label: '3 月', value: '3' },
  { label: '4 月', value: '4' },
  { label: '5 月', value: '5' },
  { label: '6 月', value: '6' },
  { label: '7 月', value: '7' },
  { label: '8 月', value: '8' },
  { label: '9 月', value: '9' },
  { label: '10 月', value: '10' },
  { label: '11 月', value: '11' },
  { label: '12 月', value: '12' },
];

// 季度选项
export const QUARTER_OPTIONS = [
  { label: '第一季度 (1-3 月)', value: '1' },
  { label: '第二季度 (4-6 月)', value: '2' },
  { label: '第三季度 (7-9 月)', value: '3' },
  { label: '第四季度 (10-12 月)', value: '4' },
];
