import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, message, Space, Switch, Tag } from 'antd';
import React, { useState } from 'react';

// 星期配置接口
export interface WeekDayConfig {
  id: number;
  name: string;
  isEnabled: boolean; // 是否启用该天
  isSchedulable: boolean; // 是否可排课
}

interface WeekDayConfigPanelProps {
  config: WeekDayConfig[];
  onChange: (config: WeekDayConfig[]) => void;
}

const defaultWeekDays: WeekDayConfig[] = [
  { id: 1, name: '周一', isEnabled: true, isSchedulable: true },
  { id: 2, name: '周二', isEnabled: true, isSchedulable: true },
  { id: 3, name: '周三', isEnabled: true, isSchedulable: true },
  { id: 4, name: '周四', isEnabled: true, isSchedulable: true },
  { id: 5, name: '周五', isEnabled: true, isSchedulable: true },
  { id: 6, name: '周六', isEnabled: false, isSchedulable: false },
  { id: 7, name: '周日', isEnabled: false, isSchedulable: false },
];

const WeekDayConfigPanel: React.FC<WeekDayConfigPanelProps> = ({
  config,
  onChange,
}) => {
  const [weekDays, setWeekDays] = useState<WeekDayConfig[]>(
    config.length > 0 ? config : defaultWeekDays,
  );

  // 切换启用状态
  const toggleEnabled = (id: number) => {
    const newWeekDays = weekDays.map((day) => {
      if (day.id === id) {
        const newEnabled = !day.isEnabled;
        return {
          ...day,
          isEnabled: newEnabled,
          isSchedulable: newEnabled ? day.isSchedulable : false,
        };
      }
      return day;
    });
    setWeekDays(newWeekDays);
    onChange(newWeekDays);

    const day = weekDays.find((d) => d.id === id);
    message.success(
      `${day?.name}已${newWeekDays.find((d) => d.id === id)?.isEnabled ? '启用' : '禁用'}`,
    );
  };

  // 切换可排课状态
  const toggleSchedulable = (id: number) => {
    const newWeekDays = weekDays.map((day) => {
      if (day.id === id) {
        return { ...day, isSchedulable: !day.isSchedulable };
      }
      return day;
    });
    setWeekDays(newWeekDays);
    onChange(newWeekDays);
  };

  // 批量设置工作日
  const setWorkDays = () => {
    const newWeekDays = weekDays.map((day) => ({
      ...day,
      isEnabled: day.id <= 5,
      isSchedulable: day.id <= 5,
    }));
    setWeekDays(newWeekDays);
    onChange(newWeekDays);
    message.success('已设置为工作日模式（周一至周五）');
  };

  // 批量设置全周
  const setAllWeek = () => {
    const newWeekDays = weekDays.map((day) => ({
      ...day,
      isEnabled: true,
      isSchedulable: true,
    }));
    setWeekDays(newWeekDays);
    onChange(newWeekDays);
    message.success('已设置为全周模式（周一至周日）');
  };

  // 重置为默认
  const handleReset = () => {
    setWeekDays(defaultWeekDays);
    onChange(defaultWeekDays);
    message.success('已重置为默认配置');
  };

  const schedulableCount = weekDays.filter((d) => d.isSchedulable).length;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined />
          <span>星期配置</span>
        </div>
      }
      size="small"
      style={{ marginBottom: 16 }}
      extra={
        <Space size="small">
          <Button size="small" onClick={setWorkDays}>
            工作日
          </Button>
          <Button size="small" onClick={setAllWeek}>
            全周
          </Button>
          <Button size="small" onClick={handleReset}>
            重置
          </Button>
        </Space>
      }
    >
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {weekDays.map((day) => (
          <div
            key={day.id}
            style={{
              width: 140,
              padding: '12px',
              border: `1px solid ${day.isEnabled ? '#d9f7be' : '#ffccc7'}`,
              borderRadius: 8,
              backgroundColor: day.isEnabled ? '#f6ffed' : '#fff1f0',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14 }}>{day.name}</span>
              {day.isEnabled ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: '#666' }}>启用</span>
                <Switch
                  size="small"
                  checked={day.isEnabled}
                  onChange={() => toggleEnabled(day.id)}
                  checkedChildren="开"
                  unCheckedChildren="关"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: '#666' }}>可排课</span>
                <Switch
                  size="small"
                  checked={day.isSchedulable}
                  onChange={() => toggleSchedulable(day.id)}
                  disabled={!day.isEnabled}
                  checkedChildren="可排"
                  unCheckedChildren="禁排"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider style={{ margin: '12px 0 8px' }} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: '#666',
        }}
      >
        <span>
          已启用：{weekDays.filter((d) => d.isEnabled).length} /{' '}
          {weekDays.length} 天
        </span>
        <Space>
          <Tag color="green">可排课：{schedulableCount} 天</Tag>
          <Tag color="red">
            禁排课：{weekDays.filter((d) => !d.isSchedulable).length} 天
          </Tag>
        </Space>
      </div>
    </Card>
  );
};

export default WeekDayConfigPanel;
