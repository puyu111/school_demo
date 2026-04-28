import { DatePicker, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';
import { MONTH_OPTIONS, QUARTER_OPTIONS } from '../constants';

interface DateSelectorProps {
  selectionType: 'single' | 'week' | 'month' | 'quarter' | 'range';
  selectedDate: Dayjs | null;
  dateRange: [Dayjs | null, Dayjs | null];
  selectedWeek: string;
  selectedMonth: string;
  selectedQuarter: string;
  disabledDate?: (current: Dayjs) => boolean;
  weeks?: Array<{ label: string; value: string }>;
  onChange: (type: string, value: any) => void;
}

/**
 * 日期选择器组件 - 根据类型渲染不同的选择器
 */
const DateSelector: React.FC<DateSelectorProps> = ({
  selectionType,
  selectedDate,
  dateRange,
  selectedWeek,
  selectedMonth,
  selectedQuarter,
  disabledDate,
  weeks,
  onChange,
}) => {
  switch (selectionType) {
    case 'single':
      return (
        <DatePicker
          value={selectedDate}
          onChange={(date) => onChange('date', date)}
          placeholder="选择不可排日期"
          style={{ width: 200 }}
          disabledDate={disabledDate}
        />
      );

    case 'week':
      return (
        <Select
          value={selectedWeek}
          onChange={(value) => onChange('week', value)}
          placeholder="选择周"
          style={{ width: 250 }}
          options={weeks}
          showSearch
          optionFilterProp="label"
        />
      );

    case 'month':
      return (
        <Select
          value={selectedMonth}
          onChange={(value) => onChange('month', value)}
          placeholder="选择月份"
          style={{ width: 200 }}
          options={MONTH_OPTIONS}
        />
      );

    case 'quarter':
      return (
        <Select
          value={selectedQuarter}
          onChange={(value) => onChange('quarter', value)}
          placeholder="选择季度"
          style={{ width: 200 }}
          options={QUARTER_OPTIONS}
        />
      );

    case 'range':
      return (
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) => onChange('range', dates)}
          style={{ width: 320 }}
          disabledDate={disabledDate}
        />
      );

    default:
      return null;
  }
};

export default DateSelector;
