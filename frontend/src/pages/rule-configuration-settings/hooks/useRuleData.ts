import type {
  RuleData,
  SelectionType,
  UnavailableDate,
} from "@/pages/rule-configuration-settings/types";
import dayjs, { type Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useCallback, useMemo, useState } from "react";

// 扩展 dayjs
dayjs.extend(weekOfYear);

/**
 * 规则数据管理 Hook
 */
export const useRuleData = (initialData: RuleData[] = []) => {
  const [rules, setRules] = useState<RuleData[]>(initialData);

  // 添加规则
  const addRule = useCallback((rule: RuleData) => {
    setRules((prev) => [...prev, rule]);
  }, []);

  // 更新规则
  const updateRule = useCallback((key: string, updates: Partial<RuleData>) => {
    setRules((prev) =>
      prev.map((rule) => (rule.key === key ? { ...rule, ...updates } : rule))
    );
  }, []);

  // 删除规则
  const deleteRule = useCallback((key: string) => {
    setRules((prev) => prev.filter((rule) => rule.key !== key));
  }, []);

  // 批量更新
  const bulkUpdate = useCallback((newRules: RuleData[]) => {
    setRules(newRules);
  }, []);

  return {
    rules,
    addRule,
    updateRule,
    deleteRule,
    bulkUpdate,
    setRules,
  };
};

/**
 * 不可排日期管理 Hook
 */
export const useUnavailableDates = () => {
  const [dates, setDates] = useState<UnavailableDate[]>([]);

  // 添加日期
  const addDate = useCallback((date: UnavailableDate) => {
    setDates((prev) => [...prev, date]);
  }, []);

  // 批量添加
  const bulkAddDates = useCallback((newDates: UnavailableDate[]) => {
    setDates((prev) => [...prev, ...newDates]);
  }, []);

  // 删除日期
  const deleteDate = useCallback((key: string) => {
    setDates((prev) => prev.filter((item) => item.key !== key));
  }, []);

  // 按教师 ID 删除
  const deleteByTeacherId = useCallback((teacherId: string) => {
    setDates((prev) => prev.filter((item) => item.teacherId !== teacherId));
  }, []);

  // 按教师 IDs 批量删除
  const bulkDeleteByTeacherIds = useCallback((teacherIds: string[]) => {
    setDates((prev) =>
      prev.filter((item) => !teacherIds.includes(item.teacherId))
    );
  }, []);

  // 清空所有
  const clearAll = useCallback(() => {
    setDates([]);
  }, []);

  // 按教师筛选
  const getDatesByTeacher = useCallback(
    (teacherId: string) => {
      return dates.filter((date) => date.teacherId === teacherId);
    },
    [dates]
  );

  // 按类型筛选
  const getDatesByType = useCallback(
    (type: string) => {
      return dates.filter((date) => date.type === type);
    },
    [dates]
  );

  // 获取唯一教师 IDs
  const getUniqueTeacherIds = useMemo(() => {
    return [...new Set(dates.map((d) => d.teacherId))];
  }, [dates]);

  return {
    dates,
    addDate,
    bulkAddDates,
    deleteDate,
    deleteByTeacherId,
    bulkDeleteByTeacherIds,
    clearAll,
    getDatesByTeacher,
    getDatesByType,
    getUniqueTeacherIds,
    setDates,
  };
};

/**
 * 日期选择器 Hook
 */
export const useDateSelector = () => {
  const [selectionType, setSelectionType] = useState<SelectionType>("single");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [reason, setReason] = useState("");
  const [addWeekendOnly, setAddWeekendOnly] = useState(false);
  const [addWorkdayOnly, setAddWorkdayOnly] = useState(false);

  // 重置选择器
  const resetSelector = useCallback(() => {
    setSelectedDate(null);
    setDateRange([null, null]);
    setSelectedWeek("");
    setSelectedMonth("");
    setSelectedQuarter("");
    setReason("");
    setAddWeekendOnly(false);
    setAddWorkdayOnly(false);
  }, []);

  // 禁用过去的日期
  const disabledDate = useCallback((current: Dayjs) => {
    return current && current < dayjs().startOf("day");
  }, []);

  // 获取周日期范围
  const getWeekDateRange = useCallback((year: number, week: number): string => {
    const startOfWeek = dayjs().year(year).week(week).startOf("week");
    const endOfWeek = startOfWeek.endOf("week");
    return `${startOfWeek.format("MM/DD")}-${endOfWeek.format("MM/DD")}`;
  }, []);

  // 获取季度包含的月份
  const getQuarterMonths = useCallback((quarter: number): number[] => {
    const quarterMap: Record<number, number[]> = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12],
    };
    return quarterMap[quarter] || [];
  }, []);

  // 生成日期范围
  const generateDateRange = useCallback(
    (start: Dayjs, end: Dayjs): string[] => {
      const dates: string[] = [];
      let current = start.clone();

      while (current.isBefore(end) || current.isSame(end)) {
        const isWeekend = current.day() === 0 || current.day() === 6;
        const isWorkday = !isWeekend;

        if (addWeekendOnly && !isWeekend) {
          current = current.add(1, "day");
          continue;
        }

        if (addWorkdayOnly && !isWorkday) {
          current = current.add(1, "day");
          continue;
        }

        dates.push(current.format("YYYY-MM-DD"));
        current = current.add(1, "day");
      }

      return dates;
    },
    [addWeekendOnly, addWorkdayOnly]
  );

  return {
    selectionType,
    setSelectionType,
    selectedDate,
    setSelectedDate,
    dateRange,
    setDateRange,
    selectedWeek,
    setSelectedWeek,
    selectedMonth,
    setSelectedMonth,
    selectedQuarter,
    setSelectedQuarter,
    reason,
    setReason,
    addWeekendOnly,
    setAddWeekendOnly,
    addWorkdayOnly,
    setAddWorkdayOnly,
    resetSelector,
    disabledDate,
    getWeekDateRange,
    getQuarterMonths,
    generateDateRange,
  };
};

/**
 * 步骤状态管理 Hook
 */
export const useSteps = (initialStep: number = 1) => {
  const [activeStep, setActiveStep] = useState(initialStep);

  const handleStepChange = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, 2));
  }, []);

  const prevStep = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setActiveStep(initialStep);
  }, [initialStep]);

  return {
    activeStep,
    setActiveStep,
    handleStepChange,
    nextStep,
    prevStep,
    reset,
  };
};
