/**
 * 智能排课系统 - 数据管理 Hook
 * 改造：数据源从 Mock 改为后端 API
 */

import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
  autoArrange,
  clearAllSchedules,
  getClasses,
  getCourses,
  getSchedules,
  getTeachers,
  removeSchedule,
  saveSchedule,
} from '../services';
import { generateEmptySchedule, mockData } from '../utils/mockData';
import {
  checkTimeConflict,
  generateCourseColor,
  recommendTimeSlots,
} from '../utils/scheduleUtils';

export const useScheduleData = () => {
  // ==================== 状态 ====================

  const [schedule, setSchedule] = useState(generateEmptySchedule());
  const [pendingCourses, setPendingCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // 加载状态
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 是否为演示模式（后端不可用时）
  const [isDemoMode, setIsDemoMode] = useState(false);

  // ==================== 数据加载 ====================

  /**
   * 初始化加载数据
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 并行请求基础数据
      const [coursesRes, teachersRes, classesRes, schedulesRes] =
        await Promise.all([
          getCourses(),
          getTeachers(),
          getClasses(),
          getSchedules(),
        ]);

      // 检查是否有请求失败（后端不存在时返回 undefined 或 success: false）
      const hasError = [coursesRes, teachersRes, classesRes].some(
        (res) => !res || !res.success,
      );

      if (hasError) {
        // 后端服务不可用，使用降级方案
        console.warn('后端服务不可用，切换至演示模式');
        setError(new Error('Backend unavailable'));
        setIsDemoMode(true);
        setPendingCourses(mockData.pendingCourses);
        setTeachers(mockData.teachers);
        setClasses(mockData.classes);
        setSchedule(generateEmptySchedule());
      } else {
        // 处理响应
        setPendingCourses(coursesRes.data || []);
        setTeachers(teachersRes.data || []);
        setClasses(classesRes.data || []);

        if (schedulesRes?.data) {
          const formattedSchedule = formatScheduleData(schedulesRes.data);
          setSchedule(formattedSchedule);
        }
      }
    } catch (err) {
      console.error('数据加载失败:', err);
      setError(err);

      // 降级方案：使用 Mock 数据
      message.warning('后端服务不可用，已切换至演示模式');
      setPendingCourses(mockData.pendingCourses);
      setTeachers(mockData.teachers);
      setClasses(mockData.classes);
      setSchedule(generateEmptySchedule());
    } finally {
      setLoading(false);
    }
  }, []);

  // 组件加载时初始化数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== 工具函数 ====================

  /**
   * 将扁平的排课记录转换为嵌套结构
   */
  const formatScheduleData = (schedules) => {
    const formatted = {};
    mockData.weekDays.forEach((day) => {
      formatted[day.value] = {};
      mockData.timeSlots.forEach((slot) => {
        formatted[day.value][slot.id] = [];
      });
    });

    schedules.forEach((item) => {
      if (formatted[item.day]?.[item.slot]) {
        formatted[item.day][item.slot].push({
          ...item,
          color: generateCourseColor(item.courseId),
        });
      }
    });

    return formatted;
  };

  // ==================== 排课操作 ====================

  /**
   * 添加排课记录
   */
  const addCourseToSchedule = useCallback(
    async (course, day, slot) => {
      // 1. 前端冲突检测（即时提示）
      const conflicts = checkTimeConflict(schedule, course, day, slot);
      if (conflicts.length > 0) {
        setConflicts(conflicts);
        message.error(conflicts[0]);
        return false;
      }

      // 2. 演示模式下直接更新本地状态，不调用后端
      if (isDemoMode) {
        const newSchedule = { ...schedule };
        const courseWithDetails = {
          ...course,
          color: generateCourseColor(course.id),
          day,
          slot,
        };

        for (let i = 0; i < course.duration; i++) {
          const currentSlot = parseInt(slot, 10) + i;
          if (!newSchedule[day][currentSlot]) {
            newSchedule[day][currentSlot] = [];
          }
          newSchedule[day][currentSlot].push(courseWithDetails);
        }

        setSchedule(newSchedule);
        setConflicts([]);
        setPendingCourses((prev) => prev.filter((c) => c.id !== course.id));

        // 添加历史记录
        setHistory((prev) => [
          {
            id: Date.now(),
            courseId: course.id,
            courseName: course.name,
            day,
            slot,
            teacher: course.teacherName,
            className: course.className,
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);

        message.success('保存成功（演示模式）');
        return true;
      }

      // 3. 正式模式：调用后端保存
      try {
        const res = await saveSchedule({
          courseId: course.id,
          day,
          slot,
        });

        if (res.success) {
          // 更新本地状态（逻辑同上）
          const newSchedule = { ...schedule };
          const courseWithDetails = {
            ...course,
            color: generateCourseColor(course.id),
            day,
            slot,
          };

          for (let i = 0; i < course.duration; i++) {
            const currentSlot = parseInt(slot, 10) + i;
            if (!newSchedule[day][currentSlot]) {
              newSchedule[day][currentSlot] = [];
            }
            newSchedule[day][currentSlot].push(courseWithDetails);
          }

          setSchedule(newSchedule);
          setConflicts([]);
          setPendingCourses((prev) => prev.filter((c) => c.id !== course.id));

          setHistory((prev) => [
            {
              id: Date.now(),
              courseId: course.id,
              courseName: course.name,
              day,
              slot,
              teacher: course.teacherName,
              className: course.className,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);

          message.success('保存成功');
          return true;
        } else {
          message.error(res.message || '保存失败');
          return false;
        }
      } catch (_err) {
        message.error('网络请求失败');
        return false;
      }
    },
    [schedule, isDemoMode],
  );

  /**
   * 删除排课记录
   */
  const removeCourseFromSchedule = useCallback(
    async (courseId, scheduleId) => {
      // 演示模式下直接更新本地状态
      if (isDemoMode) {
        const newSchedule = { ...schedule };
        let removedCourse = null;

        Object.keys(newSchedule).forEach((day) => {
          Object.keys(newSchedule[day]).forEach((slot) => {
            newSchedule[day][slot] = newSchedule[day][slot].filter((course) => {
              if (course.id === courseId) {
                removedCourse = course;
                return false;
              }
              return true;
            });
          });
        });

        if (removedCourse) {
          setSchedule(newSchedule);
          setPendingCourses((prev) => [
            ...prev,
            { ...removedCourse, color: undefined },
          ]);

          setHistory((prev) => [
            {
              id: Date.now(),
              courseId: removedCourse.id,
              courseName: removedCourse.name,
              action: 'removed',
              teacher: removedCourse.teacherName,
              className: removedCourse.className,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);

          message.success('已撤销（演示模式）');
        }
        return;
      }

      // 正式模式：调用后端删除
      try {
        if (scheduleId) {
          await removeSchedule(scheduleId);
        }

        // 更新本地状态
        const newSchedule = { ...schedule };
        let removedCourse = null;

        Object.keys(newSchedule).forEach((day) => {
          Object.keys(newSchedule[day]).forEach((slot) => {
            newSchedule[day][slot] = newSchedule[day][slot].filter((course) => {
              if (course.id === courseId) {
                removedCourse = course;
                return false;
              }
              return true;
            });
          });
        });

        if (removedCourse) {
          setSchedule(newSchedule);
          setPendingCourses((prev) => [
            ...prev,
            { ...removedCourse, color: undefined },
          ]);

          setHistory((prev) => [
            {
              id: Date.now(),
              courseId: removedCourse.id,
              courseName: removedCourse.name,
              action: 'removed',
              teacher: removedCourse.teacherName,
              className: removedCourse.className,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);

          message.success('已撤销');
        }
      } catch (_err) {
        message.error('删除失败');
      }
    },
    [schedule, isDemoMode],
  );

  /**
   * 一键智能排课
   */
  const autoSchedule = useCallback(async () => {
    // 演示模式下使用前端智能排课
    if (isDemoMode) {
      const newSchedule = { ...schedule };
      const coursesToSchedule = [...pendingCourses];
      const failed = [];
      let scheduledCount = 0;

      // 简单的贪心算法：按优先级排序，依次尝试安排
      coursesToSchedule.sort((a, b) => a.priority - b.priority);

      for (const course of coursesToSchedule) {
        let scheduled = false;
        // 尝试所有时间段
        for (const day of mockData.weekDays) {
          if (scheduled) break;
          for (const slot of mockData.timeSlots) {
            const conflicts = checkTimeConflict(
              newSchedule,
              course,
              day.value,
              slot.id,
            );
            if (conflicts.length === 0) {
              // 可以安排
              const courseWithDetails = {
                ...course,
                color: generateCourseColor(course.id),
                day: day.value,
                slot: slot.id,
              };

              for (let i = 0; i < course.duration; i++) {
                const currentSlot = slot.id + i;
                if (!newSchedule[day.value][currentSlot]) {
                  newSchedule[day.value][currentSlot] = [];
                }
                newSchedule[day.value][currentSlot].push(courseWithDetails);
              }

              scheduledCount++;
              scheduled = true;
              break;
            }
          }
        }

        if (!scheduled) {
          failed.push({ course, reason: '无可用时间段' });
        }
      }

      setSchedule(newSchedule);
      setPendingCourses(failed.map((f) => f.course));

      message.success(
        `自动排课完成：成功 ${scheduledCount} 门，失败 ${failed.length} 门`,
      );
      return { scheduled: scheduledCount, failed: failed.length };
    }

    // 正式模式：调用后端 API
    try {
      const res = await autoArrange({ strategy: 'priority' });

      if (res.success) {
        const { scheduled, failed, stats } = res.data;

        const newSchedule = { ...schedule };
        scheduled.forEach((item) => {
          if (!newSchedule[item.day][item.slot]) {
            newSchedule[item.day][item.slot] = [];
          }
          newSchedule[item.day][item.slot].push({
            ...item,
            color: generateCourseColor(item.courseId),
          });
        });

        setSchedule(newSchedule);
        setPendingCourses(failed.map((f) => f.course));

        message.success(
          `自动排课完成：成功 ${stats.scheduled} 门，失败 ${stats.failed} 门`,
        );
        return { scheduled: stats.scheduled, failed: stats.failed };
      } else {
        message.error(res.message || '自动排课失败');
        return { scheduled: 0, failed: 0 };
      }
    } catch (_err) {
      message.error('自动排课失败');
      return { scheduled: 0, failed: 0 };
    }
  }, [schedule, pendingCourses, isDemoMode]);

  /**
   * 清空所有排课
   */
  const clearAllSchedule = useCallback(async () => {
    if (isDemoMode) {
      setSchedule(generateEmptySchedule());
      setHistory([]);
      message.success('已清空（演示模式）');
      return;
    }

    try {
      await clearAllSchedules();
      setSchedule(generateEmptySchedule());
      await loadData();
      setHistory([]);
      message.success('已清空');
    } catch (_err) {
      message.error('清空失败');
    }
  }, [loadData, isDemoMode]);

  /**
   * 重置数据（保留用于开发调试）
   */
  const resetData = useCallback(() => {
    setSchedule(generateEmptySchedule());
    setPendingCourses([...mockData.pendingCourses]);
    setHistory([]);
    setRecommendations([]);
    message.success('已重置为演示数据');
  }, []);

  /**
   * 选中课程并获取推荐
   */
  const handleSelectCourse = useCallback(
    (course) => {
      setSelectedCourse(course);
      // 使用前端推荐（即时响应）
      const recs = recommendTimeSlots(course, schedule);
      setRecommendations(recs);
    },
    [schedule],
  );

  // ==================== 导出 ====================

  return {
    // 数据
    schedule,
    pendingCourses,
    teachers,
    classes,
    selectedCourse,
    conflicts,
    history,
    recommendations,
    mockData,

    // 状态
    loading,
    error,
    isDemoMode,

    // 方法
    loadData,
    setSelectedCourse: handleSelectCourse,
    addCourseToSchedule,
    removeCourseFromSchedule,
    autoSchedule,
    clearAllSchedule,
    resetData,
    setConflicts,
  };
};
