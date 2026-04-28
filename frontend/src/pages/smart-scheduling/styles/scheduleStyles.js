export const scheduleStyles = {
  // 容器样式
  container: {
    background: '#f0f2f5',
    minHeight: '100vh',
    padding: '24px',
  },

  // 卡片样式
  card: {
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },

  // 排课表格样式
  scheduleTable: {
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    overflow: 'hidden',
    background: '#fff',
  },

  // 表头样式
  tableHeader: {
    background: '#fafafa',
    fontWeight: '600',
    textAlign: 'center',
    padding: '12px 8px',
    borderRight: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
  },

  // 时间槽样式
  timeSlotCell: {
    background: '#f5f5f5',
    textAlign: 'center',
    padding: '12px 8px',
    borderRight: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    fontWeight: '500',
    minWidth: '100px',
  },

  // 课程单元格样式
  courseCell: {
    padding: '4px',
    borderRight: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    minHeight: '100px',
    background: '#fff',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },

  // 课程卡片样式
  courseCard: {
    padding: '8px',
    margin: '4px 0',
    borderRadius: '4px',
    borderLeft: '4px solid',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: '#fff',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)',
    },
  },

  // 待排课程池样式
  coursePool: {
    maxHeight: '400px',
    overflowY: 'auto',
    borderRadius: '4px',
  },

  // 优先级标签样式
  priorityTag: {
    high: {
      background: '#fff1f0',
      color: '#ff4d4f',
      borderColor: '#ffa39e',
    },
    medium: {
      background: '#fff7e6',
      color: '#fa8c16',
      borderColor: '#ffd591',
    },
    low: {
      background: '#f6ffed',
      color: '#52c41a',
      borderColor: '#b7eb8f',
    },
  },

  // 课程类型标签
  courseTypeTag: {
    必修: 'red',
    选修: 'blue',
    实验: 'purple',
    实践: 'green',
  },

  // 拖拽样式
  dragOverCell: {
    background: 'rgba(24, 144, 255, 0.1)',
    border: '2px dashed #1890ff',
  },
};
