/**
 * base-data 模块 - API 路径配置
 * 统一管理所有后端接口路径
 */

// 基础路径
const BASE_PATH = '/api/base-data';

export const API_PATHS = {
  // 课程相关
  COURSES: {
    IMPORT: `${BASE_PATH}/courses/import`,
    TEMPLATE: `${BASE_PATH}/courses/import/template`,
  },
  // 课程设置相关
  COURSE_SETTINGS: {
    IMPORT: `${BASE_PATH}/course-settings/import`,
    TEMPLATE: `${BASE_PATH}/course-settings/import/template`,
  },
  // 专业相关
  MAJORS: {
    IMPORT: `${BASE_PATH}/majors/import`,
    TEMPLATE: `${BASE_PATH}/majors/import/template`,
  },
  // 教师相关
  TEACHERS: {
    IMPORT: `${BASE_PATH}/teachers/import`,
    TEMPLATE: `${BASE_PATH}/teachers/import/template`,
  },
} as const;
