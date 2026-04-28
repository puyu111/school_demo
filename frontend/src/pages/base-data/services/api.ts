/**
 * base-data 模块 - API 路径配置
 * 统一管理所有后端接口路径
 */

// 基础路径
const BASE_PATH = '/api/base-data';

export const API_PATHS = {
  // 课程相关
  COURSES: {
    LIST: `${BASE_PATH}/courses`,
    CREATE: `${BASE_PATH}/courses`,
    BATCH_DELETE: `${BASE_PATH}/courses/batch-delete`,
    IMPORT: `${BASE_PATH}/courses/import`,
    TEMPLATE: `${BASE_PATH}/courses/import/template`,
  },
  // 课程设置相关
  COURSE_SETTINGS: {
    LIST: `${BASE_PATH}/course-settings`,
    CREATE: `${BASE_PATH}/course-settings`,
    BATCH_DELETE: `${BASE_PATH}/course-settings/batch-delete`,
    IMPORT: `${BASE_PATH}/course-settings/import`,
    TEMPLATE: `${BASE_PATH}/course-settings/import/template`,
  },
  // 专业相关
  MAJORS: {
    LIST: `${BASE_PATH}/majors`,
    CREATE: `${BASE_PATH}/majors`,
    BATCH_DELETE: `${BASE_PATH}/majors/batch-delete`,
    IMPORT: `${BASE_PATH}/majors/import`,
    TEMPLATE: `${BASE_PATH}/majors/import/template`,
  },
  // 教师相关
  TEACHERS: {
    LIST: `${BASE_PATH}/teachers`,
    CREATE: `${BASE_PATH}/teachers`,
    BATCH_DELETE: `${BASE_PATH}/teachers/batch-delete`,
    IMPORT: `${BASE_PATH}/teachers/import`,
    TEMPLATE: `${BASE_PATH}/teachers/import/template`,
  },
  // 学期日历相关
  CALENDAR: {
    SUBMIT: `${BASE_PATH}/calendar`,
    LIST: `${BASE_PATH}/calendar`,
  },
  // 批量提交
  SUBMIT: `${BASE_PATH}/submit`,
} as const;
