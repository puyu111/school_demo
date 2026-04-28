import { ClockCircleOutlined, SettingOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  message,
  Switch,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';

// 课时配置接口
export interface TimeSlotConfig {
  id: string;
  label: string; // 节次标签，如"第 1 节"
  startTime: string; // 开始时间，如"08:00"
  endTime: string; // 结束时间，如"08:45"
  duration: number; // 时长（分钟）
  halfDayType: HalfDayType; // 所属半天类型
  isBreak: boolean; // 是否为休息时段
  breakAfter?: number; // 课后休息时长（分钟）
  isSchedulable: boolean; // 是否可排课
}

// 半天时段类型
export type HalfDayType = 'morning' | 'afternoon' | 'evening';

// 半天时段配置
export interface HalfDayConfig {
  type: HalfDayType;
  name: string;
  startTime: string; // 半天开始时间
  endTime: string; // 半天结束时间
  isSchedulable: boolean; // 是否可排课
}

// 每日节数配置接口
export interface DailyScheduleConfig {
  totalPeriods: number; // 每日总节数
  defaultDuration: number; // 默认每节课时长（分钟）
  defaultBreakDuration: number; // 默认课间休息时长（分钟）
}

interface TimeSlotConfigPanelProps {
  config: TimeSlotConfig[];
  dailyConfig: DailyScheduleConfig;
  halfDayConfig: HalfDayConfig[];
  onChange: (
    config: TimeSlotConfig[],
    dailyConfig: DailyScheduleConfig,
    halfDayConfig: HalfDayConfig[],
  ) => void;
}

// 时间字符串转分钟数
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 分钟数转时间字符串
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// 获取时间所属的半天类型
const getHalfDayType = (time: string): HalfDayType => {
  const minutes = timeToMinutes(time);
  if (minutes < timeToMinutes('12:00')) return 'morning';
  if (minutes >= timeToMinutes('14:00') && minutes < timeToMinutes('18:00'))
    return 'afternoon';
  if (minutes >= timeToMinutes('19:00')) return 'evening';
  return 'morning';
};

// 生成默认时段配置
const generateDefaultTimeSlots = (
  totalPeriods: number,
  duration: number,
  breakDuration: number,
  startHour: number = 8,
): TimeSlotConfig[] => {
  const slots: TimeSlotConfig[] = [];
  let currentMinutes = startHour * 60;

  for (let i = 1; i <= totalPeriods; i++) {
    const startTime = minutesToTime(currentMinutes);
    const endTime = minutesToTime(currentMinutes + duration);

    slots.push({
      id: `slot-${i}`,
      label: `第${i}节`,
      startTime,
      endTime,
      duration,
      halfDayType: getHalfDayType(startTime),
      isBreak: false,
      breakAfter: breakDuration,
      isSchedulable: true,
    });

    // 累加时间和休息时间
    currentMinutes += duration + breakDuration;
  }

  return slots;
};

// 默认半天配置
const DEFAULT_HALF_DAY_CONFIG: HalfDayConfig[] = [
  {
    type: 'morning',
    name: '上午',
    startTime: '08:00',
    endTime: '12:00',
    isSchedulable: true,
  },
  {
    type: 'afternoon',
    name: '下午',
    startTime: '14:00',
    endTime: '18:00',
    isSchedulable: true,
  },
  {
    type: 'evening',
    name: '晚上',
    startTime: '19:00',
    endTime: '21:00',
    isSchedulable: true,
  },
];

const TimeSlotConfigPanel: React.FC<TimeSlotConfigPanelProps> = ({
  config,
  dailyConfig,
  halfDayConfig,
  onChange,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlotConfig[]>(config);
  const [localDailyConfig, setLocalDailyConfig] =
    useState<DailyScheduleConfig>(dailyConfig);
  const [localHalfDayConfig, setLocalHalfDayConfig] =
    useState<HalfDayConfig[]>(halfDayConfig);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setTimeSlots(config);
  }, [config]);

  useEffect(() => {
    setLocalDailyConfig(dailyConfig);
  }, [dailyConfig]);

  useEffect(() => {
    setLocalHalfDayConfig(halfDayConfig);
  }, [halfDayConfig]);

  // 调用 onChange 的辅助函数
  const callOnChange = (
    slots: TimeSlotConfig[],
    dailyCfg: DailyScheduleConfig,
    halfCfg: HalfDayConfig[],
  ) => {
    onChange(slots, dailyCfg, halfCfg);
  };

  // 更新每日节数
  const handleTotalPeriodsChange = (value: number | null) => {
    if (!value || value < 1 || value > 20) return;

    const newConfig = { ...localDailyConfig, totalPeriods: value };
    setLocalDailyConfig(newConfig);

    // 如果当前时段数量与新数量不同，重新生成
    if (value !== timeSlots.length) {
      const newSlots = generateDefaultTimeSlots(
        value,
        newConfig.defaultDuration,
        newConfig.defaultBreakDuration,
      );
      // 保留原有的可排课设置
      const mergedSlots = newSlots
        .map((slot, index) => ({
          ...slot,
          ...(timeSlots[index] || {}),
        }))
        .slice(0, value);
      setTimeSlots(mergedSlots);
      callOnChange(mergedSlots, newConfig, localHalfDayConfig);
    }
  };

  // 更新默认时长
  const handleDurationChange = (value: number | null) => {
    if (!value || value < 15 || value > 180) return;

    const newConfig = { ...localDailyConfig, defaultDuration: value };
    setLocalDailyConfig(newConfig);
    recalculateAllTimes(
      newConfig.defaultDuration,
      newConfig.defaultBreakDuration,
    );
  };

  // 更新默认休息时长
  const handleBreakDurationChange = (value: number | null) => {
    if (!value || value < 0 || value > 60) return;

    const newConfig = { ...localDailyConfig, defaultBreakDuration: value };
    setLocalDailyConfig(newConfig);
    recalculateAllTimes(
      newConfig.defaultDuration,
      newConfig.defaultBreakDuration,
    );
  };

  // 重新计算所有时间
  const recalculateAllTimes = (duration: number, breakDuration: number) => {
    let currentMinutes = timeToMinutes(timeSlots[0]?.startTime || '08:00');
    const newSlots = timeSlots.map((slot, index) => {
      const newStart = minutesToTime(currentMinutes);
      const newEnd = minutesToTime(currentMinutes + duration);
      currentMinutes += duration + breakDuration;

      return {
        ...slot,
        startTime: newStart,
        endTime: newEnd,
        duration,
        breakAfter: index < timeSlots.length - 1 ? breakDuration : 0,
      };
    });

    setTimeSlots(newSlots);
    callOnChange(
      newSlots,
      {
        ...localDailyConfig,
        defaultDuration: duration,
        defaultBreakDuration: breakDuration,
      },
      localHalfDayConfig,
    );
  };

  // 更新单个时段
  const updateTimeSlot = (id: string, updates: Partial<TimeSlotConfig>) => {
    const newSlots = timeSlots.map((slot) => {
      if (slot.id === id) {
        const updated = { ...slot, ...updates };

        // 如果修改了时长或开始时间，重新计算后续时间
        if (updates.duration || updates.startTime) {
          // 更新当前 slot
          if (updates.startTime) {
            updated.halfDayType = getHalfDayType(updates.startTime);
          }
        }

        return updated;
      }
      return slot;
    });

    // 重新计算后续时段的时间
    recalculateSubsequentTimes(
      newSlots,
      timeSlots.findIndex((s) => s.id === id),
    );
    setTimeSlots(newSlots);
    callOnChange(newSlots, localDailyConfig, localHalfDayConfig);
  };

  // 重新计算指定索引之后的时段
  const recalculateSubsequentTimes = (
    slots: TimeSlotConfig[],
    startIndex: number,
  ) => {
    if (startIndex < 0 || startIndex >= slots.length - 1) return;

    let currentMinutes = timeToMinutes(slots[startIndex].endTime);
    const breakDuration =
      slots[startIndex].breakAfter || localDailyConfig.defaultBreakDuration;
    currentMinutes += breakDuration;

    const newSlots = [...slots];
    for (let i = startIndex + 1; i < slots.length; i++) {
      newSlots[i] = {
        ...newSlots[i],
        startTime: minutesToTime(currentMinutes),
        endTime: minutesToTime(currentMinutes + newSlots[i].duration),
      };
      currentMinutes = timeToMinutes(newSlots[i].endTime);
      currentMinutes +=
        newSlots[i].breakAfter || localDailyConfig.defaultBreakDuration;
    }

    setTimeSlots(newSlots);
    callOnChange(newSlots, localDailyConfig, localHalfDayConfig);
  };

  // 切换可排课状态
  const toggleSchedulable = (id: string) => {
    const slot = timeSlots.find((s) => s.id === id);
    if (slot) {
      updateTimeSlot(id, { isSchedulable: !slot.isSchedulable });
    }
  };

  // 重置为默认配置
  const handleReset = () => {
    const defaultSlots = generateDefaultTimeSlots(
      localDailyConfig.totalPeriods,
      localDailyConfig.defaultDuration,
      localDailyConfig.defaultBreakDuration,
    );
    setTimeSlots(defaultSlots);
    callOnChange(defaultSlots, localDailyConfig, localHalfDayConfig);
    message.success('已重置为默认配置');
  };

  // 切换半天可排课状态
  const toggleHalfDaySchedulable = (type: HalfDayType) => {
    const newHalfDayConfig = localHalfDayConfig.map((halfDay) =>
      halfDay.type === type
        ? { ...halfDay, isSchedulable: !halfDay.isSchedulable }
        : halfDay,
    );
    setLocalHalfDayConfig(newHalfDayConfig);
    callOnChange(timeSlots, localDailyConfig, newHalfDayConfig);

    const halfDay = localHalfDayConfig.find((h) => h.type === type);
    message.success(
      `${halfDay?.name}已设置为${newHalfDayConfig.find((h) => h.type === type)?.isSchedulable ? '可排课' : '禁排课'}`,
    );
  };

  // 重置半天配置
  const handleHalfDayReset = () => {
    setLocalHalfDayConfig(DEFAULT_HALF_DAY_CONFIG);
    callOnChange(timeSlots, localDailyConfig, DEFAULT_HALF_DAY_CONFIG);
    message.success('半天配置已重置');
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingOutlined />
          <span>时段配置</span>
        </div>
      }
      size="small"
      style={{ marginBottom: 16 }}
      extra={
        <Button
          type="link"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '收起' : '展开'}
        </Button>
      }
    >
      {isExpanded && (
        <>
          {/* 全局配置 */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <label htmlFor="daily-periods" style={{ marginRight: 8 }}>
                每日节数:
              </label>
              <InputNumber
                id="daily-periods"
                min={1}
                max={20}
                value={localDailyConfig.totalPeriods}
                onChange={handleTotalPeriodsChange}
              />
            </div>
            <div>
              <label htmlFor="default-duration" style={{ marginRight: 8 }}>
                默认课时 (分钟):
              </label>
              <InputNumber
                id="default-duration"
                min={15}
                max={180}
                step={5}
                value={localDailyConfig.defaultDuration}
                onChange={handleDurationChange}
              />
            </div>
            <div>
              <label htmlFor="default-break" style={{ marginRight: 8 }}>
                默认休息 (分钟):
              </label>
              <InputNumber
                id="default-break"
                min={0}
                max={60}
                step={5}
                value={localDailyConfig.defaultBreakDuration}
                onChange={handleBreakDurationChange}
              />
            </div>
            <Button onClick={handleReset} size="small">
              重置默认
            </Button>
          </div>

          {/* 半天配置 */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClockCircleOutlined />
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  半天排课配置
                </span>
              </div>
              <Button onClick={handleHalfDayReset} size="small">
                重置半天配置
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {localHalfDayConfig.map((halfDay) => (
                <div
                  key={halfDay.type}
                  style={{
                    width: 180,
                    padding: '12px',
                    border: `1px solid ${halfDay.isSchedulable ? '#b7eb8f' : '#ffccc7'}`,
                    borderRadius: 8,
                    backgroundColor: halfDay.isSchedulable
                      ? '#f6ffed'
                      : '#fff1f0',
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
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {halfDay.name}
                    </span>
                    <Tag color={halfDay.isSchedulable ? 'green' : 'red'}>
                      {halfDay.isSchedulable ? '可排课' : '禁排课'}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                    {halfDay.startTime} - {halfDay.endTime}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#666' }}>
                      排课状态
                    </span>
                    <Switch
                      size="small"
                      checked={halfDay.isSchedulable}
                      onChange={() => toggleHalfDaySchedulable(halfDay.type)}
                      checkedChildren="可排"
                      unCheckedChildren="禁排"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* 时段列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 100px 100px 80px 100px 100px 80px',
                gap: 8,
                fontWeight: 600,
                fontSize: 13,
                color: '#666',
                padding: '0 8px 8px',
              }}
            >
              <span>节次</span>
              <span>开始时间</span>
              <span>结束时间</span>
              <span>时长</span>
              <span>课后休息</span>
              <span>状态</span>
              <span>操作</span>
            </div>

            {timeSlots.map((slot, index) => (
              <div
                key={slot.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 100px 100px 80px 100px 100px 80px',
                  gap: 8,
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: slot.isSchedulable ? '#f6ffed' : '#fff1f0',
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                }}
              >
                <span>{slot.label}</span>
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    updateTimeSlot(slot.id, { startTime: e.target.value })
                  }
                  size="small"
                />
                <Input type="time" value={slot.endTime} disabled size="small" />
                <InputNumber
                  min={15}
                  max={180}
                  step={5}
                  value={slot.duration}
                  onChange={(val) =>
                    updateTimeSlot(slot.id, { duration: val || 45 })
                  }
                  size="small"
                  style={{ width: '100%' }}
                />
                <InputNumber
                  min={0}
                  max={60}
                  step={5}
                  value={slot.breakAfter || 0}
                  onChange={(val) =>
                    updateTimeSlot(slot.id, { breakAfter: val || 0 })
                  }
                  size="small"
                  style={{ width: '100%' }}
                  disabled={index === timeSlots.length - 1}
                />
                <div>
                  <Tag color={slot.isSchedulable ? 'green' : 'red'}>
                    {slot.isSchedulable ? '可排课' : '不可排课'}
                  </Tag>
                </div>
                <div>
                  <Switch
                    size="small"
                    checked={slot.isSchedulable}
                    onChange={() => toggleSchedulable(slot.id)}
                    checkedChildren="可排"
                    unCheckedChildren="禁排"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 收起状态下的摘要 */}
      {!isExpanded && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 13,
            color: '#666',
            flexWrap: 'wrap',
          }}
        >
          <span>
            <ClockCircleOutlined /> 每日 {localDailyConfig.totalPeriods} 节课
          </span>
          <span>每节 {localDailyConfig.defaultDuration} 分钟</span>
          <span>休息 {localDailyConfig.defaultBreakDuration} 分钟</span>
          <span>
            可排课时：{timeSlots.filter((s) => s.isSchedulable).length} /{' '}
            {timeSlots.length}
          </span>
          <span>
            可排半天：{localHalfDayConfig.filter((h) => h.isSchedulable).length}{' '}
            / {localHalfDayConfig.length}
          </span>
        </div>
      )}
    </Card>
  );
};

export default TimeSlotConfigPanel;
