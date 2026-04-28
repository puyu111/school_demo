import {
  ClockCircleOutlined,
  DragOutlined,
  HomeOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";
import React, { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import type { DraggableCourseCardProps } from "../types";

const DraggableCourseCard: React.FC<DraggableCourseCardProps> = ({
  course,
  weekDay,
  timeSlotIndex,
  isDragDisabled = false,
  spanCount = 1,
  isMobile: isMobileProp = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobileDetected =
    isMobileProp ||
    (typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent
      ));

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "COURSE",
      item: {
        type: "COURSE",
        courseId: course.id,
        fromWeekDay: weekDay,
        fromTimeSlotIndex: timeSlotIndex,
        course,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      options: {
        dropEffect: "move",
      },
    }),
    [course, weekDay, timeSlotIndex]
  );

  useEffect(() => {
    if (ref.current && !isDragDisabled) {
      drag(ref.current);
    }
  }, [drag, isDragDisabled, ref]);

  // 移动端样式适配
  const baseFontSize = isMobileDetected ? 14 : 13;
  const iconFontSize = isMobileDetected ? 12 : 10;
  const padding = isMobileDetected ? "10px 8px" : "8px 6px";

  return (
    <div
      ref={ref}
      style={{
        position: spanCount > 1 ? "absolute" : "relative",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: spanCount > 1 ? "auto" : "100%",
        minHeight:
          spanCount > 1
            ? `${spanCount * (isMobileDetected ? 60 : 68)}px`
            : "auto",
        padding,
        borderRadius: "6px",
        backgroundColor: course.color,
        color: "#fff",
        cursor: isDragDisabled
          ? "not-allowed"
          : isMobileDetected
          ? "grab"
          : "move",
        opacity: isDragging ? 0.5 : 1,
        transition: "all 0.2s",
        boxShadow: isDragging
          ? "0 8px 16px rgba(0,0,0,0.2)"
          : isMobileDetected
          ? "0 2px 6px rgba(0,0,0,0.15)"
          : "0 1px 4px rgba(0,0,0,0.15)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
        boxSizing: "border-box",
        zIndex: spanCount > 1 ? 10 : 1,
        transform: isDragging ? "scale(1.05)" : "scale(1)",
        touchAction: "none",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "2px" }}
      >
        {!isDragDisabled && (
          <DragOutlined
            style={{ marginRight: "4px", fontSize: iconFontSize, opacity: 0.7 }}
          />
        )}
        <span
          style={{
            fontWeight: 600,
            fontSize: baseFontSize,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
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
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "4px 6px",
          }}
        >
          <ClockCircleOutlined
            style={{ marginRight: "3px", fontSize: iconFontSize }}
          />
          <span>
            {course.startTime}-{course.endTime}
          </span>
          {spanCount > 1 && (
            <Tag
              color="white"
              style={{
                marginLeft: "4px",
                color: course.color,
                borderColor: "#fff",
                fontSize: isMobileDetected ? 11 : 10,
                padding: "0 6px",
              }}
            >
              {spanCount}节连堂
            </Tag>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: isMobileDetected ? 11 : 10,
          }}
        >
          <UserOutlined
            style={{ marginRight: "3px", fontSize: iconFontSize }}
          />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {course.teacherName}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: isMobileDetected ? 11 : 10,
          }}
        >
          <HomeOutlined
            style={{ marginRight: "3px", fontSize: iconFontSize }}
          />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {course.roomName}
          </span>
        </div>
      </div>

      {isDragDisabled && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningOutlined
            style={{ color: "#fff", fontSize: isMobileDetected ? 22 : 18 }}
          />
        </div>
      )}
    </div>
  );
};

export default DraggableCourseCard;
