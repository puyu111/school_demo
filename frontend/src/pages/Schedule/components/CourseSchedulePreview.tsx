import {
  BookOutlined,
  CalendarOutlined as CalendarIcon,
  ClockCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FilePdfOutlined,
  HomeOutlined,
  LeftOutlined,
  PictureOutlined,
  RightOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Empty,
  List,
  type MenuProps,
  message,
  Popover,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TIME_SLOTS, WEEK_DAY_OPTIONS } from '../constants';
import { useScheduleData } from '../hooks/useScheduleData';
import {
  courseCardStyles,
  dayScheduleStyles,
  scheduleControlsStyles,
  schedulePreviewStyles,
} from '../styles';
import type {
  Course,
  CourseAction,
  CourseSchedulePreviewProps,
  ViewMode,
  WeekOption,
} from '../types';

const weekOptions: WeekOption[] = Array.from({ length: 20 }, (_, i) => ({
  label: `第${i + 1}周`,
  value: i + 1,
}));

const { Text, Title } = Typography;

// 响应式 Hook - 检测是否为移动端
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// 工具函数
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 获取课程占据的时段数量
const getCourseSpanCount = (
  course: Course,
  timeSlots: typeof TIME_SLOTS,
): number => {
  const startIndex = timeSlots.findIndex(
    (slot) => slot.startTime === course.startTime,
  );
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

// 获取时间段标签
const getTimeSlotLabel = (
  startTime: string,
): 'morning' | 'afternoon' | 'evening' => {
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

// 课程占据映射表条目
interface CourseOccupancyEntry {
  courseId: string;
  isFirstCell: boolean;
  spanCount: number;
  course: Course;
}

// 课程卡片组件（优化版，用于网格中）
const CompactCourseCard: React.FC<{
  course: Course;
  onAction: (action: CourseAction) => void;
  spanCount?: number;
  isHovered?: boolean;
}> = ({ course, onAction, spanCount = 1, isHovered }) => {
  const timeSlotType = getTimeSlotLabel(course.startTime);

  // 时间段图标 - 使用 SVG 图标替代 emoji
  const timeSlotIcons = {
    morning: (
      <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.9 }}>
        🌅
      </span>
    ),
    afternoon: (
      <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.9 }}>
        ☀️
      </span>
    ),
    evening: (
      <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.9 }}>
        🌙
      </span>
    ),
  };

  const popoverContent = (
    <div
      style={{
        ...courseCardStyles.popover,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: course.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${course.color}40`,
          }}
        >
          <BookOutlined style={{ color: '#fff', fontSize: '20px' }} />
        </div>
        <div>
          <Text strong style={{ fontSize: '15px', display: 'block' }}>
            {course.courseName}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {course.className}
          </Text>
        </div>
      </div>

      <div style={courseCardStyles.popoverRow}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(24, 144, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
          }}
        >
          <UserOutlined style={{ color: '#1890ff' }} />
        </div>
        <Text>教师：{course.teacherName}</Text>
      </div>
      <div style={courseCardStyles.popoverRow}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(82, 196, 26, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
          }}
        >
          <TeamOutlined style={{ color: '#52c41a' }} />
        </div>
        <Text>
          班级：{course.className} ({course.studentCount}人)
        </Text>
      </div>
      <div style={courseCardStyles.popoverRow}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(114, 46, 209, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
          }}
        >
          <HomeOutlined style={{ color: '#722ed1' }} />
        </div>
        <Text>教室：{course.roomName}</Text>
      </div>
      <div style={courseCardStyles.popoverRow}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(250, 173, 20, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
          }}
        >
          <ClockCircleOutlined style={{ color: '#faad14' }} />
        </div>
        <Text>
          时间：周{course.weekDay} {course.startTime}-{course.endTime}
        </Text>
      </div>
      {course.weeks && course.weeks.length > 0 && (
        <div style={courseCardStyles.popoverRow}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(26, 194, 194, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
            }}
          >
            <CalendarIcon style={{ color: '#13c2c2' }} />
          </div>
          <Text>周次：{course.weeks.length} 周</Text>
        </div>
      )}
      <Divider style={{ margin: '12px 0' }} />
      <Space style={{ justifyContent: 'center', width: '100%' }}>
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onAction('view')}
          style={{ borderRadius: '6px' }}
        >
          查看
        </Button>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => onAction('edit')}
          style={{ borderRadius: '6px' }}
        >
          编辑
        </Button>
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onAction('delete')}
          style={{ borderRadius: '6px' }}
        >
          删除
        </Button>
      </Space>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      title={<div style={{ fontWeight: 600, color: '#333' }}>课程详情</div>}
      trigger="click"
      overlayStyle={{ maxWidth: '360px' }}
    >
      <button
        type="button"
        style={{
          ...courseCardStyles.compact.container,
          backgroundColor: course.color,
          height: '100%',
          minHeight: spanCount > 1 ? `${spanCount * 60 - 4}px` : '60px',
          padding: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
          boxShadow: isHovered
            ? '0 12px 32px rgba(0,0,0,0.2)'
            : '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.35)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
        className="course-card"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
          }
        }}
      >
        {/* 光泽效果 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <div style={courseCardStyles.compact.header}>
          <strong
            style={{
              ...courseCardStyles.compact.courseName,
              fontSize: '14px',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              fontWeight: 700,
            }}
          >
            {course.courseName}
          </strong>
        </div>
        <div
          style={{
            fontSize: '11px',
            opacity: 0.95,
            marginTop: '6px',
            color: '#fff',
            lineHeight: 1.7,
          }}
        >
          <div
            style={{
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ClockCircleOutlined
              style={{ marginRight: '5px', fontSize: '12px' }}
            />
            {course.startTime}-{course.endTime}
            {timeSlotIcons[timeSlotType]}
          </div>
          <div
            style={{
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <UserOutlined style={{ marginRight: '5px', fontSize: '12px' }} />
            {course.teacherName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HomeOutlined style={{ marginRight: '5px', fontSize: '12px' }} />
            {course.roomName}
          </div>
        </div>
        {spanCount > 1 && (
          <div
            style={{
              ...courseCardStyles.compact.badge,
              backdropFilter: 'blur(10px)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <ExperimentOutlined style={{ fontSize: '10px' }} />
            {spanCount}节连上
          </div>
        )}
      </button>
    </Popover>
  );
};

/**
 * 课表预览组件 - 使用 CSS Grid 布局
 * 现代化 UI 设计
 */
const CourseSchedulePreview: React.FC<CourseSchedulePreviewProps> = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // 使用课表数据 Hook
  const { courses, loading, error, refreshSchedule } =
    useScheduleData(currentWeek);

  // 课表内容 ref
  const scheduleContentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // 生成班级和教师选项
  const classOptions = useMemo(() => {
    const classes = [...new Set((courses || []).map((c) => c.className))];
    return [
      { label: '全部班级', value: 'all' },
      ...classes.map((name) => ({ label: name, value: name })),
    ];
  }, [courses]);

  const teacherOptions = useMemo(() => {
    const teachers = [...new Set((courses || []).map((c) => c.teacherName))];
    return [
      { label: '全部教师', value: 'all' },
      ...teachers.map((name) => ({ label: name, value: name })),
    ];
  }, [courses]);

  // 过滤课程
  const filteredCourses = useMemo(() => {
    return (courses || []).filter(
      (course) =>
        course.weeks.includes(currentWeek) &&
        (filterClass === 'all' || course.className === filterClass) &&
        (filterTeacher === 'all' || course.teacherName === filterTeacher),
    );
  }, [currentWeek, filterClass, filterTeacher, courses]);

  // 构建课程占据映射表
  const courseOccupancyMap = useMemo(() => {
    const map: Record<string, CourseOccupancyEntry> = {};

    filteredCourses.forEach((course) => {
      const startIndex = TIME_SLOTS.findIndex(
        (slot) => slot.startTime === course.startTime,
      );
      if (startIndex === -1) return;

      const spanCount = getCourseSpanCount(course, TIME_SLOTS);
      const startKey = `${course.weekDay}-${startIndex}`;
      map[startKey] = {
        courseId: course.id,
        isFirstCell: true,
        spanCount,
        course,
      };

      // 标记后续占据的位置
      for (
        let i = 1;
        i < spanCount && startIndex + i < TIME_SLOTS.length;
        i++
      ) {
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
  }, [filteredCourses]);

  // 课程操作
  const handleCourseAction = useCallback(
    (action: CourseAction, course: Course) => {
      switch (action) {
        case 'view':
          message.info({
            content: `查看课程：${course.courseName}`,
            icon: <EyeOutlined style={{ color: '#1890ff' }} />,
          });
          break;
        case 'edit':
          message.info({
            content: `编辑课程：${course.courseName}`,
            icon: <EditOutlined style={{ color: '#52c41a' }} />,
          });
          break;
        case 'delete':
          message.warning({
            content: `确定删除课程：${course.courseName}?`,
            icon: <DeleteOutlined />,
          });
          break;
      }
    },
    [],
  );

  // 前一天/后一天
  const handlePrevDay = () =>
    setCurrentDay((prev) => (prev === 1 ? 7 : prev - 1));
  const handleNextDay = () =>
    setCurrentDay((prev) => (prev === 7 ? 1 : prev + 1));

  // 导出为图片
  const exportToImage = useCallback(async () => {
    if (!scheduleContentRef.current) {
      message.error('课表内容未加载');
      return;
    }

    setExporting(true);
    try {
      const canvas = await html2canvas(scheduleContentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `课表 - 第${currentWeek}周.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('课表图片已下载');
        }
      }, 'image/png');
    } catch (error) {
      console.error('导出图片失败:', error);
      message.error('导出图片失败，请重试');
    } finally {
      setExporting(false);
    }
  }, [currentWeek]);

  // 导出为 PDF
  const exportToPDF = useCallback(async () => {
    if (!scheduleContentRef.current) {
      message.error('课表内容未加载');
      return;
    }

    setExporting(true);
    try {
      const canvas = await html2canvas(scheduleContentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 横向宽度 (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`课表 - 第${currentWeek}周.pdf`);
      message.success('课表 PDF 已下载');
    } catch (error) {
      console.error('导出 PDF 失败:', error);
      message.error('导出 PDF 失败，请重试');
    } finally {
      setExporting(false);
    }
  }, [currentWeek]);

  // 导出菜单
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'image',
      icon: <PictureOutlined />,
      label: '导出为图片',
      onClick: exportToImage,
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: '导出为 PDF',
      onClick: exportToPDF,
    },
  ];

  // 渲染周视图（CSS Grid 布局 - 优化版）
  const renderWeekView = () => {
    const hasCurrentWeekData = filteredCourses.length > 0;
    const today = new Date().getDay() || 7;
    const isCurrentWeek = currentWeek === 1;

    // 响应式列宽
    const timeColumnWidth = isMobile ? '50px' : '70px';
    const headerFontSize = isMobile ? '11px' : '13px';
    const timeSlotFontSize = isMobile ? '10px' : '11px';

    // 渲染表头
    const renderHeader = () => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${timeColumnWidth} repeat(7, 1fr)`,
          borderBottom: 'none',
          backgroundColor: 'transparent',
          borderRadius: '12px 12px 0 0',
          overflow: 'hidden',
        }}
      >
        {/* 左上角：节次 */}
        <div
          style={{
            padding: '12px 4px',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: headerFontSize,
            borderRight: '1px solid rgba(255,255,255,0.2)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          }}
        >
          <div>{isMobile ? '节' : '节次'}</div>
        </div>
        {/* 星期表头 */}
        {WEEK_DAY_OPTIONS.map((day, index) => {
          const isToday = isCurrentWeek && day.id === today;
          return (
            <div
              key={day.id}
              style={{
                padding: '12px 2px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: headerFontSize,
                borderRight:
                  index < 6 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                background: isToday
                  ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
                  : 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
                color: isToday ? '#fff' : '#333',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: isToday
                  ? '0 2px 8px rgba(24, 144, 255, 0.3)'
                  : 'none',
              }}
            >
              <div>{isMobile ? day.name.replace('周', '') : day.name}</div>
              {isToday && (
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    right: '50%',
                    transform: 'translateX(50%)',
                    fontSize: '9px',
                    color: '#fff',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  今天
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    // 渲染表格内容
    const renderTableBody = () => (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${timeColumnWidth} repeat(7, 1fr)`,
          gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${isMobile ? '50px' : '56px'})`,
          border: '1px solid #f0f0f0',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        {TIME_SLOTS.map((slot, slotIndex) => {
          const hour = parseInt(slot.startTime.split(':')[0], 10);
          const timeSlotType =
            hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
          const sectionBgColors = {
            morning: 'rgba(230, 247, 255, 0.5)',
            afternoon: 'rgba(255, 247, 219, 0.5)',
            evening: 'rgba(246, 236, 255, 0.5)',
          };

          return (
            <React.Fragment key={slot.key}>
              {/* 左侧时间列 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 2px',
                  borderRight: '1px solid #f0f0f0',
                  borderBottom:
                    slotIndex < TIME_SLOTS.length - 1
                      ? '1px solid #f0f0f0'
                      : 'none',
                  backgroundColor: sectionBgColors[timeSlotType],
                  fontSize: timeSlotFontSize,
                  boxSizing: 'border-box',
                  gridRow: `${slotIndex + 1} / ${slotIndex + 2}`,
                  transition: 'background-color 0.2s ease',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: '#333',
                    fontSize: timeSlotFontSize,
                  }}
                >
                  {isMobile
                    ? slot.label.replace('第', '').replace('节', '')
                    : slot.label}
                </span>
                {!isMobile && (
                  <span
                    style={{ color: '#666', fontSize: '9px', marginTop: '2px' }}
                  >
                    {slot.startTime}
                  </span>
                )}
              </div>

              {/* 星期课程网格 */}
              {WEEK_DAY_OPTIONS.map((day, dayIndex) => {
                const key = `${day.id}-${slotIndex}`;
                const occupancy = courseOccupancyMap[key];
                const isRowSpanned = occupancy && !occupancy.isFirstCell;
                const spanCount = occupancy?.isFirstCell
                  ? occupancy.spanCount
                  : 1;
                const course = occupancy?.isFirstCell ? occupancy.course : null;
                const isHovered = hoveredCourseId === occupancy?.course.id;

                // 被跨节课程占据但非起始单元格：只占当前行，不渲染内容
                if (isRowSpanned) {
                  return (
                    <div
                      key={day.id}
                      style={{
                        borderRight:
                          dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                        borderBottom:
                          slotIndex < TIME_SLOTS.length - 1
                            ? '1px solid #f0f0f0'
                            : 'none',
                        backgroundColor: 'rgba(0,0,0,0.015)',
                        gridRow: `${slotIndex + 1} / ${slotIndex + 2}`,
                        gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                      }}
                      aria-hidden="true"
                    />
                  );
                }

                // 跨节课程的起始单元格或普通单元格
                const gridRowValue =
                  spanCount > 1
                    ? `${slotIndex + 1} / span ${spanCount}`
                    : `${slotIndex + 1} / ${slotIndex + 2}`;

                return (
                  <div
                    key={day.id}
                    style={{
                      padding: isMobile ? '3px' : '4px',
                      borderRight: dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                      borderBottom:
                        spanCount > 1
                          ? 'none'
                          : slotIndex < TIME_SLOTS.length - 1
                            ? '1px solid #f0f0f0'
                            : 'none',
                      backgroundColor: course ? 'transparent' : '#fff',
                      transition: 'all 0.2s ease',
                      gridRow: gridRowValue,
                      gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                      zIndex: spanCount > 1 ? 10 : 1,
                      cursor: course ? 'pointer' : 'default',
                    }}
                    onMouseEnter={() => course && setHoveredCourseId(course.id)}
                    onMouseLeave={() => setHoveredCourseId(null)}
                  >
                    {course ? (
                      <CompactCourseCard
                        course={course}
                        onAction={(action) =>
                          handleCourseAction(action, course)
                        }
                        spanCount={spanCount}
                        isHovered={isHovered}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#e5e5e5',
                          fontSize: isMobile ? '14px' : '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderRadius: '6px',
                          fontWeight: 300,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1890ff';
                          e.currentTarget.style.backgroundColor = '#f0f5ff';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#e5e5e5';
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        +
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    );

    return (
      <div>
        {/* 课表主体 */}
        <div
          style={{
            border: 'none',
            borderRadius: '12px',
            overflow: 'visible',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        >
          {renderHeader()}
          {renderTableBody()}
        </div>

        {/* 空状态提示 */}
        {!hasCurrentWeekData && (
          <div
            style={{
              marginTop: '32px',
              padding: '60px 20px',
              textAlign: 'center',
              background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
              borderRadius: '16px',
              border: '2px dashed #d9d9d9',
            }}
          >
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📅</div>
            <div
              style={{
                fontSize: '18px',
                color: '#666',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              第{currentWeek}周暂无课程安排
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              请切换到其他周次查看
            </div>
          </div>
        )}

        {/* 图例 */}
        {hasCurrentWeekData && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px 20px',
              backgroundColor: '#fafafa',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              border: '1px solid #f0f0f0',
            }}
          >
            <Text strong style={{ color: '#666' }}>
              图例：
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(230, 247, 255, 0.8)',
                  border: '1px solid #91d5ff',
                  boxShadow: '0 2px 4px rgba(145, 213, 255, 0.3)',
                }}
              />
              <Text
                style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}
              >
                上午
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 247, 219, 0.8)',
                  border: '1px solid #ffd666',
                  boxShadow: '0 2px 4px rgba(255, 214, 102, 0.3)',
                }}
              />
              <Text
                style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}
              >
                下午
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(246, 236, 255, 0.8)',
                  border: '1px solid #b37feb',
                  boxShadow: '0 2px 4px rgba(179, 127, 235, 0.3)',
                }}
              />
              <Text
                style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}
              >
                晚上
              </Text>
            </div>
            <Divider type="vertical" style={{ height: '20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>🌅</span>
              <Text style={{ fontSize: '13px', color: '#666' }}>上午</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>☀️</span>
              <Text style={{ fontSize: '13px', color: '#666' }}>下午</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>🌙</span>
              <Text style={{ fontSize: '13px', color: '#666' }}>晚上</Text>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染日视图
  const renderDayView = () => {
    const dayName = WEEK_DAY_OPTIONS.find((d) => d.id === currentDay)?.name;
    const dayCourses = filteredCourses.filter((c) => c.weekDay === currentDay);

    return (
      <div>
        <div style={dayScheduleStyles.header}>
          <Title level={4} style={{ margin: 0 }}>
            {dayName}课程表
          </Title>
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={handlePrevDay}
              size="small"
            >
              前一天
            </Button>
            <span style={{ fontSize: '16px', fontWeight: 500 }}>{dayName}</span>
            <Button
              icon={<RightOutlined />}
              onClick={handleNextDay}
              size="small"
            >
              后一天
            </Button>
          </Space>
        </div>
        <div style={dayScheduleStyles.container}>
          <div style={dayScheduleStyles.timeColumn}>
            {TIME_SLOTS.map((slot) => (
              <div key={slot.key} style={dayScheduleStyles.timeSlot}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {slot.label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  {slot.startTime}
                </div>
              </div>
            ))}
          </div>
          <div style={dayScheduleStyles.courseColumn}>
            {TIME_SLOTS.map((slot) => {
              const coursesInSlot = dayCourses.filter(
                (c) => c.startTime === slot.startTime,
              );
              return (
                <div key={slot.key} style={dayScheduleStyles.courseRow}>
                  {coursesInSlot.length > 0 ? (
                    coursesInSlot.map((course) => (
                      <div
                        key={course.id}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <CompactCourseCard
                          course={course}
                          onAction={(action) =>
                            handleCourseAction(action, course)
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <div style={dayScheduleStyles.empty}>
                      <span style={{ fontSize: '14px' }}>暂无课程</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 渲染列表视图
  const renderListView = () => (
    <List
      dataSource={filteredCourses}
      renderItem={(course) => {
        const weekDay = WEEK_DAY_OPTIONS.find(
          (d) => d.id === course.weekDay,
        )?.name;
        return (
          <List.Item
            style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}
          >
            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
              <div
                style={{
                  width: '4px',
                  backgroundColor: course.color,
                  borderRadius: '2px',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <Text strong style={{ fontSize: '16px' }}>
                    {course.courseName}
                  </Text>
                  <Tag color="blue">{weekDay}</Tag>
                  <Tag color="green">
                    {course.startTime}-{course.endTime}
                  </Tag>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '8px',
                    color: '#666',
                  }}
                >
                  <span>
                    <UserOutlined /> {course.teacherName}
                  </span>
                  <span>
                    <TeamOutlined /> {course.className}
                  </span>
                  <span>
                    <HomeOutlined /> {course.roomName}
                  </span>
                  <span>
                    <CalendarIcon /> 第{currentWeek}周
                  </span>
                </div>
                <Space style={{ marginTop: '12px' }}>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleCourseAction('view', course)}
                  >
                    查看
                  </Button>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleCourseAction('edit', course)}
                  >
                    编辑
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleCourseAction('delete', course)}
                  >
                    删除
                  </Button>
                </Space>
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );

  // 统计卡片
  const renderStatistics = () => {
    const statData = {
      total: filteredCourses.length,
      classCount: new Set(filteredCourses.map((c) => c.className)).size,
      roomCount: new Set(filteredCourses.map((c) => c.roomName)).size,
      morningCount: filteredCourses.filter(
        (c) => parseInt(c.startTime, 10) < 12,
      ).length,
      afternoonCount: filteredCourses.filter(
        (c) =>
          parseInt(c.startTime, 10) >= 12 && parseInt(c.startTime, 10) < 18,
      ).length,
    };

    const statCards = [
      {
        title: '本周课程数',
        value: statData.total,
        icon: <BookOutlined />,
        color: '#1890ff',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      {
        title: '涉及班级',
        value: statData.classCount,
        icon: <TeamOutlined />,
        color: '#52c41a',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      {
        title: '使用教室',
        value: statData.roomCount,
        icon: <HomeOutlined />,
        color: '#722ed1',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      {
        title: '上午课程',
        value: statData.morningCount,
        icon: <span style={{ fontSize: '16px' }}>🌅</span>,
        color: '#fa8c16',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      },
      {
        title: '下午课程',
        value: statData.afternoonCount,
        icon: <span style={{ fontSize: '16px' }}>☀️</span>,
        color: '#faad14',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      },
    ];

    return (
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {statCards.map((stat) => (
          <Col xs={12} sm={8} md={4} key={stat.title}>
            <Card
              hoverable
              style={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: stat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${stat.color}40`,
                  }}
                >
                  <div style={{ color: '#fff', fontSize: '20px' }}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '4px',
                    }}
                  >
                    {stat.title}
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#333',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div style={schedulePreviewStyles.container}>
      {/* 加载状态 */}
      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <Spin size="large" tip="加载课表数据中..." />
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <Empty
          description={
            <div>
              <Text type="danger">加载课表数据失败</Text>
              <br />
              <Text type="secondary">{error.message}</Text>
            </div>
          }
        >
          <Button type="primary" onClick={() => refreshSchedule()}>
            重新加载
          </Button>
        </Empty>
      )}

      {/* 正常渲染课表 */}
      {!loading && !error && (
        <Card
          title={
            <div style={schedulePreviewStyles.headerTitle}>
              <ScheduleOutlined style={{ fontSize: '22px' }} />
              <span>课程表预览</span>
              <Tag
                color="green"
                style={{
                  marginLeft: '12px',
                  fontSize: '12px',
                  padding: '2px 8px',
                }}
              >
                {filteredCourses.length} 门课程
              </Tag>
            </div>
          }
          extra={
            <Dropdown menu={{ items: exportMenuItems }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={exporting}
                style={{
                  borderRadius: '8px',
                  padding: '6px 16px',
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 16px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                导出课表
              </Button>
            </Dropdown>
          }
          style={{
            ...schedulePreviewStyles.footerCard,
            background: '#ffffff',
          }}
        >
          {/* 控制面板 */}
          <div
            style={{
              ...scheduleControlsStyles.container,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} md={12}>
                <Space>
                  <Text strong style={{ color: '#333' }}>
                    视图模式:
                  </Text>
                  <Radio.Group
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="week">周视图</Radio.Button>
                    <Radio.Button value="day">日视图</Radio.Button>
                    <Radio.Button value="list">列表视图</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={8} justify="end">
                  <Col>
                    <Space>
                      <Text strong style={{ color: '#333' }}>
                        周次:
                      </Text>
                      <Select
                        value={currentWeek}
                        onChange={setCurrentWeek}
                        style={{ width: 110, borderRadius: '6px' }}
                        suffixIcon={
                          <CalendarIcon style={{ color: '#1890ff' }} />
                        }
                      >
                        {weekOptions.map((w) => (
                          <Select.Option key={w.value} value={w.value}>
                            {w.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Text strong style={{ color: '#333' }}>
                        班级:
                      </Text>
                      <Select
                        value={filterClass}
                        onChange={setFilterClass}
                        style={{ width: 140, borderRadius: '6px' }}
                        allowClear
                        showSearch
                        placeholder="选择班级"
                      >
                        {classOptions.map((o) => (
                          <Select.Option key={o.value} value={o.value}>
                            {o.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Text strong style={{ color: '#333' }}>
                        教师:
                      </Text>
                      <Select
                        value={filterTeacher}
                        onChange={setFilterTeacher}
                        style={{ width: 120, borderRadius: '6px' }}
                        allowClear
                        showSearch
                        placeholder="选择教师"
                      >
                        {teacherOptions.map((o) => (
                          <Select.Option key={o.value} value={o.value}>
                            {o.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Space>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* 课程表内容 */}
          <div
            ref={scheduleContentRef}
            style={schedulePreviewStyles.scheduleContent}
          >
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'list' && renderListView()}
          </div>

          {/* 统计信息 */}
          {renderStatistics()}
        </Card>
      )}
    </div>
  );
};

export default CourseSchedulePreview;
