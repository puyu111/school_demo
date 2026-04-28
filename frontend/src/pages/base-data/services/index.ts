/**
 * base-data 模块 - Services 统一导出
 * 导出所有 API 接口函数和类型定义
 */

// API 路径配置
export { API_PATHS } from './api';

// 课程相关服务
export {
  downloadCourseSettingsTemplate,
  downloadCoursesTemplate,
  importCourseSettings,
  importCourses,
} from './course';

// 专业相关服务
export { downloadMajorsTemplate, importMajors } from './major';
// 请求工具（内部使用）
export { downloadFile, uploadFile } from './request';
// 教师相关服务
export { downloadTeachersTemplate, importTeachers } from './teacher';
// 共享类型
export type {
  Course,
  CourseSetting,
  ImportResponse,
  Major,
  Teacher,
} from './types';
