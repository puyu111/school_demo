/**
 * base-data 模块 - 日历选项面板组件
 * 提供日期管理、周末设置、禁用/启用操作等功能
 */

import { Button, Checkbox, Divider, Tag } from 'antd';
import React from 'react';

/** 组件 Props 接口 */
export interface CalendarOptionsPanelProps {
  /** 已选中的日期列表 */
  selectedDates: string[];
  /** 已禁用的日期列表 */
  disabledDates: string[];
  /** 是否包含周末（false 表示禁用周末） */
  includeWeekends: boolean;
  /** 周末设置变更回调 */
  onIncludeWeekendsChange: (checked: boolean) => void;
  /** 移除日期回调 */
  onRemoveDate: (date: string) => void;
  /** 禁用选中日期回调 */
  onDisableSelected: () => void;
  /** 启用选中日期回调 */
  onEnableSelected: () => void;
  /** 提交回调 */
  onSubmit: () => void;
}

/**
 * 日历选项面板组件
 * 显示选中的日期、提供禁用/启用操作按钮
 */
const CalendarOptionsPanel: React.FC<CalendarOptionsPanelProps> = ({
  selectedDates,
  disabledDates,
  includeWeekends,
  onIncludeWeekendsChange,
  onRemoveDate,
  onDisableSelected,
  onEnableSelected,
  onSubmit,
}) => {
  return (
    <div
      style={{ width: 300, paddingLeft: 16, borderLeft: '1px solid #f0f0f0' }}
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
                onRemoveDate(date);
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
          onChange={(e) => onIncludeWeekendsChange(!e.target.checked)}
        >
          禁用周末
        </Checkbox>
      </div>

      {/* 禁用/启用操作按钮 */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          danger
          onClick={onDisableSelected}
          disabled={selectedDates.length === 0}
          style={{ marginBottom: 8, width: '100%' }}
        >
          禁用选中日期
        </Button>
        <Button
          type="default"
          onClick={onEnableSelected}
          disabled={
            selectedDates.filter((d) => disabledDates.includes(d)).length === 0
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
        onClick={onSubmit}
        style={{ width: '100%' }}
      >
        保存设置
      </Button>
    </div>
  );
};

export default CalendarOptionsPanel;
