import { CalendarOutlined } from "@ant-design/icons";
import { message, Tag } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CellCourseInfo,
  Course,
  CourseOccupancyEntry,
  ScheduleTableProps,
} from "../types";
import {
  calculateEndTime,
  getCourseSpanCount,
  getCourseStartTimeSlotIndex,
  getHalfDayType,
  timeToMinutes,
} from "../utils";
import DroppableCell from "./DroppableCell";
import WeekSelector from "./WeekSelector";

const ScheduleTable: React.FC<ScheduleTableProps> = ({
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
    const map: Record<string, CourseOccupancyEntry> = {};

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
        message.error("目标星期不可排课");
        return;
      }

      // 检查时段是否可排课
      if (!newTimeSlot.isSchedulable) {
        message.error("目标时段不可排课");
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
        message.error("目标位置已有其他课程");
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
          message.error("目标位置与已有课程冲突");
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
        courseDuration
      );

      const updatedCourses = optimisticCourses.map((course) => {
        if (course.id === courseId) {
          return {
            ...course,
            weekDay: newWeekDay,
            startTime: newTimeSlot.startTime,
            endTime: newEndTime,
            duration: courseDuration,
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
        console.log("数据已持久化到后端", updatedCourses);
      }, 500);
    },
    [
      optimisticCourses,
      timeSlots,
      weekDays,
      halfDayConfigs,
      courseOccupancyMap,
      onCourseUpdate,
    ]
  );

  // 获取指定单元格的课程信息
  const getCellCourse = (
    weekDay: number,
    timeSlotIndex: number
  ): CellCourseInfo => {
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
      isRowSpanned: !occupancy.isFirstCell,
    };
  };

  const hasCurrentWeekData = filteredCourses.length > 0;
  const isMobileDevice =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent
    );

  return (
    <div>
      {/* 周次选择器 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isMobileDevice ? 10 : 12,
          padding: isMobileDevice ? "10px 12px" : "12px 16px",
          backgroundColor: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #f0f0f0",
          flexWrap: "wrap",
          gap: isMobileDevice ? 8 : 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobileDevice ? 8 : 12,
            flexWrap: "wrap",
          }}
        >
          <CalendarOutlined
            style={{ fontSize: isMobileDevice ? 16 : 18, color: "#1890ff" }}
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
            color: "#666",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Tag color="blue" style={{ margin: 0 }}>
            {filteredCourses.length} 门课程
          </Tag>
          <span style={{ display: "flex", alignItems: "center" }}>
            可排课时：{halfDayConfigs.filter((h) => h.isSchedulable).length}/
            {halfDayConfigs.length} 个半天
          </span>
        </div>
      </div>

      {/* 半天配置状态提示 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: isMobileDevice ? 6 : 12,
          marginBottom: isMobileDevice ? 10 : 12,
          padding: isMobileDevice ? "8px 10px" : "8px 12px",
          backgroundColor: "#f6ffed",
          borderRadius: "6px",
          border: "1px solid #b7eb8f",
          fontSize: isMobileDevice ? 12 : 13,
          alignItems: "center",
        }}
      >
        <span style={{ color: "#666", whiteSpace: "nowrap" }}>
          半天排课状态：
        </span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobileDevice ? 4 : 8,
          }}
        >
          {halfDayConfigs.map((hd) => (
            <Tag
              key={hd.type}
              color={hd.isSchedulable ? "green" : "red"}
              style={{
                margin: 0,
                fontSize: isMobileDevice ? 11 : 13,
                padding: isMobileDevice ? "2px 6px" : undefined,
              }}
            >
              {hd.name}: {hd.isSchedulable ? "可排课" : "禁排课"}
            </Tag>
          ))}
        </div>
      </div>

      {/* 课表主体 */}
      <div
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          overflow: isMobileDevice ? "auto" : "hidden",
          backgroundColor: "#fff",
          WebkitOverflowScrolling: "touch",
          maxWidth: "100%",
        }}
      >
        {!isMobileDevice ? (
          /* 桌面端：原始网格布局 */
          <>
            {/* 表头：星期 + 半天标识 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px repeat(7, 1fr)",
                borderBottom: "2px solid #f0f0f0",
                backgroundColor: "#fafafa",
                minWidth: "700px",
              }}
            >
              <div
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRight: "1px solid #f0f0f0",
                  backgroundColor: "#f5f5f5",
                  gridColumn: "1 / 2",
                  gridRow: "1 / 2",
                }}
              >
                节次 / 时间
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={day.id}
                  style={{
                    padding: "8px 4px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "14px",
                    borderRight: index < 6 ? "1px solid #f0f0f0" : "none",
                    backgroundColor: day.isEnabled
                      ? day.isSchedulable
                        ? "#f0f5ff"
                        : "#fff1f0"
                      : "#f5f5f5",
                    opacity: day.isEnabled ? 1 : 0.5,
                    gridColumn: `${index + 2} / ${index + 3}`,
                    gridRow: "1 / 2",
                  }}
                >
                  {day.name}
                </div>
              ))}
              <div
                style={{
                  padding: "4px 8px",
                  textAlign: "center",
                  fontSize: "12px",
                  borderRight: "1px solid #f0f0f0",
                  color: "#666",
                  gridColumn: "1 / 2",
                  gridRow: "2 / 3",
                }}
              >
                时段
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={day.id}
                  style={{
                    padding: "4px 4px",
                    display: "flex",
                    gap: "2px",
                    borderRight: index < 6 ? "1px solid #e8e8e8" : "none",
                    gridColumn: `${index + 2} / ${index + 3}`,
                    gridRow: "2 / 3",
                  }}
                >
                  {halfDayConfigs.map((hd) => (
                    <div
                      key={hd.type}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "11px",
                        padding: "2px 0",
                        backgroundColor: hd.isSchedulable
                          ? "#f6ffed"
                          : "#fff1f0",
                        color: hd.isSchedulable ? "#52c41a" : "#ff4d4f",
                        borderRadius: "2px",
                      }}
                    >
                      {hd.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* 表格内容 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px repeat(7, 1fr)",
                gap: 0,
                minWidth: "700px",
              }}
            >
              {timeSlots.map((slot, slotIndex) => {
                const halfDayType = getHalfDayType(slot.startTime);
                const halfDayConfig = halfDayConfigs.find(
                  (h) => h.type === halfDayType
                );

                return (
                  <React.Fragment key={slot.id}>
                    <div
                      style={{
                        padding: "8px 4px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: "1px solid #f0f0f0",
                        borderBottom:
                          slotIndex < timeSlots.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        backgroundColor:
                          slot.isSchedulable && halfDayConfig?.isSchedulable
                            ? "#fafafa"
                            : "#f5f5f5",
                        fontSize: "11px",
                        boxSizing: "border-box",
                        gridColumn: "1 / 2",
                        gridRow: `${slotIndex + 1} / ${slotIndex + 2}`,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#666" }}>
                        {slot.label}
                      </span>
                      <span style={{ color: "#999" }}>{slot.startTime}</span>
                    </div>

                    {weekDays.map((day, dayIndex) => {
                      const {
                        course,
                        isOccupied,
                        isFirstCell,
                        spanCount,
                        isRowSpanned,
                      } = getCellCourse(day.id, slotIndex);

                      if (isRowSpanned) {
                        return (
                          <div
                            key={day.id}
                            style={{
                              padding: "0",
                              margin: "0",
                              borderRight:
                                dayIndex < 6 ? "1px solid #f0f0f0" : "none",
                              borderBottom: "none",
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

                      return (
                        <div
                          key={day.id}
                          style={{
                            padding: "0",
                            margin: "0",
                            borderRight:
                              dayIndex < 6 ? "1px solid #f0f0f0" : "none",
                            borderBottom:
                              spanCount > 1
                                ? "none"
                                : slotIndex < timeSlots.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
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
          /* 移动端简化视图 */
          <div style={{ padding: "8px" }}>
            <div
              style={{
                marginBottom: 8,
                fontSize: 12,
                color: "#999",
                textAlign: "center",
              }}
            >
              左右滑动查看课表 →
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px repeat(7, minmax(80px, 1fr))",
                gap: 0,
                minWidth: "100%",
                border: "1px solid #f0f0f0",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "8px 4px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "12px",
                  borderRight: "1px solid #f0f0f0",
                  borderBottom: "1px solid #f0f0f0",
                  backgroundColor: "#f5f5f5",
                }}
              >
                节次
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.id}
                  style={{
                    padding: "6px 2px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "11px",
                    borderRight: "1px solid #f0f0f0",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: day.isEnabled
                      ? day.isSchedulable
                        ? "#f0f5ff"
                        : "#fff1f0"
                      : "#f5f5f5",
                    opacity: day.isEnabled ? 1 : 0.5,
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    minHeight: "40px",
                  }}
                >
                  {day.name}
                </div>
              ))}
              {timeSlots.map((slot, slotIndex) => (
                <React.Fragment key={slot.id}>
                  <div
                    style={{
                      padding: "6px 4px",
                      textAlign: "center",
                      fontSize: "10px",
                      borderRight: "1px solid #f0f0f0",
                      borderBottom: "1px solid #f0f0f0",
                      backgroundColor: slot.isSchedulable
                        ? "#fafafa"
                        : "#f5f5f5",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{slot.label}</div>
                    <div style={{ color: "#999", fontSize: "9px" }}>
                      {slot.startTime}
                    </div>
                  </div>
                  {weekDays.map((day) => {
                    const {
                      course,
                      isOccupied,
                      isFirstCell,
                      spanCount,
                      isRowSpanned,
                    } = getCellCourse(day.id, slotIndex);
                    const halfDayType = getHalfDayType(slot.startTime);
                    const halfDayConfig = halfDayConfigs.find(
                      (h) => h.type === halfDayType
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
                          minHeight: "44px",
                          padding: "2px",
                          borderRight: "1px solid #f0f0f0",
                          borderBottom: "1px solid #f0f0f0",
                          backgroundColor: isForbidden
                            ? "#f5f5f5"
                            : course
                            ? "#fafafa"
                            : "#fff",
                          opacity: isForbidden ? 0.6 : 1,
                          position: "relative",
                        }}
                      >
                        {course && isFirstCell && !isRowSpanned && (
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
                            isMobile={true}
                          />
                        )}
                        {isRowSpanned && (
                          <div
                            style={{
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "9px",
                              color: "#999",
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

      {/* 空状态提示 */}
      {!hasCurrentWeekData && (
        <div
          style={{
            marginTop: isMobileDevice ? 12 : 16,
            padding: isMobileDevice ? "24px 16px" : "40px 20px",
            textAlign: "center",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "1px dashed #d9d9d9",
          }}
        >
          <CalendarOutlined
            style={{
              fontSize: isMobileDevice ? 36 : 48,
              color: "#d9d9d9",
              marginBottom: isMobileDevice ? 12 : 16,
            }}
          />
          <div
            style={{
              fontSize: isMobileDevice ? 14 : 16,
              color: "#666",
              marginBottom: 8,
            }}
          >
            第{currentWeek}周暂无课程安排
          </div>
          <div style={{ fontSize: isMobileDevice ? 12 : 13, color: "#999" }}>
            请切换周次或拖拽课程到可排课时段
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;
