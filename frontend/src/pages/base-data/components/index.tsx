/**
 * base-data 模块 - 组件统一导出
 * 导出所有可复用的 UI 组件和类型
 */

// 共享类型导出
export type {
  CalendarComponentProps,
  CalendarOptionsPanelProps,
  CalendarPageLayoutProps,
} from './Calendar';

// 日历相关组件
export {
  CalendarComponent,
  CalendarOptionsPanel,
  CalendarPageLayout,
} from './Calendar';
export type { CommonDataManagerProps } from './CommonDataManager';

// 数据管理器组件
export { default as CommonDataManager } from './CommonDataManager';
// 通用表格组件
export { default as CommonTable } from './CommonTable';
// 步骤工厂函数
export {
  type BaseDataItem,
  createDataManagementStep,
  type DataStepConfig,
} from './DataStepFactory';
export type { StepperProps } from './Stepper';
// 步骤导航组件
export { default as Stepper } from './Stepper';
export type { StepCompletion } from './StepStatusPanel';
// 步骤状态面板组件
export { default as StepStatusPanel } from './StepStatusPanel';
