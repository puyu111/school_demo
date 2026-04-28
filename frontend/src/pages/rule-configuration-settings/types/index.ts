// 规则数据类型
export interface RuleData {
  key: string;
  ruleName: string;
  teachers?: string[]; // 可选字段
  description: string;
  validDate?: [number, number]; // 时间戳格式 [开始，结束]
}

// 教师数据
export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
}

// 不可排日期数据
export interface UnavailableDate {
  key: string;
  teacherId: string;
  teacherName: string;
  validDate?: [number, number];
  reason: string;
  type: 'personal' | 'holiday' | 'other';
  rangeType?: 'single' | 'week' | 'month' | 'quarter' | 'range';
}

// 日期选择类型
export type SelectionType = 'single' | 'week' | 'month' | 'quarter' | 'range';

// 规则权重数据
export interface RuleWeight {
  id: string;
  name: string;
  category: string;
  currentWeight: number;
  defaultWeight: number;
  minWeight: number;
  maxWeight: number;
  enabled: boolean;
  description?: string;
}

// 权重变更记录
export interface WeightChangeRecord {
  id: string;
  ruleId: string;
  ruleName: string;
  oldValue: number;
  newValue: number;
  time: string;
}

// 分类数据
export interface Category {
  key: string;
  name: string;
  color: string;
  icon?: string;
}

// 步骤组件 props
export interface StepsComponentProps {
  current?: number;
  items?: Array<{
    title: string;
    icon?: React.ReactNode;
    status?: 'wait' | 'process' | 'finish' | 'error';
  }>;
}

// Tabs 组件 props
export interface TabItem {
  label: string;
  key: string;
  children: React.ReactNode;
}

export interface MyTabsProps {
  activeStep?: number;
  onStepChange?: (step: number) => void;
  tabItems?: TabItem[];
}

// 对话框组件 props
export interface RuleEditDialogProps {
  open: boolean;
  title: string;
  record: RuleData | null;
  onSave: (values: RuleData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface TeacherUnavailableDialogProps {
  open?: boolean;
  onClose?: () => void;
}
