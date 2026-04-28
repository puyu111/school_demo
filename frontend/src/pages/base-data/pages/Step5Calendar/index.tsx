/**
 * base-data 模块 - 步骤 5：学期日历
 * 提供学期日期设置、工作日选择、禁用日期管理等功能
 */

import { Button, Checkbox, DatePicker, Divider, Space, Tag } from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';

import {
  CalendarComponent,
  CalendarPageLayout,
} from '../../components/Calendar';
import { useCalendar } from './useCalendar';

/** 组件 Props 接口 */
export interface Step5CalendarProps {
  /** 更新步骤状态回调 */
  onUpdateStatus?: (completed: boolean) => void;
  /** 提交回调 */
  onSubmit?: (data: {
    selected: string[];
    disabled: string[];
    includeWeekends: boolean;
    termStart: Dayjs | null;
    termEnd: Dayjs | null;
  }) => void;
}

/**
 * 学期日历步骤组件
 * 包含日历、日期选择器、操作面板
 */
const Step5Calendar: React.FC<Step5CalendarProps> = ({
  onUpdateStatus,
  onSubmit,
}) => {
  // 使用学期日历 Hook
  const {
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
    handleSubmit: handleCalendarSubmit,
  } = useCalendar({
    initialDisabledDates: ['2026-02-10', '2026-02-11', '2026-03-08'],
    initialIncludeWeekends: true,
  });

  /** 处理提交 */
  const handleSubmit = () => {
    handleCalendarSubmit(onSubmit, onUpdateStatus);
  };

  return (
    <CalendarPageLayout
      title="学期日历"
      initialDisabledDates={['2026-02-10', '2026-02-11', '2026-03-08']}
      initialIncludeWeekends={true}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        {/* 学期日期选择区域 */}
        <div
          style={{
            marginBottom: 16,
            paddingBottom: 16,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space direction="horizontal" size="large">
            <span style={{ fontWeight: 500 }}>学期开始:</span>
            <DatePicker
              value={termStart}
              onChange={(date) => setTermStart(date)}
              showTime
              format="YYYY-MM-DD"
            />
            <span style={{ fontWeight: 500 }}>学期结束:</span>
            <DatePicker
              value={termEnd}
              onChange={(date) => setTermEnd(date)}
              showTime
              format="YYYY-MM-DD"
            />
          </Space>
        </div>

        <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
          {/* 日历组件 */}
          <div style={{ flex: 1 }}>
            <CalendarComponent
              disabledDates={disabledDates}
              disableWeekends={!includeWeekends}
              selectedDates={selectedDates}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* 右侧操作面板 */}
          <div
            style={{
              width: 300,
              paddingLeft: 16,
              borderLeft: '1px solid #f0f0f0',
            }}
          >
            {/* 选中日期列表 */}
            <div style={{ marginBottom: 24 }}>
              <h4>选中日期 ({selectedDates.length})</h4>
              <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                {selectedDates.map((date) => (
                  <Tag
                    key={date}
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      handleRemoveDate(date);
                    }}
                    color={disabledDates.includes(date) ? 'red' : 'blue'}
                  >
                    {date}
                  </Tag>
                ))}
              </div>
              {selectedDates.length === 0 && (
                <p style={{ color: '#ccc' }}>暂无选中日期</p>
              )}
            </div>

            {/* 周末设置 */}
            <div style={{ marginBottom: 24 }}>
              <Checkbox
                checked={!includeWeekends}
                onChange={(e) => setIncludeWeekends(!e.target.checked)}
              >
                禁用周末
              </Checkbox>
            </div>

            {/* 禁用/启用操作按钮 */}
            <div style={{ marginBottom: 24 }}>
              <Button
                type="primary"
                danger
                onClick={handleDisableSelected}
                disabled={selectedDates.length === 0}
                style={{ marginBottom: 8, width: '100%' }}
              >
                禁用选中日期
              </Button>
              <Button
                type="default"
                onClick={handleEnableSelected}
                disabled={
                  selectedDates.filter((d) => disabledDates.includes(d))
                    .length === 0
                }
                style={{ width: '100%' }}
              >
                启用选中日期
              </Button>
            </div>

            {/* 已禁用日期统计 */}
            <div style={{ marginBottom: 24 }}>
              <p>已禁用日期：{disabledDates.length}</p>
            </div>

            <Divider />

            {/* 提交按钮 */}
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              style={{ width: '100%' }}
            >
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </CalendarPageLayout>
  );
};

export default Step5Calendar;
