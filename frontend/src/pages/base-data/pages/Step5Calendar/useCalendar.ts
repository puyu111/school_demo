/**
 * base-data 模块 - 步骤 5 专用 Hook：学期日历
 * 处理学期日历的日期选择、禁用、学期设置等逻辑
 */

import { message } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useState } from 'react';

/** Hook 返回值接口 */
export interface UseCalendarReturn {
  // 日期状态
  /** 已选中的日期列表 */
  selectedDates: string[];
  /** 已禁用的日期列表 */
  disabledDates: string[];
  /** 是否包含周末 */
  includeWeekends: boolean;
  /** 学期开始日期 */
  termStart: Dayjs | null;
  /** 学期结束日期 */
  termEnd: Dayjs | null;

  // 日期操作方法
  /** 选择/取消选择日期 */
  handleDateSelect: (date: string) => void;
  /** 移除日期 */
  handleRemoveDate: (date: string) => void;
  /** 禁用选中的日期 */
  handleDisableSelected: () => void;
  /** 启用选中的日期 */
  handleEnableSelected: () => void;

  // 学期设置方法
  /** 设置学期开始日期 */
  setTermStart: (date: Dayjs | null) => void;
  /** 设置学期结束日期 */
  setTermEnd: (date: Dayjs | null) => void;
  /** 设置是否包含周末 */
  setIncludeWeekends: (value: boolean) => void;

  // 提交方法
  /** 提交日历设置 */
  handleSubmit: (
    onSubmit?: (data: CalendarSubmitData) => void,
    onUpdateStatus?: (completed: boolean) => void,
  ) => void;
}

/** 提交数据结构 */
export interface CalendarSubmitData {
  /** 选中的日期列表 */
  selected: string[];
  /** 禁用的日期列表 */
  disabled: string[];
  /** 是否包含周末 */
  includeWeekends: boolean;
  /** 学期开始日期 */
  termStart: Dayjs | null;
  /** 学期结束日期 */
  termEnd: Dayjs | null;
}

/** Hook 配置接口 */
export interface UseCalendarConfig {
  /** 初始禁用日期列表 */
  initialDisabledDates?: string[];
  /** 初始是否包含周末 */
  initialIncludeWeekends?: boolean;
}

/**
 * 学期日历 Hook
 * @param config - 配置项
 * @returns 日历状态和操作方法
 */
export function useCalendar({
  initialDisabledDates = [],
  initialIncludeWeekends = true,
}: UseCalendarConfig = {}): UseCalendarReturn {
  // 日期状态
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [disabledDates, setDisabledDates] =
    useState<string[]>(initialDisabledDates);
  const [includeWeekends, setIncludeWeekends] = useState(
    initialIncludeWeekends,
  );
  const [termStart, setTermStart] = useState<Dayjs | null>(null);
  const [termEnd, setTermEnd] = useState<Dayjs | null>(null);

  /** 选择/取消选择日期：切换选中状态 */
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDates((prev) => {
      if (prev.includes(date)) {
        return prev.filter((d) => d !== date); // 取消选中
      } else {
        return [...prev, date].sort(); // 添加选中
      }
    });
  }, []);

  /** 移除日期：从选中列表中删除 */
  const handleRemoveDate = useCallback((date: string) => {
    setSelectedDates((prev) => prev.filter((d) => d !== date));
  }, []);

  /** 禁用选中日期：将选中的日期添加到禁用列表 */
  const handleDisableSelected = useCallback(() => {
    if (selectedDates.length === 0) {
      message.warning('请先选择要禁用的日期');
      return;
    }
    setDisabledDates((prev) => {
      const newDisabled = [...prev, ...selectedDates];
      return [...new Set(newDisabled)].sort(); // 去重并排序
    });
    message.success(`已禁用 ${selectedDates.length} 个选定日期`);
    setSelectedDates([]);
  }, [selectedDates]);

  /** 启用选中日期：从禁用列表中移除选中的日期 */
  const handleEnableSelected = useCallback(() => {
    const selectedDisabledDates = selectedDates.filter((d) =>
      disabledDates.includes(d),
    );
    if (selectedDisabledDates.length === 0) {
      message.warning('选定的日期中没有被禁用的日期');
      return;
    }
    setDisabledDates((prev) =>
      prev.filter((d) => !selectedDisabledDates.includes(d)),
    );
    setSelectedDates([]);
    message.success(`已取消禁用 ${selectedDisabledDates.length} 个日期`);
  }, [selectedDates, disabledDates]);

  /** 提交：验证学期日期并调用回调 */
  const handleSubmit = useCallback(
    (
      onSubmit?: (data: CalendarSubmitData) => void,
      onUpdateStatus?: (completed: boolean) => void,
    ) => {
      if (!termStart || !termEnd) {
        message.warning('请先选择学期开始和结束日期');
        return;
      }

      onSubmit?.({
        selected: selectedDates,
        disabled: disabledDates,
        includeWeekends,
        termStart,
        termEnd,
      });
      onUpdateStatus?.(true);
      message.success('学期日历设置已保存！');
    },
    [selectedDates, disabledDates, includeWeekends, termStart, termEnd],
  );

  return {
    selectedDates,
    disabledDates,
    includeWeekends,
    termStart,
    termEnd,
    handleDateSelect,
    handleRemoveDate,
    handleDisableSelected,
    handleEnableSelected,
    setTermStart,
    setTermEnd,
    setIncludeWeekends,
    handleSubmit,
  };
}
