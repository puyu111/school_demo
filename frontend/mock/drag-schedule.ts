import mockjs from "mockjs";

// 定义数据类型
interface Course {
  key: number;
  id: number;
  name: string;
  credits: number;
  type: string;
  totalHours: number;
  description?: string;
  department?: string;
}

interface Teacher {
  key: number;
  id: number;
  name: string;
  gender: string;
  title: string;
  department: string;
  email?: string;
  phone?: string;
  courses: string[];
  degree: string;
  workload: number;
  availableTime?: string;
  unavailableTime?: string;
}

interface Schedule {
  key: number;
  scheduleId: number;
  course: Course;
  teacher: Teacher;
  classroom: Classroom;
  weekday: string;
  timeSlot: TimeSlot;
  weekRange: string;
  studentCount: number;
  status: string;
  conflict: boolean;
  conflictReason: string;
  createTime: string;
}

interface Classroom {
  key: number;
  id: number;
  code: string;
  name: string;
  capacity: number;
  type: string;
  building: string;
  floor: number;
  equipment: string[];
  available: boolean;
}

interface TimeSlot {
  id: number;
  start: string;
  end: string;
  period: string;
}

// 模拟课程数据
const mockCourses: { list: Course[] } = mockjs.mock({
  "list|46": [
    {
      "key|+1": 1,
      "id|+1": 1,
      name: "@ctitle(3, 8)",
      "credits|1-4": 1,
      "type|1": ["必修", "选修", "限选"],
      "totalHours|16-64": 32,
      description: "@cparagraph(1, 3)",
      department: "@cword(2, 4)系",
    },
  ],
});

// 模拟教师数据
const mockTeachers: { list: Teacher[] } = mockjs.mock({
  "list|30": [
    {
      "key|+1": 1,
      "id|+1": 1,
      name: "@cname",
      "gender|1": ["男", "女"],
      "title|1": ["教授", "副教授", "讲师", "助教"],
      department: "@cword(2, 4)系",
      email: "@email",
      phone: /^1[3-9]\d{9}$/,
      "courses|1-4": ["@ctitle(3, 8)"],
      "degree|1": ["专科", "本科", "硕士", "博士"],
      "workload|8-20": 12,
      availableTime: "@time",
      unavailableTime: "@time",
    },
  ],
});

// 模拟专业数据
const mockMajors = mockjs.mock({
  "list|15": [
    {
      "key|+1": 1,
      "id|+1": 1,
      code: /MAJOR\d{3}/,
      name: "@ctitle(4, 10)专业",
      department: "@cword(2, 4)学院",
      "courses|3-8": ["@ctitle(3, 8)"],
      "classSize|2-8": 4,
      "duration|3-5": 4,
      "studentCount|30-120": 60,
      description: "@cparagraph(1, 3)",
    },
  ],
});

// 模拟教室数据
const mockClassrooms: { list: Classroom[] } = mockjs.mock({
  "list|25": [
    {
      "key|+1": 1,
      "id|+1": 1,
      code: /[A-D]\d{3}/,
      name: "@ctitle(2, 6)教室",
      "capacity|30-120": 60,
      "type|1": ["多媒体", "实验室", "普通", "计算机房"],
      building: "@cword(2, 4)楼",
      "floor|1-6": 3,
      "equipment|1-5": ["@cword(2, 4)"],
      available: "@boolean",
    },
  ],
});

// 模拟排课结果数据
const generateMockSchedules = () => {
  const courses = mockCourses.list.slice(0, 20);
  const teachers = mockTeachers.list.slice(0, 15);
  const classrooms = mockClassrooms.list.slice(0, 10);
  const weekdays = ["周一", "周二", "周三", "周四", "周五"];
  const timeSlots = [
    { id: 1, start: "08:00", end: "09:40", period: "1-2节" },
    { id: 2, start: "10:00", end: "11:40", period: "3-4节" },
    { id: 3, start: "14:00", end: "15:40", period: "5-6节" },
    { id: 4, start: "16:00", end: "17:40", period: "7-8节" },
  ];

  return mockjs.mock({
    "list|40": [
      {
        "key|+1": 1,
        "scheduleId|+1": 1,
        course: function () {
          return courses[Math.floor(Math.random() * courses.length)];
        },
        teacher: function () {
          return teachers[Math.floor(Math.random() * teachers.length)];
        },
        classroom: function () {
          return classrooms[Math.floor(Math.random() * classrooms.length)];
        },
        weekday: function () {
          return weekdays[Math.floor(Math.random() * weekdays.length)];
        },
        timeSlot: function () {
          return timeSlots[Math.floor(Math.random() * timeSlots.length)];
        },
        weekRange: function () {
          const start = Math.floor(Math.random() * 4) + 1;
          const end = start + Math.floor(Math.random() * 8) + 12;
          return `${start}-${end}周`;
        },
        "studentCount|20-60": 40,
        "status|1": ["已安排", "待审核", "冲突", "已取消"],
        conflict: "@boolean",
        "conflictReason|1": ["教室冲突", "教师时间冲突", "学生冲突", ""],
        createTime: "@datetime",
      },
    ],
  });
};

let mockSchedules: Schedule[] = generateMockSchedules().list;

export default {
  // 1. 基础数据管理接口
  // 课程管理
  "GET /api/courses": (req: any, res: any) => {
    const { current = 1, pageSize = 10, keyword } = req.query;

    let data = [...mockCourses.list];

    // 关键词搜索
    if (keyword) {
      data = data.filter(
        (item: Course) =>
          item.name.includes(keyword as string) ||
          item.id.toString().includes(keyword as string)
      );
    }

    // 分页
    const start = (Number(current) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const pageData = data.slice(start, end);

    res.json({
      success: true,
      data: pageData,
      total: data.length,
      current: Number(current),
      pageSize: Number(pageSize),
    });
  },

  "POST /api/courses": (req: any, res: any) => {
    const newCourse = {
      key: mockCourses.list.length + 1,
      id: mockCourses.list.length + 1,
      ...req.body,
      createTime: new Date().toISOString(),
    };

    mockCourses.list.push(newCourse);

    res.json({
      success: true,
      data: newCourse,
      message: "课程创建成功",
    });
  },

  "PUT /api/courses/:id": (req: any, res: any) => {
    const { id } = req.params;
    const index = mockCourses.list.findIndex(
      (item: Course) => item.id === Number(id)
    );

    if (index >= 0) {
      mockCourses.list[index] = { ...mockCourses.list[index], ...req.body };
      res.json({
        success: true,
        data: mockCourses.list[index],
        message: "课程更新成功",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "课程不存在",
      });
    }
  },

  "DELETE /api/courses/:id": (req: any, res: any) => {
    const { id } = req.params;
    const index = mockCourses.list.findIndex(
      (item: Course) => item.id === Number(id)
    );

    if (index >= 0) {
      mockCourses.list.splice(index, 1);
      res.json({
        success: true,
        message: "课程删除成功",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "课程不存在",
      });
    }
  },

  // 2. 教师管理接口
  "GET /api/teachers": (req: any, res: any) => {
    const { current = 1, pageSize = 10, department, keyword } = req.query;

    let data = [...mockTeachers.list];

    // 院系筛选
    if (department) {
      data = data.filter((item: Teacher) => item.department === department);
    }

    // 关键词搜索
    if (keyword) {
      data = data.filter(
        (item: Teacher) =>
          item.name.includes(keyword as string) ||
          item.title.includes(keyword as string)
      );
    }

    // 分页
    const start = (Number(current) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const pageData = data.slice(start, end);

    res.json({
      success: true,
      data: pageData,
      total: data.length,
      current: Number(current),
      pageSize: Number(pageSize),
    });
  },

  "POST /api/teachers": (req: any, res: any) => {
    const newTeacher = {
      key: mockTeachers.list.length + 1,
      id: mockTeachers.list.length + 1,
      ...req.body,
      createTime: new Date().toISOString(),
    };

    mockTeachers.list.push(newTeacher);

    res.json({
      success: true,
      data: newTeacher,
      message: "教师创建成功",
    });
  },

  // 3. 专业管理接口
  "GET /api/majors": (req: any, res: any) => {
    const { current = 1, pageSize = 10 } = req.query;

    // 分页
    const start = (Number(current) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const pageData = mockMajors.list.slice(start, end);

    res.json({
      success: true,
      data: pageData,
      total: mockMajors.list.length,
      current: Number(current),
      pageSize: Number(pageSize),
    });
  },

  // 4. 教室管理接口
  "GET /api/classrooms": (req: any, res: any) => {
    const { type, building, available, capacityMin, capacityMax } = req.query;

    let data = [...mockClassrooms.list];

    // 类型筛选
    if (type) {
      data = data.filter((item: Classroom) => item.type === type);
    }

    // 楼栋筛选
    if (building) {
      data = data.filter((item: Classroom) =>
        item.building.includes(building as string)
      );
    }

    // 可用性筛选
    if (available !== undefined) {
      data = data.filter(
        (item: Classroom) => item.available === (available === "true")
      );
    }

    // 容量筛选
    if (capacityMin) {
      data = data.filter(
        (item: Classroom) => item.capacity >= Number(capacityMin)
      );
    }

    if (capacityMax) {
      data = data.filter(
        (item: Classroom) => item.capacity <= Number(capacityMax)
      );
    }

    res.json({
      success: true,
      data,
      total: data.length,
    });
  },

  // 5. 排课管理接口
  "GET /api/schedules": (req: any, res: any) => {
    const {
      current = 1,
      pageSize = 10,
      status,
      weekday,
      teacherId,
      courseId,
      classroomId,
    } = req.query;

    let data = [...mockSchedules];

    // 状态筛选
    if (status) {
      data = data.filter((item: Schedule) => item.status === status);
    }

    // 星期筛选
    if (weekday) {
      data = data.filter((item: Schedule) => item.weekday === weekday);
    }

    // 教师筛选
    if (teacherId) {
      data = data.filter(
        (item: Schedule) => item.teacher.id === Number(teacherId)
      );
    }

    // 课程筛选
    if (courseId) {
      data = data.filter(
        (item: Schedule) => item.course.id === Number(courseId)
      );
    }

    // 教室筛选
    if (classroomId) {
      data = data.filter(
        (item: Schedule) => item.classroom.id === Number(classroomId)
      );
    }

    // 分页
    const start = (Number(current) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const pageData = data.slice(start, end);

    res.json({
      success: true,
      data: pageData,
      total: data.length,
      current: Number(current),
      pageSize: Number(pageSize),
    });
  },

  "POST /api/schedules": (req: any, res: any) => {
    const { courseId, teacherId, classroomId, weekday, timeSlotId, weekRange } =
      req.body;

    // 模拟冲突检测
    const conflict = mockSchedules.some(
      (schedule: Schedule) =>
        schedule.classroom.id === Number(classroomId) &&
        schedule.weekday === weekday &&
        schedule.timeSlot.id === Number(timeSlotId) &&
        schedule.weekRange === weekRange
    );

    if (conflict) {
      res.status(400).json({
        success: false,
        message: "时间冲突！该教室在此时间段已被占用",
        conflictType: "classroom",
      });
      return;
    }

    // 查找相关数据
    const course = mockCourses.list.find(
      (c: Course) => c.id === Number(courseId)
    );
    const teacher = mockTeachers.list.find(
      (t: Teacher) => t.id === Number(teacherId)
    );
    const classroom = mockClassrooms.list.find(
      (c: Classroom) => c.id === Number(classroomId)
    );
    const timeSlot = [
      { id: 1, start: "08:00", end: "09:40", period: "1-2节" },
      { id: 2, start: "10:00", end: "11:40", period: "3-4节" },
      { id: 3, start: "14:00", end: "15:40", period: "5-6节" },
      { id: 4, start: "16:00", end: "17:40", period: "7-8节" },
    ].find((t: TimeSlot) => t.id === Number(timeSlotId));

    // 检查是否找到了必需的数据
    if (!course || !teacher || !classroom || !timeSlot) {
      res.status(404).json({
        success: false,
        message: "找不到指定的课程、教师、教室或时间段",
      });
      return;
    }

    const newSchedule: Schedule = {
      key: mockSchedules.length + 1,
      scheduleId: mockSchedules.length + 1,
      course,
      teacher,
      classroom,
      weekday,
      timeSlot,
      weekRange,
      studentCount: Math.floor(Math.random() * 40) + 20,
      status: "已安排",
      conflict: false,
      conflictReason: "",
      createTime: new Date().toISOString(),
    };

    mockSchedules.push(newSchedule);

    res.json({
      success: true,
      data: newSchedule,
      message: "排课成功",
    });
  },

  // 6. 自动排课接口
  "POST /api/schedules/auto-arrange": async (
    req: { body: { courses: any[]; constraints?: any } },
    res: any
  ): Promise<void> => {
    const { courses, constraints } = req.body;

    // 模拟处理时间
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 生成排课结果
    const arrangedCourses = courses
      .slice(0, 5)
      .map((course: any, index: number) => {
        const teacher = mockTeachers.list[index % mockTeachers.list.length];
        const classroom =
          mockClassrooms.list[index % mockClassrooms.list.length];
        const weekdays = ["周一", "周二", "周三", "周四", "周五"];
        const timeSlots = [
          { id: 1, start: "08:00", end: "09:40", period: "1-2节" },
          { id: 2, start: "10:00", end: "11:40", period: "3-4节" },
          { id: 3, start: "14:00", end: "15:40", period: "5-6节" },
        ];

        return {
          courseId: course.id,
          courseName: course.name,
          teacherId: teacher.id,
          teacherName: teacher.name,
          classroomId: classroom.id,
          classroomName: classroom.name,
          weekday: weekdays[index % weekdays.length],
          timeSlotId: timeSlots[index % timeSlots.length].id,
          timeSlot: timeSlots[index % timeSlots.length],
          weekRange: "1-16周",
          status: "已安排",
          conflict: Math.random() > 0.8,
        };
      });

    const conflicts = arrangedCourses.filter((course: any) => course.conflict);

    res.json({
      success: true,
      data: {
        arrangedCourses,
        stats: {
          total: courses.length,
          arranged: arrangedCourses.length,
          conflicts: conflicts.length,
          successRate:
            (
              ((arrangedCourses.length - conflicts.length) /
                arrangedCourses.length) *
              100
            ).toFixed(2) + "%",
        },
        suggestions:
          conflicts.length > 0
            ? ["建议更换冲突课程的教室", "建议调整上课时间", "可以考虑分班教学"]
            : [],
      },
      message: `自动排课完成，成功安排${arrangedCourses.length}门课程`,
    });
  },

  // 7. 冲突检测接口
  "POST /api/schedules/check-conflict": (req: any, res: any) => {
    const { scheduleData } = req.body;

    const conflicts = [];

    // 检查教室冲突
    const classroomConflict = mockSchedules.find(
      (schedule: Schedule) =>
        schedule.classroom.id === Number(scheduleData.classroomId) &&
        schedule.weekday === scheduleData.weekday &&
        schedule.timeSlot.id === Number(scheduleData.timeSlotId)
    );

    if (classroomConflict) {
      conflicts.push({
        type: "classroom",
        level: "error",
        message: `教室 ${classroomConflict.classroom.name} 已被 ${classroomConflict.course.name} 占用`,
        conflictingSchedule: classroomConflict,
      });
    }

    // 检查教师冲突
    const teacherConflict = mockSchedules.find(
      (schedule: Schedule) =>
        schedule.teacher.id === Number(scheduleData.teacherId) &&
        schedule.weekday === scheduleData.weekday &&
        schedule.timeSlot.id === Number(scheduleData.timeSlotId)
    );

    if (teacherConflict) {
      conflicts.push({
        type: "teacher",
        level: "error",
        message: `教师 ${teacherConflict.teacher.name} 已有课程 ${teacherConflict.course.name}`,
        conflictingSchedule: teacherConflict,
      });
    }

    // 检查课程间隔（同一课程不能连续安排）
    const intervalConflict = mockSchedules.find(
      (schedule: Schedule) =>
        schedule.course.id === Number(scheduleData.courseId) &&
        schedule.weekday === scheduleData.weekday &&
        Math.abs(schedule.timeSlot.id - Number(scheduleData.timeSlotId)) <= 1
    );

    if (intervalConflict) {
      conflicts.push({
        type: "interval",
        level: "warning",
        message: `课程 ${intervalConflict.course.name} 在该天相邻时间段已有安排`,
        conflictingSchedule: intervalConflict,
      });
    }

    res.json({
      success: true,
      data: {
        hasConflict: conflicts.length > 0,
        conflicts,
        recommendations:
          conflicts.length > 0
            ? ["尝试更换教室", "调整上课时间", "更换授课教师"]
            : [],
      },
    });
  },

  // 8. 批量操作接口
  "POST /api/schedules/batch": (req: any, res: any) => {
    const { action, scheduleIds } = req.body;

    if (action === "delete") {
      mockSchedules = mockSchedules.filter(
        (schedule: Schedule) => !scheduleIds.includes(schedule.scheduleId)
      );

      res.json({
        success: true,
        message: `成功删除 ${scheduleIds.length} 条排课记录`,
        deletedCount: scheduleIds.length,
      });
    } else if (action === "approve") {
      const updated = mockSchedules
        .filter((schedule: Schedule) =>
          scheduleIds.includes(schedule.scheduleId)
        )
        .map((schedule: Schedule) => {
          schedule.status = "已安排";
          return schedule;
        });

      res.json({
        success: true,
        message: `成功审核 ${updated.length} 条排课记录`,
        approvedCount: updated.length,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "不支持的操作类型",
      });
    }
  },

  // 9. 统计数据接口
  "GET /api/stats": (req: any, res: any) => {
    const stats = {
      // 课程统计
      courses: {
        total: mockCourses.list.length,
        byType: {
          必修: mockCourses.list.filter((c: Course) => c.type === "必修")
            .length,
          选修: mockCourses.list.filter((c: Course) => c.type === "选修")
            .length,
          限选: mockCourses.list.filter((c: Course) => c.type === "限选")
            .length,
        },
        byDepartment: {},
      },

      // 教师统计
      teachers: {
        total: mockTeachers.list.length,
        byTitle: {
          教授: mockTeachers.list.filter((t: Teacher) => t.title === "教授")
            .length,
          副教授: mockTeachers.list.filter((t: Teacher) => t.title === "副教授")
            .length,
          讲师: mockTeachers.list.filter((t: Teacher) => t.title === "讲师")
            .length,
          助教: mockTeachers.list.filter((t: Teacher) => t.title === "助教")
            .length,
        },
        workload: {
          average:
            mockTeachers.list.reduce(
              (sum: number, t: Teacher) => sum + t.workload,
              0
            ) / mockTeachers.list.length,
          max: Math.max(...mockTeachers.list.map((t: Teacher) => t.workload)),
          min: Math.min(...mockTeachers.list.map((t: Teacher) => t.workload)),
        },
      },

      // 排课统计
      schedules: {
        total: mockSchedules.length,
        byStatus: {
          已安排: mockSchedules.filter((s: Schedule) => s.status === "已安排")
            .length,
          待审核: mockSchedules.filter((s: Schedule) => s.status === "待审核")
            .length,
          冲突: mockSchedules.filter((s: Schedule) => s.status === "冲突")
            .length,
          已取消: mockSchedules.filter((s: Schedule) => s.status === "已取消")
            .length,
        },
        byWeekday: {
          周一: mockSchedules.filter((s: Schedule) => s.weekday === "周一")
            .length,
          周二: mockSchedules.filter((s: Schedule) => s.weekday === "周二")
            .length,
          周三: mockSchedules.filter((s: Schedule) => s.weekday === "周三")
            .length,
          周四: mockSchedules.filter((s: Schedule) => s.weekday === "周四")
            .length,
          周五: mockSchedules.filter((s: Schedule) => s.weekday === "周五")
            .length,
        },
        conflictRate:
          (
            (mockSchedules.filter((s: Schedule) => s.conflict).length /
              mockSchedules.length) *
            100
          ).toFixed(2) + "%",
      },

      // 教室使用率
      classrooms: {
        total: mockClassrooms.list.length,
        available: mockClassrooms.list.filter((c: Classroom) => c.available)
          .length,
        byType: {
          多媒体: mockClassrooms.list.filter(
            (c: Classroom) => c.type === "多媒体"
          ).length,
          实验室: mockClassrooms.list.filter(
            (c: Classroom) => c.type === "实验室"
          ).length,
          普通: mockClassrooms.list.filter((c: Classroom) => c.type === "普通")
            .length,
          计算机房: mockClassrooms.list.filter(
            (c: Classroom) => c.type === "计算机房"
          ).length,
        },
        averageCapacity:
          mockClassrooms.list.reduce(
            (sum: number, c: Classroom) => sum + c.capacity,
            0
          ) / mockClassrooms.list.length,
      },

      // 实时数据
      realtime: {
        todaySchedules: mockSchedules.filter((s: Schedule) => {
          const today = new Date().getDay();
          const weekdayMap: { [key: string]: number } = {
            周一: 1,
            周二: 2,
            周三: 3,
            周四: 4,
            周五: 5,
          };
          return weekdayMap[s.weekday] === today;
        }).length,
        pendingApprovals: mockSchedules.filter(
          (s: Schedule) => s.status === "待审核"
        ).length,
        activeConflicts: mockSchedules.filter((s: Schedule) => s.conflict)
          .length,
      },
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  },

  // 10. 导出数据接口
  "GET /api/export/schedules": (req: any, res: any) => {
    const { format = "csv" } = req.query;

    // 模拟导出数据
    const exportData = mockSchedules.map((schedule: Schedule) => ({
      排课ID: schedule.scheduleId,
      课程名称: schedule.course.name,
      教师: schedule.teacher.name,
      教室: schedule.classroom.name,
      星期: schedule.weekday,
      时间段: `${schedule.timeSlot.start}-${schedule.timeSlot.end}`,
      周次: schedule.weekRange,
      学生人数: schedule.studentCount,
      状态: schedule.status,
      是否冲突: schedule.conflict ? "是" : "否",
      创建时间: schedule.createTime,
    }));

    res.json({
      success: true,
      data: exportData,
      format,
      total: exportData.length,
      downloadUrl: "/api/download/schedules.csv", // 模拟下载链接
    });
  },

  // 11. 用户登录接口（模拟）
  "POST /api/login": (req: any, res: any) => {
    const { username, password } = req.body;

    // 模拟用户验证
    if (username === "admin" && password === "admin123") {
      res.json({
        success: true,
        data: {
          id: 1,
          username: "admin",
          name: "管理员",
          avatar:
            "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
          token: "mock-token-" + Date.now(),
          roles: ["admin"],
          permissions: ["*:*:*"],
        },
        message: "登录成功",
      });
    } else if (username === "teacher" && password === "teacher123") {
      res.json({
        success: true,
        data: {
          id: 2,
          username: "teacher",
          name: "李老师",
          avatar: "",
          token: "mock-token-" + Date.now(),
          roles: ["teacher"],
          permissions: ["schedule:view", "course:view"],
        },
        message: "登录成功",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }
  },

  // 12. 获取用户信息
  "GET /api/user/info": (req: any, res: any) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token?.includes("admin")) {
      res.json({
        success: true,
        data: {
          id: 1,
          username: "admin",
          name: "管理员",
          avatar:
            "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
          roles: ["admin"],
          permissions: ["*:*:*"],
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          id: 2,
          username: "teacher",
          name: "李老师",
          avatar: "",
          roles: ["teacher"],
          permissions: ["schedule:view", "course:view"],
        },
      });
    }
  },

  // 13. 系统配置接口
  "GET /api/settings": (req: any, res: any) => {
    res.json({
      success: true,
      data: {
        // 学期配置
        semester: {
          current: "2026-2027学年 第一学期",
          startDate: "2026-09-01",
          endDate: "2027-01-20",
          weeks: 20,
          currentWeek: 8,
        },
        // 时间配置
        timeSettings: {
          morningStart: "08:00",
          morningEnd: "12:00",
          afternoonStart: "14:00",
          afternoonEnd: "18:00",
          eveningStart: "19:00",
          eveningEnd: "21:00",
        },
        // 排课规则
        schedulingRules: {
          maxCoursesPerDay: 4,
          maxCoursesPerTeacherPerDay: 3,
          minIntervalBetweenCourses: 2,
          allowWeekend: false,
          allowEvening: true,
        },
        // 冲突规则
        conflictRules: {
          strictMode: true,
          autoResolve: false,
          notifyOnConflict: true,
        },
      },
    });
  },

  // ==================== 拖拽排课模块接口 (/api/drag-schedule) ====================

  // 获取时段配置
  "GET /api/drag-schedule/time-slots": (req: any, res: any) => {
    res.json({
      code: 200,
      message: "success",
      data: {
        halfDayConfigs: [
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
        ],
        timeSlots: [
          {
            id: "slot-1",
            label: "第 1 节",
            startTime: "08:00",
            endTime: "08:45",
            duration: 45,
            halfDayType: "morning",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-2",
            label: "第 2 节",
            startTime: "08:50",
            endTime: "09:35",
            duration: 45,
            halfDayType: "morning",
            isBreak: false,
            breakAfter: 15,
            isSchedulable: true,
          },
          {
            id: "slot-3",
            label: "第 3 节",
            startTime: "09:50",
            endTime: "10:35",
            duration: 45,
            halfDayType: "morning",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-4",
            label: "第 4 节",
            startTime: "10:45",
            endTime: "11:30",
            duration: 45,
            halfDayType: "morning",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-5",
            label: "第 5 节",
            startTime: "14:00",
            endTime: "14:45",
            duration: 45,
            halfDayType: "afternoon",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-6",
            label: "第 6 节",
            startTime: "14:50",
            endTime: "15:35",
            duration: 45,
            halfDayType: "afternoon",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-7",
            label: "第 7 节",
            startTime: "15:50",
            endTime: "16:35",
            duration: 45,
            halfDayType: "afternoon",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-8",
            label: "第 8 节",
            startTime: "16:45",
            endTime: "17:30",
            duration: 45,
            halfDayType: "afternoon",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-9",
            label: "第 9 节",
            startTime: "19:00",
            endTime: "19:45",
            duration: 45,
            halfDayType: "evening",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
          {
            id: "slot-10",
            label: "第 10 节",
            startTime: "19:50",
            endTime: "20:35",
            duration: 45,
            halfDayType: "evening",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
        ],
        dailyConfig: {
          totalPeriods: 10,
          defaultDuration: 45,
          defaultBreakDuration: 10,
        },
      },
      timestamp: Date.now(),
    });
  },

  // 更新时段配置
  "PUT /api/drag-schedule/time-slots": (req: any, res: any) => {
    res.json({
      code: 200,
      message: "配置更新成功",
      data: {
        updatedFields: Object.keys(req.body),
        dailyConfig: req.body.dailyConfig || {
          totalPeriods: 10,
          defaultDuration: 45,
          defaultBreakDuration: 10,
        },
        halfDayConfigs: req.body.halfDayConfigs || [],
      },
      timestamp: Date.now(),
    });
  },

  // 重置时段配置
  "POST /api/drag-schedule/time-slots/reset": (req: any, res: any) => {
    res.json({
      code: 200,
      message: "配置已重置为默认值",
      data: {
        dailyConfig: {
          totalPeriods: 10,
          defaultDuration: 45,
          defaultBreakDuration: 10,
        },
        timeSlots: [
          {
            id: "slot-1",
            label: "第 1 节",
            startTime: "08:00",
            endTime: "08:45",
            duration: 45,
            halfDayType: "morning",
            isBreak: false,
            breakAfter: 10,
            isSchedulable: true,
          },
        ],
        halfDayConfigs: [
          {
            type: "morning",
            name: "上午",
            startTime: "08:00",
            endTime: "12:00",
            isSchedulable: true,
          },
        ],
      },
      timestamp: Date.now(),
    });
  },

  // 获取星期配置
  "GET /api/drag-schedule/week-days": (req: any, res: any) => {
    res.json({
      code: 200,
      message: "success",
      data: [
        { id: 1, name: "周一", isEnabled: true, isSchedulable: true },
        { id: 2, name: "周二", isEnabled: true, isSchedulable: true },
        { id: 3, name: "周三", isEnabled: true, isSchedulable: true },
        { id: 4, name: "周四", isEnabled: true, isSchedulable: true },
        { id: 5, name: "周五", isEnabled: true, isSchedulable: true },
        { id: 6, name: "周六", isEnabled: false, isSchedulable: false },
        { id: 7, name: "周日", isEnabled: false, isSchedulable: false },
      ],
      timestamp: Date.now(),
    });
  },

  // 更新星期配置
  "PUT /api/drag-schedule/week-days": (req: any, res: any) => {
    res.json({
      code: 200,
      message: "星期配置更新成功",
      data: { weekDays: req.body.weekDays },
      timestamp: Date.now(),
    });
  },

  // 获取课程列表
  "GET /api/drag-schedule/courses": (req: any, res: any) => {
    const { week, classId, teacherId, roomId } = req.query;

    // 生成模拟课程数据
    const mockCourses = [
      {
        id: `w${week}-1`,
        courseName: "高等数学",
        teacherName: "张教授",
        teacherId: "t001",
        className: "计算机科学与技术 1 班",
        classId: classId || "c001",
        roomName: "教学楼 A-301",
        roomId: roomId || "r001",
        weekDay: 1,
        startTime: "08:00",
        endTime: "10:00",
        duration: 120,
        color: "#1890ff",
        weeks: [1, 2, 3, 4, 5],
        studentCount: 45,
      },
      {
        id: `w${week}-2`,
        courseName: "数据结构",
        teacherName: "李教授",
        teacherId: teacherId || "t002",
        className: "计算机科学与技术 1 班",
        classId: classId || "c001",
        roomName: "实验楼 C-401",
        roomId: roomId || "r002",
        weekDay: 2,
        startTime: "10:10",
        endTime: "11:50",
        duration: 100,
        color: "#52c41a",
        weeks: [1, 2, 3, 4, 5],
        studentCount: 42,
      },
      {
        id: `w${week}-3`,
        courseName: "大学英语",
        teacherName: "王老师",
        teacherId: "t003",
        className: "计算机科学与技术 1 班",
        classId: classId || "c001",
        roomName: "教学楼 B-201",
        roomId: roomId || "r003",
        weekDay: 3,
        startTime: "14:00",
        endTime: "15:30",
        duration: 90,
        color: "#1890ff",
        weeks: [1, 2, 3, 4, 5, 6, 7, 8],
        studentCount: 50,
      },
      {
        id: `w${week}-4`,
        courseName: "计算机组成原理",
        teacherName: "赵教授",
        teacherId: "t004",
        className: "计算机科学与技术 1 班",
        classId: classId || "c001",
        roomName: "教学楼 A-101",
        roomId: roomId || "r004",
        weekDay: 4,
        startTime: "08:00",
        endTime: "09:40",
        duration: 100,
        color: "#faad14",
        weeks: [1, 2, 3, 4, 5],
        studentCount: 45,
      },
      {
        id: `w${week}-5`,
        courseName: "操作系统",
        teacherName: "钱教授",
        teacherId: "t005",
        className: "计算机科学与技术 1 班",
        classId: classId || "c001",
        roomName: "实验楼 C-301",
        roomId: roomId || "r005",
        weekDay: 5,
        startTime: "10:10",
        endTime: "11:50",
        duration: 100,
        color: "#722ed1",
        weeks: [1, 2, 3, 4, 5, 6],
        studentCount: 42,
      },
    ];

    res.json({
      code: 200,
      message: "success",
      data: mockCourses,
      timestamp: Date.now(),
    });
  },

  // 创建课程
  "POST /api/drag-schedule/courses": (req: any, res: any) => {
    const newCourse = {
      id: `w${Date.now()}`,
      ...req.body,
    };

    res.json({
      code: 200,
      message: "创建成功",
      data: newCourse,
      timestamp: Date.now(),
    });
  },

  // 更新课程
  "PUT /api/drag-schedule/courses/:id": (req: any, res: any) => {
    const { id } = req.params;

    res.json({
      code: 200,
      message: "更新成功",
      data: {
        id,
        ...req.body,
      },
      timestamp: Date.now(),
    });
  },

  // 移动课程
  "POST /api/drag-schedule/courses/move": (req: any, res: any) => {
    const { moves } = req.body;

    res.json({
      code: 200,
      message: "移动成功",
      data: {
        success: moves.map((m: any) => ({
          courseId: m.courseId,
          oldWeekDay: 1,
          newWeekDay: m.newWeekDay,
          oldStartTime: "08:00",
          newStartTime: m.newStartTime || "08:00",
        })),
        failed: [],
        conflicts: [],
      },
      timestamp: Date.now(),
    });
  },

  // 批量删除课程
  "POST /api/drag-schedule/courses/batch-delete": (req: any, res: any) => {
    const { courseIds } = req.body;

    res.json({
      code: 200,
      message: "批量删除成功",
      data: {
        deletedCount: courseIds.length,
        deletedIds: courseIds,
        failedIds: [],
      },
      timestamp: Date.now(),
    });
  },

  // 删除课程
  "DELETE /api/drag-schedule/courses/:id": (req: any, res: any) => {
    const { id } = req.params;

    res.json({
      code: 200,
      message: "删除成功",
      data: {
        deletedId: id,
        courseName: "测试课程",
      },
      timestamp: Date.now(),
    });
  },

  // 获取周次信息
  "GET /api/drag-schedule/weeks/:weekNumber": (req: any, res: any) => {
    const { weekNumber } = req.params;

    res.json({
      code: 200,
      message: "success",
      data: {
        weekNumber: Number(weekNumber),
        startDate: "2026-03-30",
        endDate: "2026-04-05",
        courseCount: 5,
        isCurrentWeek: weekNumber === 8,
        hasUnsavedChanges: false,
        config: {},
      },
      timestamp: Date.now(),
    });
  },

  // 复制周次数据
  "POST /api/drag-schedule/weeks/copy": (req: any, res: any) => {
    const { sourceWeek, targetWeeks } = req.body;

    res.json({
      code: 200,
      message: "复制成功",
      data: {
        sourceWeek,
        copiedWeeks: targetWeeks,
        copiedCourseCount: 5,
        skippedWeeks: [],
        failedWeeks: [],
      },
      timestamp: Date.now(),
    });
  },

  // 清空周次数据
  "DELETE /api/drag-schedule/weeks/:weekNumber": (req: any, res: any) => {
    const { weekNumber } = req.params;

    res.json({
      code: 200,
      message: "清空成功",
      data: {
        weekNumber: Number(weekNumber),
        deletedCourseCount: 5,
        configPreserved: true,
      },
      timestamp: Date.now(),
    });
  },

  // 检测冲突
  "POST /api/drag-schedule/conflicts/check": (req: any, res: any) => {
    const { week, course } = req.body;

    res.json({
      code: 200,
      message: "success",
      data: {
        hasConflicts: false,
        conflicts: [],
        recommendations: [],
      },
      timestamp: Date.now(),
    });
  },

  // 获取冲突类型
  "GET /api/drag-schedule/conflicts/types": (req: any, res: any) => {
    res.json({
      code: 200,
      message: "success",
      data: [
        {
          type: "teacher",
          name: "教师冲突",
          description: "同一教师在同一时间有多个课程安排",
        },
        {
          type: "room",
          name: "教室冲突",
          description: "同一教室在同一时间被多个课程占用",
        },
        {
          type: "class",
          name: "班级冲突",
          description: "同一班级在同一时间有多个课程",
        },
        {
          type: "duration",
          name: "时长冲突",
          description: "课程时长超出一天的可排课时间范围",
        },
      ],
      timestamp: Date.now(),
    });
  },

  // 导出数据
  "GET /api/drag-schedule/export": (req: any, res: any) => {
    const { startWeek, endWeek } = req.query;

    res.json({
      code: 200,
      message: "success",
      data: {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          startWeek,
          endWeek,
          totalCourses: 5,
        },
        courses: [],
        timeSlots: [],
        weekDays: [],
        halfDayConfigs: [],
      },
      timestamp: Date.now(),
    });
  },

  // 保存周次课表
  "POST /api/drag-schedule/save": (req: any, res: any) => {
    const { week, courses } = req.body;

    res.json({
      code: 200,
      message: "保存成功",
      data: {
        week,
        savedCount: courses?.length || 0,
        message: `第${week}周课表已保存`,
      },
      timestamp: Date.now(),
    });
  },

  // 刷新周次数据
  "GET /api/drag-schedule/refresh": (req: any, res: any) => {
    const { week } = req.query;

    res.json({
      code: 200,
      message: "success",
      data: {
        week: Number(week),
        courses: [],
        timeSlots: [],
        weekDays: [],
      },
      timestamp: Date.now(),
    });
  },
};
