/**
 * Step2 课程设置 - 初始数据生成
 */

import { DEFAULT_COURSE_NAMES } from '../../../constants';
import { generateMockDataWithId } from '../../../utils';
import type { CourseSettingData } from '../types';

const allCourseNames = DEFAULT_COURSE_NAMES;

/**
 * 生成初始课程设置数据
 * @param initialData - 外部传入的初始数据
 * @returns 课程设置数据数组
 */
export function generateInitialData(
  initialData?: CourseSettingData[],
): CourseSettingData[] {
  return (
    initialData ||
    generateMockDataWithId(
      20,
      (i, id) => ({
        key: i,
        id,
        name: `课程 ${i + 1}`,
        priority: (i % 4) + 1,
        prerequisites: i > 0 ? allCourseNames.slice(Math.max(0, i - 3), i) : [],
        semester: `第${(i % 4) + 1}学期`,
      }),
      'CRS',
    )
  );
}
