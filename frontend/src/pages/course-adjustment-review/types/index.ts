// ==================== 调课申请类型定义 ====================

import type { Key } from 'antd/lib/table/interface';

// 申请状态枚举
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// 紧急程度枚举
export type UrgencyLevel = 'high' | 'normal';

// 调课申请记录
export interface CourseAdjustmentRecord {
  key: string; // 表格行 key
  id: string; // 申请编号
  teacherId?: string; // 教师 ID
  teacherName: string; // 教师姓名
  department: string; // 所在院系
  originalCourse: string; // 原课程信息
  targetCourse: string; // 调整后课程信息
  reason: string; // 调课原因
  applyTime: string; // 申请时间
  status: ApplicationStatus; // 审核状态
  urgency: UrgencyLevel; // 紧急程度
  reviewComment?: string; // 审核意见
  reviewerId?: string; // 审核人 ID
  reviewerName?: string; // 审核人姓名
  reviewTime?: string; // 审核时间
}

// ==================== 筛选条件类型 ====================

export interface FilterOptions {
  status: 'all' | ApplicationStatus;
  urgency: 'all' | UrgencyLevel;
  department?: string;
  keyword?: string;
}

// ==================== 组件 Props 类型 ====================

// 筛选区域 Props
export interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onBatchAction: (action: 'approve' | 'reject') => void;
  selectedCount: number;
}

// 申请表格 Props
export interface ApplicationTableProps {
  data: CourseAdjustmentRecord[];
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  onViewDetail: (record: CourseAdjustmentRecord) => void;
  onReview: (
    record: CourseAdjustmentRecord,
    status: 'approved' | 'rejected',
  ) => void;
  loading?: boolean;
}

// 详情弹窗 Props
export interface DetailModalProps {
  visible: boolean;
  record: CourseAdjustmentRecord | null;
  onClose: () => void;
  onReview?: (
    record: CourseAdjustmentRecord,
    status: 'approved' | 'rejected',
    comment: string,
  ) => void;
}

// 审核表单 Props
export interface ReviewFormProps {
  record: CourseAdjustmentRecord;
  onSubmit: (status: 'approved' | 'rejected', comment: string) => void;
  onCancel: () => void;
}

// ==================== API 响应类型 ====================

export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
  timestamp?: number;
  success?: boolean;
}

export interface ApplicationListResponse {
  list: CourseAdjustmentRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReviewRequest {
  applicationId: string;
  status: ApplicationStatus;
  reviewComment: string;
}

export interface BatchReviewRequest {
  applicationIds: string[];
  status: ApplicationStatus;
  reviewComment?: string;
}
