/**
 * base-data 模块 - API 响应类型定义
 * 定义后端接口的统一响应结构和各业务数据类型
 */

/**
 * 通用响应结构
 * 所有 API 接口返回的基础格式
 */
export interface ApiResponse<T = any> {
  /** HTTP 状态码：200/400/404/500 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: T;
  /** 时间戳（毫秒） */
  timestamp: number;
}

/**
 * 列表响应结构
 * 用于分页列表接口
 */
export interface ListResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 总记录数 */
  total: number;
}

/**
 * 导入响应结构
 * 批量导入 Excel 文件后的返回结果
 */
export interface ImportResponse {
  /** 总记录数 */
  total: number;
  /** 成功数量 */
  success: number;
  /** 失败数量 */
  failed: number;
  /** 错误详情（行号和错误信息） */
  errors?: Array<{
    row: number;
    message: string;
  }>;
}

/**
 * 课程数据类型
 * 用于课程录入和课程设置步骤
 */
export interface Course {
  /** 课程 ID */
  id: string;
  /** 课程名称 */
  name: string;
  /** 学分 */
  credits: number;
  /** 课程类型（必修/选修/限选） */
  type: string;
  /** 总课时 */
  totalHours: number;
}

/**
 * 课程设置数据类型
 * 用于课程设置步骤
 */
export interface CourseSetting {
  /** 课程名称 */
  name: string;
  /** 优先级 */
  priority: number;
  /** 先修课程列表 */
  prerequisites: string[];
  /** 开课学期 */
  semester: string;
}

/**
 * 专业数据类型
 * 用于专业设置步骤
 */
export interface Major {
  /** 专业 ID */
  id: string;
  /** 专业名称 */
  name: string;
  /** 必修课程列表 */
  courses: string[];
  /** 班级人数 */
  classSize: number;
  /** 学制（年） */
  duration: number;
}

/**
 * 教师数据类型
 * 用于教师录入步骤
 */
export interface Teacher {
  /** 教师 ID */
  id: string;
  /** 教师姓名 */
  name: string;
  /** 性别 */
  gender: string;
  /** 可授课程列表 */
  courses: string[];
  /** 学历 */
  degree: string;
  /** 邮箱（可选） */
  email?: string;
  /** 电话（可选） */
  phone?: string;
}

/**
 * 日历提交请求结构
 * 用于学期日历日期设置提交
 */
export interface CalendarSubmitRequest {
  /** 学期开始日期 YYYY-MM-DD */
  startDate: string;
  /** 学期结束日期 YYYY-MM-DD */
  endDate: string;
  /** 禁用日期列表 */
  disabledDates: {
    /** 禁用日期 YYYY-MM-DD */
    date: string;
    /** 备注（如：国庆节） */
    remark?: string;
  }[];
}

/**
 * 提交响应结构
 * 用于批量提交基础数据
 */
export interface SubmitRequest {
  /** 课程列表 */
  courses: Course[];
  /** 课程设置列表 */
  courseSettings: CourseSetting[];
  /** 专业列表 */
  majors: Major[];
  /** 教师列表 */
  teachers: Teacher[];
}

/**
 * 提交响应结构
 * 用于批量提交基础数据
 */
export interface SubmitResponse {
  /** 提交 ID */
  submissionId: string;
  /** 课程数量 */
  coursesCount: number;
  /** 课程设置数量 */
  courseSettingsCount: number;
  /** 专业数量 */
  majorsCount: number;
  /** 教师数量 */
  teachersCount: number;
  /** 提交时间 */
  submitTime: string;
  /** 状态 */
  status: string;
}
