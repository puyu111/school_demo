import {
  ApartmentOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';

export const ruleCategories = [
  {
    key: 'course',
    name: '课程相关规则',
    icon: <BookOutlined />,
    description: '课程连续性、课程难度分布等规则',
    color: '#1890ff',
  },
  {
    key: 'teacher',
    name: '教师相关规则',
    icon: <UserOutlined />,
    description: '教师时间偏好、教师工作强度等规则',
    color: '#52c41a',
  },
  {
    key: 'time',
    name: '时间相关规则',
    icon: <ClockCircleOutlined />,
    description: '时间分布、课程时段偏好等规则',
    color: '#fa8c16',
  },
  {
    key: 'resource',
    name: '资源相关规则',
    icon: <ApartmentOutlined />,
    description: '教室使用、设备分配等规则',
    color: '#722ed1',
  },
];
