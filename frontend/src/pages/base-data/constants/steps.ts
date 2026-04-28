/**
 * base-data 模块 - 步骤配置常量
 * 定义基础数据管理流程的步骤导航配置
 */

/**
 * 步骤条配置数组
 * 每个步骤包含：key(步骤索引), title(步骤标题), icon(图标组件名)
 */
export const BASE_DATA_STEPS = [
  { key: 0, title: '课程录入', icon: 'UserOutlined' },
  { key: 1, title: '课程设置', icon: 'SolutionOutlined' },
  { key: 2, title: '专业设置', icon: 'UserOutlined' },
  { key: 3, title: '教师录入', icon: 'SmileOutlined' },
  { key: 4, title: '学期日历', icon: 'SolutionOutlined' },
  { key: 5, title: '提交', icon: 'UserOutlined' },
] as const;

/** 步骤总数 */
export const TOTAL_STEPS = 6;

/**
 * 默认步骤完成状态
 * 记录前 5 个步骤的完成状态（提交步骤本身不计入）
 */
export const DEFAULT_STEP_COMPLETION = {
  0: false,
  1: false,
  2: false,
  3: false,
  4: false,
} as const;
