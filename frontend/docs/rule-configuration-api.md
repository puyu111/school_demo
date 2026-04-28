# 规则配置模块接口文档

## 概述

本文档描述规则配置模块（Rule Configuration Settings）的所有 API 接口。

### 基础信息

- **Base URL**: `/api`
- **认证方式**: 暂无（请求拦截器中预留了 token 添加位置）
- **响应格式**: 统一返回 JSON 格式

### 统一响应结构

```typescript
interface ResponseStructure<T> {
  success: boolean;        // 请求是否成功
  data: T;                 // 响应数据
  errorCode?: number;      // 错误码（可选）
  errorMessage?: string;   // 错误信息（可选）
  showType?: number;       // 错误展示方式（可选）
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 一、规则管理 API

### 1.1 获取规则列表

**接口**: `GET /api/rules`

**描述**: 获取分页的规则列表

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| current | number | 否 | 当前页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |

**请求示例**:
```
GET /api/rules?current=1&pageSize=10
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "key": "1",
      "ruleName": "英语教师周末不排课",
      "teachers": ["张三", "李四", "王老师"],
      "description": "英语教研组的教师周末不安排课程",
      "validDate": [1704067200000, 1735689600000]
    }
  ],
  "total": 7
}
```

---

### 1.2 创建规则

**接口**: `POST /api/rules`

**描述**: 创建新的规则

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ruleName | string | 是 | 规则名称 |
| teachers | string[] | 否 | 适用教师名单 |
| description | string | 是 | 规则描述 |
| validDate | [number, number] | 否 | 有效期 [开始时间戳，结束时间戳] |

**请求示例**:
```json
POST /api/rules
{
  "ruleName": "数学教师早课优先",
  "teachers": ["王老师", "李老师"],
  "description": "数学教师优先安排上午课程",
  "validDate": [1704067200000, 1735689600000]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "key": "8",
    "ruleName": "数学教师早课优先",
    "teachers": ["王老师", "李老师"],
    "description": "数学教师优先安排上午课程",
    "validDate": [1704067200000, 1735689600000]
  }
}
```

---

### 1.3 更新规则

**接口**: `PUT /api/rules/:key`

**描述**: 根据 key 更新规则

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| key | string | 规则唯一标识 |

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ruleName | string | 否 | 规则名称 |
| teachers | string[] | 否 | 适用教师名单 |
| description | string | 否 | 规则描述 |
| validDate | [number, number] | 否 | 有效期 |

**请求示例**:
```json
PUT /api/rules/1
{
  "ruleName": "英语教师周末不排课（修订版）",
  "description": "英语教研组教师周末原则上不排课"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "key": "1",
    "ruleName": "英语教师周末不排课（修订版）",
    "teachers": ["张三", "李四", "王老师"],
    "description": "英语教研组教师周末原则上不排课",
    "validDate": [1704067200000, 1735689600000]
  }
}
```

---

### 1.4 删除规则

**接口**: `DELETE /api/rules/:key`

**描述**: 根据 key 删除规则

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| key | string | 规则唯一标识 |

**响应示例**:
```json
{
  "success": true
}
```

---

## 二、教师管理 API

### 2.1 获取教师列表

**接口**: `GET /api/teachers`

**描述**: 获取所有教师信息

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "张三",
      "employeeId": "T001"
    },
    {
      "id": "2",
      "name": "李四",
      "employeeId": "T002"
    }
  ]
}
```

---

## 三、教师不可用日期 API

### 3.1 获取不可用日期列表

**接口**: `GET /api/unavailable-dates`

**描述**: 获取教师不可用日期列表，支持筛选

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teacherId | string | 否 | 按教师 ID 筛选 |
| type | string | 否 | 按类型筛选 (personal/holiday/other) |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "key": "1",
      "teacherId": "1",
      "teacherName": "张三",
      "validDate": [1705276800000, 1705363200000],
      "reason": "个人事务",
      "type": "personal",
      "rangeType": "single"
    }
  ]
}
```

---

### 3.2 添加不可用日期

**接口**: `POST /api/unavailable-dates`

**描述**: 添加单个不可用日期

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teacherId | string | 是 | 教师 ID |
| teacherName | string | 是 | 教师姓名 |
| validDate | [number, number] | 是 | 日期范围 [开始时间戳，结束时间戳] |
| reason | string | 是 | 原因说明 |
| type | string | 是 | 类型：personal（个人）/holiday（假期）/other（其他） |
| rangeType | string | 否 | 范围类型：single/week/month/quarter/range |

**请求示例**:
```json
POST /api/unavailable-dates
{
  "teacherId": "1",
  "teacherName": "张三",
  "validDate": [1705276800000, 1705363200000],
  "reason": "参加培训",
  "type": "other",
  "rangeType": "single"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "key": "5",
    "teacherId": "1",
    "teacherName": "张三",
    "validDate": [1705276800000, 1705363200000],
    "reason": "参加培训",
    "type": "other",
    "rangeType": "single"
  }
}
```

---

### 3.3 批量添加不可用日期

**接口**: `POST /api/unavailable-dates/batch`

**描述**: 批量添加不可用日期

**请求体**: 不可用日期数组

**请求示例**:
```json
POST /api/unavailable-dates/batch
[
  {
    "teacherId": "1",
    "teacherName": "张三",
    "validDate": [1705276800000, 1705363200000],
    "reason": "培训",
    "type": "other"
  },
  {
    "teacherId": "1",
    "teacherName": "张三",
    "validDate": [1705708800000, 1706140800000],
    "reason": "会议",
    "type": "other"
  }
]
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "key": "6",
      "teacherId": "1",
      "teacherName": "张三",
      "validDate": [1705276800000, 1705363200000],
      "reason": "培训",
      "type": "other"
    },
    {
      "key": "7",
      "teacherId": "1",
      "teacherName": "张三",
      "validDate": [1705708800000, 1706140800000],
      "reason": "会议",
      "type": "other"
    }
  ]
}
```

---

### 3.4 删除不可用日期

**接口**: `DELETE /api/unavailable-dates/:key`

**描述**: 根据 key 删除单个不可用日期

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| key | string | 不可用日期唯一标识 |

**响应示例**:
```json
{
  "success": true
}
```

---

### 3.5 批量删除不可用日期

**接口**: `POST /api/unavailable-dates/batch-delete`

**描述**: 批量删除不可用日期

**请求体**:

| 字段 | 类型 | 说明 |
|------|------|------|
| keys | string[] | 要删除的日期 ID 数组 |

**请求示例**:
```json
POST /api/unavailable-dates/batch-delete
{
  "keys": ["1", "2", "3"]
}
```

**响应示例**:
```json
{
  "success": true
}
```

---

## 四、规则权重管理 API

### 4.1 获取规则权重列表

**接口**: `GET /api/rule-weights`

**描述**: 获取所有规则权重配置

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "教师时间偏好",
      "category": "teacher",
      "currentWeight": 8,
      "defaultWeight": 8,
      "minWeight": 1,
      "maxWeight": 10,
      "enabled": true,
      "description": "尊重教师的时间偏好"
    }
  ]
}
```

---

### 4.2 更新规则权重

**接口**: `PUT /api/rule-weights/:id`

**描述**: 更新单个规则的权重值

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 权重配置 ID |

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| currentWeight | number | 是 | 新的权重值 |

**请求示例**:
```json
PUT /api/rule-weights/1
{
  "currentWeight": 9
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "教师时间偏好",
    "category": "teacher",
    "currentWeight": 9,
    "defaultWeight": 8,
    "minWeight": 1,
    "maxWeight": 10,
    "enabled": true,
    "description": "尊重教师的时间偏好"
  }
}
```

---

### 4.3 批量更新规则权重

**接口**: `POST /api/rule-weights/batch`

**描述**: 批量更新多个规则权重

**请求体**: 权重更新数组

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 权重配置 ID |
| currentWeight | number | 新的权重值 |

**请求示例**:
```json
POST /api/rule-weights/batch
[
  {
    "id": "1",
    "currentWeight": 9
  },
  {
    "id": "2",
    "currentWeight": 6
  }
]
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "教师时间偏好",
      "currentWeight": 9,
      ...
    },
    {
      "id": "2",
      "name": "课程连续性",
      "currentWeight": 6,
      ...
    }
  ]
}
```

---

### 4.4 获取权重变更历史

**接口**: `GET /api/rule-weights/history`

**描述**: 获取权重变更历史记录（支持分页）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ruleId | string | 否 | 按规则 ID 筛选 |
| current | number | 否 | 当前页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1001",
      "ruleId": "1",
      "ruleName": "教师时间偏好",
      "oldValue": 8,
      "newValue": 9,
      "time": "14:30:25"
    }
  ],
  "total": 15
}
```

---

### 4.5 重置规则权重

**接口**: `POST /api/rule-weights/reset`

**描述**: 将所有规则权重重置为默认值

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "已重置为默认权重"
}
```

---

## 五、数据结构定义

### RuleData (规则数据)

```typescript
interface RuleData {
  key: string;              // 唯一标识
  ruleName: string;         // 规则名称
  teachers?: string[];      // 适用教师名单（可选）
  description: string;      // 规则描述
  validDate?: [number, number]; // 有效期 [开始时间戳，结束时间戳]
}
```

### Teacher (教师信息)

```typescript
interface Teacher {
  id: string;               // 教师 ID
  name: string;             // 教师姓名
  employeeId: string;       // 工号
}
```

### UnavailableDate (不可用日期)

```typescript
interface UnavailableDate {
  key: string;                    // 唯一标识
  teacherId: string;              // 教师 ID
  teacherName: string;            // 教师姓名
  validDate?: [number, number];   // 日期范围
  reason: string;                 // 原因
  type: 'personal' | 'holiday' | 'other';  // 类型
  rangeType?: 'single' | 'week' | 'month' | 'quarter' | 'range'; // 范围类型
}
```

### RuleWeight (规则权重)

```typescript
interface RuleWeight {
  id: string;             // 权重配置 ID
  name: string;           // 规则名称
  category: string;       // 分类
  currentWeight: number;  // 当前权重值
  defaultWeight: number;  // 默认权重值
  minWeight: number;      // 最小权重
  maxWeight: number;      // 最大权重
  enabled: boolean;       // 是否启用
  description?: string;   // 描述
}
```

### WeightChangeRecord (权重变更记录)

```typescript
interface WeightChangeRecord {
  id: string;             // 记录 ID
  ruleId: string;         // 规则 ID
  ruleName: string;       // 规则名称
  oldValue: number;       // 原权重值
  newValue: number;       // 新权重值
  time: string;           // 变更时间
}
```
