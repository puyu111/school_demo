/**
 * Step4 教师录入 - 表格列配置
 */

/** 教师录入表格列配置 */
export const TEACHER_TABLE_COLUMNS = [
  { title: '教师 ID', dataIndex: 'id', key: 'id' },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    render: (value: string) => value,
  },
  {
    title: '可授课程（多选）',
    dataIndex: 'courses',
    key: 'courses',
    render: (text: string[]) => {
      if (!text || text.length === 0) return <span>-</span>;
      return (
        <div>
          {text.map((course) => (
            <div key={course}>{course}</div>
          ))}
        </div>
      );
    },
  },
  { title: '学历', dataIndex: 'degree', key: 'degree' },
];
