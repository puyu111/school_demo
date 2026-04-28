# 基础数据管理模块接口文档 (base-data)

## 概述

本文档描述基础数据管理模块（base-data）的所有 API 接口。该模块用于录入和管理排课系统所需的基础数据，包括课程、课程设置、专业和教师信息。

### 基础信息

- **Base URL**: `/api/base-data`
- **认证方式**: 暂无（请求拦截器中预留了 token 添加位置）
- **响应格式**: 统一返回 JSON 格式

### 统一响应结构

```typescript
interface BaseResponse<T = any> {
  success: boolean;        // 请求是否成功
  data?: T;                // 响应数据
  message?: string;        // 响应消息
  errorCode?: string;      // 错误代码
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 一、课程管理 API

### 1.1 批量导入课程数据

**接口**: `POST /api/base-data/courses/import`

**描述**: 通过 Excel 文件批量导入课程信息

**请求方式**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | Excel 文件（.xlsx 或 .xls） |

**请求示例**:
```javascript
const formData = new FormData();
formData.append('file', excelFile);

fetch('/api/base-data/courses/import', {
  method: 'POST',
  body: formData,
});
```

**响应示例**:
```json
{
  "success": true,
  "message": "课程数据导入成功，共导入 25 条记录",
  "data": {
    "total": 25,
    "success": 25,
    "failed": 0,
    "errors": []
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "导入失败：文件格式不正确，请上传 .xlsx 或 .xls 文件",
  "errorCode": "INVALID_FILE_FORMAT"
}
```

---

### 1.2 下载课程导入模板

**接口**: `GET /api/base-data/courses/import/template`

**描述**: 下载课程导入的 Excel 模板文件

**请求参数**: 无

**响应示例**:
- 成功：返回 Excel 文件（application/vnd.openxmlformats-officedocument.spreadsheetml.sheet）
- 失败：返回 JSON 错误信息

**Excel 模板格式**:

| 列名 | 必填 | 说明 | 示例 |
|------|------|------|------|
| 课程 ID | 否 | 课程唯一标识（为空时自动生成） | C001 |
| 课程名称 | 是 | 课程中文名 | 高等数学 |
| 学分 | 是 | 课程学分 | 4 |
| 课程类型 | 是 | 必修/选修/限选 | 必修 |
| 总课时 | 是 | 课程总学时 | 64 |

**Excel 数据示例**：

| 课程 ID | 课程名称 | 学分 | 课程类型 | 总课时 |
|---------|----------|------|----------|--------|
| C001 | 高等数学 | 4 | 必修 | 64 |
| C002 | 线性代数 | 3 | 必修 | 48 |
| C003 | 概率论 | 3 | 必修 | 48 |
| C004 | 数据结构 | 4 | 必修 | 64 |
|  | 程序设计基础 | 3 | 选修 | 48 |

**对应的 JSON 数据**：
```json
[
  {
    "id": "C001",
    "name": "高等数学",
    "credits": 4,
    "type": "必修",
    "totalHours": 64
  },
  {
    "id": "C002",
    "name": "线性代数",
    "credits": 3,
    "type": "必修",
    "totalHours": 48
  },
  {
    "id": "auto_generated_5",
    "name": "程序设计基础",
    "credits": 3,
    "type": "选修",
    "totalHours": 48
  }
]
```

---

## 二、课程设置 API

### 2.1 批量导入课程设置

**接口**: `POST /api/base-data/course-settings/import`

**描述**: 通过 Excel 文件批量导入课程设置信息

**请求方式**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | Excel 文件 |

**响应示例**:
```json
{
  "success": true,
  "message": "课程设置导入成功，共导入 18 条记录",
  "data": {
    "total": 18,
    "success": 18,
    "failed": 0,
    "errors": []
  }
}
```

---

### 2.2 下载课程设置导入模板

**接口**: `GET /api/base-data/course-settings/import/template`

**描述**: 下载课程设置的 Excel 模板文件

**Excel 模板格式**:

| 列名 | 必填 | 说明 | 示例 |
|------|------|------|------|
| 课程名称 | 是 | 关联的课程名 | 高等数学 |
| 优先级 | 是 | 数字，越小优先级越高 | 1 |
| 先修课程 | 否 | 多门用分号隔开 | 初等数学;线性代数 |
| 开课学期 | 是 | 第几学期 | 第 1 学期 |

**Excel 数据示例**：

| 课程名称 | 优先级 | 先修课程 | 开课学期 |
|----------|--------|----------|----------|
| 高等数学 | 1 |  | 第 1 学期 |
| 线性代数 | 2 | 高等数学 | 第 2 学期 |
| 概率论 | 3 | 高等数学;线性代数 | 第 3 学期 |
| 数据结构 | 1 | 程序设计基础 | 第 2 学期 |

**对应的 JSON 数据**：
```json
[
  {
    "name": "高等数学",
    "priority": 1,
    "prerequisites": [],
    "semester": "第 1 学期"
  },
  {
    "name": "线性代数",
    "priority": 2,
    "prerequisites": ["高等数学"],
    "semester": "第 2 学期"
  },
  {
    "name": "概率论",
    "priority": 3,
    "prerequisites": ["高等数学", "线性代数"],
    "semester": "第 3 学期"
  }
]
```

---

## 三、专业管理 API

### 3.1 批量导入专业数据

**接口**: `POST /api/base-data/majors/import`

**描述**: 通过 Excel 文件批量导入专业信息

**请求方式**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | Excel 文件 |

**响应示例**:
```json
{
  "success": true,
  "message": "专业设置导入成功，共导入 8 条记录",
  "data": {
    "total": 8,
    "success": 8,
    "failed": 0,
    "errors": []
  }
}
```

---

### 3.2 下载专业导入模板

**接口**: `GET /api/base-data/majors/import/template`

**描述**: 下载专业信息的 Excel 模板文件

**Excel 模板格式**:

| 列名 | 必填 | 说明 | 示例 |
|------|------|------|------|
| 专业 ID | 否 | 专业唯一标识（为空时自动生成） | M001 |
| 专业名称 | 是 | 专业中文名 | 计算机科学与技术 |
| 必修课程 | 否 | 多门用分号隔开 | 高等数学;数据结构;操作系统 |
| 班级人数 | 是 | 默认班级规模 | 45 |
| 学制 | 是 | 学习年限（年） | 4 |

**Excel 数据示例**：

| 专业 ID | 专业名称 | 必修课程 | 班级人数 | 学制 |
|---------|----------|----------|----------|------|
| M001 | 计算机科学与技术 | 高等数学;数据结构;操作系统;计算机组成原理 | 45 | 4 |
| M002 | 软件工程 | 高等数学;数据结构;软件工程导论;数据库原理 | 40 | 4 |
|  | 人工智能 | 高等数学;线性代数;机器学习;深度学习 | 30 | 4 |

**对应的 JSON 数据**：
```json
[
  {
    "id": "M001",
    "name": "计算机科学与技术",
    "courses": ["高等数学", "数据结构", "操作系统", "计算机组成原理"],
    "classSize": 45,
    "duration": 4
  },
  {
    "id": "M002",
    "name": "软件工程",
    "courses": ["高等数学", "数据结构", "软件工程导论", "数据库原理"],
    "classSize": 40,
    "duration": 4
  },
  {
    "id": "auto_generated_3",
    "name": "人工智能",
    "courses": ["高等数学", "线性代数", "机器学习", "深度学习"],
    "classSize": 30,
    "duration": 4
  }
]
```

---

## 四、教师管理 API

### 4.1 批量导入教师数据

**接口**: `POST /api/base-data/teachers/import`

**描述**: 通过 Excel 文件批量导入教师信息

**请求方式**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | Excel 文件 |

**响应示例**:
```json
{
  "success": true,
  "message": "教师数据导入成功，共导入 32 条记录",
  "data": {
    "total": 32,
    "success": 32,
    "failed": 0,
    "errors": []
  }
}
```

---

### 4.2 下载教师导入模板

**接口**: `GET /api/base-data/teachers/import/template`

**描述**: 下载教师信息的 Excel 模板文件

**Excel 模板格式**:

| 列名 | 必填 | 说明 | 示例 |
|------|------|------|------|
| 教师 ID | 否 | 教师唯一标识（为空时自动生成） | T001 |
| 教师姓名 | 是 | 姓名 | 张三 |
| 性别 | 是 | 男/女 | 男 |
| 可授课程 | 否 | 多门用分号隔开 | 高等数学;线性代数 |
| 学历 | 是 | 最高学历 | 博士研究生 |

**Excel 数据示例**：

| 教师 ID | 教师姓名 | 性别 | 可授课程 | 学历 |
|---------|----------|------|----------|------|
| T001 | 张三 | 男 | 高等数学;线性代数 | 博士研究生 |
| T002 | 李四 | 女 | 数据结构;算法分析 | 博士研究生 |
| T003 | 王五 | 男 | 操作系统;计算机组成原理 | 硕士研究生 |
|  | 钱七 | 男 | 概率论;数理统计 | 博士研究生 |

**对应的 JSON 数据**：
```json
[
  {
    "id": "T001",
    "name": "张三",
    "gender": "男",
    "courses": ["高等数学", "线性代数"],
    "degree": "博士研究生"
  },
  {
    "id": "T002",
    "name": "李四",
    "gender": "女",
    "courses": ["数据结构", "算法分析"],
    "degree": "博士研究生"
  },
  {
    "id": "auto_generated_4",
    "name": "钱七",
    "gender": "男",
    "courses": ["概率论", "数理统计"],
    "degree": "博士研究生"
  }
]
```

---

## 五、数据结构定义

### Course（课程）

```typescript
interface Course {
  id: string;              // 课程唯一标识
  name: string;            // 课程名称
  credits: number;         // 学分
  type: string;            // 课程类型：必修/选修/限选
  totalHours: number;      // 总课时
}
```

### CourseSetting（课程设置）

```typescript
interface CourseSetting {
  name: string;            // 课程名称
  priority: number;        // 优先级（数字越小优先级越高）
  prerequisites: string[]; // 先修课程列表
  semester: string;        // 开课学期
}
```

### Major（专业）

```typescript
interface Major {
  id: string;              // 专业唯一标识
  name: string;            // 专业名称
  courses: string[];       // 必修课程列表
  classSize: number;       // 班级人数
  duration: number;        // 学制（年）
}
```

### Teacher（教师）

```typescript
interface Teacher {
  id: string;              // 教师唯一标识
  name: string;            // 教师姓名
  gender: string;          // 性别
  courses: string[];       // 可授课程列表
  degree: string;          // 学历
}
```

### ImportResponse（导入响应）

```typescript
interface ImportResponse {
  success: boolean;        // 是否成功
  message: string;         // 响应消息
  data?: {
    total: number;         // 总记录数
    success: number;       // 成功数量
    failed: number;        // 失败数量
    errors?: Array<{       // 错误详情
      row: number;         // 行号
      message: string;     // 错误信息
    }>;
  };
}
```

---

## 六、错误处理

### 常见错误类型

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| INVALID_FILE_FORMAT | 文件格式不正确 | 请上传 .xlsx 或 .xls 格式文件 |
| FILE_TOO_LARGE | 文件过大 | 文件大小请勿超过 10MB |
| MISSING_REQUIRED_FIELD | 缺少必填字段 | 请检查 Excel 模板中的必填列 |
| DATA_VALIDATION_FAILED | 数据验证失败 | 请检查数据格式是否正确 |
| DUPLICATE_DATA | 数据重复 | 请检查是否存在重复记录 |
| IMPORT_FAILED | 导入失败 | 请查看错误详情 |

### 错误响应示例

```json
{
  "success": false,
  "message": "导入失败：部分数据验证失败",
  "errorCode": "DATA_VALIDATION_FAILED",
  "data": {
    "total": 30,
    "success": 27,
    "failed": 3,
    "errors": [
      {
        "row": 5,
        "message": "学分必须为正数"
      },
      {
        "row": 12,
        "message": "课程类型必须是必修、选修或限选"
      },
      {
        "row": 28,
        "message": "总课时必须为正整数"
      }
    ]
  }
}
```

---

## 七、前端使用示例

### 使用 useRequest Hook

```typescript
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import * as baseDataApi from '@/pages/base-data/services/api';

function ImportButton() {
  const { run: importCourses, loading } = useRequest(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(baseDataApi.API_PATHS.COURSES.IMPORT, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    {
      manual: true,
      onSuccess: (result) => {
        message.success(result.message);
      },
      onError: (error) => {
        message.error(error.message);
      },
    },
  );

  return (
    <Button 
      loading={loading} 
      onClick={() => {
        // 触发文件选择
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) importCourses(file);
        };
        input.click();
      }}
    >
      导入课程
    </Button>
  );
}
```

### 下载模板示例

```typescript
const downloadTemplate = async () => {
  try {
    const response = await fetch('/api/base-data/courses/import/template');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '课程导入模板.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    message.error('下载模板失败');
  }
};
```

---

## 八、最佳实践

### 1. 导入前数据校验

在前端上传文件前，建议先进行基础校验：

```typescript
const validateFile = (file: File): boolean => {
  // 检查文件类型
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!allowedTypes.includes(file.type)) {
    message.error('请上传 Excel 文件（.xlsx 或 .xls）');
    return false;
  }
  
  // 检查文件大小（不超过 10MB）
  if (file.size > 10 * 1024 * 1024) {
    message.error('文件大小请勿超过 10MB');
    return false;
  }
  
  return true;
};
```

### 2. 处理导入错误

建议展示详细的错误信息，帮助用户定位问题：

```typescript
if (result.data?.errors?.length > 0) {
  const errorList = result.data.errors.map((e: any) => 
    `第${e.row}行：${e.message}`
  ).join('\n');
  
  Modal.error({
    title: '导入部分失败',
    content: (
      <div>
        <p>成功：{result.data.success} 条</p>
        <p>失败：{result.data.failed} 条</p>
        <pre>{errorList}</pre>
      </div>
    ),
    width: 600,
  });
}
```

### 3. 批量操作优化

对于大量数据导入，建议添加进度提示：

```typescript
const { run: importWithProgress } = useRequest(importApi, {
  manual: true,
  onBefore: () => {
    message.loading('正在导入数据，请稍候...', 0);
  },
  onFinally: () => {
    message.destroy();
  },
});
```

---

## 九、更新日志

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-04-10 | 初始版本，包含课程、课程设置、专业、教师的导入接口和示例数据 |
