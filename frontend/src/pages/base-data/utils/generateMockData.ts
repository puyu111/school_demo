/**
 * base-data 模块 - 通用数据生成工具
 * 提供模拟数据生成函数
 */

/**
 * 生成模拟数据数组
 * @param length - 生成数据的长度
 * @param factory - 数据工厂函数，接收索引返回数据项
 * @returns 模拟数据数组
 *
 * @example
 * ```typescript
 * const users = generateMockData(10, (i) => ({
 *   id: i,
 *   name: `用户${i + 1}`,
 * }));
 * ```
 */
export function generateMockData<T>(
  length: number,
  factory: (i: number) => T,
): T[] {
  return Array.from({ length }, (_, i) => factory(i));
}

/**
 * 生成带递增 ID 的模拟数据
 * @param length - 生成数据的长度
 * @param factory - 数据工厂函数，接收索引和 ID 返回数据项
 * @param idPrefix - ID 前缀
 * @param idStart - ID 起始值
 * @returns 模拟数据数组
 *
 * @example
 * ```typescript
 * const courses = generateMockDataWithId(20, (i, id) => ({
 *   id,
 *   name: `课程${i + 1}`,
 * }), 'COURSE');
 * // 生成：[{ id: 'COURSE1', name: '课程 1' }, ...]
 * ```
 */
export function generateMockDataWithId<T>(
  length: number,
  factory: (i: number, id: string) => T,
  idPrefix: string,
  idStart = 1,
): T[] {
  return Array.from({ length }, (_, i) => {
    const id = `${idPrefix}${i + idStart}`;
    return factory(i, id);
  });
}

/**
 * 从选项数组中随机选择
 * @param options - 选项数组
 * @param count - 选择数量（默认 1）
 * @returns 随机选择的项
 */
export function randomSelect<T>(options: T[], count = 1): T | T[] {
  if (count <= 0) return [];
  if (count === 1) return options[Math.floor(Math.random() * options.length)];

  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, options.length));
}
