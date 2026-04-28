# 规则配置模块 - 后端接口定义文档

## 文档说明

本文档供后端开发人员参考，定义前后端接口契约。

---

## 接口概览

| 模块 | 接口 | 方法 | 路径 |
|------|------|------|------|
| 规则管理 | 获取列表 | GET | /api/rules |
| 规则管理 | 创建规则 | POST | /api/rules |
| 规则管理 | 更新规则 | PUT | /api/rules/:key |
| 规则管理 | 删除规则 | DELETE | /api/rules/:key |
| 教师管理 | 获取列表 | GET | /api/teachers |
| 不可用日期 | 获取列表 | GET | /api/unavailable-dates |
| 不可用日期 | 添加日期 | POST | /api/unavailable-dates |
| 不可用日期 | 批量添加 | POST | /api/unavailable-dates/batch |
| 不可用日期 | 删除日期 | DELETE | /api/unavailable-dates/:key |
| 不可用日期 | 批量删除 | POST | /api/unavailable-dates/batch-delete |
| 权重管理 | 获取权重 | GET | /api/rule-weights |
| 权重管理 | 更新权重 | PUT | /api/rule-weights/:id |
| 权重管理 | 批量更新 | POST | /api/rule-weights/batch |
| 权重管理 | 变更记录 | GET | /api/rule-weights/history |
| 权重管理 | 重置权重 | POST | /api/rule-weights/reset |

---

## 详细接口定义

### 1. 规则管理

#### 1.1 获取规则列表
```
GET /api/rules?current=1&pageSize=10
```

**Query Parameters:**
- `current` (number, optional): 当前页码，默认 1
- `pageSize` (number, optional): 每页数量，默认 10

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "1",
      "ruleName": "英语教师周末不排课",
      "teachers": ["张三", "李四"],
      "description": "英语教研组的教师周末不安排课程",
      "validDate": [1704067200000, 1735689600000]
    }
  ],
  "total": 7
}
```

---

#### 1.2 创建规则
```
POST /api/rules
```

**Request Body:**
```json
{
  "ruleName": "规则名称",
  "teachers": ["教师 1", "教师 2"],  // 可选
  "description": "规则描述",
  "validDate": [1704067200000, 1735689600000]  // 可选，毫秒时间戳
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "生成的唯一 ID",
    "ruleName": "规则名称",
    "teachers": ["教师 1", "教师 2"],
    "description": "规则描述",
    "validDate": [1704067200000, 1735689600000]
  }
}
```

---

#### 1.3 更新规则
```
PUT /api/rules/:key
```

**Path Parameters:**
- `key`: 规则唯一标识

**Request Body:**
```json
{
  "ruleName": "新规则名称",  // 可选
  "teachers": ["新教师列表"],  // 可选
  "description": "新描述",  // 可选
  "validDate": [1704067200000, 1735689600000]  // 可选
}
```

---

#### 1.4 删除规则
```
DELETE /api/rules/:key
```

**Response:**
```json
{ "success": true }
```

---

### 2. 教师管理

#### 2.1 获取教师列表
```
GET /api/teachers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "张三",
      "employeeId": "T001"
    }
  ]
}
```

---

### 3. 不可用日期管理

#### 3.1 获取不可用日期列表
```
GET /api/unavailable-dates?teacherId=1&type=personal
```

**Query Parameters:**
- `teacherId` (string, optional): 按教师 ID 筛选
- `type` (string, optional): 按类型筛选 (personal/holiday/other)

**Response:**
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

#### 3.2 添加不可用日期
```
POST /api/unavailable-dates
```

**Request Body:**
```json
{
  "teacherId": "1",
  "teacherName": "张三",
  "validDate": [1705276800000, 1705363200000],
  "reason": "个人事务",
  "type": "personal",
  "rangeType": "single"
}
```

**字段说明:**
- `type`: `personal` | `holiday` | `other`
- `rangeType`: `single` | `week` | `month` | `quarter` | `range`

---

#### 3.3 批量添加不可用日期
```
POST /api/unavailable-dates/batch
```

**Request Body:**
```json
[
  {
    "teacherId": "1",
    "teacherName": "张三",
    "validDate": [1705276800000, 1705363200000],
    "reason": "培训",
    "type": "other"
  }
]
```

---

#### 3.4 删除不可用日期
```
DELETE /api/unavailable-dates/:key
```

---

#### 3.5 批量删除不可用日期
```
POST /api/unavailable-dates/batch-delete
```

**Request Body:**
```json
{
  "keys": ["1", "2", "3"]
}
```

---

### 4. 规则权重管理

#### 4.1 获取权重列表
```
GET /api/rule-weights
```

**Response:**
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

#### 4.2 更新权重
```
PUT /api/rule-weights/:id
```

**Request Body:**
```json
{
  "currentWeight": 9
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "教师时间偏好",
    "currentWeight": 9,
    "defaultWeight": 8,
    "minWeight": 1,
    "maxWeight": 10,
    "enabled": true
  }
}
```

---

#### 4.3 批量更新权重
```
POST /api/rule-weights/batch
```

**Request Body:**
```json
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

---

#### 4.4 获取权重变更历史
```
GET /api/rule-weights/history?ruleId=1&current=1&pageSize=10
```

**Query Parameters:**
- `ruleId` (string, optional): 按规则 ID 筛选
- `current` (number, optional): 当前页码
- `pageSize` (number, optional): 每页数量

**Response:**
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

#### 4.5 重置权重
```
POST /api/rule-weights/reset
```

**Response:**
```json
{
  "success": true,
  "message": "已重置为默认权重"
}
```

---

## 数据模型

### Rule (规则)
```typescript
{
  key: string;              // 主键
  ruleName: string;         // 规则名称
  teachers: string[];       // 关联教师名称列表
  description: string;      // 描述
  validDate: [number, number]; // 有效期 [开始，结束] (毫秒时间戳)
}
```

### Teacher (教师)
```typescript
{
  id: string;               // 主键
  name: string;             // 姓名
  employeeId: string;       // 工号
}
```

### UnavailableDate (不可用日期)
```typescript
{
  key: string;                    // 主键
  teacherId: string;              // 教师 ID (外键)
  teacherName: string;            // 教师姓名
  validDate: [number, number];    // 日期范围
  reason: string;                 // 原因
  type: 'personal' | 'holiday' | 'other';
  rangeType: 'single' | 'week' | 'month' | 'quarter' | 'range';
}
```

### RuleWeight (规则权重)
```typescript
{
  id: string;               // 主键
  name: string;             // 规则名称
  category: string;         // 分类
  currentWeight: number;    // 当前权重 (1-10)
  defaultWeight: number;    // 默认权重
  minWeight: number;        // 最小值
  maxWeight: number;        // 最大值
  enabled: boolean;         // 是否启用
  description?: string;     // 描述
}
```

### WeightChangeRecord (权重变更记录)
```typescript
{
  id: string;               // 主键
  ruleId: string;           // 规则 ID
  ruleName: string;         // 规则名称
  oldValue: number;         // 原权重
  newValue: number;         // 新权重
  time: string;             // 变更时间
}
```

---

## 后端实现注意事项

### 1. 数据库表设计建议

**rules 表**
```sql
CREATE TABLE rules (
  key VARCHAR(50) PRIMARY KEY,
  rule_name VARCHAR(255) NOT NULL,
  description TEXT,
  valid_date_start BIGINT,
  valid_date_end BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rule_teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_key VARCHAR(50),
  teacher_name VARCHAR(100),
  FOREIGN KEY (rule_key) REFERENCES rules(key)
);
```

**teachers 表**
```sql
CREATE TABLE teachers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(50) UNIQUE
);
```

**unavailable_dates 表**
```sql
CREATE TABLE unavailable_dates (
  key VARCHAR(50) PRIMARY KEY,
  teacher_id VARCHAR(50) NOT NULL,
  teacher_name VARCHAR(100),
  valid_date_start BIGINT,
  valid_date_end BIGINT,
  reason VARCHAR(255),
  type ENUM('personal', 'holiday', 'other'),
  range_type ENUM('single', 'week', 'month', 'quarter', 'range'),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
```

**rule_weights 表**
```sql
CREATE TABLE rule_weights (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  current_weight INT NOT NULL,
  default_weight INT NOT NULL,
  min_weight INT DEFAULT 1,
  max_weight INT DEFAULT 10,
  enabled BOOLEAN DEFAULT TRUE,
  description TEXT
);
```

**weight_change_history 表**
```sql
CREATE TABLE weight_change_history (
  id VARCHAR(50) PRIMARY KEY,
  rule_id VARCHAR(50) NOT NULL,
  rule_name VARCHAR(255),
  old_value INT,
  new_value INT,
  change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES rule_weights(id)
);
```

### 2. 业务逻辑建议

1. **权重变更时自动记录历史**: 每次更新权重时，需要在 `weight_change_history` 表中插入记录

2. **删除规则时的级联处理**: 删除规则时，建议软删除或检查是否有关联数据

3. **时间戳处理**: `validDate` 使用毫秒时间戳 (JavaScript `Date.now()` 格式)

4. **分页**: 所有列表接口建议支持分页，返回 `{ data, total }` 格式

### 3. 响应格式统一

```json
{
  "success": true,
  "data": { ... },
  "errorCode": 200,
  "errorMessage": ""
}
```
