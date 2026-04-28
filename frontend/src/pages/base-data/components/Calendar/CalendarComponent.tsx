/**
 * base-data 模块 - 日历组件
 * 提供日期选择、禁用日期、节假日标记等功能
 */
//usememo缓存
import { Calendar, type CalendarProps, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { Dayjs } from 'dayjs';
import React from 'react';

/** 组件 Props 接口 */
export interface CalendarComponentProps {
  /** 禁用日期列表（格式：YYYY-MM-DD） */
  disabledDates?: string[];
  /** 节假日列表 */
  holidays?: { date: string; name: string }[];
  /** 是否禁用周末 */
  disableWeekends?: boolean;
  /** 已选中的日期列表 */
  selectedDates?: string[];
  /** 日期选择回调 */
  onDateSelect?: (date: string) => void;
  /** 面板切换回调 */
  onPanelChange?: (date: Dayjs) => void;
}

/**
 * 日历组件
 * 支持日期选择、禁用日期高亮、节假日标记
 */
const CalendarComponent: React.FC<CalendarComponentProps> = ({
  disabledDates = [],
  holidays = [],
  disableWeekends = false,
  selectedDates = [],
  onDateSelect,
  onPanelChange,
}) => {
  /** 处理面板视图切换 */
  const handlePanelChange = (
    value: Dayjs,
    mode: CalendarProps<Dayjs>['mode'],
  ) => {
    console.log(value.format('YYYY-MM-DD'), mode);
    onPanelChange?.(value);
  };

  /** 判断日期是否被禁用 */
  const isDateDisabled = (value: Dayjs) => {
    const d = value.format('YYYY-MM-DD');
    // 在禁用列表中则禁用
    if (disabledDates.includes(d)) return true;
    // 启用周末禁用且是周末则禁用
    if (disableWeekends) {
      const wd = value.day();
      if (wd === 0 || wd === 6) return true;
    }
    return false;
  };

  /** 查找指定日期是否为节假日 */
  const findHoliday = React.useCallback(
    (value: Dayjs) => {
      const d = value.format('YYYY-MM-DD');
      return holidays.find((h) => h.date === d);
    },
    [holidays],
  );

  /** 渲染日期单元格 */
  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const isSelected = selectedDates.includes(dateStr);
    const isWeekend = [0, 6].includes(value.day());
    const isDisabled =
      disabledDates.includes(dateStr) || (disableWeekends && isWeekend);
    const holiday = findHoliday(value);

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
        onClick={() => {
          onDateSelect?.(dateStr);
        }}
      >
        {/* 背景层：根据选中/禁用状态显示不同颜色 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            cursor: 'pointer',
            borderRadius: '4px',
            ...(isSelected && !isDisabled
              ? {
                  backgroundColor: 'rgba(24, 144, 255, 0.2)', // 选中蓝色
                }
              : isSelected && isDisabled
                ? {
                    backgroundColor: 'rgba(255, 100, 100, 0.4)', // 选中但禁用红色
                    border: '2px solid rgba(24, 144, 255, 0.8)',
                  }
                : isDisabled
                  ? {
                      backgroundColor: 'rgba(252, 214, 218, 0.8)', // 禁用粉色
                      opacity: 0.8,
                    }
                  : {}),
          }}
        />
        {/* 节假日标记 */}
        {holiday && (
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              fontSize: '10px',
              color: '#f5222d',
              marginTop: '2px',
            }}
          >
            {holiday.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Calendar
        onPanelChange={handlePanelChange}
        dateCellRender={dateCellRender}
        mode={'month'}
        disabledDate={isDateDisabled}
      />
    </ConfigProvider>
  );
};

export default CalendarComponent;
