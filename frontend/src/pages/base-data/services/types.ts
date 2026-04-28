/**
 * base-data 模块 - API 响应类型定义
 * 定义后端接口的统一响应结构和各业务数据类型
 */

/**
 * 通用响应结构
 * 所有 API 接口返回的基础格式
 */
export interface BaseResponse<T = any> {
  /** 请求是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 响应消息 */
  message?: string;
  /** 错误代码 */
  errorCode?: string;
}

/**
 * 导入响应结构
 * 批量导入 Excel 文件后的返回结果
 */
export interface ImportResponse {
  /** 是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 导入统计信息 */
  data?: {
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
  };
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
  /** 先修课程要求 */
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
}
