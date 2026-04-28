import type { CalendarProps } from 'antd';
import { Calendar, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { Dayjs } from 'dayjs';
import React from 'react';
import type { Holiday } from './constants';

export interface CalendarComponentProps {
  disabledDates?: string[]; // YYYY-MM-DD
  holidays?: Holiday[];
  disableWeekends?: boolean;
  selectedDates?: string[]; // 多选日期，格式 YYYY-MM-DD
  onDateSelect?: (date: string) => void; // 单个日期点击回调
  onPanelChange?: (date: Dayjs) => void; // 日历面板变化回调
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  disabledDates = [],
  holidays = [],
  disableWeekends = false,
  selectedDates = [],
  onDateSelect,
  onPanelChange,
}) => {
  const handlePanelChange = (
    value: Dayjs,
    mode: CalendarProps<Dayjs>['mode'],
  ) => {
    console.log(value.format('YYYY-MM-DD'), mode);
    onPanelChange?.(value);
  };

  const findHoliday = React.useCallback(
    (value: Dayjs) => {
      const d = value.format('YYYY-MM-DD');
      return holidays.find((h) => h.date === d);
    },
    [holidays],
  );

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
        {/* 覆盖层用于显示选中和禁用状态，但位于日期数字下方 */}
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
                  backgroundColor: 'rgba(24, 144, 255, 0.2)',
                }
              : isSelected && isDisabled
                ? {
                    backgroundColor: 'rgba(255, 100, 100, 0.4)',
                    border: '2px solid rgba(24, 144, 255, 0.8)',
                  }
                : isDisabled
                  ? {
                      backgroundColor: 'rgba(252, 214, 218, 0.8)',
                      opacity: 0.8,
                    }
                  : {}),
          }}
        />
        {/* 节假日标签显示在最顶层 */}
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
        disabledDate={(_date) => {
          return false;
        }}
      />
    </ConfigProvider>
  );
};

export default CalendarComponent;
