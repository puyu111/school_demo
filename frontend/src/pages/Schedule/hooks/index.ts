// 导出步骤管理 hook
// 导出课表数据 hooks（旧版 - 本地数据）
// 导出统计 hook
export {
  useScheduleData as useScheduleDataLocal,
  useScheduleView,
  useStatistics,
  useSteps,
} from './useSchedule';
// 导出课表数据 hooks（新版 - API 数据）
export {
  useConflictCheck,
  useScheduleData,
  useStatisticsData,
} from './useScheduleData';
