import { DatePicker, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';

export interface DateRangePanelProps {
  termStart: Dayjs | null;
  termEnd: Dayjs | null;
  onTermStartChange: (date: Dayjs | null) => void;
  onTermEndChange: (date: Dayjs | null) => void;
}

const DateRangePanel: React.FC<DateRangePanelProps> = ({
  termStart,
  termEnd,
  onTermStartChange,
  onTermEndChange,
}) => {
  return (
    <div style={{ marginTop: 16 }}>
      <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <span>学期开始:</span>
        <DatePicker value={termStart} onChange={onTermStartChange} />
        <span style={{ marginLeft: 16 }}>学期结束:</span>
        <DatePicker value={termEnd} onChange={onTermEndChange} />
      </Space>
    </div>
  );
};

export default DateRangePanel;
