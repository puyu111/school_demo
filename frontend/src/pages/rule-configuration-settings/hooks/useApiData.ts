import { useRequest } from "ahooks";
import { useCallback, useEffect, useState } from "react";
import {
  batchCreateUnavailableDates,
  batchDeleteUnavailableDates,
  batchUpdateRuleWeights,
  createUnavailableDate,
  deleteRule,
  deleteUnavailableDate,
  getRuleList,
  getRuleWeights,
  getTeacherList,
  getUnavailableDates,
  getWeightHistory,
  resetRuleWeights,
  updateRule,
  updateRuleWeight,
} from "../services/api";
import type { RuleData, UnavailableDate } from "../types";

/**
 * 规则数据管理 Hook - 使用 API 请求
 */
export const useRuleDataWithApi = () => {
  // 获取规则列表
  const {
    data: rulesResponse,
    loading: rulesLoading,
    run: loadRules,
    mutate: setRules,
  } = useRequest(getRuleList, {
    manual: true,
  });

  const rules = rulesResponse?.data?.data || rulesResponse?.data || [];

  // 更新规则
  const updateRuleMutation = useCallback(
    async (key: string, updates: Partial<RuleData>) => {
      const response = await updateRule(key, updates);
      return response.data;
    },
    []
  );

  // 删除规则
  const deleteRuleMutation = useCallback(async (key: string) => {
    await deleteRule(key);
  }, []);

  return {
    rules,
    rulesLoading,
    loadRules,
    updateRule: updateRuleMutation,
    deleteRule: deleteRuleMutation,
    setRules,
  };
};

/**
 * 教师数据管理 Hook
 */
export const useTeachers = () => {
  const {
    data: teachersResponse,
    loading: teachersLoading,
    run: loadTeachers,
  } = useRequest(getTeacherList, {
    manual: false,
    refreshDeps: [],
  });

  const teachers = teachersResponse?.data || [];

  return {
    teachers,
    teachersLoading,
    loadTeachers,
  };
};

/**
 * 不可排日期管理 Hook - 使用 API 请求
 */
export const useUnavailableDatesWithApi = (teacherId?: string) => {
  const [dates, setDates] = useState<UnavailableDate[]>([]);

  // 获取不可用日期
  const {
    data: datesResponse,
    loading: datesLoading,
    run: loadDates,
  } = useRequest(() => getUnavailableDates({ teacherId }), {
    manual: false,
  });

  useEffect(() => {
    if (datesResponse?.data) {
      setDates(datesResponse.data);
    }
  }, [datesResponse]);

  // 添加不可用日期
  const addDate = useCallback(async (date: Omit<UnavailableDate, "key">) => {
    const response = await createUnavailableDate(date);
    if (response.data) {
      setDates((prev) => [...prev, response.data]);
    }
    return response.data;
  }, []);

  // 批量添加
  const bulkAddDates = useCallback(
    async (newDates: Omit<UnavailableDate, "key">[]) => {
      const response = await batchCreateUnavailableDates(newDates);
      if (response.data) {
        setDates((prev) => [...prev, ...response.data]);
      }
      return response.data;
    },
    []
  );

  // 删除日期
  const deleteDate = useCallback(async (key: string) => {
    await deleteUnavailableDate(key);
    setDates((prev) => prev.filter((item) => item.key !== key));
  }, []);

  // 批量删除
  const bulkDeleteDates = useCallback(async (keys: string[]) => {
    await batchDeleteUnavailableDates(keys);
    setDates((prev) => prev.filter((item) => !keys.includes(item.key)));
  }, []);

  // 清空所有
  const clearAll = useCallback(async () => {
    const keys = dates.map((d) => d.key);
    if (keys.length > 0) {
      await batchDeleteUnavailableDates(keys);
    }
    setDates([]);
  }, [dates]);

  return {
    dates,
    datesLoading,
    loadDates,
    addDate,
    bulkAddDates,
    deleteDate,
    bulkDeleteDates,
    clearAll,
    setDates,
  };
};

/**
 * 规则权重管理 Hook - 使用 API 请求
 */
export const useRuleWeights = () => {
  const [weightHistory, setWeightHistory] = useState<any[]>([]);

  // 获取权重列表
  const {
    data: weightsResponse,
    loading: weightsLoading,
    run: loadWeights,
    mutate: setWeights,
  } = useRequest(getRuleWeights, {
    manual: true,
  });

  const weights = weightsResponse?.data || [];

  // 更新单个权重
  const updateWeight = useCallback(
    async (id: string, currentWeight: number) => {
      const response = await updateRuleWeight(id, { currentWeight });
      return response.data;
    },
    []
  );

  // 批量更新权重
  const bulkUpdateWeights = useCallback(
    async (updates: { id: string; currentWeight: number }[]) => {
      const response = await batchUpdateRuleWeights(updates);
      setWeights(response);
      return response.data;
    },
    []
  );

  // 重置权重
  const resetWeights = useCallback(async () => {
    await resetRuleWeights();
    loadWeights();
  }, [loadWeights]);

  // 获取历史记录
  const loadHistory = useCallback(async () => {
    const response = await getWeightHistory({ current: 1, pageSize: 20 });
    setWeightHistory(response.data?.data || response.data || []);
  }, []);

  return {
    weights,
    weightsLoading,
    loadWeights,
    updateWeight,
    bulkUpdateWeights,
    resetWeights,
    weightHistory,
    loadHistory,
    setWeights,
  };
};

/**
 * 组合 Hook - 加载所有规则配置相关数据
 */
export const useRuleConfigData = () => {
  const { rules, rulesLoading, loadRules, setRules } = useRuleDataWithApi();
  const { teachers, teachersLoading, loadTeachers } = useTeachers();
  const { weights, weightsLoading, loadWeights, setWeights } = useRuleWeights();
  const {
    dates,
    datesLoading,
    loadDates,
    addDate,
    bulkAddDates,
    deleteDate,
    bulkDeleteDates,
    clearAll,
    setDates,
  } = useUnavailableDatesWithApi();

  // 初始化加载所有数据
  useEffect(() => {
    loadRules();
    loadTeachers();
    loadWeights();
    loadDates();
  }, []);

  return {
    // 规则数据
    rules,
    rulesLoading,
    reloadRules: loadRules,
    updateRuleData: setRules,

    // 教师数据
    teachers,
    teachersLoading,
    reloadTeachers: loadTeachers,

    // 权重数据
    weights,
    weightsLoading,
    reloadWeights: loadWeights,
    updateWeightsData: setWeights,

    // 不可用日期
    dates,
    datesLoading,
    reloadDates: loadDates,
    addUnavailableDate: addDate,
    bulkAddUnavailableDates: bulkAddDates,
    deleteUnavailableDate: deleteDate,
    bulkDeleteUnavailableDates: bulkDeleteDates,
    clearAllUnavailableDates: clearAll,
    setUnavailableDates: setDates,
  };
};
