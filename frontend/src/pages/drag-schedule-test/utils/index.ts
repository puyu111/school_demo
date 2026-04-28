// ==================== 工具函数 ====================

import type {
  Course,
  HalfDayConfig,
  HalfDayType,
  TimeSlotConfig,
} from '../types';

// 检测是否为移动设备
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent,
  );
};

// 获取设备类型
export const getDeviceType = (): 'mobile' | 'desktop' => {
  return isMobile() ? 'mobile' : 'desktop';
};

// 时间字符串转分钟数
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 分钟数转时间字符串
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// 获取时间所属的半天类型
export const getHalfDayType = (time: string): HalfDayType => {
  const minutes = timeToMinutes(time);
  const morningEnd = timeToMinutes('12:00');
  const afternoonStart = timeToMinutes('14:00');
  const afternoonEnd = timeToMinutes('18:00');
  const eveningStart = timeToMinutes('19:00');

  if (minutes < morningEnd) return 'morning';
  if (minutes >= afternoonStart && minutes < afternoonEnd) return 'afternoon';
  if (minutes >= eveningStart) return 'evening';
  return 'morning';
};

// 获取课程起始时段索引
export const getCourseStartTimeSlotIndex = (
  course: Course,
  timeSlots: TimeSlotConfig[],
): number => {
  return timeSlots.findIndex((slot) => slot.startTime === course.startTime);
};

// 获取课程占据的时段数量
export const getCourseSpanCount = (
  course: Course,
  timeSlots: TimeSlotConfig[],
): number => {
  const startIndex = getCourseStartTimeSlotIndex(course, timeSlots);
  if (startIndex === -1) return 1;

  const courseDuration =
    course.duration ||
    timeToMinutes(course.endTime) - timeToMinutes(course.startTime);
  let accumulatedDuration = 0;

  for (let i = startIndex; i < timeSlots.length; i++) {
    accumulatedDuration =
      timeToMinutes(timeSlots[i].startTime) - timeToMinutes(course.startTime);
    if (accumulatedDuration >= courseDuration) return i - startIndex;
  }

  return 1;
};

// 计算课程结束时间（保持时长）
export const calculateEndTime = (
  startTime: string,
  duration: number,
): string => {
  const startMinutes = timeToMinutes(startTime);
  return minutesToTime(startMinutes + duration);
};

// 检查时间段是否在可排课的半天内
export const isTimeInSchedulableHalfDay = (
  startTime: string,
  halfDayConfigs: HalfDayConfig[],
): boolean => {
  const halfDayType = getHalfDayType(startTime);
  const config = halfDayConfigs.find((h) => h.type === halfDayType);
  return config ? config.isSchedulable : false;
};

// ==================== 默认配置生成器 ====================

// 生成默认时段配置
export const generateDefaultTimeSlots = (
  totalPeriods: number = 10,
  duration: number = 45,
  breakDuration: number = 10,
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
      breakAfter: i < totalPeriods ? breakDuration : 0,
      isSchedulable: true,
    });

    currentMinutes += duration + breakDuration;
  }

  return slots;
};

// 默认半天配置
export const DEFAULT_HALF_DAY_CONFIG: HalfDayConfig[] = [
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

// 默认星期配置
export const DEFAULT_WEEK_DAYS = [
  { id: 1, name: '周一', isEnabled: true, isSchedulable: true },
  { id: 2, name: '周二', isEnabled: true, isSchedulable: true },
  { id: 3, name: '周三', isEnabled: true, isSchedulable: true },
  { id: 4, name: '周四', isEnabled: true, isSchedulable: true },
  { id: 5, name: '周五', isEnabled: true, isSchedulable: true },
  { id: 6, name: '周六', isEnabled: false, isSchedulable: false },
  { id: 7, name: '周日', isEnabled: false, isSchedulable: false },
];

// 默认每日配置
export const DEFAULT_DAILY_CONFIG = {
  totalPeriods: 10,
  defaultDuration: 45,
  defaultBreakDuration: 10,
};
