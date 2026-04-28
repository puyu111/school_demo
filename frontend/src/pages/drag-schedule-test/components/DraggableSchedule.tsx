import {
  CalendarOutlined,
  ClockCircleOutlined,
  DownOutlined,
  DragOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { message, Select, Tag } from 'antd';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDrag, useDrop } from 'react-dnd';

// ==================== 类型定义 ====================

export interface Course {
  id: string;
  courseName: string;
  teacherName: string;
  teacherId: string;
  className: string;
  classId: string;
  roomName: string;
  roomId: string;
  weekDay: number;
  startTime: string;
  endTime: string;
  duration: number; // 课程时长（分钟）- 新增字段，用于拖拽时保持时长
  color: string;
  weeks: number[];
  studentCount: number;
}

// 半天时段类型
export type HalfDayType = 'morning' | 'afternoon' | 'evening';

// 半天时段配置
export interface HalfDayConfig {
  type: HalfDayType;
  name: string;
  startTime: string; // 半天开始时间
  endTime: string; // 半天结束时间
  isSchedulable: boolean; // 是否可排课
}

// 每天的半天配置
export interface DayHalfDayConfig {
  weekDay: number;
  halfDays: HalfDayConfig[];
}

export interface TimeSlotConfig {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  duration: number;
  halfDayType: HalfDayType; // 所属半天类型
  isBreak: boolean;
  breakAfter?: number;
  isSchedulable: boolean;
}

export interface DailyScheduleConfig {
  totalPeriods: number;
  defaultDuration: number;
  defaultBreakDuration: number;
}

export interface WeekDayConfig {
  id: number;
  name: string;
  isEnabled: boolean;
  isSchedulable: boolean;
}

// 半天时段定义（默认配置）
const _DEFAULT_HALF_DAY_CONFIG: HalfDayConfig[] = [
  {
    type: 'morning',
    name: '上午',
    startTime: '08:00',
    endTime: '12:00',
    isSchedulable: true,
  },
  {
    type: 'afternoon',
    name: '下午',
    startTime: '14:00',
    endTime: '18:00',
    isSchedulable: true,
  },
  {
    type: 'evening',
    name: '晚上',
    startTime: '19:00',
    endTime: '21:00',
    isSchedulable: true,
  },
];

// ==================== 拖拽类型 ====================

const DRAG_TYPE = 'COURSE';

// ==================== 工具函数 ====================

// 检测是否为移动设备
const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent,
  );
};

// 获取设备类型
const _getDeviceType = (): 'mobile' | 'desktop' => {
  return isMobile() ? 'mobile' : 'desktop';
};

// 时间字符串转分钟数
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 分钟数转时间字符串
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// 获取时间所属的半天类型
const getHalfDayType = (time: string): HalfDayType => {
  const minutes = timeToMinutes(time);
  const morningEnd = timeToMinutes('12:00');
  const afternoonStart = timeToMinutes('14:00');
  const afternoonEnd = timeToMinutes('18:00');
  const eveningStart = timeToMinutes('19:00');

  if (minutes < morningEnd) return 'morning';
  if (minutes >= afternoonStart && minutes < afternoonEnd) return 'afternoon';
  if (minutes >= eveningStart) return 'evening';
  return 'morning';
};

// 获取课程起始时段索引
const getCourseStartTimeSlotIndex = (
  course: Course,
  timeSlots: TimeSlotConfig[],
): number => {
  return timeSlots.findIndex((slot) => slot.startTime === course.startTime);
};

// 获取课程占据的时段数量
const getCourseSpanCount = (
  course: Course,
  timeSlots: TimeSlotConfig[],
): number => {
  const startIndex = getCourseStartTimeSlotIndex(course, timeSlots);
  if (startIndex === -1) return 1;

  const courseDuration =
    course.duration ||
    timeToMinutes(course.endTime) - timeToMinutes(course.startTime);
  let accumulatedDuration = 0;

  for (let i = startIndex; i < timeSlots.length; i++) {
    accumulatedDuration =
      timeToMinutes(timeSlots[i].startTime) - timeToMinutes(course.startTime);
    if (accumulatedDuration >= courseDuration) return i - startIndex;
  }

  return 1;
};

// 计算课程结束时间（保持时长）
const calculateEndTime = (startTime: string, duration: number): string => {
  const startMinutes = timeToMinutes(startTime);
  return minutesToTime(startMinutes + duration);
};

// 检查时间段是否在可排课的半天内
const _isTimeInSchedulableHalfDay = (
  startTime: string,
  halfDayConfigs: HalfDayConfig[],
): boolean => {
  const halfDayType = getHalfDayType(startTime);
  const config = halfDayConfigs.find((h) => h.type === halfDayType);
  return config ? config.isSchedulable : false;
};

// ==================== 周次选择器组件 ====================

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
  isMobile?: boolean;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  totalWeeks,
  onWeekChange,
  isMobile: isMobileProp = false,
}) => {
  const weekOptions = Array.from({ length: totalWeeks }, (_, i) => ({
    value: i + 1,
    label: `第${i + 1}周`,
  }));

  const isMobileDetected = isMobileProp || isMobile();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobileDetected ? 12 : 8,
        flexShrink: 0,
      }}
    >
      <LeftOutlined
        onClick={() => currentWeek > 1 && onWeekChange(currentWeek - 1)}
        style={{
          cursor: currentWeek > 1 ? 'pointer' : 'not-allowed',
          color: currentWeek > 1 ? '#1890ff' : '#d9d9d9',
          fontSize: isMobileDetected ? 20 : 16,
          padding: isMobileDetected ? 8 : 4,
          minHeight: 44,
          minWidth: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor:
            currentWeek > 1 ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
        }}
      />

      <Select
        value={currentWeek}
        onChange={onWeekChange}
        options={weekOptions}
        size={isMobileDetected ? 'large' : 'small'}
        style={{
          width: isMobileDetected ? 120 : 100,
          fontSize: isMobileDetected ? 16 : 14,
        }}
        suffixIcon={<DownOutlined />}
      />

      <RightOutlined
        onClick={() =>
          currentWeek < totalWeeks && onWeekChange(currentWeek + 1)
        }
        style={{
          cursor: currentWeek < totalWeeks ? 'pointer' : 'not-allowed',
          color: currentWeek < totalWeeks ? '#1890ff' : '#d9d9d9',
          fontSize: isMobileDetected ? 20 : 16,
          padding: isMobileDetected ? 8 : 4,
          minHeight: 44,
          minWidth: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor:
            currentWeek < totalWeeks
              ? 'rgba(24, 144, 255, 0.1)'
              : 'transparent',
        }}
      />
    </div>
  );
};

// ==================== 可拖拽课程卡片组件 ====================

interface CourseCardProps {
  course: Course;
  weekDay: number;
  timeSlotIndex: number;
  isDragDisabled?: boolean;
  spanCount?: number;
  isMobile?: boolean;
}

const DraggableCourseCard: React.FC<CourseCardProps> = ({
  course,
  weekDay,
  timeSlotIndex,
  isDragDisabled = false,
  spanCount = 1,
  isMobile: isMobileProp = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobileDetected = isMobileProp || isMobile();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: {
        type: DRAG_TYPE,
        courseId: course.id,
        fromWeekDay: weekDay,
        fromTimeSlotIndex: timeSlotIndex,
        course,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      options: {
        dropEffect: 'move',
      },
    }),
    [course, weekDay, timeSlotIndex],
  );

  useEffect(() => {
    if (ref.current && !isDragDisabled) {
      drag(ref.current);
    }
  }, [drag, isDragDisabled, ref]);

  // 移动端样式适配
  const baseFontSize = isMobileDetected ? 14 : 13;
  const iconFontSize = isMobileDetected ? 12 : 10;
  const padding = isMobileDetected ? '10px 8px' : '8px 6px';

  return (
    <div
      ref={ref}
      style={{
        position: spanCount > 1 ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: spanCount > 1 ? 'auto' : '100%',
        minHeight:
          spanCount > 1
            ? `${spanCount * (isMobileDetected ? 60 : 68)}px`
            : 'auto',
        padding,
        borderRadius: '6px',
        backgroundColor: course.color,
        color: '#fff',
        cursor: isDragDisabled
          ? 'not-allowed'
          : isMobileDetected
            ? 'grab'
            : 'move',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        boxShadow: isDragging
          ? '0 8px 16px rgba(0,0,0,0.2)'
          : isMobileDetected
            ? '0 2px 6px rgba(0,0,0,0.15)'
            : '0 1px 4px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        boxSizing: 'border-box',
        zIndex: spanCount > 1 ? 10 : 1,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        touchAction: 'none',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}
      >
        {!isDragDisabled && (
          <DragOutlined
            style={{ marginRight: '4px', fontSize: iconFontSize, opacity: 0.7 }}
          />
        )}
        <span
          style={{
            fontWeight: 600,
            fontSize: baseFontSize,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {course.courseName}
        </span>
      </div>

      <div
        style={{
          fontSize: isMobileDetected ? 11 : 10,
          opacity: 0.95,
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '4px 6px',
          }}
        >
          <ClockCircleOutlined
            style={{ marginRight: '3px', fontSize: iconFontSize }}
          />
          <span>
            {course.startTime}-{course.endTime}
          </span>
          {spanCount > 1 && (
            <Tag
              color="white"
              style={{
                marginLeft: '4px',
                color: course.color,
                borderColor: '#fff',
                fontSize: isMobileDetected ? 11 : 10,
                padding: '0 6px',
              }}
            >
              {spanCount}节连堂
            </Tag>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: isMobileDetected ? 11 : 10,
          }}
        >
          <UserOutlined
            style={{ marginRight: '3px', fontSize: iconFontSize }}
          />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {course.teacherName}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: isMobileDetected ? 11 : 10,
          }}
        >
          <HomeOutlined
            style={{ marginRight: '3px', fontSize: iconFontSize }}
          />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {course.roomName}
          </span>
        </div>
      </div>

      {isDragDisabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningOutlined
            style={{ color: '#fff', fontSize: isMobileDetected ? 22 : 18 }}
          />
        </div>
      )}
    </div>
  );
};

// ==================== 可放置的时间槽单元格组件 ====================

interface DropCellProps {
  weekDay: number;
  timeSlotIndex: number;
  cellCourse: Course | null;
  isOccupied: boolean;
  timeSlot: TimeSlotConfig;
  weekDayConfig: WeekDayConfig;
  halfDayConfigs: HalfDayConfig[];
  onMoveCourse: (
    courseId: string,
    newWeekDay: number,
    newTimeSlotIndex: number,
  ) => void;
  isFirstCell: boolean;
  spanCount?: number;
  isRowSpanned?: boolean; // 是否被连堂课程跨越（非首单元格）
  isMobile?: boolean;
}

const DroppableCell: React.FC<DropCellProps> = ({
  weekDay,
  timeSlotIndex,
  cellCourse,
  isOccupied,
  timeSlot,
  weekDayConfig,
  halfDayConfigs,
  onMoveCourse,
  isFirstCell,
  spanCount = 1,
  isRowSpanned = false,
  isMobile: isMobileProp = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobileDetected = isMobileProp || isMobile();

  const [{ isOver, canDrop: canDropState }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      drop: (item: any) => {
        if (item.type === DRAG_TYPE) {
          if (
            item.fromWeekDay !== weekDay ||
            item.fromTimeSlotIndex !== timeSlotIndex
          ) {
            onMoveCourse(item.courseId, weekDay, timeSlotIndex);
            return { success: true };
          }
        }
        return { success: false };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
      canDrop: (item: any) => {
        // 被跨越的单元格（非首单元格）不能放置
        if (isRowSpanned) {
          return false;
        }

        // 检查星期是否可排课
        if (!weekDayConfig.isEnabled || !weekDayConfig.isSchedulable) {
          return false;
        }

        // 检查时段是否可排课
        if (!timeSlot.isSchedulable) {
          return false;
        }

        // 检查半天配置是否可排课
        const halfDayType = getHalfDayType(timeSlot.startTime);
        const halfDayConfig = halfDayConfigs.find(
          (h) => h.type === halfDayType,
        );
        if (!halfDayConfig?.isSchedulable) {
          return false;
        }

        // 检查目标位置是否已有其他课程
        if (isOccupied && isFirstCell) {
          const draggedCourse = item.course;
          return cellCourse?.id === draggedCourse?.id;
        }

        return !isOccupied;
      },
    }),
    [
      weekDayConfig,
      timeSlot,
      halfDayConfigs,
      isRowSpanned,
      isOccupied,
      isFirstCell,
      cellCourse,
      onMoveCourse,
      weekDay,
      timeSlotIndex,
    ],
  );

  useEffect(() => {
    if (ref.current) {
      drop(ref.current);
    }
  }, [drop]);

  const isHighlighted = isOver && canDropState;

  // 检查半天是否可排课
  const halfDayType = getHalfDayType(timeSlot.startTime);
  const halfDayConfig = halfDayConfigs.find((h) => h.type === halfDayType);
  const isHalfDayForbidden = !halfDayConfig?.isSchedulable;
  const isForbidden =
    !weekDayConfig.isEnabled ||
    !weekDayConfig.isSchedulable ||
    !timeSlot.isSchedulable ||
    isHalfDayForbidden;

  // 根据状态确定背景色
  const getBackgroundColor = () => {
    if (isHighlighted) return '#e6f7ff';
    if (isForbidden) return '#f5f5f5';
    if (isOccupied) return '#fafafa';
    return '#fff';
  };

  const getBorderStyle = () => {
    if (isHighlighted)
      return isMobileDetected ? '3px dashed #1890ff' : '2px dashed #1890ff';
    if (isForbidden) return '1px dotted #d9d9d9';
    return '1px solid #f0f0f0';
  };

  // 移动端样式变量
  const cellPadding = isMobileDetected ? '4px' : '2px';
  const borderRadius = isMobileDetected ? '6px' : '4px';
  const fontSize = isMobileDetected ? 12 : 11;

  return (
    <div
      ref={ref}
      style={{
        height: '100%',
        minHeight: isMobileDetected ? 56 : 48,
        padding: cellPadding,
        backgroundColor: getBackgroundColor(),
        border: getBorderStyle(),
        borderRadius,
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        opacity: isForbidden ? 0.6 : 1,
        position: 'relative',
        boxSizing: 'border-box',
        touchAction: 'none',
      }}
    >
      {isForbidden && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(245,245,245,0.8)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: '#999',
              fontSize,
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: isMobileDetected ? '4px 8px' : '2px 6px',
              borderRadius: '4px',
            }}
          >
            <WarningOutlined
              style={{
                marginRight: isMobileDetected ? 4 : 3,
                fontSize: isMobileDetected ? 14 : 12,
              }}
            />
            {isHalfDayForbidden ? `${halfDayConfig?.name}禁排` : '不可排课'}
          </div>
        </div>
      )}

      {/* 首单元格：渲染完整课程卡片 */}
      {!isForbidden && cellCourse && isFirstCell && !isRowSpanned && (
        <DraggableCourseCard
          course={cellCourse}
          weekDay={weekDay}
          timeSlotIndex={timeSlotIndex}
          isDragDisabled={false}
          spanCount={spanCount}
          isMobile={isMobileDetected}
        />
      )}

      {/* 被跨越的单元格：渲染课程延续标识，保持视觉占位 */}
      {!isForbidden && isRowSpanned && cellCourse && (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px dashed rgba(255,255,255,0.2)',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontSize: isMobileDetected ? 11 : 10,
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              writingMode: 'vertical-rl',
            }}
          >
            <ClockCircleOutlined
              style={{
                display: 'block',
                marginBottom: '2px',
                fontSize: isMobileDetected ? 12 : 10,
              }}
            />
            延续
          </div>
        </div>
      )}

      {/* 空单元格 */}
      {!isForbidden && !cellCourse && !isOccupied && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobileDetected ? 56 : 48,
            flex: 1,
            color: isMobileDetected ? '#bfbfbf' : '#d9d9d9',
            fontSize,
            backgroundColor: isHighlighted
              ? 'rgba(24, 144, 255, 0.05)'
              : 'transparent',
            borderRadius: '4px',
          }}
        >
          {isHighlighted ? (
            <span style={{ color: '#1890ff', fontWeight: 500 }}>
              <DragOutlined style={{ marginRight: 4 }} />
              释放放置
            </span>
          ) : (
            isMobileDetected && '+'
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 主调度表组件 ====================

interface DraggableScheduleProps {
  courses: Course[];
  timeSlots: TimeSlotConfig[];
  weekDays: WeekDayConfig[];
  halfDayConfigs: HalfDayConfig[];
  currentWeek: number;
  totalWeeks?: number;
  onCourseUpdate: (courses: Course[]) => void;
  onWeekChange?: (week: number) => void;
}

const DraggableSchedule: React.FC<DraggableScheduleProps> = ({
  courses,
  timeSlots,
  weekDays,
  halfDayConfigs,
  currentWeek,
  totalWeeks = 20,
  onCourseUpdate,
  onWeekChange,
}) => {
  // 根据周次过滤课程
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => course.weeks.includes(currentWeek));
  }, [courses, currentWeek]);

  // 本地乐观更新状态
  const [optimisticCourses, setOptimisticCourses] = useState<Course[]>([]);

  // 当过滤课程变化时，重置乐观更新
  useEffect(() => {
    setOptimisticCourses(filteredCourses);
  }, [filteredCourses]);

  // 构建课程占据映射表
  const courseOccupancyMap = useMemo(() => {
    const map: Record<
      string,
      {
        courseId: string;
        isFirstCell: boolean;
        spanCount: number;
        course: Course;
      }
    > = {};

    optimisticCourses.forEach((course) => {
      const startIndex = getCourseStartTimeSlotIndex(course, timeSlots);
      const spanCount = getCourseSpanCount(course, timeSlots);

      if (startIndex === -1) return;

      const startKey = `${course.weekDay}-${startIndex}`;
      map[startKey] = {
        courseId: course.id,
        isFirstCell: true,
        spanCount,
        course,
      };

      // 标记后续占据的位置
      for (let i = 1; i < spanCount && startIndex + i < timeSlots.length; i++) {
        const key = `${course.weekDay}-${startIndex + i}`;
        map[key] = {
          courseId: course.id,
          isFirstCell: false,
          spanCount,
          course,
        };
      }
    });

    return map;
  }, [optimisticCourses, timeSlots]);

  // 处理课程移动
  const handleMoveCourse = useCallback(
    (courseId: string, newWeekDay: number, newTimeSlotIndex: number) => {
      const newTimeSlot = timeSlots[newTimeSlotIndex];
      if (!newTimeSlot) return;

      // 检查星期是否可排课
      const targetWeekDay = weekDays.find((d) => d.id === newWeekDay);
      if (!targetWeekDay?.isEnabled || !targetWeekDay.isSchedulable) {
        message.error('目标星期不可排课');
        return;
      }

      // 检查时段是否可排课
      if (!newTimeSlot.isSchedulable) {
        message.error('目标时段不可排课');
        return;
      }

      // 检查半天配置是否可排课
      const halfDayType = getHalfDayType(newTimeSlot.startTime);
      const halfDayConfig = halfDayConfigs.find((h) => h.type === halfDayType);
      if (!halfDayConfig?.isSchedulable) {
        message.error(`${halfDayConfig?.name}时段不可排课`);
        return;
      }

      // 获取被移动的课程
      const movedCourse = optimisticCourses.find((c) => c.id === courseId);
      if (!movedCourse) return;

      // 检查目标位置是否有冲突
      const targetKey = `${newWeekDay}-${newTimeSlotIndex}`;
      const targetOccupancy = courseOccupancyMap[targetKey];
      if (
        targetOccupancy &&
        targetOccupancy.courseId !== courseId &&
        targetOccupancy.isFirstCell
      ) {
        message.error('目标位置已有其他课程');
        return;
      }

      // 计算课程跨度，检查跨度内是否有冲突
      const spanCount = getCourseSpanCount(movedCourse, timeSlots);
      for (let i = 0; i < spanCount; i++) {
        const checkIndex = newTimeSlotIndex + i;
        if (checkIndex >= timeSlots.length) break;

        const checkKey = `${newWeekDay}-${checkIndex}`;
        const checkOccupancy = courseOccupancyMap[checkKey];
        if (checkOccupancy && checkOccupancy.courseId !== courseId) {
          message.error('目标位置与已有课程冲突');
          return;
        }
      }

      // 更新课程数据 - 保持原有课程时长，计算新的结束时间
      const courseDuration =
        movedCourse.duration ||
        timeToMinutes(movedCourse.endTime) -
          timeToMinutes(movedCourse.startTime);
      const newEndTime = calculateEndTime(
        newTimeSlot.startTime,
        courseDuration,
      );

      const updatedCourses = optimisticCourses.map((course) => {
        if (course.id === courseId) {
          return {
            ...course,
            weekDay: newWeekDay,
            startTime: newTimeSlot.startTime,
            endTime: newEndTime,
            duration: courseDuration, // 保持时长不变
          };
        }
        return course;
      });

      setOptimisticCourses(updatedCourses);

      // 显示成功消息
      message.success({
        content: `已将"${movedCourse.courseName}"调整到${targetWeekDay.name} ${newTimeSlot.label}`,
        duration: 2,
      });

      // 调用数据更新回调
      setTimeout(() => {
        onCourseUpdate(updatedCourses);
        console.log('数据已持久化到后端', updatedCourses);
      }, 500);
    },
    [
      optimisticCourses,
      timeSlots,
      weekDays,
      halfDayConfigs,
      courseOccupancyMap,
      onCourseUpdate,
    ],
  );

  // 获取指定单元格的课程信息
  const getCellCourse = (
    weekDay: number,
    timeSlotIndex: number,
  ): {
    course: Course | null;
    isOccupied: boolean;
    isFirstCell: boolean;
    spanCount: number;
    isRowSpanned: boolean; // 是否被连堂课程跨越（非首单元格）
  } => {
    const key = `${weekDay}-${timeSlotIndex}`;
    const occupancy = courseOccupancyMap[key];

    if (!occupancy) {
      return {
        course: null,
        isOccupied: false,
        isFirstCell: true,
        spanCount: 1,
        isRowSpanned: false,
      };
    }

    return {
      course: occupancy.isFirstCell ? occupancy.course : null,
      isOccupied: true,
      isFirstCell: occupancy.isFirstCell,
      spanCount: occupancy.spanCount,
      isRowSpanned: !occupancy.isFirstCell, // 非首单元格即为被跨越的单元格
    };
  };

  // 检查半天是否可排课
  const _isHalfDaySchedulable = (halfDayType: HalfDayType): boolean => {
    return (
      halfDayConfigs.find((h) => h.type === halfDayType)?.isSchedulable ?? true
    );
  };

  const hasCurrentWeekData = filteredCourses.length > 0;

  // 移动端检测
  const isMobileDevice = isMobile();

  return (
    <div>
      {/* 周次选择器 - 移动端适配 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobileDevice ? 10 : 12,
          padding: isMobileDevice ? '10px 12px' : '12px 16px',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          border: '1px solid #f0f0f0',
          flexWrap: 'wrap',
          gap: isMobileDevice ? 8 : 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobileDevice ? 8 : 12,
            flexWrap: 'wrap',
          }}
        >
          <CalendarOutlined
            style={{ fontSize: isMobileDevice ? 16 : 18, color: '#1890ff' }}
          />
          <span style={{ fontWeight: 600, fontSize: isMobileDevice ? 13 : 14 }}>
            当前周次：
          </span>
          <WeekSelector
            currentWeek={currentWeek}
            totalWeeks={totalWeeks}
            onWeekChange={onWeekChange || (() => {})}
            isMobile={isMobileDevice}
          />
        </div>
        <div
          style={{
            fontSize: isMobileDevice ? 12 : 13,
            color: '#666',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Tag color="blue" style={{ margin: 0 }}>
            {filteredCourses.length} 门课程
          </Tag>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            可排课时：{halfDayConfigs.filter((h) => h.isSchedulable).length}/
            {halfDayConfigs.length} 个半天
          </span>
        </div>
      </div>

      {/* 半天配置状态提示 - 移动端适配 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobileDevice ? 6 : 12,
          marginBottom: isMobileDevice ? 10 : 12,
          padding: isMobileDevice ? '8px 10px' : '8px 12px',
          backgroundColor: '#f6ffed',
          borderRadius: '6px',
          border: '1px solid #b7eb8f',
          fontSize: isMobileDevice ? 12 : 13,
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#666', whiteSpace: 'nowrap' }}>
          半天排课状态：
        </span>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobileDevice ? 4 : 8,
          }}
        >
          {halfDayConfigs.map((hd) => (
            <Tag
              key={hd.type}
              color={hd.isSchedulable ? 'green' : 'red'}
              style={{
                margin: 0,
                fontSize: isMobileDevice ? 11 : 13,
                padding: isMobileDevice ? '2px 6px' : undefined,
              }}
            >
              {hd.name}: {hd.isSchedulable ? '可排课' : '禁排课'}
            </Tag>
          ))}
        </div>
      </div>

      {/* 课表主体 - 移动端横向滚动 */}
      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          overflow: isMobileDevice ? 'auto' : 'hidden',
          backgroundColor: '#fff',
          WebkitOverflowScrolling: 'touch',
          maxWidth: '100%',
        }}
      >
        {/* 桌面端：原始网格布局 */}
        {!isMobileDevice ? (
          <>
            {/* 表头：星期 + 半天标识 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '100px repeat(7, 1fr)',
                borderBottom: '2px solid #f0f0f0',
                backgroundColor: '#fafafa',
                minWidth: '700px',
              }}
            >
              {/* 表头第一行 - 节次/星期 */}
              <div
                style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRight: '1px solid #f0f0f0',
                  backgroundColor: '#f5f5f5',
                  gridColumn: '1 / 2',
                  gridRow: '1 / 2',
                }}
              >
                节次 / 时间
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={day.id}
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    borderRight: index < 6 ? '1px solid #f0f0f0' : 'none',
                    backgroundColor: day.isEnabled
                      ? day.isSchedulable
                        ? '#f0f5ff'
                        : '#fff1f0'
                      : '#f5f5f5',
                    opacity: day.isEnabled ? 1 : 0.5,
                    gridColumn: `${index + 2} / ${index + 3}`,
                    gridRow: '1 / 2',
                  }}
                >
                  {day.name}
                </div>
              ))}
              {/* 表头第二行 - 时段/半天标识 */}
              <div
                style={{
                  padding: '4px 8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  borderRight: '1px solid #f0f0f0',
                  color: '#666',
                  gridColumn: '1 / 2',
                  gridRow: '2 / 3',
                }}
              >
                时段
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={day.id}
                  style={{
                    padding: '4px 4px',
                    display: 'flex',
                    gap: '2px',
                    borderRight: index < 6 ? '1px solid #e8e8e8' : 'none',
                    gridColumn: `${index + 2} / ${index + 3}`,
                    gridRow: '2 / 3',
                  }}
                >
                  {halfDayConfigs.map((hd) => (
                    <div
                      key={hd.type}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '11px',
                        padding: '2px 0',
                        backgroundColor: hd.isSchedulable
                          ? '#f6ffed'
                          : '#fff1f0',
                        color: hd.isSchedulable ? '#52c41a' : '#ff4d4f',
                        borderRadius: '2px',
                      }}
                    >
                      {hd.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 表格内容 - 使用时段网格 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '100px repeat(7, 1fr)',
                gap: 0,
                minWidth: '700px',
              }}
            >
              {timeSlots.map((slot, slotIndex) => {
                const halfDayType = getHalfDayType(slot.startTime);
                const halfDayConfig = halfDayConfigs.find(
                  (h) => h.type === halfDayType,
                );

                return (
                  <React.Fragment key={slot.id}>
                    {/* 时间列 */}
                    <div
                      style={{
                        padding: '8px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid #f0f0f0',
                        borderBottom:
                          slotIndex < timeSlots.length - 1
                            ? '1px solid #f0f0f0'
                            : 'none',
                        backgroundColor:
                          slot.isSchedulable && halfDayConfig?.isSchedulable
                            ? '#fafafa'
                            : '#f5f5f5',
                        fontSize: '11px',
                        boxSizing: 'border-box',
                        gridColumn: '1 / 2',
                        gridRow: `${slotIndex + 1} / ${slotIndex + 2}`,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#666' }}>
                        {slot.label}
                      </span>
                      <span style={{ color: '#999' }}>{slot.startTime}</span>
                    </div>

                    {/* 星期列 */}
                    {weekDays.map((day, dayIndex) => {
                      const {
                        course,
                        isOccupied,
                        isFirstCell,
                        spanCount,
                        isRowSpanned,
                      } = getCellCourse(day.id, slotIndex);

                      // 被跨越的单元格不需要渲染外层容器边框，由首单元格的卡片覆盖
                      if (isRowSpanned) {
                        return (
                          <div
                            key={day.id}
                            style={{
                              padding: '0',
                              margin: '0',
                              borderRight:
                                dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                              borderBottom: 'none',
                              gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                              gridRow: `${slotIndex + 1} / ${slotIndex + 2}`,
                              zIndex: 5,
                            }}
                          >
                            <DroppableCell
                              weekDay={day.id}
                              timeSlotIndex={slotIndex}
                              cellCourse={course}
                              isOccupied={isOccupied}
                              timeSlot={slot}
                              weekDayConfig={day}
                              halfDayConfigs={halfDayConfigs}
                              onMoveCourse={handleMoveCourse}
                              isFirstCell={isFirstCell}
                              spanCount={spanCount}
                              isRowSpanned={isRowSpanned}
                              isMobile={isMobileDevice}
                            />
                          </div>
                        );
                      }

                      // 首单元格或普通单元格：需要跨越 spanCount 行
                      return (
                        <div
                          key={day.id}
                          style={{
                            padding: '0',
                            margin: '0',
                            borderRight:
                              dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                            borderBottom:
                              spanCount > 1
                                ? 'none'
                                : slotIndex < timeSlots.length - 1
                                  ? '1px solid #f0f0f0'
                                  : 'none',
                            gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                            gridRow:
                              spanCount > 1
                                ? `${slotIndex + 1} / span ${spanCount}`
                                : `${slotIndex + 1} / ${slotIndex + 2}`,
                            zIndex: spanCount > 1 ? 10 : 1,
                          }}
                        >
                          <DroppableCell
                            weekDay={day.id}
                            timeSlotIndex={slotIndex}
                            cellCourse={course}
                            isOccupied={isOccupied}
                            timeSlot={slot}
                            weekDayConfig={day}
                            halfDayConfigs={halfDayConfigs}
                            onMoveCourse={handleMoveCourse}
                            isFirstCell={isFirstCell}
                            spanCount={spanCount}
                            isRowSpanned={isRowSpanned}
                            isMobile={isMobileDevice}
                          />
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : (
          /* 移动端简化视图 - 按星期纵向堆叠 */
          <div style={{ padding: '8px' }}>
            <div
              style={{
                marginBottom: 8,
                fontSize: 12,
                color: '#999',
                textAlign: 'center',
              }}
            >
              左右滑动查看课表 →
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '60px repeat(7, minmax(80px, 1fr))',
                gap: 0,
                minWidth: '100%',
                border: '1px solid #f0f0f0',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {/* 移动端表头 */}
              <div
                style={{
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '12px',
                  borderRight: '1px solid #f0f0f0',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: '#f5f5f5',
                }}
              >
                节次
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.id}
                  style={{
                    padding: '6px 2px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '11px',
                    borderRight: '1px solid #f0f0f0',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: day.isEnabled
                      ? day.isSchedulable
                        ? '#f0f5ff'
                        : '#fff1f0'
                      : '#f5f5f5',
                    opacity: day.isEnabled ? 1 : 0.5,
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    minHeight: '40px',
                  }}
                >
                  {day.name}
                </div>
              ))}
              {/* 移动端内容 */}
              {timeSlots.map((slot, slotIndex) => (
                <React.Fragment key={slot.id}>
                  <div
                    style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      fontSize: '10px',
                      borderRight: '1px solid #f0f0f0',
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: slot.isSchedulable
                        ? '#fafafa'
                        : '#f5f5f5',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{slot.label}</div>
                    <div style={{ color: '#999', fontSize: '9px' }}>
                      {slot.startTime}
                    </div>
                  </div>
                  {weekDays.map((day) => {
                    const { course, isFirstCell, spanCount, isRowSpanned } =
                      getCellCourse(day.id, slotIndex);
                    const halfDayType = getHalfDayType(slot.startTime);
                    const halfDayConfig = halfDayConfigs.find(
                      (h) => h.type === halfDayType,
                    );
                    const isForbidden =
                      !day.isEnabled ||
                      !day.isSchedulable ||
                      !slot.isSchedulable ||
                      !halfDayConfig?.isSchedulable;

                    return (
                      <div
                        key={day.id}
                        style={{
                          minHeight: '44px',
                          padding: '2px',
                          borderRight: '1px solid #f0f0f0',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: isForbidden
                            ? '#f5f5f5'
                            : course
                              ? '#fafafa'
                              : '#fff',
                          opacity: isForbidden ? 0.6 : 1,
                          position: 'relative',
                        }}
                      >
                        {course && isFirstCell && !isRowSpanned && (
                          <DraggableCourseCard
                            course={course}
                            weekDay={day.id}
                            timeSlotIndex={slotIndex}
                            isDragDisabled={isForbidden}
                            spanCount={spanCount}
                            isMobile={true}
                          />
                        )}
                        {isRowSpanned && (
                          <div
                            style={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '9px',
                              color: '#999',
                            }}
                          >
                            延续
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 空状态提示 - 移动端适配 */}
      {!hasCurrentWeekData && (
        <div
          style={{
            marginTop: isMobileDevice ? 12 : 16,
            padding: isMobileDevice ? '24px 16px' : '40px 20px',
            textAlign: 'center',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px dashed #d9d9d9',
          }}
        >
          <CalendarOutlined
            style={{
              fontSize: isMobileDevice ? 36 : 48,
              color: '#d9d9d9',
              marginBottom: isMobileDevice ? 12 : 16,
            }}
          />
          <div
            style={{
              fontSize: isMobileDevice ? 14 : 16,
              color: '#666',
              marginBottom: 8,
            }}
          >
            第{currentWeek}周暂无课程安排
          </div>
          <div style={{ fontSize: isMobileDevice ? 12 : 13, color: '#999' }}>
            请切换周次或拖拽课程到可排课时段
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableSchedule;
