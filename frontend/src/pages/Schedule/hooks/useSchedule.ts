import { useCallback, useMemo, useState } from 'react';
import type { Course, ViewMode } from '../types';

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

/**
 * 课表数据管理 Hook
 */
interface UseScheduleDataProps {
  courses: Course[];
}

export interface ScheduleDataResult {
  filteredCourses: Course[];
  classOptions: Array<{ label: string; value: string }>;
  teacherOptions: Array<{ label: string; value: string }>;
  filterClass: string;
  filterTeacher: string;
  currentWeek: number;
  setFilterClass: (value: string) => void;
  setFilterTeacher: (value: string) => void;
  setCurrentWeek: (week: number) => void;
}

export const useScheduleData = ({
  courses,
}: UseScheduleDataProps): ScheduleDataResult => {
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  // 生成班级选项
  const classOptions = useMemo(() => {
    const classes = [...new Set(courses.map((course) => course.className))];
    return classes.map((className) => ({ label: className, value: className }));
  }, [courses]);

  // 生成教师选项
  const teacherOptions = useMemo(() => {
    const teachers = [...new Set(courses.map((course) => course.teacherName))];
    return teachers.map((teacherName) => ({
      label: teacherName,
      value: teacherName,
    }));
  }, [courses]);

  // 过滤课程
  const filteredCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        course.weeks.includes(currentWeek) &&
        (filterClass === 'all' || course.className === filterClass) &&
        (filterTeacher === 'all' || course.teacherName === filterTeacher),
    );
  }, [courses, currentWeek, filterClass, filterTeacher]);

  return {
    filteredCourses,
    classOptions,
    teacherOptions,
    filterClass,
    filterTeacher,
    currentWeek,
    setFilterClass,
    setFilterTeacher,
    setCurrentWeek,
  };
};

/**
 * 课表视图控制 Hook
 */
export interface ViewActions {
  viewMode: ViewMode;
  currentDay: number;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onCourseAction: (action: 'view' | 'edit' | 'delete', course: Course) => void;
}

export const useScheduleView = (
  onCourseAction?: (action: 'view' | 'edit' | 'delete', course: Course) => void,
): ViewActions => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDay, setCurrentDay] = useState<number>(
    new Date().getDay() || 7,
  );

  const onPrevDay = useCallback(() => {
    setCurrentDay((prev) => (prev === 1 ? 7 : prev - 1));
  }, []);

  const onNextDay = useCallback(() => {
    setCurrentDay((prev) => (prev === 7 ? 1 : prev + 1));
  }, []);

  const onViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleCourseAction = useCallback(
    (action: 'view' | 'edit' | 'delete', course: Course) => {
      onCourseAction?.(action, course);
    },
    [onCourseAction],
  );

  return {
    viewMode,
    currentDay,
    onViewModeChange,
    onPrevDay,
    onNextDay,
    onCourseAction: handleCourseAction,
  };
};

/**
 * 统计数据管理 Hook
 */
export const useStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    showCharts,
    setShowCharts,
    activeTab,
    setActiveTab,
    refreshData,
  };
};
