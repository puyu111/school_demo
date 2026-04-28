import { request } from '@umijs/max';
import type {
  ApiResponse,
  ApplicationListResponse,
  BatchReviewRequest,
  CourseAdjustmentRecord,
  ReviewRequest,
} from '../types';

const BASE_URL = '/api/course-adjustment';

// ==================== 申请管理接口 ====================

/**
 * 获取调课申请列表
 */
export async function getApplications(params: {
  page?: number;
  pageSize?: number;
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  urgency?: 'all' | 'high' | 'normal';
  department?: string;
}): Promise<ApiResponse<ApplicationListResponse>> {
  return request(`${BASE_URL}/applications`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个申请详情
 */
export async function getApplicationDetail(
  applicationId: string,
): Promise<ApiResponse<CourseAdjustmentRecord>> {
  return request(`${BASE_URL}/applications/${applicationId}`, {
    method: 'GET',
  });
}

/**
 * 提交调课申请
 */
export async function createApplication(
  data: Partial<CourseAdjustmentRecord>,
): Promise<ApiResponse<{ id: string }>> {
  return request(`${BASE_URL}/applications`, {
    method: 'POST',
    data,
  });
}

/**
 * 审核申请（通过/驳回）
 */
export async function reviewApplication(
  data: ReviewRequest,
): Promise<ApiResponse<{ id: string; status: string }>> {
  return request(`${BASE_URL}/applications/review`, {
    method: 'POST',
    data,
  });
}

/**
 * 批量审核申请
 */
export async function batchReviewApplications(
  data: BatchReviewRequest,
): Promise<ApiResponse<{ successCount: number; failedIds: string[] }>> {
  return request(`${BASE_URL}/applications/batch-review`, {
    method: 'POST',
    data,
  });
}

/**
 * 撤销申请
 */
export async function revokeApplication(
  applicationId: string,
): Promise<ApiResponse<{ id: string }>> {
  return request(`${BASE_URL}/applications/${applicationId}/revoke`, {
    method: 'POST',
  });
}

/**
 * 删除申请记录
 */
export async function deleteApplication(
  applicationId: string,
): Promise<ApiResponse<{ deletedId: string }>> {
  return request(`${BASE_URL}/applications/${applicationId}`, {
    method: 'DELETE',
  });
}

// ==================== 统计接口 ====================

// 统计数据类型
export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  highUrgency: number;
}

export interface DepartmentStat {
  department: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * 获取申请统计数据
 */
export async function getApplicationStats(): Promise<
  ApiResponse<ApplicationStats>
> {
  return request(`${BASE_URL}/stats`, {
    method: 'GET',
  });
}

/**
 * 获取各院系申请数量统计
 */
export async function getDepartmentStats(): Promise<
  ApiResponse<DepartmentStat[]>
> {
  return request(`${BASE_URL}/stats/departments`, {
    method: 'GET',
  });
}
