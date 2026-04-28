// Mock 数据索引文件
// Umi 会自动加载 mock 目录下的所有 .ts 文件
// 此文件用于确保所有 mock 数据被正确注册

import type { Request, Response } from 'express';

export default {
  // 规则管理 API
  'GET /api/rules': (req: Request, res: Response) => {
    const { current = 1, pageSize = 10 } = req.query;
    const start = (Number(current) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedRules = mockRules.slice(start, end);

    setTimeout(() => {
      res.json({
        data: paginatedRules,
        total: mockRules.length,
        success: true,
      });
    }, 500);
  },

  'POST /api/rules': (req: Request, res: Response) => {
    const newRule = {
      ...req.body,
      key: `${Date.now()}`,
    };
    mockRules.push(newRule);

    setTimeout(() => {
      res.json({
        data: newRule,
        success: true,
      });
    }, 300);
  },

  'PUT /api/rules/:key': (req: Request, res: Response) => {
    const { key } = req.params;
    const ruleIndex = mockRules.findIndex(r => r.key === key);

    if (ruleIndex !== -1) {
      mockRules[ruleIndex] = { ...mockRules[ruleIndex], ...req.body };
      setTimeout(() => {
        res.json({
          data: mockRules[ruleIndex],
          success: true,
        });
      }, 300);
    } else {
      res.status(404).json({ success: false, message: '规则不存在' });
    }
  },

  'DELETE /api/rules/:key': (req: Request, res: Response) => {
    const { key } = req.params;
    mockRules = mockRules.filter(r => r.key !== key);

    setTimeout(() => {
      res.json({ success: true });
    }, 300);
  },

  // 教师管理 API
  'GET /api/teachers': (_req: Request, res: Response) => {
    setTimeout(() => {
      res.json({
        data: mockTeachers,
        success: true,
      });
    }, 300);
  },

  // 不可用日期管理 API
  'GET /api/unavailable-dates': (req: Request, res: Response) => {
    const { teacherId, type } = req.query;
    let filteredDates = [...mockUnavailableDates];

    if (teacherId) {
      filteredDates = filteredDates.filter((d: any) => d.teacherId === teacherId);
    }
    if (type) {
      filteredDates = filteredDates.filter((d: any) => d.type === type);
    }

    setTimeout(() => {
      res.json({
        data: filteredDates,
        success: true,
      });
    }, 300);
  },

  'POST /api/unavailable-dates': (req: Request, res: Response) => {
    const newDate = {
      ...req.body,
      key: `${Date.now()}`,
    };
    mockUnavailableDates.push(newDate);

    setTimeout(() => {
      res.json({
        data: newDate,
        success: true,
      });
    }, 300);
  },

  'POST /api/unavailable-dates/batch': (req: Request, res: Response) => {
    const newDates = req.body.map((item: any) => ({
      ...item,
      key: `${Date.now()}-${Math.random()}`,
    }));
    mockUnavailableDates = [...mockUnavailableDates, ...newDates];

    setTimeout(() => {
      res.json({
        data: newDates,
        success: true,
      });
    }, 300);
  },

  'DELETE /api/unavailable-dates/:key': (req: Request, res: Response) => {
    const { key } = req.params;
    mockUnavailableDates = mockUnavailableDates.filter(d => d.key !== key);

    setTimeout(() => {
      res.json({ success: true });
    }, 300);
  },

  'POST /api/unavailable-dates/batch-delete': (req: Request, res: Response) => {
    const { keys } = req.body;
    mockUnavailableDates = mockUnavailableDates.filter((d: any) => !keys.includes(d.key));

    setTimeout(() => {
      res.json({ success: true });
    }, 300);
  },

  // 规则权重管理 API
  'GET /api/rule-weights': (_req: Request, res: Response) => {
    setTimeout(() => {
      res.json({
        data: mockRuleWeights,
        success: true,
      });
    }, 300);
  },

  'PUT /api/rule-weights/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const { currentWeight } = req.body;
    const weightIndex = mockRuleWeights.findIndex((w: any) => w.id === id);

    if (weightIndex !== -1) {
      const oldWeight = mockRuleWeights[weightIndex].currentWeight;
      mockRuleWeights[weightIndex].currentWeight = currentWeight;

      mockWeightHistory.unshift({
        id: `${Date.now()}`,
        ruleId: id,
        ruleName: mockRuleWeights[weightIndex].name,
        oldValue: oldWeight,
        newValue: currentWeight,
        time: new Date().toLocaleTimeString(),
      });

      setTimeout(() => {
        res.json({
          data: mockRuleWeights[weightIndex],
          success: true,
        });
      }, 300);
    } else {
      res.status(404).json({ success: false, message: '权重配置不存在' });
    }
  },

  'POST /api/rule-weights/batch': (req: Request, res: Response) => {
    const updates = req.body;
    updates.forEach((update: any) => {
      const weightIndex = mockRuleWeights.findIndex((w: any) => w.id === update.id);
      if (weightIndex !== -1) {
        const oldWeight = mockRuleWeights[weightIndex].currentWeight;
        mockRuleWeights[weightIndex].currentWeight = update.currentWeight;

        mockWeightHistory.unshift({
          id: `${Date.now()}-${update.id}`,
          ruleId: update.id,
          ruleName: mockRuleWeights[weightIndex].name,
          oldValue: oldWeight,
          newValue: update.currentWeight,
          time: new Date().toLocaleTimeString(),
        });
      }
    });

    setTimeout(() => {
      res.json({
        data: mockRuleWeights,
        success: true,
      });
    }, 300);
  },

  'GET /api/rule-weights/history': (req: Request, res: Response) => {
    const { ruleId, current = 1, pageSize = 10 } = req.query;
    let filteredHistory = [...mockWeightHistory];

    if (ruleId) {
      filteredHistory = filteredHistory.filter((h: any) => h.ruleId === ruleId);
    }

    const start = (Number(current) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedHistory = filteredHistory.slice(start, end);

    setTimeout(() => {
      res.json({
        data: paginatedHistory,
        total: filteredHistory.length,
        success: true,
      });
    }, 300);
  },

  'POST /api/rule-weights/reset': (_req: Request, res: Response) => {
    mockRuleWeights.forEach((weight: any) => {
      weight.currentWeight = weight.defaultWeight;
    });

    setTimeout(() => {
      res.json({
        success: true,
        message: '已重置为默认权重',
      });
    }, 300);
  },
};

// 模拟规则数据
let mockRules = [
  {
    key: '1',
    ruleName: '英语教师周末不排课',
    teachers: ['张三', '李四', '王老师', '赵老师'],
    description: '英语教研组的教师周末不安排课程',
    validDate: [1704067200000, 1735689600000] as [number, number],
  },
  {
    key: '2',
    ruleName: '物理实验课时间限制',
    teachers: ['王五'],
    description: '物理实验课只能在上午 9:00-11:00 进行',
  },
  {
    key: '3',
    ruleName: '新教师课时限制',
    teachers: ['赵六', '钱七'],
    description: '新入职教师每周不超过 20 课时',
    validDate: [1706745600000, 1722441600000] as [number, number],
  },
  {
    key: '4',
    ruleName: '多媒体教室优先排课',
    teachers: [],
    description: '优先安排多媒体教室进行公开课'
  },
  {
    key: '5',
    ruleName: '高三重点课程优先',
    teachers: ['张三', '李四', '王五', '孙老师', '周老师'],
    description: '高三重点课程优先安排在黄金时间段',
    validDate: [1707945600000, 1717084800000] as [number, number],
  },
  {
    key: '6',
    ruleName: '体育课室外安排',
    teachers: ['刘教练', '陈教练'],
    description: '天气良好时体育课优先安排室外场地',
  },
  {
    key: '7',
    ruleName: '晚自习值班安排',
    teachers: ['李老师', '张老师', '王老师'],
    description: '晚自习必须有教师在教室值班',
  }
];

// 模拟教师数据
const mockTeachers = [
  { id: '1', name: '张三', employeeId: 'T001' },
  { id: '2', name: '李四', employeeId: 'T002' },
  { id: '3', name: '王五', employeeId: 'T003' },
  { id: '4', name: '赵六', employeeId: 'T004' },
  { id: '5', name: '刘七', employeeId: 'T005' },
  { id: '6', name: '陈八', employeeId: 'T006' },
  { id: '7', name: '杨九', employeeId: 'T007' },
  { id: '8', name: '周十', employeeId: 'T008' },
];

// 模拟不可用日期数据
let mockUnavailableDates: any[] = [
  {
    key: '1',
    teacherId: '1',
    teacherName: '张三',
    validDate: [1705276800000, 1705363200000] as [number, number],
    reason: '个人事务',
    type: 'personal',
    rangeType: 'single',
  },
  {
    key: '2',
    teacherId: '1',
    teacherName: '张三',
    validDate: [1705708800000, 1706140800000] as [number, number],
    reason: '年度会议',
    type: 'other',
    rangeType: 'range',
  },
  {
    key: '3',
    teacherId: '2',
    teacherName: '李四',
    validDate: [1704067200000, 1704672000000] as [number, number],
    reason: '培训周',
    type: 'other',
    rangeType: 'week',
  },
  {
    key: '4',
    teacherId: '2',
    teacherName: '李四',
    validDate: [1706745600000, 1709251200000] as [number, number],
    reason: '春节假期',
    type: 'holiday',
    rangeType: 'month',
  }
];

// 模拟规则权重数据
const mockRuleWeights = [
  {
    id: '1',
    name: '教师时间偏好',
    category: 'teacher',
    currentWeight: 8,
    defaultWeight: 8,
    minWeight: 1,
    maxWeight: 10,
    enabled: true,
    description: '尊重教师的时间偏好'
  },
  {
    id: '2',
    name: '课程连续性',
    category: 'course',
    currentWeight: 7,
    defaultWeight: 7,
    minWeight: 1,
    maxWeight: 10,
    enabled: true,
    description: '同一课程尽量连续安排'
  },
  {
    id: '3',
    name: '教室利用率',
    category: 'resource',
    currentWeight: 6,
    defaultWeight: 6,
    minWeight: 1,
    maxWeight: 10,
    enabled: true,
    description: '提高教室使用效率'
  },
  {
    id: '4',
    name: '黄金时间优先',
    category: 'time',
    currentWeight: 9,
    defaultWeight: 9,
    minWeight: 1,
    maxWeight: 10,
    enabled: true,
    description: '重点课程优先安排在黄金时间'
  },
  {
    id: '5',
    name: '教师工作量均衡',
    category: 'teacher',
    currentWeight: 8,
    defaultWeight: 8,
    minWeight: 1,
    maxWeight: 10,
    enabled: true,
    description: '均衡分配教师工作量'
  }
];

// 模拟权重变更历史
let mockWeightHistory: any[] = [];
