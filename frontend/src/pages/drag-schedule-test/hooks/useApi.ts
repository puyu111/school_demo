import { useRequest } from '@umijs/max';
import { useCallback, useState } from 'react';
import * as scheduleApi from '../service';
import type {
  Course,
  DailyScheduleConfig,
  HalfDayConfig,
  TimeSlotConfig,
  WeekDayConfig,
} from '../services';

// ==================== 课程数据请求 Hooks ====================

/**
 * 获取周次课程列表
 */
export function useWeekCourses(week: number, classId?: string) {
  const { data, loading, error, refresh, run } = useRequest(
    () => scheduleApi.getCourses({ week, classId }),
    {
      ready: week > 0,
      formatResult: (res) => res.data,
      manual: true,
      onError: (err) => {
        console.error('获取课程失败:', err);
      },
    },
  );

  return {
    courses: data || [],
    loading,
    error,
    refresh,
    load: run,
  };
}

/**
 * 获取时段配置
 */
export function useTimeSlots() {
  const { data, loading, error, refresh, run } = useRequest(
    () => scheduleApi.getTimeSlots(),
    {
      formatResult: (res) => res.data,
      onError: (err) => {
        console.error('获取时段配置失败:', err);
      },
    },
  );

  return {
    timeSlots: data?.timeSlots || [],
    halfDayConfigs: data?.halfDayConfigs || [],
    dailyConfig: data?.dailyConfig,
    loading,
    error,
    refresh,
    load: run,
  };
}

/**
 * 获取星期配置
 */
export function useWeekDays() {
  const { data, loading, error, refresh, run } = useRequest(
    () => scheduleApi.getWeekDays(),
    {
      formatResult: (res) => res.data,
      onError: (err) => {
        console.error('获取星期配置失败:', err);
      },
    },
  );

  return {
    weekDays: data || [],
    loading,
    error,
    refresh,
    load: run,
  };
}

// ==================== 操作类 Hooks ====================

/**
 * 课程操作 Hooks
 */
export function useCourseActions() {
  const [loading, setLoading] = useState(false);

  /**
   * 创建课程
   */
  const createCourse = useCallback(async (data: Partial<Course>) => {
    setLoading(true);
    try {
      const res = await scheduleApi.createCourse(data);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新课程
   */
  const updateCourse = useCallback(
    async (courseId: string, data: Partial<Course>) => {
      setLoading(true);
      try {
        const res = await scheduleApi.updateCourse(courseId, data);
        return { success: true, data: res.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 删除课程
   */
  const deleteCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    try {
      const res = await scheduleApi.deleteCourse(courseId);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 批量移动课程
   */
  const moveCourses = useCallback(
    async (
      moves: {
        courseId: string;
        newWeekDay: number;
        newTimeSlotIndex: number;
      }[],
    ) => {
      setLoading(true);
      try {
        const movesRequest = moves.map((m) => ({
          courseId: m.courseId,
          newWeekDay: m.newWeekDay,
        }));
        const res = await scheduleApi.moveCourses(movesRequest);
        return { success: true, data: res.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    moveCourses,
    loading,
  };
}

/**
 * 配置管理 Hooks
 */
export function useConfigActions() {
  const [loading, setLoading] = useState(false);

  /**
   * 更新时段配置
   */
  const updateTimeSlots = useCallback(
    async (data: {
      halfDayConfigs?: HalfDayConfig[];
      timeSlots?: TimeSlotConfig[];
      dailyConfig?: DailyScheduleConfig;
    }) => {
      setLoading(true);
      try {
        const res = await scheduleApi.updateTimeSlots(data);
        return { success: true, data: res.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 更新星期配置
   */
  const updateWeekDays = useCallback(async (weekDays: WeekDayConfig[]) => {
    setLoading(true);
    try {
      const res = await scheduleApi.updateWeekDays({ weekDays });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 重置时段配置
   */
  const resetTimeSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.resetTimeSlots();
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateTimeSlots,
    updateWeekDays,
    resetTimeSlots,
    loading,
  };
}

/**
 * 保存/提交 Hooks
 */
export function useScheduleSubmit() {
  const [loading, setLoading] = useState(false);

  /**
   * 保存周次课表
   */
  const saveSchedule = useCallback(
    async (data: {
      week: number;
      courses: Course[];
      timeSlots?: TimeSlotConfig[];
      weekDays?: WeekDayConfig[];
      dailyConfig?: DailyScheduleConfig;
      halfDayConfig?: HalfDayConfig[];
    }) => {
      setLoading(true);
      try {
        const res = await scheduleApi.saveWeekSchedule(data);
        return { success: true, data: res.data, message: '保存成功' };
      } catch (error: any) {
        return { success: false, error: error.message, message: '保存失败' };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 刷新周次数据
   */
  const refreshSchedule = useCallback(async (week: number) => {
    setLoading(true);
    try {
      const res = await scheduleApi.refreshWeekData(week);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    saveSchedule,
    refreshSchedule,
    loading,
  };
}

/**
 * 冲突检测 Hooks
 */
export function useConflictCheck() {
  const [loading, setLoading] = useState(false);

  /**
   * 检测冲突
   */
  const checkConflicts = useCallback(
    async (week: number, course?: Partial<Course>) => {
      setLoading(true);
      try {
        const res = await scheduleApi.checkConflicts({ week, course });
        return { success: true, data: res.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 获取冲突类型
   */
  const { data: conflictTypes, loading: typesLoading } = useRequest(
    () => scheduleApi.getConflictTypes(),
    {
      formatResult: (res) => res.data,
    },
  );

  return {
    checkConflicts,
    conflictTypes: conflictTypes || [],
    loading,
    typesLoading,
  };
}

// ==================== 完整数据管理 Hook（整合版）====================

interface UseScheduleDataResult {
  // 数据
  courses: Course[];
  timeSlots: TimeSlotConfig[];
  weekDays: WeekDayConfig[];
  halfDayConfigs: HalfDayConfig[];
  dailyConfig?: DailyScheduleConfig;

  // 状态
  coursesLoading: boolean;
  configLoading: boolean;
  submitLoading: boolean;
  error: Error | null;

  // 刷新
  refreshCourses: () => void;
  refreshConfigs: () => void;

  // 操作
  moveCourses: (
    moves: { courseId: string; newWeekDay: number; newTimeSlotIndex: number }[],
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  saveSchedule: (data: {
    week: number;
    courses: Course[];
  }) => Promise<{ success: boolean; message: string }>;
  refreshSchedule: (
    week: number,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateTimeSlots: (data: {
    halfDayConfigs?: HalfDayConfig[];
    timeSlots?: TimeSlotConfig[];
    dailyConfig?: DailyScheduleConfig;
  }) => Promise<{ success: boolean; error?: string }>;
  updateWeekDays: (
    weekDays: WeekDayConfig[],
  ) => Promise<{ success: boolean; error?: string }>;
  checkConflicts: (
    week: number,
    course?: Partial<Course>,
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
}

/**
 * 整合的排课数据管理 Hook
 * @param week 当前周次
 */
export function useScheduleDataFull(week: number): UseScheduleDataResult {
  // 获取课程数据
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    refresh: refreshCourses,
  } = useWeekCourses(week);

  // 获取配置数据
  const {
    timeSlots,
    halfDayConfigs,
    dailyConfig,
    loading: timeSlotsLoading,
  } = useTimeSlots();

  const { weekDays, loading: weekDaysLoading } = useWeekDays();

  // 操作 hooks
  const { moveCourses, loading: moveLoading } = useCourseActions();
  const {
    updateTimeSlots,
    updateWeekDays,
    loading: configActionLoading,
  } = useConfigActions();
  const {
    saveSchedule,
    refreshSchedule,
    loading: submitLoading,
  } = useScheduleSubmit();
  const { checkConflicts, loading: conflictLoading } = useConflictCheck();

  const configLoading = timeSlotsLoading || weekDaysLoading;
  const error = (coursesError || null) as Error | null;

  return {
    // 数据
    courses,
    timeSlots,
    weekDays,
    halfDayConfigs,
    dailyConfig,

    // 状态
    coursesLoading,
    configLoading,
    submitLoading:
      submitLoading || moveLoading || configActionLoading || conflictLoading,
    error,

    // 刷新
    refreshCourses,
    refreshConfigs: () => {
      refreshCourses();
    },

    // 操作
    moveCourses,
    saveSchedule,
    refreshSchedule,
    updateTimeSlots,
    updateWeekDays,
    checkConflicts,
  };
}
