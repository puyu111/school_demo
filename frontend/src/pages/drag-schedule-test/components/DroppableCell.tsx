import {
  ClockCircleOutlined,
  DragOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { DroppableCellProps } from '../types';
import { getHalfDayType } from '../utils';
import DraggableCourseCard from './DraggableCourseCard';

const DroppableCell: React.FC<DroppableCellProps> = ({
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
  const isMobileDetected =
    isMobileProp ||
    (typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent,
      ));

  const [{ isOver, canDrop: canDropState }, drop] = useDrop(
    () => ({
      accept: 'COURSE',
      drop: (item: any) => {
        if (item.type === 'COURSE') {
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

      {/* 被跨越的单元格：渲染课程延续标识 */}
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

export default DroppableCell;
