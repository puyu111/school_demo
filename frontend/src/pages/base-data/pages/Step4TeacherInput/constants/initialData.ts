/**
 * Step4 教师录入 - 初始数据生成
 */

import { TEACHER_COURSES } from '../../../constants';
import { generateMockDataWithId } from '../../../utils';
import type { TeacherData } from '../types';
import { DEGREE_OPTIONS } from '../types';

const availableCourses = TEACHER_COURSES;

/**
 * 生成初始教师录入数据
 * @param initialData - 外部传入的初始数据
 * @returns 教师数据数组
 */
export function generateInitialData(
  initialData?: TeacherData[],
): TeacherData[] {
  return (
    initialData ||
    generateMockDataWithId(
      30,
      (i, id) => ({
        key: i,
        id,
        name: `教师 ${i + 1}`,
        gender: i % 2 === 0 ? '男' : '女',
        courses:
          i % 2 === 0
            ? [availableCourses[i % 10], availableCourses[(i + 1) % 10]]
            : [availableCourses[i % 10]],
        degree: DEGREE_OPTIONS[i % 4].value,
      }),
      'TCH',
    )
  );
}
