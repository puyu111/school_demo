/* eslint-disable */
import type {
  RuleData,
  RuleWeight,
  Teacher,
  UnavailableDate,
} from "@/pages/rule-configuration-settings/types";
import { request } from "@umijs/max";

/**
 * 规则管理相关 API
 */

// 获取规则列表
export async function getRuleList(params?: {
  current?: number;
  pageSize?: number;
}) {
  return request<{ data: RuleData[]; total: number }>("/api/rules", {
    method: "GET",
    params,
  });
}

// 创建规则
export async function createRule(data: Omit<RuleData, "key">) {
  return request<{ data: RuleData }>("/api/rules", {
    method: "POST",
    data,
  });
}

// 更新规则
export async function updateRule(key: string, data: Partial<RuleData>) {
  return request<{ data: RuleData }>(`/api/rules/${key}`, {
    method: "PUT",
    data,
  });
}

// 删除规则
export async function deleteRule(key: string) {
  return request<Record<string, any>>(`/api/rules/${key}`, {
    method: "DELETE",
  });
}

/**
 * 教师不可用时间 API
 */

// 获取教师列表
export async function getTeacherList() {
  return request<{ data: Teacher[] }>("/api/teachers", {
    method: "GET",
  });
}

// 获取教师不可用日期列表
export async function getUnavailableDates(params?: {
  teacherId?: string;
  type?: string;
}) {
  return request<{ data: UnavailableDate[] }>("/api/unavailable-dates", {
    method: "GET",
    params,
  });
}

// 添加不可用日期
export async function createUnavailableDate(
  data: Omit<UnavailableDate, "key">
) {
  return request<{ data: UnavailableDate }>("/api/unavailable-dates", {
    method: "POST",
    data,
  });
}

// 批量添加不可用日期
export async function batchCreateUnavailableDates(
  data: Omit<UnavailableDate, "key">[]
) {
  return request<{ data: UnavailableDate[] }>("/api/unavailable-dates/batch", {
    method: "POST",
    data,
  });
}

// 删除不可用日期
export async function deleteUnavailableDate(key: string) {
  return request<Record<string, any>>(`/api/unavailable-dates/${key}`, {
    method: "DELETE",
  });
}

// 批量删除不可用日期
export async function batchDeleteUnavailableDates(keys: string[]) {
  return request<Record<string, any>>("/api/unavailable-dates/batch", {
    method: "POST",
    data: { keys },
  });
}

/**
 * 规则权重管理 API
 */

// 获取规则权重列表
export async function getRuleWeights() {
  return request<{ data: RuleWeight[] }>("/api/rule-weights", {
    method: "GET",
  });
}

// 更新规则权重
export async function updateRuleWeight(
  id: string,
  data: { currentWeight: number }
) {
  return request<{ data: RuleWeight }>(`/api/rule-weights/${id}`, {
    method: "PUT",
    data,
  });
}

// 批量更新规则权重
export async function batchUpdateRuleWeights(
  data: { id: string; currentWeight: number }[]
) {
  return request<{ data: RuleWeight[] }>("/api/rule-weights/batch", {
    method: "POST",
    data,
  });
}

// 获取权重变更历史
export async function getWeightHistory(params?: {
  ruleId?: string;
  current?: number;
  pageSize?: number;
}) {
  return request<{ data: any[]; total: number }>("/api/rule-weights/history", {
    method: "GET",
    params,
  });
}

// 重置权重为默认值
export async function resetRuleWeights() {
  return request<Record<string, any>>("/api/rule-weights/reset", {
    method: "POST",
  });
}
