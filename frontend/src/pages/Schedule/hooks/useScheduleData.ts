import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import * as scheduleApi from '../services/api';
import type { Course } from '../types';

/**
 * 课表数据状态
 */
interface ScheduleDataState {
  courses: Course[];
  loading: boolean;
  error: Error | null;
}

/**
 * 使用课表数据 Hook
 * @param week 周次
 */
export const useScheduleData = (week: number) => {
  const [state, setState] = useState<ScheduleDataState>({
    courses: [],
    loading: false,
    error: null,
  });

  /**
   * 加载课表数据
   */
  const loadSchedule = useCallback(async (weekNumber: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await scheduleApi.getScheduleData({ week: weekNumber });
      setState({ courses: data, loading: false, error: null });
    } catch (error) {
      const err = error as Error;
      setState({ courses: [], loading: false, error: err });
      message.error('加载课表数据失败');
    }
  }, []);

  /**
   * 刷新课表
   */
  const refreshSchedule = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await scheduleApi.refreshSchedule(week);
      setState((prev) => ({ ...prev, courses: data, loading: false }));
      message.success('数据已刷新');
    } catch (_error) {
      setState((prev) => ({ ...prev, loading: false }));
      message.error('刷新失败');
    }
  }, [week]);

  /**
   * 添加课程
   */
  const addCourse = useCallback(async (course: Omit<Course, 'id'>) => {
    try {
      const newCourse = await scheduleApi.createCourse(course);
      setState((prev) => ({
        ...prev,
        courses: [...prev.courses, newCourse],
      }));
      message.success('课程添加成功');
      return newCourse;
    } catch (error) {
      message.error('添加课程失败');
      throw error;
    }
  }, []);

  /**
   * 更新课程
   */
  const updateCourse = useCallback(
    async (id: string, updates: Partial<Course>) => {
      try {
        const updatedCourse = await scheduleApi.updateCourse(id, updates);
        setState((prev) => ({
          ...prev,
          courses: prev.courses.map((c) => (c.id === id ? updatedCourse : c)),
        }));
        message.success('课程更新成功');
        return updatedCourse;
      } catch (error) {
        message.error('更新课程失败');
        throw error;
      }
    },
    [],
  );

  /**
   * 删除课程
   */
  const removeCourse = useCallback(async (id: string) => {
    try {
      await scheduleApi.deleteCourse(id);
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== id),
      }));
      message.success('课程删除成功');
      return true;
    } catch (error) {
      message.error('删除课程失败');
      throw error;
    }
  }, []);

  /**
   * 批量移动课程
   */
  const moveCourses = useCallback(
    async (moves: scheduleApi.CourseMoveParams[]) => {
      try {
        const result = await scheduleApi.batchMoveCourses({ moves });

        // 更新本地状态
        setState((prev) => ({
          ...prev,
          courses: prev.courses.map((course) => {
            const move = moves.find((m) => m.courseId === course.id);
            if (move) {
              return {
                ...course,
                weekDay: move.newWeekDay,
                startTime: move.newStartTime || course.startTime,
              };
            }
            return course;
          }),
        }));

        if (result.failed.length > 0) {
          message.warning(`移动完成，${result.failed.length} 个课程移动失败`);
        } else {
          message.success('课程移动成功');
        }

        return result;
      } catch (error) {
        message.error('移动课程失败');
        throw error;
      }
    },
    [],
  );

  /**
   * 保存课表
   */
  const saveSchedule = useCallback(async () => {
    try {
      const result = await scheduleApi.saveSchedule({
        week,
        courses: state.courses,
      });
      message.success(`第${week}周课表已保存，共${result.savedCount}门课程`);
      return result;
    } catch (error) {
      message.error('保存失败');
      throw error;
    }
  }, [week, state.courses]);

  // 初始加载
  useEffect(() => {
    loadSchedule(week);
  }, [week, loadSchedule]);

  return {
    // 数据
    courses: state.courses,
    loading: state.loading,
    error: state.error,

    // 方法
    loadSchedule,
    refreshSchedule,
    addCourse,
    updateCourse,
    removeCourse,
    moveCourses,
    saveSchedule,
  };
};

/**
 * 使用统计数据 Hook
 * @param week 周次
 */
export const useStatisticsData = (week: number) => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadStatistics = useCallback(async (weekNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleApi.getStatistics(weekNumber);
      setStatistics(data);
    } catch (err) {
      setError(err as Error);
      message.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scheduleApi.getStatistics(week);
      setStatistics(data);
      message.success('统计数据已刷新');
    } catch (_err) {
      message.error('刷新失败');
    } finally {
      setLoading(false);
    }
  }, [week]);

  useEffect(() => {
    loadStatistics(week);
  }, [week, loadStatistics]);

  return {
    statistics,
    loading,
    error,
    refreshStatistics,
  };
};

/**
 * 使用课程冲突检测 Hook
 */
export const useConflictCheck = () => {
  const [checking, setChecking] = useState(false);

  const checkConflict = useCallback(
    async (course: Partial<Course>, week: number) => {
      setChecking(true);
      try {
        const result = await scheduleApi.checkConflict(course, week);
        setChecking(false);
        return result;
      } catch (_error) {
        setChecking(false);
        message.error('冲突检测失败');
        return { hasConflicts: false, conflicts: [], recommendations: [] };
      }
    },
    [],
  );

  return {
    checking,
    checkConflict,
  };
};
