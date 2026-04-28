import { mockData } from './mockData';

// 检查时间冲突
export const checkTimeConflict = (schedule, course, day, slot) => {
  const conflicts = [];
  const courseId = course.id;
  const teacherId = course.teacherId;
  const classId = course.classId;

  // 检查是否已安排在同一时间
  if (schedule[day]?.[slot]) {
    schedule[day][slot].forEach((scheduledCourse) => {
      if (scheduledCourse.id === courseId) {
        conflicts.push('同一课程重复安排');
      }
    });
  }

  // 检查教师时间冲突
  Object.keys(schedule).forEach((d) => {
    Object.keys(schedule[d]).forEach((s) => {
      schedule[d][s].forEach((scheduledCourse) => {
        // 检查教师冲突
        if (
          scheduledCourse.teacherId === teacherId &&
          d === day &&
          parseInt(s, 10) === parseInt(slot, 10)
        ) {
          conflicts.push(`教师 ${course.teacherName} 时间冲突`);
        }
        // 检查班级冲突
        if (
          scheduledCourse.classId === classId &&
          d === day &&
          parseInt(s, 10) === parseInt(slot, 10)
        ) {
          conflicts.push(`班级 ${course.className} 时间冲突`);
        }
      });
    });
  });

  // 检查教师约束（不可用时间）
  const teacherConstraint = mockData.teacherConstraints.find(
    (tc) => tc.teacherId === teacherId,
  );
  if (teacherConstraint) {
    const isUnavailable = teacherConstraint.unavailableTimes.some(
      (ut) => ut.day === day && ut.slots.includes(parseInt(slot, 10)),
    );
    if (isUnavailable) {
      conflicts.push(`教师 ${course.teacherName} 该时间不可用`);
    }
  }

  // 检查班级约束
  const classConstraint = mockData.classConstraints.find(
    (cc) => cc.classId === classId,
  );
  if (classConstraint) {
    const isUnavailable = classConstraint.unavailableTimes.some(
      (ut) => ut.day === day && ut.slots.includes(parseInt(slot, 10)),
    );
    if (isUnavailable) {
      conflicts.push(`班级 ${course.className} 该时间不可用`);
    }
  }

  // 检查教师每日课程上限
  const teacher = mockData.teachers.find((t) => t.id === teacherId);
  if (teacher?.maxDailyCourses) {
    const teacherDailyCourses = Object.keys(schedule[day] || {}).reduce(
      (count, s) => {
        return (
          count +
          (schedule[day][s] || []).filter((c) => c.teacherId === teacherId)
            .length
        );
      },
      0,
    );

    // 如果添加本课程会超过限制
    if (teacherDailyCourses + 1 > teacher.maxDailyCourses) {
      conflicts.push(
        `教师 ${course.teacherName} 当日课程已达上限（${teacher.maxDailyCourses}门）`,
      );
    }
  }

  // 检查班级每日课程上限
  const classInfo = mockData.classes.find((c) => c.id === classId);
  if (classInfo?.maxDailyCourses) {
    const classDailyCourses = Object.keys(schedule[day] || {}).reduce(
      (count, s) => {
        return (
          count +
          (schedule[day][s] || []).filter((c) => c.classId === classId).length
        );
      },
      0,
    );

    if (classDailyCourses + 1 > classInfo.maxDailyCourses) {
      conflicts.push(
        `班级 ${course.className} 当日课程已达上限（${classInfo.maxDailyCourses}门）`,
      );
    }
  }

  return conflicts;
};

// 智能推荐时间（改进版）
export const recommendTimeSlots = (course, schedule) => {
  const recommendations = [];

  // 如果有偏好时间，优先推荐
  if (course.preferredTimes && course.preferredTimes.length > 0) {
    course.preferredTimes.forEach((pt) => {
      const conflicts = checkTimeConflict(schedule, course, pt.day, pt.slot);
      if (conflicts.length === 0) {
        recommendations.push({
          day: pt.day,
          slot: pt.slot,
          reason: '符合偏好时间',
          score: 95,
        });
      }
    });
  }

  // 检查所有可能的时间
  mockData.weekDays.forEach((day) => {
    mockData.timeSlots.forEach((timeSlot) => {
      const conflicts = checkTimeConflict(
        schedule,
        course,
        day.value,
        timeSlot.id,
      );
      if (conflicts.length === 0) {
        let score = 70;
        let reason = '可用时间';

        // 评分规则
        if (timeSlot.id <= 2) {
          // 上午
          score += 10;
          reason = '上午时段';
        } else if (timeSlot.id <= 4) {
          // 下午
          score += 5;
          reason = '下午时段';
        }

        // 避免同一天多门课连续
        const teacher = mockData.teachers.find(
          (t) => t.id === course.teacherId,
        );
        if (teacher?.maxDailyCourses) {
          const teacherDailyCourses = Object.keys(
            schedule[day.value] || {},
          ).reduce((count, s) => {
            return (
              count +
              (schedule[day.value][s] || []).filter(
                (c) => c.teacherId === course.teacherId,
              ).length
            );
          }, 0);

          if (teacherDailyCourses === 0) {
            score += 5;
            reason = '教师当日首门课';
          }
        }

        recommendations.push({
          day: day.value,
          slot: timeSlot.id,
          reason,
          score,
        });
      }
    });
  });

  // 按分数排序
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
};

// 生成颜色
export const generateCourseColor = (courseId) => {
  const colors = [
    '#1890ff',
    '#52c41a',
    '#fa8c16',
    '#722ed1',
    '#f5222d',
    '#13c2c2',
    '#eb2f96',
    '#faad14',
    '#a0d911',
    '#2f54eb',
  ];
  const index = courseId.charCodeAt(courseId.length - 1) % colors.length;
  return colors[index];
};

// 统计教师排课情况
export const getTeacherStats = (teacherId, schedule) => {
  const stats = {
    totalCourses: 0,
    daysTeaching: new Set(),
    dailyCount: {},
  };

  mockData.weekDays.forEach((day) => {
    const dayValue = day.value;
    let dailyCourses = 0;

    mockData.timeSlots.forEach((slot) => {
      if (schedule[dayValue]?.[slot.id]) {
        const teacherCourses = schedule[dayValue][slot.id].filter(
          (course) => course.teacherId === teacherId,
        );
        stats.totalCourses += teacherCourses.length;
        dailyCourses += teacherCourses.length;

        if (teacherCourses.length > 0) {
          stats.daysTeaching.add(dayValue);
        }
      }
    });

    stats.dailyCount[dayValue] = dailyCourses;
  });

  stats.daysCount = stats.daysTeaching.size;
  stats.avgDailyCourses =
    stats.daysCount > 0 ? (stats.totalCourses / stats.daysCount).toFixed(1) : 0;

  return stats;
};

// 统计班级排课情况
export const getClassStats = (classId, schedule) => {
  const stats = {
    totalCourses: 0,
    daysTeaching: new Set(),
    dailyCount: {},
  };

  mockData.weekDays.forEach((day) => {
    const dayValue = day.value;
    let dailyCourses = 0;

    mockData.timeSlots.forEach((slot) => {
      if (schedule[dayValue]?.[slot.id]) {
        const classCourses = schedule[dayValue][slot.id].filter(
          (course) => course.classId === classId,
        );
        stats.totalCourses += classCourses.length;
        dailyCourses += classCourses.length;

        if (classCourses.length > 0) {
          stats.daysTeaching.add(dayValue);
        }
      }
    });

    stats.dailyCount[dayValue] = dailyCourses;
  });

  return stats;
};
