/**
 * Step1 课程录入 - 初始数据生成
 */

import { generateMockDataWithId } from '../../../utils';
import type { CourseData } from '../types';

const COURSE_TYPES = ['必修', '选修', '限选'] as const;

/**
 * 生成初始课程数据
 * @param initialData - 外部传入的初始数据
 * @returns 课程数据数组
 */
export function generateInitialData(initialData?: any[]): CourseData[] {
  return (
    initialData ||
    generateMockDataWithId(
      46,
      (i, id) => ({
        key: i,
        id,
        name: `课程${i + 1}`,
        credits: Math.floor(Math.random() * 4) + 1,
        type: COURSE_TYPES[i % 3] as string,
        totalHours: Math.floor(Math.random() * 48) + 16,
      }),
      'COURSE',
    )
  );
}
