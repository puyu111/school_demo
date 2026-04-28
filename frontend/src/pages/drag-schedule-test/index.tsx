import { useRequest } from '@umijs/max';
import { Alert, Modal, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ScheduleTable from './components/ScheduleTable';
import ScheduleToolbar from './components/ScheduleToolbar';
import TimeSlotConfigPanel from './components/TimeSlotConfigPanel';
import WeekDayConfigPanel from './components/WeekDayConfigPanel';
import {
  DEFAULT_HALF_DAY_CONFIG,
  defaultDailyConfig,
  defaultWeekDays,
  generateDefaultTimeSlots,
  generateMockCourses,
  TOTAL_WEEKS,
} from './constants';
import * as scheduleApi from './service';
import type {
  Course,
  DailyScheduleConfig,
  HalfDayConfig,
  TimeSlotConfig,
  WeekDayConfig,
} from './types';

const DragScheduleTest: React.FC = () => {
  // 课程数据（本地状态 + 接口数据）
  const [localCourses, setLocalCourses] = useState<Course[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  // 配置数据
  const [timeSlots, setTimeSlots] = useState<TimeSlotConfig[]>(
    generateDefaultTimeSlots,
  );
  const [weekDays, setWeekDays] = useState<WeekDayConfig[]>(defaultWeekDays);
  const [dailyConfig, setDailyConfig] =
    useState<DailyScheduleConfig>(defaultDailyConfig);
  const [halfDayConfig, setHalfDayConfig] = useState<HalfDayConfig[]>(
    DEFAULT_HALF_DAY_CONFIG,
  );

  // 原始数据（用于撤销）
  const [originalCourses, setOriginalCourses] = useState<Course[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 加载状态
  const [loading, setLoading] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  // 检测是否为移动设备
  const isMobileDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent,
    );
  }, []);

  // 获取课程数据 - 使用 umi useRequest
  const { data: apiCoursesData, run } = useRequest(
    (week: number) => scheduleApi.getCourses({ week }),
    {
      ready: false, // 初始不自动请求，手动触发
      formatResult: (res) => res.data,
      manual: true,
      onError: (err) => {
        console.error('获取课程失败:', err);
        message.error('获取课程数据失败，使用模拟数据');
      },
    },
  );

  // 包装后的 loadCourses，支持传入周次参数
  const loadCourses = useCallback(
    (week: number) => {
      run(week);
    },
    [run],
  );

  // 获取配置数据
  const { data: apiConfigData, refresh: refreshConfigs } = useRequest(
    () => scheduleApi.getTimeSlots(),
    {
      formatResult: (res) => res.data,
      onError: (err) => {
        console.error('获取配置失败:', err);
      },
    },
  );

  // 初始化加载数据
  useEffect(() => {
    // 初始使用模拟数据，后续可以切换到接口数据
    const mockCourses = generateMockCourses();
    setLocalCourses(mockCourses);
    setOriginalCourses(mockCourses);

    // 如果有接口数据，使用接口数据
    if (apiCoursesData) {
      setLocalCourses(apiCoursesData);
      setOriginalCourses(apiCoursesData);
    }

    if (apiConfigData) {
      setTimeSlots(apiConfigData.timeSlots || generateDefaultTimeSlots());
      setDailyConfig(apiConfigData.dailyConfig || defaultDailyConfig);
      setHalfDayConfig(apiConfigData.halfDayConfigs || DEFAULT_HALF_DAY_CONFIG);
    }
  }, []);

  // 周次切换时加载对应周的课程
  useEffect(() => {
    if (currentWeek > 0) {
      loadCourses(currentWeek);
    }
  }, [currentWeek]);

  // 使用接口数据或本地数据
  const courses = useMemo(() => {
    return apiCoursesData || localCourses;
  }, [apiCoursesData, localCourses]);

  // 当前周的课程数据
  const currentWeekCourses = useMemo(() => {
    return courses.filter((course) => course.weeks.includes(currentWeek));
  }, [courses, currentWeek]);

  // 处理周次切换
  const handleWeekChange = useCallback((week: number) => {
    setCurrentWeek(week);
  }, []);

  // 处理课程数据更新（本地更新 + 可选 API 提交）
  const handleCourseUpdate = useCallback(
    async (updatedCourses: Course[]) => {
      const otherWeekCourses = courses.filter(
        (c) => !c.weeks.includes(currentWeek),
      );
      const newAllCourses = [...otherWeekCourses, ...updatedCourses];

      setLocalCourses(newAllCourses);
      setOriginalCourses(newAllCourses);
      setHasUnsavedChanges(false);

      // 可选：提交到后端
      // try {
      //   await scheduleApi.saveWeekSchedule({
      //     week: currentWeek,
      //     courses: updatedCourses,
      //   });
      //   message.success('课程数据已保存到服务器');
      // } catch (err) {
      //   console.error('保存失败:', err);
      // }

      console.log(`第${currentWeek}周课程数据已更新:`, updatedCourses);
    },
    [courses, currentWeek],
  );

  // 处理时段配置变更
  const handleTimeSlotConfigChange = useCallback(
    (
      newTimeSlots: TimeSlotConfig[],
      newDailyConfig: DailyScheduleConfig,
      newHalfDayConfig: HalfDayConfig[],
    ) => {
      setTimeSlots(newTimeSlots);
      setDailyConfig(newDailyConfig);
      setHalfDayConfig(newHalfDayConfig);
      setHasUnsavedChanges(true);
    },
    [],
  );

  // 处理星期配置变更
  const handleWeekDayConfigChange = useCallback(
    (newWeekDays: WeekDayConfig[]) => {
      setWeekDays(newWeekDays);
      setHasUnsavedChanges(true);
    },
    [],
  );

  // 撤销操作
  const handleUndo = () => {
    Modal.confirm({
      title: '确认撤销',
      content: `确定要撤销第${currentWeek}周的所有未保存更改吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setLocalCourses(originalCourses);
        setHasUnsavedChanges(false);
        message.success('已撤销所有未保存的更改');
      },
    });
  };

  // 保存更改 - 调用后端 API
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.saveWeekSchedule({
        week: currentWeek,
        courses: currentWeekCourses,
        timeSlots,
        weekDays,
        dailyConfig,
        halfDayConfig,
      });

      setOriginalCourses(courses);
      setHasUnsavedChanges(false);
      message.success(res.data?.message || `第${currentWeek}周课表数据已保存`);
      console.log('保存的数据:', {
        week: currentWeek,
        courses: currentWeekCourses,
        timeSlots,
        weekDays,
        dailyConfig,
        halfDayConfig,
      });
    } catch (err: any) {
      console.error('保存失败:', err);
      message.error('保存失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据 - 从后端重新加载
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // 刷新课程数据
      loadCourses(currentWeek);
      // 刷新配置数据
      refreshConfigs();

      message.success('数据已刷新');
    } catch (err: any) {
      console.error('刷新失败:', err);
      message.error('刷新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f0f2f5',
          padding: isMobileDevice ? '12px 8px' : '24px',
        }}
      >
        {/* 顶部工具栏 */}
        <ScheduleToolbar
          currentWeek={currentWeek}
          totalWeeks={TOTAL_WEEKS}
          hasUnsavedChanges={hasUnsavedChanges}
          loading={loading}
          showConfigPanel={showConfigPanel}
          onWeekChange={handleWeekChange}
          onToggleConfigPanel={() => setShowConfigPanel(!showConfigPanel)}
          onUndo={handleUndo}
          onRefresh={handleRefresh}
          onSave={handleSave}
          isMobile={isMobileDevice}
        />

        {/* 配置面板 */}
        {showConfigPanel && (
          <>
            <TimeSlotConfigPanel
              config={timeSlots}
              dailyConfig={dailyConfig}
              halfDayConfig={halfDayConfig}
              onChange={handleTimeSlotConfigChange}
            />

            <WeekDayConfigPanel
              config={weekDays}
              onChange={handleWeekDayConfigChange}
            />
          </>
        )}

        {/* 提示信息 */}
        <Alert
          message="使用说明"
          description={
            <div style={{ fontSize: isMobileDevice ? 12 : 13 }}>
              <ul style={{ margin: 0, paddingLeft: isMobileDevice ? 16 : 20 }}>
                <li>使用周次选择器切换不同周次，或点击左右箭头快速切换</li>
                <li>拖拽课程卡片到不同的时间段或星期，松开鼠标即可完成调整</li>
                <li>
                  灰色背景表示不可排课的时段或星期，课程无法拖拽到这些位置
                </li>
                <li>跨时段的课程会自动占据多个单元格，显示为"课程延续"</li>
                <li>在时段配置中可以设置每节课的时长、休息时间和可排课状态</li>
                <li>修改配置后请点击"保存"按钮提交更改</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: isMobileDevice ? 10 : 16 }}
        />

        {/* 课表主体 */}
        <ScheduleTable
          courses={courses}
          timeSlots={timeSlots}
          weekDays={weekDays}
          halfDayConfigs={halfDayConfig}
          currentWeek={currentWeek}
          totalWeeks={TOTAL_WEEKS}
          onCourseUpdate={handleCourseUpdate}
          onWeekChange={handleWeekChange}
        />
      </div>
    </DndProvider>
  );
};

export default DragScheduleTest;
