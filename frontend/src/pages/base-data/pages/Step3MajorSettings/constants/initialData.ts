/**
 * Step3 专业设置 - 初始数据生成
 */

import { MAJOR_COURSES } from '../../../constants';
import { generateMockDataWithId } from '../../../utils';
import type { MajorData } from '../types';

const availableCourses = MAJOR_COURSES;

/**
 * 生成初始专业设置数据
 * @param initialData - 外部传入的初始数据
 * @returns 专业设置数据数组
 */
export function generateInitialData(initialData?: MajorData[]): MajorData[] {
  return (
    initialData ||
    generateMockDataWithId(
      15,
      (i, id) => ({
        key: i,
        id,
        name: `专业 ${i + 1}`,
        courses: [
          availableCourses[i % availableCourses.length],
          availableCourses[(i + 3) % availableCourses.length],
        ],
        classSize: Math.floor(Math.random() * 10) + 5,
        duration: Math.floor(Math.random() * 2) + 3,
      }),
      'MAJOR',
    )
  );
}
