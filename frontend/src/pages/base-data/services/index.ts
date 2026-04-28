/**
 * base-data 模块 - Services 统一导出
 * 导出所有 API 接口函数和类型定义
 */

// API 路径配置
export { API_PATHS } from './api';
// 学期日历服务
export {
  getCalendar,
  submitCalendar,
} from './calendar';
// 课程相关服务
export {
  createCourse,
  createCourseSetting,
  deleteCourseSettings,
  deleteCourses,
  downloadCourseSettingsTemplate,
  downloadCoursesTemplate,
  getCourseSettings,
  getCourses,
  importCourseSettings,
  importCourses,
} from './course';
// 专业相关服务
export {
  createMajor,
  deleteMajors,
  downloadMajorsTemplate,
  getMajors,
  importMajors,
} from './major';
// 请求工具
export { downloadFile, uploadFile } from './request';

// 批量提交服务
export { submitAll } from './submit';
// 教师相关服务
export {
  createTeacher,
  deleteTeachers,
  downloadTeachersTemplate,
  getTeachers,
  importTeachers,
} from './teacher';

// 共享类型
export type {
  ApiResponse,
  CalendarSubmitRequest,
  Course,
  CourseSetting,
  ImportResponse,
  ListResponse,
  Major,
  SubmitRequest,
  SubmitResponse,
  Teacher,
} from './types';
