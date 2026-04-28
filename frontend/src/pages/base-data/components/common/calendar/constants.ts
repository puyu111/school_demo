// 定义节假日接口
export interface Holiday {
  date: string; // 格式 YYYY-MM-DD
  name?: string;
}

// 2026 年中国节假日数据
export const CHINA_HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: '元旦' },
  { date: '2026-01-02', name: '休' },
  { date: '2026-01-03', name: '休' },
  { date: '2026-02-11', name: '春节' },
  { date: '2026-02-12', name: '休' },
  { date: '2026-02-13', name: '休' },
  { date: '2026-02-14', name: '休' },
  { date: '2026-02-15', name: '休' },
  { date: '2026-02-16', name: '休' },
  { date: '2026-02-17', name: '休' },
  { date: '2026-04-04', name: '清明节' },
  { date: '2026-04-05', name: '休' },
  { date: '2026-04-06', name: '休' },
  { date: '2026-05-01', name: '劳动节' },
  { date: '2026-05-02', name: '休' },
  { date: '2026-05-03', name: '休' },
  { date: '2026-05-04', name: '休' },
  { date: '2026-05-05', name: '休' },
  { date: '2026-06-09', name: '端午节' },
  { date: '2026-06-10', name: '休' },
  { date: '2026-06-11', name: '休' },
  { date: '2026-09-15', name: '中秋节' },
  { date: '2026-09-16', name: '休' },
  { date: '2026-09-17', name: '休' },
  { date: '2026-10-01', name: '国庆节' },
  { date: '2026-10-02', name: '休' },
  { date: '2026-10-03', name: '休' },
  { date: '2026-10-04', name: '休' },
  { date: '2026-10-05', name: '休' },
  { date: '2026-10-06', name: '休' },
  { date: '2026-10-07', name: '休' },
];
