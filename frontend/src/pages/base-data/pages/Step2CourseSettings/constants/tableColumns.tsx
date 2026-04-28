/**
 * Step2 课程设置 - 表格列配置
 */

/** 课程设置表格列配置 */
export const COURSE_SETTING_TABLE_COLUMNS = [
  { title: '课程名称', dataIndex: 'name', key: 'name' },
  { title: '课程优先等级', dataIndex: 'priority', key: 'priority' },
  {
    title: '前置课程（可多选）',
    dataIndex: 'prerequisites',
    key: 'prerequisites',
    render: (text: string | string[]) => {
      if (!text || (Array.isArray(text) && text.length === 0))
        return <span>-</span>;
      const prereqs = Array.isArray(text)
        ? text
        : typeof text === 'string'
          ? text.split(',')
          : [];
      return (
        <div>
          {prereqs
            .filter((prereq) => prereq && prereq.trim() !== '')
            .map((prereq) => (
              <div key={prereq}>
                第{prereqs.indexOf(prereq) + 1}前置：{prereq.trim()}
              </div>
            ))}
          {prereqs.filter((prereq: any) => prereq && prereq.trim() !== '')
            .length === 0 && <span>-</span>}
        </div>
      );
    },
  },
  { title: '开设学期', dataIndex: 'semester', key: 'semester' },
];
