/**
 * base-data 模块 - 页面组件统一导出
 * 导出所有 6 个步骤页面组件和类型
 */

// 导出 6 个步骤页面组件
export { default as Step1CourseInput } from './Step1CourseInput';
export { default as Step2CourseSettings } from './Step2CourseSettings';
export { default as Step3MajorSettings } from './Step3MajorSettings';
export { default as Step4TeacherInput } from './Step4TeacherInput';
// 导出页面组件类型
export type { Step5CalendarProps } from './Step5Calendar';
export { default as Step5Calendar } from './Step5Calendar';
export type { Step6SubmissionProps } from './Step6Submission';
export { default as Step6Submission } from './Step6Submission';
