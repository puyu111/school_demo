/**
 * Step3 专业设置 - 表格列配置
 */

/** 专业设置表格列配置 */
export const MAJOR_TABLE_COLUMNS = [
  { title: '专业 ID', dataIndex: 'id', key: 'id' },
  { title: '专业名称', dataIndex: 'name', key: 'name' },
  {
    title: '开设课程（多选）',
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
  { title: '班级数', dataIndex: 'classSize', key: 'classSize' },
  { title: '年制', dataIndex: 'duration', key: 'duration' },
];
