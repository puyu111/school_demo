import { useCallback, useMemo, useState } from "react";
import type {
  Course,
  DailyScheduleConfig,
  HalfDayConfig,
  TimeSlotConfig,
  WeekDayConfig,
} from "../types";

interface UseScheduleData {
  courses: Course[];
  pendingCourses: Course[];
  selectedCourse: Course | null;
  conflicts: any[];
  history: any[];
  recommendations: any[];
  mockData: any;
  setSelectedCourse: (course: Course | null) => void;
  addCourseToSchedule: (course: Course) => void;
  removeCourseFromSchedule: (courseId: string) => void;
  autoSchedule: () => { scheduled: number; failed: number };
  clearAllSchedule: () => void;
  resetData: () => void;
  setConflicts: (conflicts: any[]) => void;
}

// 生成模拟课程数据
export const generateMockCourses = (totalWeeks: number = 20): Course[] => {
  const colors = [
    "#1890ff",
    "#52c41a",
    "#faad14",
    "#f5222d",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#fa8c16",
  ];
  const coursesByWeek: Record<number, Course[]> = {
    1: [
      {
        id: "w1-1",
        courseName: "高等数学",
        teacherName: "张教授",
        teacherId: "t001",
        className: "计算机科学与技术 1 班",
        classId: "c001",
        roomName: "教学楼 A-301",
        roomId: "r001",
        weekDay: 1,
        startTime: "08:00",
        endTime: "10:00",
        duration: 120,
        color: colors[0],
        weeks: [1],
        studentCount: 45,
      },
      {
        id: "w1-2",
        courseName: "大学英语",
        teacherName: "李老师",
        teacherId: "t002",
        className: "计算机科学与技术 1 班",
        classId: "c001",
        roomName: "教学楼 B-201",
        roomId: "r002",
        weekDay: 1,
        startTime: "10:10",
        endTime: "11:55",
        duration: 45,
        color: colors[1],
        weeks: [1],
        studentCount: 40,
      },
      {
        id: "w1-3",
        courseName: "数据结构",
        teacherName: "王教授",
        teacherId: "t003",
        className: "计算机科学与技术 1 班",
        classId: "c001",
        roomName: "实验楼 C-401",
        roomId: "r003",
        weekDay: 2,
        startTime: "08:00",
        endTime: "08:45",
        duration: 45,
        color: colors[2],
        weeks: [1],
        studentCount: 42,
      },
    ],
    2: [
      {
        id: "w2-1",
        courseName: "操作系统",
        teacherName: "赵老师",
        teacherId: "t004",
        className: "计算机科学与技术 1 班",
        classId: "c001",
        roomName: "教学楼 A-305",
        roomId: "r004",
        weekDay: 2,
        startTime: "14:00",
        endTime: "14:45",
        duration: 45,
        color: colors[3],
        weeks: [2],
        studentCount: 38,
      },
      {
        id: "w2-2",
        courseName: "计算机网络",
        teacherName: "孙教授",
        teacherId: "t005",
        className: "计算机科学与技术 1 班",
        classId: "c001",
        roomName: "教学楼 A-302",
        roomId: "r005",
        weekDay: 3,
        startTime: "08:00",
        endTime: "08:45",
        duration: 45,
        color: colors[4],
        weeks: [2],
        studentCount: 44,
      },
    ],
    3: [
      {
        id: "w3-1",
        courseName: "数据库原理",
        teacherName: "钱老师",
        teacherId: "t006",
        className: "计算机科学与技术 1 班",
        classId: "c001",
        roomName: "实验楼 C-301",
        roomId: "r006",
        weekDay: 3,
        startTime: "14:00",
        endTime: "14:45",
        duration: 45,
        color: colors[5],
        weeks: [3],
        studentCount: 41,
      },
      {
        id: "w3-2",
        courseName: "软件工程",
        teacherName: "周教授",
        teacherId: "t007",
        className: "计算机科学与技术 1 班",
        classId: "c001",
        roomName: "教学楼 B-301",
        roomId: "r007",
        weekDay: 4,
        startTime: "10:10",
        endTime: "10:55",
        duration: 45,
        color: colors[6],
        weeks: [3],
        studentCount: 39,
      },
    ],
  };

  const allCourses: Course[] = [];

  for (let week = 1; week <= totalWeeks; week++) {
    if (coursesByWeek[week]) {
      allCourses.push(...coursesByWeek[week]);
    } else {
      const weekCourses: Course[] = [
        {
          id: `w${week}-default-1`,
          courseName: "高等数学",
          teacherName: "张教授",
          teacherId: "t001",
          className: "计算机科学与技术 1 班",
          classId: "c001",
          roomName: "教学楼 A-301",
          roomId: "r001",
          weekDay: 1,
          startTime: "08:00",
          endTime: "08:45",
          duration: 45,
          color: colors[0],
          weeks: [week],
          studentCount: 45,
        },
        {
          id: `w${week}-default-2`,
          courseName: "数据结构",
          teacherName: "王教授",
          teacherId: "t003",
          className: "计算机科学与技术 1 班",
          classId: "c001",
          roomName: "实验楼 C-401",
          roomId: "r003",
          weekDay: 2,
          startTime: "10:10",
          endTime: "10:55",
          duration: 45,
          color: colors[2],
          weeks: [week],
          studentCount: 42,
        },
      ];
      allCourses.push(...weekCourses);
    }
  }

  return allCourses;
};

// 默认时段配置生成
export const generateDefaultTimeSlots = (): TimeSlotConfig[] => {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getHalfDayType = (
    time: string
  ): "morning" | "afternoon" | "evening" => {
    const minutes = timeToMinutes(time);
    if (minutes < timeToMinutes("12:00")) return "morning";
    if (minutes >= timeToMinutes("14:00") && minutes < timeToMinutes("18:00"))
      return "afternoon";
    if (minutes >= timeToMinutes("19:00")) return "evening";
    return "morning";
  };

  const slots: TimeSlotConfig[] = [];
  const configs = [
    { label: "第 1 节", start: "08:00", duration: 45 },
    { label: "第 2 节", start: "08:50", duration: 45 },
    { label: "第 3 节", start: "10:10", duration: 45 },
    { label: "第 4 节", start: "11:00", duration: 45 },
    { label: "第 5 节", start: "14:00", duration: 45 },
    { label: "第 6 节", start: "14:50", duration: 45 },
    { label: "第 7 节", start: "16:10", duration: 45 },
    { label: "第 8 节", start: "17:00", duration: 45 },
    { label: "第 9 节", start: "19:00", duration: 45 },
    { label: "第 10 节", start: "19:50", duration: 45 },
  ];

  configs.forEach((config, index) => {
    const [hours, minutes] = config.start.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + config.duration;

    const hoursEnd = Math.floor(endMinutes / 60);
    const minsEnd = endMinutes % 60;
    const endTime = `${hoursEnd.toString().padStart(2, "0")}:${minsEnd
      .toString()
      .padStart(2, "0")}`;

    slots.push({
      id: `slot-${index + 1}`,
      label: config.label,
      startTime: config.start,
      endTime,
      duration: config.duration,
      halfDayType: getHalfDayType(config.start),
      isBreak: false,
      breakAfter: index < configs.length - 1 ? 10 : 0,
      isSchedulable: true,
    });
  });

  return slots;
};

// 默认星期配置
export const defaultWeekDays: WeekDayConfig[] = [
  { id: 1, name: "周一", isEnabled: true, isSchedulable: true },
  { id: 2, name: "周二", isEnabled: true, isSchedulable: true },
  { id: 3, name: "周三", isEnabled: true, isSchedulable: true },
  { id: 4, name: "周四", isEnabled: true, isSchedulable: true },
  { id: 5, name: "周五", isEnabled: true, isSchedulable: true },
  { id: 6, name: "周六", isEnabled: false, isSchedulable: false },
  { id: 7, name: "周日", isEnabled: false, isSchedulable: false },
];

// 默认每日配置
export const defaultDailyConfig: DailyScheduleConfig = {
  totalPeriods: 10,
  defaultDuration: 45,
  defaultBreakDuration: 10,
};

// 默认半天配置
export const DEFAULT_HALF_DAY_CONFIG: HalfDayConfig[] = [
  {
    type: "morning",
    name: "上午",
    startTime: "08:00",
    endTime: "12:00",
    isSchedulable: true,
  },
  {
    type: "afternoon",
    name: "下午",
    startTime: "14:00",
    endTime: "18:00",
    isSchedulable: true,
  },
  {
    type: "evening",
    name: "晚上",
    startTime: "19:00",
    endTime: "21:00",
    isSchedulable: true,
  },
];

// 自定义 Hook：排课数据管理
export const useScheduleData = (totalWeeks: number = 20): UseScheduleData => {
  const [courses, setCourses] = useState<Course[]>(() =>
    generateMockCourses(totalWeeks)
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // 当前周待排课程
  const pendingCourses = useMemo(() => {
    return courses.filter((c) => c.weeks.includes(1));
  }, [courses]);

  // 推荐算法（简化版）
  const recommendations = useMemo(() => {
    if (!selectedCourse) return [];
    return [
      { day: 1, slot: 1 },
      { day: 2, slot: 3 },
      { day: 4, slot: 5 },
    ];
  }, [selectedCourse]);

  // Mock 数据
  const mockData = {
    weekDays: defaultWeekDays,
    timeSlots: generateDefaultTimeSlots(),
    teachers: [],
    classes: [],
  };

  const addCourseToSchedule = useCallback((course: Course) => {
    setCourses((prev) => [...prev, course]);
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        action: "added",
        courseName: course.courseName,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  const removeCourseFromSchedule = useCallback(
    (courseId: string) => {
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            action: "removed",
            courseName: course.courseName,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    },
    [courses]
  );

  const autoSchedule = useCallback(() => {
    const scheduled = 0;
    const failed = 0;
    // 简化实现
    return { scheduled, failed };
  }, []);

  const clearAllSchedule = useCallback(() => {
    setCourses([]);
    setHistory([]);
    setConflicts([]);
  }, []);

  const resetData = useCallback(() => {
    setCourses(generateMockCourses(totalWeeks));
    setHistory([]);
    setConflicts([]);
    setSelectedCourse(null);
  }, [totalWeeks]);

  return {
    courses,
    pendingCourses,
    selectedCourse,
    conflicts,
    history,
    recommendations,
    mockData,
    setSelectedCourse,
    addCourseToSchedule,
    removeCourseFromSchedule,
    autoSchedule,
    clearAllSchedule,
    resetData,
    setConflicts,
  };
};
