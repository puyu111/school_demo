/**
 * base-data 模块 - 学期日历服务
 * 提供学期日历数据的提交与查询接口
 */

import { request } from '@umijs/max';
import { API_PATHS } from './api';
import type { CalendarSubmitRequest } from './types';

/**
 * 提交学期日历设置
 * 保存学期开始/结束日期及禁用日期列表
 * @param data - 日历数据
 * @returns 提交结果
 */
export async function submitCalendar(data: CalendarSubmitRequest): Promise<{
  code: number;
  message: string;
  data?: {
    calendarId: number;
    startDate: string;
    endDate: string;
    disabledCount: number;
  };
  timestamp: number;
}> {
  return request(API_PATHS.CALENDAR.SUBMIT, {
    method: 'POST',
    data,
  });
}

/**
 * 获取学期日历设置
 * 用于页面初始化加载已有数据
 * @returns 日历数据
 */
export async function getCalendar(): Promise<{
  code: number;
  message: string;
  data?: {
    calendarId: number;
    startDate: string;
    endDate: string;
    disabledDates: { date: string; remark?: string }[];
  };
  timestamp: number;
}> {
  return request(API_PATHS.CALENDAR.LIST, {
    method: 'GET',
  });
}
