# 基础数据管理模块接口文档 (base-data)

## 概述

本文档描述基础数据管理模块（base-data）的所有 API 接口。该模块用于录入和管理排课系统所需的基础数据，包括课程、课程设置、专业和教师信息。

### 基础信息

- **Base URL**: `/api/base-data`
- **认证方式**: 暂无（请求拦截器中预留了 token 添加位置）
- **响应格式**: 统一返回 JSON 格式

### 统一响应结构

```typescript
interface ApiResponse<T = any> {
  code: number;          // HTTP 状态码：200 成功，400 请求错误，500 服务器错误
  message: string;       // 响应消息
  data?: T;              // 响应数据
  timestamp: number;     // 时间戳（毫秒）
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### ID 说明（重要）

> **数据库 ID vs 页面展示 ID**
> 
> - **数据库 ID** (`dbId`): 后端数据库中的真实记录 ID
>   - MySQL 方案：`bigint` 自增 ID（如 `1001`）或 `varchar(36)` UUID（如 `"550e8400-e29b-41d4-a716-446655440000"`）
>   - MongoDB 方案：`ObjectId` 字符串（如 `"507f1f77bcf86cd799439011"`）
> - **页面展示 ID** (`id`): 前端展示的自定义 ID（如 C001、M001、T001），可为空，为空时系统自动生成
> 
> **删除操作使用数据库 ID**，创建/更新时页面展示 ID 为可选参数。

| 数据类型 | 数据库 ID 字段 | 页面展示 ID 字段 | 说明 |
|----------|---------------|-----------------|------|
| 课程 | `dbId` | `id` | 页面展示 ID 示例：C001 |
| 课程设置 | `dbId` | `name`（课程名称作为标识） | 无独立页面 ID |
| 专业 | `dbId` | `id` | 页面展示 ID 示例：M001 |
| 教师 | `dbId` | `id` | 页面展示 ID 示例：T001 |

**后端实现建议**:
- 如果使用 MySQL + JPA：`dbId` 类型为 `Long`（自增）或 `String`（UUID）
- 页面展示 ID 作为业务字段存储，添加唯一索引防止重复

---

## 一、课程管理 API

### 1.1 获取课程列表

**接口**: `GET /api/base-data/courses`

**描述**: 获取课程列表，支持分页和条件筛选

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 10） |
| keyword | string | 否 | 关键词搜索（课程名称） |
| type | string | 否 | 课程类型筛选：必修/选修/限选 |

**请求示例 (页面初始化加载第一页)**:
```
GET /api/base-data/courses?page=1&pageSize=10
```

**说明**: 页面首次加载时请求第一页数据，默认每页 10 条。用户分页或筛选时再传递对应参数。

**响应数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| list | Course[] | 课程列表 |
| total | number | 总记录数 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "dbId": "507f1f77bcf86cd799439011",
        "id": "C001",
        "name": "高等数学",
        "credits": 4,
        "type": "必修",
        "totalHours": 64,
        "createdAt": "2026-04-20T10:00:00Z",
        "updatedAt": "2026-04-20T10:00:00Z"
      },
      {
        "dbId": "507f1f77bcf86cd799439012",
        "id": "C002",
        "name": "线性代数",
        "credits": 3,
        "type": "必修",
        "totalHours": 48,
        "createdAt": "2026-04-20T10:05:00Z",
        "updatedAt": "2026-04-20T10:05:00Z"
      },
      {
        "dbId": "507f1f77bcf86cd799439013",
        "id": "",
        "name": "程序设计基础",
        "credits": 3,
        "type": "选修",
        "totalHours": 48,
        "createdAt": "2026-04-20T10:10:00Z",
        "updatedAt": "2026-04-20T10:10:00Z"
      }
    ],
    "total": 46
  },
  "timestamp": 1713580800000
}
```

---

### 1.2 创建课程

**接口**: `POST /api/base-data/courses`

**描述**: 创建单个课程

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 否 | 课程展示 ID（为空时自动生成） |
| name | string | 是 | 课程名称 |
| credits | number | 是 | 课程学分 |
| type | string | 是 | 课程类型：必修/选修/限选 |
| totalHours | number | 是 | 总课时 |

**请求示例**:
```json
POST /api/base-data/courses
{
  "id": "C001",
  "name": "高等数学",
  "credits": 4,
  "type": "必修",
  "totalHours": 64
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dbId": "507f1f77bcf86cd799439011",
    "id": "C001",
    "name": "高等数学",
    "credits": 4,
    "type": "必修",
    "totalHours": 64,
    "createdAt": "2026-04-20T10:00:00Z"
  },
  "timestamp": 1713580800000
}
```

**错误响应（ID 已存在）**:
```json
{
  "code": 400,
  "message": "创建失败：课程 ID 已存在",
  "data": {
    "duplicateId": "C001"
  },
  "timestamp": 1713580800000
}
```

---

### 1.3 批量删除课程

**接口**: `POST /api/base-data/courses/batch-delete`

**描述**: 批量删除课程（支持删除多个）

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dbIds | string[] | 是 | 数据库 ID 数组 |

**请求示例**:
```json
POST /api/base-data/courses/batch-delete
{
  "dbIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deletedCount": 3,
    "deletedDbIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013"
    ],
    "deletedDisplayIds": ["C001", "C002", "C003"],
    "deleteTime": "2026-04-20T12:00:00Z"
  },
  "timestamp": 1713580800000
}
```

**错误响应（部分删除失败）**:
```json
{
  "code": 400,
  "message": "删除失败：部分记录不存在",
  "data": {
    "deletedCount": 2,
    "failedCount": 1,
    "deletedDbIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "failedDbIds": ["507f1f77bcf86cd799439999"],
    "failedReasons": [
      {
        "dbId": "507f1f77bcf86cd799439999",
        "message": "记录不存在"
      }
    ]
  },
  "timestamp": 1713580800000
}
```

**说明**: 使用 POST 而非 DELETE 方法处理批量删除，避免 DELETE 带 Body 的兼容性问题。

---

### 1.4 批量导入课程数据

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
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "success": 25,
    "failed": 0,
    "createdRecords": [
      {
        "dbId": "507f1f77bcf86cd799439011",
        "id": "C001",
        "name": "高等数学"
      },
      {
        "dbId": "507f1f77bcf86cd799439012",
        "id": "C002",
        "name": "线性代数"
      }
    ],
    "errors": []
  },
  "timestamp": 1713580800000
}
```

**部分失败响应**:
```json
{
  "code": 200,
  "message": "课程数据导入完成，成功 22 条，失败 3 条",
  "data": {
    "total": 25,
    "success": 22,
    "failed": 3,
    "createdRecords": [...],
    "errors": [
      {
        "row": 5,
        "message": "学分必须为正数",
        "data": {
          "id": "C005",
          "name": "错误课程"
        }
      },
      {
        "row": 12,
        "message": "课程类型必须是必修、选修或限选",
        "data": {
          "id": "C012",
          "name": "类型错误课程"
        }
      },
      {
        "row": 18,
        "message": "课程 ID 已存在，请勿重复添加",
        "data": {
          "id": "C001",
          "name": "重复课程"
        }
      }
    ]
  },
  "timestamp": 1713580800000
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "导入失败：文件格式不正确，请上传 .xlsx 或 .xls 文件",
  "data": null,
  "timestamp": 1713580800000
}
```

---

### 1.5 下载课程导入模板

**接口**: `GET /api/base-data/courses/import/template`

**描述**: 下载课程导入的 Excel 模板文件

**请求参数**: 无

**响应示例**:
- 成功：返回 Excel 文件（application/vnd.openxmlformats-officedocument.spreadsheetml.sheet）
- 失败：返回 JSON 错误信息

**Excel 模板格式**:

| 列名 | 必填 | 说明 | 示例 |
|------|------|------|------|
| 课程 ID | 否 | 课程展示 ID（为空时自动生成） | C001 |
| 课程名称 | 是 | 课程中文名 | 高等数学 |
| 学分 | 是 | 课程学分 | 4 |
| 课程类型 | 是 | 必修/选修/限选 | 必修 |
| 总课时 | 是 | 课程总学时 | 64 |

**Excel 数据示例**：

| 课程 ID | 课程名称 | 学分 | 课程类型 | 总课时 |
|---------|----------|------|----------|--------|
| C001 | 高等数学 | 4 | 必修 | 64 |
| C002 | 线性代数 | 3 | 必修 | 48 |
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
    "id": "",
    "name": "程序设计基础",
    "credits": 3,
    "type": "选修",
    "totalHours": 48
  }
]
```

---

## 二、课程设置 API

### 2.1 获取课程设置列表

**接口**: `GET /api/base-data/course-settings`

**描述**: 获取课程设置列表，支持分页和条件筛选

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 10） |
| semester | string | 否 | 开课学期筛选 |

**请求示例 (页面初始化加载第一页)**:
```
GET /api/base-data/course-settings?page=1&pageSize=10
```

**说明**: 页面首次加载时请求第一页数据，默认每页 10 条。用户分页或筛选时再传递对应参数。

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "dbId": "507f1f77bcf86cd799439021",
        "name": "高等数学",
        "priority": 1,
        "prerequisites": [],
        "semester": "第 1 学期",
        "createdAt": "2026-04-20T10:00:00Z"
      },
      {
        "dbId": "507f1f77bcf86cd799439022",
        "name": "线性代数",
        "priority": 2,
        "prerequisites": ["高等数学"],
        "semester": "第 2 学期",
        "createdAt": "2026-04-20T10:05:00Z"
      },
      {
        "dbId": "507f1f77bcf86cd799439023",
        "name": "概率论",
        "priority": 3,
        "prerequisites": ["高等数学", "线性代数"],
        "semester": "第 3 学期",
        "createdAt": "2026-04-20T10:10:00Z"
      }
    ],
    "total": 46
  },
  "timestamp": 1713580800000
}
```

---

### 2.2 创建课程设置

**接口**: `POST /api/base-data/course-settings`

**描述**: 创建单个课程设置

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 课程名称 |
| priority | number | 是 | 优先级（数字越小优先级越高） |
| prerequisites | string[] | 否 | 先修课程列表 |
| semester | string | 是 | 开课学期 |

**请求示例**:
```json
POST /api/base-data/course-settings
{
  "name": "高等数学",
  "priority": 1,
  "prerequisites": [],
  "semester": "第 1 学期"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dbId": "507f1f77bcf86cd799439021",
    "name": "高等数学",
    "priority": 1,
    "prerequisites": [],
    "semester": "第 1 学期",
    "createdAt": "2026-04-20T10:00:00Z"
  },
  "timestamp": 1713580800000
}
```

---

### 2.3 批量删除课程设置

**接口**: `POST /api/base-data/course-settings/batch-delete`

**描述**: 批量删除课程设置（支持删除多个）

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dbIds | string[] | 是 | 数据库 ID 数组 |

**请求示例**:
```json
POST /api/base-data/course-settings/batch-delete
{
  "dbIds": [
    "507f1f77bcf86cd799439021",
    "507f1f77bcf86cd799439022"
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deletedCount": 2,
    "deletedDbIds": [
      "507f1f77bcf86cd799439021",
      "507f1f77bcf86cd799439022"
    ],
    "deletedNames": ["高等数学", "线性代数"],
    "deleteTime": "2026-04-20T12:00:00Z"
  },
  "timestamp": 1713580800000
}
```

**说明**: 使用 POST 而非 DELETE 方法处理批量删除，避免 DELETE 带 Body 的兼容性问题。

---

### 2.4 批量导入课程设置

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
  "code": 200,
  "message": "success",
  "data": {
    "total": 18,
    "success": 18,
    "failed": 0,
    "errors": []
  },
  "timestamp": 1713580800000
}
```

**部分失败响应**:
```json
{
  "code": 200,
  "message": "课程设置导入完成，成功 15 条，失败 3 条",
  "data": {
    "total": 18,
    "success": 15,
    "failed": 3,
    "errors": [
      {
        "row": 5,
        "message": "课程名称不存在，请先添加课程",
        "data": {
          "name": "不存在的课程"
        }
      },
      {
        "row": 10,
        "message": "优先级必须为正整数",
        "data": {
          "name": "优先级错误课程",
          "priority": -1
        }
      },
      {
        "row": 15,
        "message": "先修课程不存在",
        "data": {
          "name": "先修错误课程",
          "prerequisites": ["不存在的先修课"]
        }
      }
    ]
  },
  "timestamp": 1713580800000
}
```

---

### 2.5 下载课程设置导入模板

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

### 3.1 获取专业列表

**接口**: `GET /api/base-data/majors`

**描述**: 获取专业列表，支持分页和条件筛选

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 10） |
| keyword | string | 否 | 关键词搜索（专业名称） |

**请求示例 (页面初始化加载第一页)**:
```
GET /api/base-data/majors?page=1&pageSize=10
```

**说明**: 页面首次加载时请求第一页数据，默认每页 10 条。用户分页或筛选时再传递对应参数。

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "dbId": "507f1f77bcf86cd799439031",
        "id": "M001",
        "name": "计算机科学与技术",
        "courses": ["高等数学", "数据结构", "操作系统", "计算机组成原理"],
        "classSize": 45,
        "duration": 4,
        "createdAt": "2026-04-20T10:00:00Z"
      },
      {
        "dbId": "507f1f77bcf86cd799439032",
        "id": "M002",
        "name": "软件工程",
        "courses": ["高等数学", "数据结构", "软件工程导论", "数据库原理"],
        "classSize": 40,
        "duration": 4,
        "createdAt": "2026-04-20T10:05:00Z"
      }
    ],
    "total": 8
  },
  "timestamp": 1713580800000
}
```

---

### 3.2 创建专业

**接口**: `POST /api/base-data/majors`

**描述**: 创建单个专业

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 否 | 专业展示 ID（为空时自动生成） |
| name | string | 是 | 专业名称 |
| courses | string[] | 否 | 必修课程列表 |
| classSize | number | 是 | 班级人数 |
| duration | number | 是 | 学制（年） |

**请求示例**:
```json
POST /api/base-data/majors
{
  "id": "M001",
  "name": "计算机科学与技术",
  "courses": ["高等数学", "数据结构", "操作系统", "计算机组成原理"],
  "classSize": 45,
  "duration": 4
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dbId": "507f1f77bcf86cd799439031",
    "id": "M001",
    "name": "计算机科学与技术",
    "courses": ["高等数学", "数据结构", "操作系统", "计算机组成原理"],
    "classSize": 45,
    "duration": 4,
    "createdAt": "2026-04-20T10:00:00Z"
  },
  "timestamp": 1713580800000
}
```

---

### 3.3 批量删除专业

**接口**: `POST /api/base-data/majors/batch-delete`

**描述**: 批量删除专业（支持删除多个）

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dbIds | string[] | 是 | 数据库 ID 数组 |

**请求示例**:
```json
POST /api/base-data/majors/batch-delete
{
  "dbIds": [
    "507f1f77bcf86cd799439031",
    "507f1f77bcf86cd799439032"
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deletedCount": 2,
    "deletedDbIds": [
      "507f1f77bcf86cd799439031",
      "507f1f77bcf86cd799439032"
    ],
    "deletedDisplayIds": ["M001", "M002"],
    "deleteTime": "2026-04-20T12:00:00Z"
  },
  "timestamp": 1713580800000
}
```

**说明**: 使用 POST 而非 DELETE 方法处理批量删除，避免 DELETE 带 Body 的兼容性问题。

---

### 3.4 批量导入专业数据

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
  "code": 200,
  "message": "success",
  "data": {
    "total": 8,
    "success": 8,
    "failed": 0,
    "errors": []
  },
  "timestamp": 1713580800000
}
```

**部分失败响应**:
```json
{
  "code": 200,
  "message": "专业设置导入完成，成功 5 条，失败 3 条",
  "data": {
    "total": 8,
    "success": 5,
    "failed": 3,
    "errors": [
      {
        "row": 3,
        "message": "专业名称已存在",
        "data": {
          "id": "M001",
          "name": "计算机科学与技术"
        }
      },
      {
        "row": 6,
        "message": "班级人数必须为正整数",
        "data": {
          "id": "M006",
          "name": "错误专业"
        }
      },
      {
        "row": 8,
        "message": "学制必须为正整数",
        "data": {
          "id": "M008",
          "name": "学制错误专业"
        }
      }
    ]
  },
  "timestamp": 1713580800000
}
```

---

### 3.5 下载专业导入模板

**接口**: `GET /api/base-data/majors/import/template`

**描述**: 下载专业信息的 Excel 模板文件

**Excel 模板格式**:

| 列名 | 必填 | 说明 | 示例 |
|------|------|------|------|
| 专业 ID | 否 | 专业展示 ID（为空时自动生成） | M001 |
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
    "id": "",
    "name": "人工智能",
    "courses": ["高等数学", "线性代数", "机器学习", "深度学习"],
    "classSize": 30,
    "duration": 4
  }
]
```

---

## 四、教师管理 API

### 4.1 获取教师列表

**接口**: `GET /api/base-data/teachers`

**描述**: 获取教师列表，支持分页和条件筛选

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 10） |
| keyword | string | 否 | 关键词搜索（教师姓名） |
| degree | string | 否 | 学历筛选 |

**请求示例 (页面初始化加载第一页)**:
```
GET /api/base-data/teachers?page=1&pageSize=10
```

**说明**: 页面首次加载时请求第一页数据，默认每页 10 条。用户分页或筛选时再传递对应参数。

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "dbId": "507f1f77bcf86cd799439041",
        "id": "T001",
        "name": "张三",
        "gender": "男",
        "courses": ["高等数学", "线性代数"],
        "degree": "博士研究生",
        "email": "zhangsan@university.edu.cn",
        "phone": "13812341234",
        "createdAt": "2026-04-20T10:00:00Z"
      },
      {
        "dbId": "507f1f77bcf86cd799439042",
        "id": "T002",
        "name": "李四",
        "gender": "女",
        "courses": ["数据结构", "算法分析"],
        "degree": "博士研究生",
        "email": "lisi@university.edu.cn",
        "phone": "13912341234",
        "createdAt": "2026-04-20T10:05:00Z"
      }
    ],
    "total": 32
  },
  "timestamp": 1713580800000
}
```

---

### 4.2 创建教师

**接口**: `POST /api/base-data/teachers`

**描述**: 创建单个教师

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 否 | 教师展示 ID（为空时自动生成） |
| name | string | 是 | 教师姓名 |
| gender | string | 是 | 性别：男/女 |
| courses | string[] | 否 | 可授课程列表 |
| degree | string | 是 | 学历 |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 电话 |

**请求示例**:
```json
POST /api/base-data/teachers
{
  "id": "T001",
  "name": "张三",
  "gender": "男",
  "courses": ["高等数学", "线性代数"],
  "degree": "博士研究生",
  "email": "zhangsan@university.edu.cn",
  "phone": "13812341234"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dbId": "507f1f77bcf86cd799439041",
    "id": "T001",
    "name": "张三",
    "gender": "男",
    "courses": ["高等数学", "线性代数"],
    "degree": "博士研究生",
    "email": "zhangsan@university.edu.cn",
    "phone": "13812341234",
    "createdAt": "2026-04-20T10:00:00Z"
  },
  "timestamp": 1713580800000
}
```

---

### 4.3 批量删除教师

**接口**: `POST /api/base-data/teachers/batch-delete`

**描述**: 批量删除教师（支持删除多个）

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| dbIds | string[] | 是 | 数据库 ID 数组 |

**请求示例**:
```json
POST /api/base-data/teachers/batch-delete
{
  "dbIds": [
    "507f1f77bcf86cd799439041",
    "507f1f77bcf86cd799439042"
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deletedCount": 2,
    "deletedDbIds": [
      "507f1f77bcf86cd799439041",
      "507f1f77bcf86cd799439042"
    ],
    "deletedDisplayIds": ["T001", "T002"],
    "deleteTime": "2026-04-20T12:00:00Z"
  },
  "timestamp": 1713580800000
}
```

**说明**: 使用 POST 而非 DELETE 方法处理批量删除，避免 DELETE 带 Body 的兼容性问题。

---

### 4.4 批量导入教师数据

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
  "code": 200,
  "message": "success",
  "data": {
    "total": 32,
    "success": 32,
    "failed": 0,
    "errors": []
  },
  "timestamp": 1713580800000
}
```

**部分失败响应**:
```json
{
  "code": 200,
  "message": "教师数据导入完成，成功 29 条，失败 3 条",
  "data": {
    "total": 32,
    "success": 29,
    "failed": 3,
    "errors": [
      {
        "row": 5,
        "message": "教师姓名已存在",
        "data": {
          "id": "T001",
          "name": "张三"
        }
      },
      {
        "row": 15,
        "message": "性别必须是男或女",
        "data": {
          "id": "T015",
          "name": "性别错误"
        }
      },
      {
        "row": 28,
        "message": "学历必须是本科、硕士研究生或博士研究生",
        "data": {
          "id": "T028",
          "name": "学历错误"
        }
      }
    ]
  },
  "timestamp": 1713580800000
}
```

---

### 4.5 下载教师导入模板

**接口**: `GET /api/base-data/teachers/import/template`

**描述**: 下载教师信息的 Excel 模板文件

**Excel 模板格式**:

| 列名 | 必填 | 说明 | 示例 |
|------|------|------|------|
| 教师 ID | 否 | 教师展示 ID（为空时自动生成） | T001 |
| 教师姓名 | 是 | 姓名 | 张三 |
| 性别 | 是 | 男/女 | 男 |
| 可授课程 | 否 | 多门用分号隔开 | 高等数学;线性代数 |
| 学历 | 是 | 最高学历 | 博士研究生 |
| 邮箱 | 否 | 联系邮箱 | zhangsan@university.edu.cn |
| 电话 | 否 | 联系电话 | 13812341234 |

**Excel 数据示例**：

| 教师 ID | 教师姓名 | 性别 | 可授课程 | 学历 | 邮箱 | 电话 |
|---------|----------|------|----------|------|------|------|
| T001 | 张三 | 男 | 高等数学;线性代数 | 博士研究生 | zhangsan@university.edu.cn | 13812341234 |
| T002 | 李四 | 女 | 数据结构;算法分析 | 博士研究生 | lisi@university.edu.cn | 13912341234 |
|  | 王五 | 男 | 操作系统;计算机组成原理 | 硕士研究生 | wangwu@university.edu.cn | 13712341234 |

**对应的 JSON 数据**：
```json
[
  {
    "id": "T001",
    "name": "张三",
    "gender": "男",
    "courses": ["高等数学", "线性代数"],
    "degree": "博士研究生",
    "email": "zhangsan@university.edu.cn",
    "phone": "13812341234"
  },
  {
    "id": "T002",
    "name": "李四",
    "gender": "女",
    "courses": ["数据结构", "算法分析"],
    "degree": "博士研究生",
    "email": "lisi@university.edu.cn",
    "phone": "13912341234"
  },
  {
    "id": "",
    "name": "王五",
    "gender": "男",
    "courses": ["操作系统", "计算机组成原理"],
    "degree": "硕士研究生",
    "email": "wangwu@university.edu.cn",
    "phone": "13712341234"
  }
]
```

---

## 五、学期日历 API

### 5.1 提交学期日历设置

**接口**: `POST /api/base-data/calendar`

**描述**: 提交学期开始/结束日期及禁用日期列表

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 是 | 学期开始日期，格式 `YYYY-MM-DD` |
| endDate | string | 是 | 学期结束日期，格式 `YYYY-MM-DD` |
| disabledDates | object[] | 是 | 禁用日期列表 |
| disabledDates[].date | string | 是 | 禁用日期，格式 `YYYY-MM-DD` |
| disabledDates[].remark | string | 否 | 备注（如：国庆节、春节） |

**请求示例**:
```json
POST /api/base-data/calendar
{
  "startDate": "2026-09-01",
  "endDate": "2027-01-15",
  "disabledDates": [
    { "date": "2026-10-01", "remark": "国庆节" },
    { "date": "2026-10-02", "remark": "国庆节" },
    { "date": "2026-10-03", "remark": "国庆节" },
    { "date": "2026-12-31", "remark": "元旦放假" }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "calendarId": 1,
    "startDate": "2026-09-01",
    "endDate": "2027-01-15",
    "disabledCount": 4
  },
  "timestamp": 1713580800000
}
```

**错误响应（日期无效）**:
```json
{
  "code": 400,
  "message": "提交失败：结束日期不能早于开始日期",
  "timestamp": 1713580800000
}
```

---

### 5.2 获取学期日历设置

**接口**: `GET /api/base-data/calendar`

**描述**: 获取已有学期日历数据，用于页面初始化加载

**请求参数**: 无

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "calendarId": 1,
    "startDate": "2026-09-01",
    "endDate": "2027-01-15",
    "disabledDates": [
      { "date": "2026-10-01", "remark": "国庆节" },
      { "date": "2026-10-02", "remark": "国庆节" },
      { "date": "2026-10-03", "remark": "国庆节" },
      { "date": "2026-12-31", "remark": "元旦放假" }
    ]
  },
  "timestamp": 1713580800000
}
```

---

## 六、批量提交 API

### 5.1 提交所有基础数据

**接口**: `POST /api/base-data/submit`

**描述**: 提交所有基础数据（课程、课程设置、专业、教师）进行最终确认

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| courses | Course[] | 是 | 课程列表 |
| courseSettings | CourseSetting[] | 是 | 课程设置列表 |
| majors | Major[] | 是 | 专业列表 |
| teachers | Teacher[] | 是 | 教师列表 |

**请求示例**:
```json
POST /api/base-data/submit
{
  "courses": [
    {
      "dbId": "507f1f77bcf86cd799439011",
      "id": "C001",
      "name": "高等数学",
      "credits": 4,
      "type": "必修",
      "totalHours": 64
    }
  ],
  "courseSettings": [
    {
      "dbId": "507f1f77bcf86cd799439021",
      "name": "高等数学",
      "priority": 1,
      "prerequisites": [],
      "semester": "第 1 学期"
    }
  ],
  "majors": [
    {
      "dbId": "507f1f77bcf86cd799439031",
      "id": "M001",
      "name": "计算机科学与技术",
      "courses": ["高等数学", "数据结构"],
      "classSize": 45,
      "duration": 4
    }
  ],
  "teachers": [
    {
      "dbId": "507f1f77bcf86cd799439041",
      "id": "T001",
      "name": "张三",
      "gender": "男",
      "courses": ["高等数学"],
      "degree": "博士研究生"
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "submissionId": "SUB20260420001",
    "coursesCount": 46,
    "courseSettingsCount": 46,
    "majorsCount": 8,
    "teachersCount": 32,
    "submitTime": "2026-04-20T12:00:00Z",
    "status": "submitted"
  },
  "timestamp": 1713580800000
}
```

**错误响应（数据不完整）**:
```json
{
  "code": 400,
  "message": "提交失败：数据不完整",
  "data": {
    "missingSteps": [
      {
        "step": 0,
        "name": "课程录入",
        "message": "课程数据为空"
      },
      {
        "step": 3,
        "name": "教师录入",
        "message": "教师数据不足，至少需要 5 名教师"
      }
    ]
  },
  "timestamp": 1713580800000
}
```

---

## 六、数据结构定义

### ApiResponse（通用响应）

```typescript
interface ApiResponse<T = any> {
  code: number;          // HTTP 状态码：200/400/404/500
  message: string;       // 响应消息
  data?: T;              // 响应数据
  timestamp: number;     // 时间戳（毫秒）
}
```

### ListResponse（列表响应）

```typescript
interface ListResponse<T> {
  list: T[];             // 数据列表
  total: number;         // 总记录数
}
```

### Course（课程）

```typescript
interface Course {
  dbId: string;            // 数据库 ID
  id: string;              // 课程展示 ID（如 C001）
  name: string;            // 课程名称
  credits: number;         // 学分
  type: string;            // 课程类型：必修/选修/限选
  totalHours: number;      // 总课时
  createdAt?: string;      // 创建时间
  updatedAt?: string;      // 更新时间
}
```

### CourseSetting（课程设置）

```typescript
interface CourseSetting {
  dbId: string;            // 数据库 ID
  name: string;            // 课程名称
  priority: number;        // 优先级（数字越小优先级越高）
  prerequisites: string[]; // 先修课程列表
  semester: string;        // 开课学期
  createdAt?: string;      // 创建时间
  updatedAt?: string;      // 更新时间
}
```

### Major（专业）

```typescript
interface Major {
  dbId: string;            // 数据库 ID
  id: string;              // 专业展示 ID（如 M001）
  name: string;            // 专业名称
  courses: string[];       // 必修课程列表
  classSize: number;       // 班级人数
  duration: number;        // 学制（年）
  createdAt?: string;      // 创建时间
  updatedAt?: string;      // 更新时间
}
```

### Teacher（教师）

```typescript
interface Teacher {
  dbId: string;            // 数据库 ID
  id: string;              // 教师展示 ID（如 T001）
  name: string;            // 教师姓名
  gender: string;          // 性别
  courses: string[];       // 可授课程列表
  degree: string;          // 学历
  email?: string;          // 邮箱（可选）
  phone?: string;          // 电话（可选）
  createdAt?: string;      // 创建时间
  updatedAt?: string;      // 更新时间
}
```

### CalendarSubmitRequest（日历提交请求）

```typescript
interface CalendarSubmitRequest {
  startDate: string;          // 学期开始日期 YYYY-MM-DD
  endDate: string;            // 学期结束日期 YYYY-MM-DD
  disabledDates: Array<{      // 禁用日期列表
    date: string;             // 禁用日期 YYYY-MM-DD
    remark?: string;          // 备注（可选）
  }>;
}
```

### CalendarResponse（日历响应）

```typescript
interface CalendarResponse {
  calendarId: number;         // 日历 ID
  startDate: string;          // 学期开始日期
  endDate: string;            // 学期结束日期
  disabledDates: Array<{      // 禁用日期列表
    date: string;             // 禁用日期
    remark?: string;          // 备注
  }>;
}
```

### ImportResponse（导入响应）

```typescript
interface ImportResponse {
  total: number;         // 总记录数
  success: number;       // 成功数量
  failed: number;        // 失败数量
  createdRecords?: Array<{
    dbId: string;        // 数据库 ID
    id?: string;         // 展示 ID
    name: string;        // 名称
  }>;
  errors?: Array<{
    row: number;         // 行号
    message: string;     // 错误信息
    data?: object;       // 错误数据
  }>;
}
```

### SubmitRequest（提交请求）

```typescript
interface SubmitRequest {
  courses: Course[];           // 课程列表
  courseSettings: CourseSetting[]; // 课程设置列表
  majors: Major[];             // 专业列表
  teachers: Teacher[];         // 教师列表
}
```

### SubmitResponse（提交响应）

```typescript
interface SubmitResponse {
  submissionId: string;    // 提交 ID
  coursesCount: number;    // 课程数量
  courseSettingsCount: number; // 课程设置数量
  majorsCount: number;     // 专业数量
  teachersCount: number;   // 教师数量
  submitTime: string;      // 提交时间
  status: string;          // 状态：submitted/pending/approved/rejected
}
```

---

## 七、错误处理

### 常见错误类型

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 请检查请求参数是否正确 |
| 404 | 资源不存在 | 请检查数据库 ID 是否正确 |
| 500 | 服务器内部错误 | 请联系管理员 |

### 错误响应示例

```json
{
  "code": 400,
  "message": "导入失败：部分数据验证失败",
  "data": {
    "errors": [
      {
        "row": 5,
        "message": "学分必须为正数",
        "data": {
          "id": "C005",
          "name": "错误课程"
        }
      },
      {
        "row": 12,
        "message": "课程类型必须是必修、选修或限选",
        "data": {
          "id": "C012",
          "name": "类型错误课程"
        }
      }
    ]
  },
  "timestamp": 1713580800000
}
```

---

## 八、前端使用示例

### 获取列表数据（页面初始化）

```typescript
import { request } from '@umijs/max';
import { message } from 'antd';
import { useEffect, useState } from 'react';

interface Course {
  dbId: string;
  id: string;
  name: string;
  credits: number;
  type: string;
  totalHours: number;
}

function CourseList() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await request('/api/base-data/courses', {
          method: 'GET',
          params: { page: 1, pageSize: 10 },
        });
        
        if (result.code === 200) {
          setData(result.data?.list || []);
        } else {
          message.error(result.message);
        }
      } catch (error) {
        message.error('加载失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return loading ? '加载中...' : JSON.stringify(data);
}
```

### 创建课程

```typescript
import { request } from '@umijs/max';
import { message } from 'antd';

const handleCreate = async (formData: {
  id?: string;
  name: string;
  credits: number;
  type: string;
  totalHours: number;
}) => {
  const result = await request('/api/base-data/courses', {
    method: 'POST',
    data: formData,
  });
  
  if (result.code === 200) {
    message.success('课程创建成功');
    // result.data.dbId 是数据库 ID
    // result.data.id 是展示 ID
  } else {
    message.error(result.message);
  }
};
```

### 删除课程（使用数据库 ID）

```typescript
import { request } from '@umijs/max';
import { message } from 'antd';

interface Course {
  dbId: string;    // 数据库 ID
  id: string;      // 展示 ID
  name: string;
}

const handleDelete = async (selectedRows: Course[]) => {
  // 提取数据库 ID 数组
  const dbIds = selectedRows.map(row => row.dbId);
  
  const result = await request('/api/base-data/courses', {
    method: 'DELETE',
    data: { dbIds },
  });
  
  if (result.code === 200) {
    message.success(`删除成功，共删除 ${result.data?.deletedCount} 条记录`);
  } else {
    message.error(result.message);
  }
};
```

### 批量导入

```typescript
import { uploadFile } from '@/pages/base-data/services/request';
import { message } from 'antd';

const handleImport = async (file: File) => {
  const result = await uploadFile('/api/base-data/courses/import', file);
  
  if (result.code === 200) {
    message.success(result.message);
    // 检查是否有错误
    if (result.data?.errors?.length > 0) {
      showErrorModal(result.data.errors);
    }
  } else {
    message.error(result.message);
  }
};
```

### 下载模板

```typescript
import { downloadFile } from '@/pages/base-data/services/request';
import { message } from 'antd';

const handleDownloadTemplate = async () => {
  try {
    const blob = await downloadFile('/api/base-data/courses/import/template');
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

### 提交所有数据

```typescript
import { request } from '@umijs/max';
import { message } from 'antd';

const handleSubmit = async (data: {
  courses: Course[];
  courseSettings: CourseSetting[];
  majors: Major[];
  teachers: Teacher[];
}) => {
  const result = await request('/api/base-data/submit', {
    method: 'POST',
    data,
  });
  
  if (result.code === 200) {
    message.success(`提交成功！提交 ID: ${result.data?.submissionId}`);
  } else {
    // 显示详细错误
    if (result.data?.missingSteps) {
      showErrorModal(result.data.missingSteps);
    } else {
      message.error(result.message);
    }
  }
};
```

---

## 八、接口总表

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 课程 | GET | `/api/base-data/courses` | 获取课程列表 (页面初始化) |
| 课程 | POST | `/api/base-data/courses` | 创建课程 |
| 课程 | POST | `/api/base-data/courses/batch-delete` | 批量删除课程 (使用 dbIds) |
| 课程 | POST | `/api/base-data/courses/import` | 批量导入课程 |
| 课程 | GET | `/api/base-data/courses/import/template` | 下载课程模板 |
| 课程设置 | GET | `/api/base-data/course-settings` | 获取课程设置列表 (页面初始化) |
| 课程设置 | POST | `/api/base-data/course-settings` | 创建课程设置 |
| 课程设置 | POST | `/api/base-data/course-settings/batch-delete` | 批量删除课程设置 (使用 dbIds) |
| 课程设置 | POST | `/api/base-data/course-settings/import` | 批量导入课程设置 |
| 课程设置 | GET | `/api/base-data/course-settings/import/template` | 下载课程模板 |
| 专业 | GET | `/api/base-data/majors` | 获取专业列表 (页面初始化) |
| 专业 | POST | `/api/base-data/majors` | 创建专业 |
| 专业 | POST | `/api/base-data/majors/batch-delete` | 批量删除专业 (使用 dbIds) |
| 专业 | POST | `/api/base-data/majors/import` | 批量导入专业 |
| 专业 | GET | `/api/base-data/majors/import/template` | 下载专业模板 |
| 教师 | GET | `/api/base-data/teachers` | 获取教师列表 (页面初始化) |
| 教师 | POST | `/api/base-data/teachers` | 创建教师 |
| 教师 | POST | `/api/base-data/teachers/batch-delete` | 批量删除教师 (使用 dbIds) |
| 教师 | POST | `/api/base-data/teachers/import` | 批量导入教师 |
| 教师 | GET | `/api/base-data/teachers/import/template` | 下载教师模板 |
| 学期日历 | POST | `/api/base-data/calendar` | 提交学期日历设置 |
| 学期日历 | GET | `/api/base-data/calendar` | 获取学期日历设置 |
| 提交 | POST | `/api/base-data/submit` | 提交所有数据 |

**共计 23 个接口**

**设计说明**:
- 批量删除使用 `POST /xxx/batch-delete` 而非 `DELETE /xxx`，避免 DELETE 方法带 Body 的兼容性问题
- 所有删除操作统一使用 `dbIds` 数组作为请求参数

---

## 九、更新日志

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 2.6.0 | 2026-04-28 | 新增：学期日历 API（POST /api/base-data/calendar 提交日历设置，GET /api/base-data/calendar 获取日历数据），新增 CalendarSubmitRequest / CalendarResponse 类型定义 |
| 2.5.0 | 2026-04-21 | 优化：批量删除接口改为 POST /batch-delete，避免 DELETE 带 Body 的兼容性问题；完善 dbId 类型说明 |
| 2.4.0 | 2026-04-21 | 完善文档：添加数据库 ID 与展示 ID 映射说明，补充完整的请求/响应 JSON 示例 |
| 2.3.0 | 2026-04-21 | 新增：GET 列表接口（getCourses、getCourseSettings、getMajors、getTeachers），用于页面初始化加载数据 |
| 2.2.0 | 2026-04-20 | 更新响应格式：使用 code/message/timestamp 格式，与 drag-schedule-api 保持一致 |
| 2.1.0 | 2026-04-20 | 精简接口：移除 GET 列表、GET 详情、PUT 更新接口，仅保留前端实际使用的 API |
| 2.0.0 | 2026-04-20 | 新增：课程、课程设置、专业、教师的 CRUD 接口；新增批量提交接口 |
| 1.0.0 | 2026-04-10 | 初始版本，包含课程、课程设置、专业、教师的导入接口 |
