import mockjs from 'mockjs';

// ============================================
// Schedule 课表管理模块 - Umi Mock 配置
// ============================================

// 模拟课程数据
const generateMockCourses = () => {
  return mockjs.mock({
    'list|15': [
      {
        'id|+1': 1,
        'courseName': '@ctitle(3, 8)',
        'teacherName': '@cname',
        'teacherId': /T\d{3}/,
        'className': '@ctitle(2, 4)@integer(1, 3)班',
        'classId': /C\d{3}/,
        'roomName': /[A-D]-\d{3}/,
        'roomId': /R\d{3}/,
        'weekDay|1-7': 1,
        'startTime|1': ['08:00', '10:10', '14:00', '16:10', '19:00'],
        'endTime': function(this: any) {
          const startMap: { [key: string]: string } = {
            '08:00': '09:40',
            '10:10': '11:50',
            '14:00': '15:40',
            '16:10': '17:50',
            '19:00': '20:40',
          };
          return startMap[this['startTime|1']] || '09:40';
        },
        'duration|90-120': 100,
        'color|1': ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'],
        'weeks': function() {
          const start = Math.floor(Math.random() * 4) + 1;
          const count = Math.floor(Math.random() * 8) + 8;
          const weeks: number[] = [];
          for (let i = 0; i < count; i++) {
            weeks.push(start + i);
          }
          return weeks;
        },
        'studentCount|35-55': 45,
      },
    ],
  });
};

let mockCoursesList = generateMockCourses().list;

// 统一响应格式
const createResponse = (data: any, message: string = 'success') => ({
  code: 200,
  message,
  data,
  timestamp: Date.now(),
});

export default {
  // ============================================
  // 课表管理 API (/api/schedule)
  // ============================================

  // 1. 获取课表数据
  'GET /api/schedule/courses': (req: any, res: any) => {
    const { week, classId, teacherId, roomId } = req.query;
    const weekNum = parseInt(week, 10);

    // 过滤课程 - 只返回指定周次存在的课程
    let filtered = mockCoursesList.filter((course: any) => {
      if (!course.weeks.includes(weekNum)) {
        return false;
      }
      if (classId && course.classId !== classId) {
        return false;
      }
      if (teacherId && course.teacherId !== teacherId) {
        return false;
      }
      if (roomId && course.roomId !== roomId) {
        return false;
      }
      return true;
    });

    // 模拟网络延迟
    setTimeout(() => {
      res.json(createResponse(filtered));
    }, 300);
  },

  // 2. 获取单个课程详情
  'GET /api/schedule/courses/:id': (req: any, res: any) => {
    const { id } = req.params;
    const course = mockCoursesList.find((c: any) => c.id === parseInt(id, 10));

    if (course) {
      res.json(createResponse(course));
    } else {
      res.status(404).json({
        code: 404,
        message: '课程不存在',
        data: null,
        timestamp: Date.now(),
      });
    }
  },

  // 3. 创建课程
  'POST /api/schedule/courses': (req: any, res: any) => {
    const newCourse = {
      ...req.body,
      id: mockCoursesList.length + 1,
      color: req.body.color || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    };
    mockCoursesList.push(newCourse);

    res.json(createResponse(newCourse, '创建成功'));
  },

  // 4. 更新课程
  'PUT /api/schedule/courses/:id': (req: any, res: any) => {
    const { id } = req.params;
    const index = mockCoursesList.findIndex((c: any) => c.id === parseInt(id, 10));

    if (index >= 0) {
      mockCoursesList[index] = { ...mockCoursesList[index], ...req.body };
      res.json(createResponse(mockCoursesList[index], '更新成功'));
    } else {
      res.status(404).json({
        code: 404,
        message: '课程不存在',
        data: null,
        timestamp: Date.now(),
      });
    }
  },

  // 5. 删除课程
  'DELETE /api/schedule/courses/:id': (req: any, res: any) => {
    const { id } = req.params;
    const index = mockCoursesList.findIndex((c: any) => c.id === parseInt(id, 10));

    if (index >= 0) {
      const deleted = mockCoursesList[index];
      mockCoursesList.splice(index, 1);
      res.json(createResponse({ deletedId: id, courseName: deleted.courseName }, '删除成功'));
    } else {
      res.status(404).json({
        code: 404,
        message: '课程不存在',
        data: null,
        timestamp: Date.now(),
      });
    }
  },

  // 6. 批量删除课程
  'POST /api/schedule/courses/batch-delete': (req: any, res: any) => {
    const { courseIds } = req.body;
    const deletedIds: number[] = [];
    const failedIds: number[] = [];

    courseIds.forEach((id: number) => {
      const index = mockCoursesList.findIndex((c: any) => c.id === id);
      if (index >= 0) {
        mockCoursesList.splice(index, 1);
        deletedIds.push(id);
      } else {
        failedIds.push(id);
      }
    });

    res.json(createResponse({
      deletedCount: deletedIds.length,
      deletedIds,
      failedIds,
    }, '批量删除成功'));
  },

  // 7. 批量移动课程
  'POST /api/schedule/courses/move': (req: any, res: any) => {
    const { moves } = req.body;
    const success: any[] = [];
    const failed: any[] = [];
    const conflicts: any[] = [];

    moves.forEach((move: any) => {
      const course = mockCoursesList.find((c: any) => c.id === parseInt(move.courseId, 10));
      if (course) {
        // 简单模拟：总是成功
        course.weekDay = move.newWeekDay;
        if (move.newStartTime) {
          course.startTime = move.newStartTime;
        }
        success.push({
          courseId: move.courseId,
          oldWeekDay: 1,
          newWeekDay: move.newWeekDay,
        });
      } else {
        failed.push({ courseId: move.courseId, reason: '课程不存在' });
      }
    });

    res.json(createResponse({ success, failed, conflicts }, '移动成功'));
  },

  // 8. 保存课表
  'POST /api/schedule/save': (req: any, res: any) => {
    const { week, courses } = req.body;

    res.json(createResponse({
      week,
      savedCount: courses?.length || 0,
      message: `第${week}周课表已保存`,
    }, '保存成功'));
  },

  // 9. 刷新课表
  'GET /api/schedule/refresh': (req: any, res: any) => {
    const { week } = req.query;
    const weekNum = parseInt(week, 10);

    const courses = mockCoursesList.filter((course: any) => course.weeks.includes(weekNum));

    res.json(createResponse(courses, '刷新成功'));
  },

  // 10. 获取统计数据
  'GET /api/schedule/statistics': (req: any, res: any) => {
    const { week } = req.query;
    const weekNum = parseInt(week, 10);

    const weekCourses = mockCoursesList.filter((c: any) => c.weeks.includes(weekNum));

    // 计算统计数据
    const statistics = {
      total: {
        courses: weekCourses.length,
        teachers: new Set(weekCourses.map((c: any) => c.teacherName)).size,
        classes: new Set(weekCourses.map((c: any) => c.className)).size,
        rooms: new Set(weekCourses.map((c: any) => c.roomName)).size,
        students: weekCourses.reduce((sum: number, c: any) => sum + c.studentCount, 0),
      },
      timeDistribution: {
        morning: weekCourses.filter((c: any) => parseInt(c.startTime) < 12).length,
        afternoon: weekCourses.filter((c: any) => parseInt(c.startTime) >= 12 && parseInt(c.startTime) < 18).length,
        evening: weekCourses.filter((c: any) => parseInt(c.startTime) >= 18).length,
      },
      conflicts: {
        teacherConflict: 0,
        roomConflict: 0,
        classConflict: 0,
        total: 0,
      },
    };

    res.json(createResponse(statistics));
  },

  // 11. 检测冲突
  'POST /api/schedule/conflicts/check': (req: any, res: any) => {
    const { course, week } = req.body;

    // 简单模拟冲突检测
    const hasConflict = course?.courseName?.includes('冲突');

    const conflicts = hasConflict ? [
      {
        type: 'teacher',
        message: `教师${course?.teacherName}在周${course?.weekDay} ${course?.startTime}已有课程安排`,
        existingCourse: mockCoursesList[0],
      },
    ] : [];

    const recommendations = hasConflict ? [
      {
        weekDay: ((course?.weekDay || 1) % 7) + 1,
        startTime: '14:00',
        roomId: 'R011',
        reason: '该时间段教师和教室均可用',
      },
    ] : [];

    res.json(createResponse({
      hasConflicts: hasConflict,
      conflicts,
      recommendations,
    }));
  },

  // 12. 导出课表
  'GET /api/schedule/export': (req: any, res: any) => {
    const { startWeek, endWeek, classId, format = 'json' } = req.query;

    const exportCourses = mockCoursesList.filter((c: any) => {
      const hasWeekInRange = c.weeks.some((w: number) => w >= parseInt(startWeek, 10) && w <= parseInt(endWeek, 10));
      if (!hasWeekInRange) return false;
      if (classId && c.classId !== classId) return false;
      return true;
    });

    res.json(createResponse({
      exportInfo: {
        exportedAt: new Date().toISOString(),
        startWeek,
        endWeek,
        totalCourses: exportCourses.length,
        format,
      },
      courses: exportCourses,
      timeSlots: [],
      weekDays: [],
    }));
  },

  // 13. 导入课表
  'POST /api/schedule/import': (req: any, res: any) => {
    // 模拟导入
    const importedCount = Math.floor(Math.random() * 20) + 10;

    res.json(createResponse({
      importedCount,
      skippedCount: 0,
      failedCount: 0,
      conflictCount: 0,
    }, '导入成功'));
  },
};
