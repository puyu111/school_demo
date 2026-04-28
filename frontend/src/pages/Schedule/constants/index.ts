// 步骤配置常量
export const STEP_CONFIG = [
  {
    title: '课表预览',
    icon: 'ScheduleOutlined',
  },
  {
    title: '排课统计',
    icon: 'BarChartOutlined',
  },
];

// 默认周次选项
export const DEFAULT_WEEK_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  label: `第${i + 1}周`,
  value: i + 1,
}));

// 星期选项
export const WEEK_DAY_OPTIONS = [
  { id: 1, name: '周一' },
  { id: 2, name: '周二' },
  { id: 3, name: '周三' },
  { id: 4, name: '周四' },
  { id: 5, name: '周五' },
  { id: 6, name: '周六' },
  { id: 7, name: '周日' },
];

// 时间段配置
export const TIME_SLOTS = [
  { startTime: '08:00', endTime: '08:45', label: '第 1 节', key: 'slot1' },
  { startTime: '08:50', endTime: '09:35', label: '第 2 节', key: 'slot2' },
  { startTime: '10:10', endTime: '10:55', label: '第 3 节', key: 'slot3' },
  { startTime: '11:00', endTime: '11:45', label: '第 4 节', key: 'slot4' },
  { startTime: '14:00', endTime: '14:45', label: '第 5 节', key: 'slot5' },
  { startTime: '14:50', endTime: '15:35', label: '第 6 节', key: 'slot6' },
  { startTime: '16:10', endTime: '16:55', label: '第 7 节', key: 'slot7' },
  { startTime: '17:00', endTime: '17:45', label: '第 8 节', key: 'slot8' },
  { startTime: '19:00', endTime: '19:45', label: '第 9 节', key: 'slot9' },
  { startTime: '19:50', endTime: '20:35', label: '第 10 节', key: 'slot10' },
];

// 视图模式选项
export const VIEW_MODE_OPTIONS = [
  { label: '周视图', value: 'week' },
  { label: '日视图', value: 'day' },
  { label: '列表视图', value: 'list' },
];

// ===========================================
// API 配置常量
// ===========================================

/**
 * API 基础路径
 */
export const API_BASE = '/api/schedule';

/**
 * 是否使用 Mock 数据
 * 生产环境设为 false，开发环境可设为 true
 */
export const USE_MOCK = process.env.NODE_ENV === 'development';

/**
 * Mock 延迟时间（毫秒）
 */
export const MOCK_DELAY = 500;

/**
 * 错误码定义
 */
export const ERROR_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
} as const;

/**
 * 冲突类型
 */
export const CONFLICT_TYPES = {
  TEACHER: 'teacher',
  ROOM: 'room',
  CLASS: 'class',
  DURATION: 'duration',
} as const;
