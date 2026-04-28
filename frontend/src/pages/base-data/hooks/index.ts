/**
 * base-data 模块 - Hooks 统一导出
 * 导出所有可复用的自定义 Hook 和类型
 */

// 通用类型
export type { FormField } from '../types';
export type {
  UseDataManagementConfig,
  UseDataManagementReturn,
} from './useDataManagement';
// 统一数据管理 Hook（包含 CRUD 和文件上传功能）
export { useDataManagement } from './useDataManagement';
