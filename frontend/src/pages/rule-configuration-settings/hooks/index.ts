// 导出所有 API hooks

export type { SelectionType } from '../types';
export {
  useRuleConfigData,
  useRuleDataWithApi,
  useRuleWeights,
  useTeachers,
  useUnavailableDatesWithApi,
} from './useApiData';
// 导出原始 hooks（向后兼容）
export {
  useRuleData,
  useSteps,
  useUnavailableDates,
} from './useRuleData';
