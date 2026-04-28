import { DownOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import React from 'react';
import type { WeekSelectorProps } from '../types';

const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  totalWeeks,
  onWeekChange,
  isMobile: isMobileProp = false,
}) => {
  const weekOptions = Array.from({ length: totalWeeks }, (_, i) => ({
    value: i + 1,
    label: `第${i + 1}周`,
  }));

  const isMobileDetected =
    isMobileProp ||
    (typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent,
      ));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobileDetected ? 12 : 8,
        flexShrink: 0,
      }}
    >
      <LeftOutlined
        onClick={() => currentWeek > 1 && onWeekChange(currentWeek - 1)}
        style={{
          cursor: currentWeek > 1 ? 'pointer' : 'not-allowed',
          color: currentWeek > 1 ? '#1890ff' : '#d9d9d9',
          fontSize: isMobileDetected ? 20 : 16,
          padding: isMobileDetected ? 8 : 4,
          minHeight: 44,
          minWidth: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor:
            currentWeek > 1 ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
        }}
      />

      <Select
        value={currentWeek}
        onChange={onWeekChange}
        options={weekOptions}
        size={isMobileDetected ? 'large' : 'small'}
        style={{
          width: isMobileDetected ? 120 : 100,
          fontSize: isMobileDetected ? 16 : 14,
        }}
        suffixIcon={<DownOutlined />}
      />

      <RightOutlined
        onClick={() =>
          currentWeek < totalWeeks && onWeekChange(currentWeek + 1)
        }
        style={{
          cursor: currentWeek < totalWeeks ? 'pointer' : 'not-allowed',
          color: currentWeek < totalWeeks ? '#1890ff' : '#d9d9d9',
          fontSize: isMobileDetected ? 20 : 16,
          padding: isMobileDetected ? 8 : 4,
          minHeight: 44,
          minWidth: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor:
            currentWeek < totalWeeks
              ? 'rgba(24, 144, 255, 0.1)'
              : 'transparent',
        }}
      />
    </div>
  );
};

export default WeekSelector;
