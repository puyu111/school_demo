# 调课申请审核模块接口文档 (course-adjustment-review)

## 概述

本文档描述调课申请审核模块（course-adjustment-review）的所有 API 接口。该模块用于管理教师的调课申请，支持申请的提交、审核、批量处理等功能。

### 基础信息

- **Base URL**: `/api/course-adjustment`
- **认证方式**: 暂无（请求拦截器中预留了 token 添加位置）
- **响应格式**: 统一返回 JSON 格式

### 统一响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;        // 请求是否成功
  data?: T;                // 实际数据
  message?: string;        // 响应消息
  errorCode?: string;      // 错误码
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如时间冲突） |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

---

## 一、申请管理接口

### 1.1 获取调课申请列表

**接口**: `GET /api/course-adjustment/applications`

**描述**: 获取调课申请列表，支持分页和条件筛选

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 10） |
| status | string | 否 | 状态筛选：all/pending/approved/rejected |
| urgency | string | 否 | 紧急程度：all/high/normal |
| department | string | 否 | 院系筛选 |
| keyword | string | 否 | 关键词搜索（教师姓名或课程名） |

**请求示例**:
```
GET /api/course-adjustment/applications?page=1&pageSize=10&status=pending&urgency=high
```

**响应数据字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| list | Application[] | 申请列表 |
| total | number | 总记录数 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "key": "1",
        "id": "T2026001",
        "teacherId": "T001",
        "teacherName": "张三",
        "department": "数学系",
        "originalCourse": "高等数学 周一 1-2 节 A101",
        "targetCourse": "周三 3-4 节 B203",
        "reason": "参加学术会议",
        "applyTime": "2026-10-26 09:30",
        "status": "pending",
        "urgency": "high",
        "reviewComment": "",
        "reviewerId": "",
        "reviewerName": "",
        "reviewTime": ""
      },
      {
        "key": "2",
        "id": "T2026002",
        "teacherId": "T002",
        "teacherName": "李四",
        "department": "物理系",
        "originalCourse": "大学物理 周二 3-4 节 C305",
        "targetCourse": "周四 1-2 节 D401",
        "reason": "身体不适，需要去医院",
        "applyTime": "2026-10-25 14:20",
        "status": "approved",
        "urgency": "normal",
        "reviewComment": "同意，请提前通知学生",
        "reviewerId": "admin",
        "reviewerName": "管理员",
        "reviewTime": "2026-10-25 16:00"
      },
      {
        "key": "3",
        "id": "T2026003",
        "teacherId": "T003",
        "teacherName": "王五",
        "department": "计算机系",
        "originalCourse": "程序设计 周三 5-6 节 E502",
        "targetCourse": "周五 7-8 节 F608",
        "reason": "出差参加技术会议",
        "applyTime": "2026-10-24 10:15",
        "status": "rejected",
        "urgency": "high",
        "reviewComment": "目标时间段教室已被占用，请重新选择",
        "reviewerId": "admin",
        "reviewerName": "管理员",
        "reviewTime": "2026-10-24 15:30"
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

---

### 1.2 获取单个申请详情

**接口**: `GET /api/course-adjustment/applications/:applicationId`

**描述**: 获取单个调课申请的详细信息

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| applicationId | string | 申请 ID |

**请求示例**:
```
GET /api/course-adjustment/applications/T2026001
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "key": "1",
    "id": "T2026001",
    "teacherId": "T001",
    "teacherName": "张三",
    "department": "数学系",
    "originalCourse": "高等数学 周一 1-2 节 A101",
    "targetCourse": "周三 3-4 节 B203",
    "originalCourseDetail": {
      "courseId": "C001",
      "courseName": "高等数学",
      "weekDay": 1,
      "slot": 1,
      "duration": 2,
      "roomName": "教学楼 A-101",
      "roomId": "R001",
      "className": "计算机 21 级 1 班",
      "classId": "C2101",
      "studentCount": 45
    },
    "targetCourseDetail": {
      "courseId": "C001",
      "courseName": "高等数学",
      "weekDay": 3,
      "slot": 3,
      "duration": 2,
      "roomName": "教学楼 B-203",
      "roomId": "R002",
      "className": "计算机 21 级 1 班",
      "classId": "C2101",
      "studentCount": 45
    },
    "reason": "参加学术会议",
    "applyTime": "2026-10-26 09:30",
    "status": "pending",
    "urgency": "high",
    "reviewComment": "",
    "reviewerId": "",
    "reviewerName": "",
    "reviewTime": "",
    "attachments": [
      {
        "name": "会议通知.pdf",
        "url": "/files/meeting-notice.pdf",
        "size": 102400
      }
    ],
    "createdAt": "2026-10-26T09:30:00Z",
    "updatedAt": "2026-10-26T09:30:00Z"
  },
  "message": "success"
}
```

---

### 1.3 提交调课申请

**接口**: `POST /api/course-adjustment/applications`

**描述**: 教师提交调课申请

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teacherId | string | 是 | 教师 ID |
| teacherName | string | 是 | 教师姓名 |
| department | string | 是 | 所在院系 |
| originalCourseId | string | 是 | 原课程 ID |
| originalCourse | string | 是 | 原课程信息 |
| targetCourse | string | 是 | 调整后课程信息 |
| targetWeekDay | number | 是 | 目标星期（1-7） |
| targetSlot | number | 是 | 目标节次 |
| reason | string | 是 | 调课原因 |
| urgency | string | 是 | 紧急程度：high/normal |
| attachments | array | 否 | 附件列表（可选） |

**请求示例**:
```json
POST /api/course-adjustment/applications
{
  "teacherId": "T001",
  "teacherName": "张三",
  "department": "数学系",
  "originalCourseId": "C001",
  "originalCourse": "高等数学 周一 1-2 节 A101",
  "targetCourse": "高等数学 周三 3-4 节 B203",
  "targetWeekDay": 3,
  "targetSlot": 3,
  "reason": "参加学术会议，需要请假两天",
  "urgency": "high",
  "attachments": [
    {
      "name": "会议通知.pdf",
      "url": "/files/meeting-notice.pdf",
      "size": 102400
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "T2026004",
    "teacherId": "T001",
    "teacherName": "张三",
    "status": "pending",
    "applyTime": "2026-10-27T10:30:00Z"
  },
  "message": "申请提交成功"
}
```

---

### 1.4 审核申请（通过/驳回）

**接口**: `POST /api/course-adjustment/applications/review`

**描述**: 审核调课申请，可以选择通过或驳回

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| applicationId | string | 是 | 申请 ID |
| status | string | 是 | 审核结果：approved/rejected |
| reviewComment | string | 是 | 审核意见（驳回时必填） |
| reviewerId | string | 是 | 审核人 ID |
| reviewerName | string | 是 | 审核人姓名 |

**请求示例**:
```json
POST /api/course-adjustment/applications/review
{
  "applicationId": "T2026001",
  "status": "approved",
  "reviewComment": "同意，请提前通知学生",
  "reviewerId": "admin",
  "reviewerName": "管理员"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "T2026001",
    "status": "approved",
    "reviewComment": "同意，请提前通知学生",
    "reviewerId": "admin",
    "reviewerName": "管理员",
    "reviewTime": "2026-10-27T11:00:00Z"
  },
  "message": "审核成功"
}
```

**驳回示例**:
```json
POST /api/course-adjustment/applications/review
{
  "applicationId": "T2026001",
  "status": "rejected",
  "reviewComment": "目标时间段教室已被其他课程占用，请重新选择时间",
  "reviewerId": "admin",
  "reviewerName": "管理员"
}
```

**驳回响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "T2026001",
    "status": "rejected",
    "reviewComment": "目标时间段教室已被其他课程占用，请重新选择时间",
    "reviewerId": "admin",
    "reviewerName": "管理员",
    "reviewTime": "2026-10-27T11:00:00Z"
  },
  "message": "已驳回申请"
}
```

---

### 1.5 批量审核申请

**接口**: `POST /api/course-adjustment/applications/batch-review`

**描述**: 批量审核多个调课申请

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| applicationIds | string[] | 是 | 申请 ID 数组 |
| status | string | 是 | 审核结果：approved/rejected |
| reviewComment | string | 否 | 统一审核意见（可选） |

**请求示例**:
```json
POST /api/course-adjustment/applications/batch-review
{
  "applicationIds": ["T2026001", "T2026002", "T2026003"],
  "status": "approved",
  "reviewComment": "批量审核通过"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "successCount": 3,
    "failedIds": [],
    "details": [
      {
        "applicationId": "T2026001",
        "status": "approved",
        "message": "审核成功"
      },
      {
        "applicationId": "T2026002",
        "status": "approved",
        "message": "审核成功"
      },
      {
        "applicationId": "T2026003",
        "status": "approved",
        "message": "审核成功"
      }
    ]
  },
  "message": "批量审核完成，成功 3 条，失败 0 条"
}
```

**部分失败示例**:
```json
{
  "success": true,
  "data": {
    "successCount": 2,
    "failedIds": ["T2026003"],
    "details": [
      {
        "applicationId": "T2026001",
        "status": "approved",
        "message": "审核成功"
      },
      {
        "applicationId": "T2026002",
        "status": "approved",
        "message": "审核成功"
      },
      {
        "applicationId": "T2026003",
        "status": "failed",
        "message": "申请状态已变更，无法审核"
      }
    ]
  },
  "message": "批量审核完成，成功 2 条，失败 1 条"
}
```

---

### 1.6 撤销申请

**接口**: `POST /api/course-adjustment/applications/:applicationId/revoke`

**描述**: 申请人撤销已提交的申请（仅限待审核状态）

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| applicationId | string | 申请 ID |

**请求示例**:
```
POST /api/course-adjustment/applications/T2026001/revoke
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "T2026001",
    "status": "revoked",
    "revokeTime": "2026-10-27T12:00:00Z"
  },
  "message": "申请已撤销"
}
```

**错误响应（已审核的申请无法撤销）**:
```json
{
  "success": false,
  "message": "该申请已审核，无法撤销",
  "errorCode": "409"
}
```

---

### 1.7 删除申请记录

**接口**: `DELETE /api/course-adjustment/applications/:applicationId`

**描述**: 删除调课申请记录（仅管理员权限）

**路径参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| applicationId | string | 申请 ID |

**请求示例**:
```
DELETE /api/course-adjustment/applications/T2026001
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "deletedId": "T2026001",
    "teacherName": "张三",
    "deleteTime": "2026-10-27T12:30:00Z"
  },
  "message": "删除成功"
}
```

---

## 二、统计接口

### 2.1 获取申请统计数据

**接口**: `GET /api/course-adjustment/stats`

**描述**: 获取调课申请的统计数据

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 120,
    "pending": 15,
    "approved": 95,
    "rejected": 8,
    "revoked": 2,
    "highUrgency": 25,
    "normalUrgency": 95,
    "thisWeekCount": 8,
    "thisMonthCount": 45
  },
  "message": "success"
}
```

**字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| total | number | 总申请数 |
| pending | number | 待审核数 |
| approved | number | 已通过数 |
| rejected | number | 已驳回数 |
| revoked | number | 已撤销数 |
| highUrgency | number | 紧急申请数 |
| normalUrgency | number | 一般申请数 |
| thisWeekCount | number | 本周申请数 |
| thisMonthCount | number | 本月申请数 |

---

### 2.2 获取各院系申请数量统计

**接口**: `GET /api/course-adjustment/stats/departments`

**描述**: 获取各院系的申请数量统计

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "department": "数学系",
      "total": 25,
      "pending": 3,
      "approved": 20,
      "rejected": 2
    },
    {
      "department": "物理系",
      "total": 18,
      "pending": 2,
      "approved": 15,
      "rejected": 1
    },
    {
      "department": "计算机系",
      "total": 30,
      "pending": 5,
      "approved": 23,
      "rejected": 2
    },
    {
      "department": "英语系",
      "total": 15,
      "pending": 1,
      "approved": 13,
      "rejected": 1
    },
    {
      "department": "化学系",
      "total": 20,
      "pending": 2,
      "approved": 17,
      "rejected": 1
    }
  ],
  "message": "success"
}
```

---

### 2.3 获取审核历史记录

**接口**: `GET /api/course-adjustment/history`

**描述**: 获取申请的审核历史记录

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| applicationId | string | 是 | 申请 ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**请求示例**:
```
GET /api/course-adjustment/history?applicationId=T2026001&page=1&pageSize=10
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "HIS001",
        "applicationId": "T2026001",
        "action": "submit",
        "actionName": "提交申请",
        "operatorId": "T001",
        "operatorName": "张三",
        "operatorType": "teacher",
        "comment": "",
        "timestamp": "2026-10-26T09:30:00Z"
      },
      {
        "id": "HIS002",
        "applicationId": "T2026001",
        "action": "review",
        "actionName": "审核通过",
        "operatorId": "admin",
        "operatorName": "管理员",
        "operatorType": "admin",
        "comment": "同意，请提前通知学生",
        "timestamp": "2026-10-27T11:00:00Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

---

## 三、数据结构定义

### CourseAdjustmentRecord（调课申请记录）

```typescript
interface CourseAdjustmentRecord {
  key: string;              // 表格行 key（前端使用）
  id: string;               // 申请唯一标识
  teacherId: string;        // 教师 ID
  teacherName: string;      // 教师姓名
  department: string;       // 所在院系
  originalCourse: string;   // 原课程信息（简短描述）
  targetCourse: string;     // 调整后课程信息（简短描述）
  originalCourseDetail?: {  // 原课程详细信息（可选）
    courseId: string;
    courseName: string;
    weekDay: number;
    slot: number;
    duration: number;
    roomName: string;
    roomId: string;
    className: string;
    classId: string;
    studentCount: number;
  };
  targetCourseDetail?: {    // 目标课程详细信息（可选）
    courseId: string;
    courseName: string;
    weekDay: number;
    slot: number;
    duration: number;
    roomName: string;
    roomId: string;
    className: string;
    classId: string;
    studentCount: number;
  };
  reason: string;           // 调课原因
  applyTime: string;        // 申请时间
  status: ApplicationStatus; // 审核状态
  urgency: UrgencyLevel;    // 紧急程度
  reviewComment?: string;   // 审核意见
  reviewerId?: string;      // 审核人 ID
  reviewerName?: string;    // 审核人姓名
  reviewTime?: string;      // 审核时间
  attachments?: Attachment[]; // 附件列表
  createdAt?: string;       // 创建时间
  updatedAt?: string;       // 更新时间
}
```

### ApplicationStatus（申请状态枚举）

```typescript
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
```

| 状态值 | 说明 |
|--------|------|
| pending | 待审核 |
| approved | 已通过 |
| rejected | 已驳回 |
| revoked | 已撤销 |

### UrgencyLevel（紧急程度枚举）

```typescript
type UrgencyLevel = 'high' | 'normal';
```

| 值 | 说明 |
|------|------|
| high | 紧急 |
| normal | 一般 |

### Attachment（附件）

```typescript
interface Attachment {
  name: string;    // 文件名
  url: string;     // 文件 URL
  size: number;    // 文件大小（字节）
  type?: string;   // 文件类型（如 application/pdf）
}
```

### ReviewRequest（审核请求）

```typescript
interface ReviewRequest {
  applicationId: string;   // 申请 ID
  status: 'approved' | 'rejected'; // 审核结果
  reviewComment: string;   // 审核意见
  reviewerId: string;      // 审核人 ID
  reviewerName: string;    // 审核人姓名
}
```

### BatchReviewRequest（批量审核请求）

```typescript
interface BatchReviewRequest {
  applicationIds: string[];  // 申请 ID 数组
  status: 'approved' | 'rejected'; // 审核结果
  reviewComment?: string;    // 统一审核意见
}
```

### ApplicationStats（统计数据）

```typescript
interface ApplicationStats {
  total: number;         // 总申请数
  pending: number;       // 待审核数
  approved: number;      // 已通过数
  rejected: number;      // 已驳回数
  revoked: number;       // 已撤销数
  highUrgency: number;   // 紧急申请数
  normalUrgency: number; // 一般申请数
  thisWeekCount: number; // 本周申请数
  thisMonthCount: number; // 本月申请数
}
```

### DepartmentStat（院系统计）

```typescript
interface DepartmentStat {
  department: string;    // 院系名称
  total: number;         // 总申请数
  pending: number;       // 待审核数
  approved: number;      // 已通过数
  rejected: number;      // 已驳回数
}
```

### HistoryRecord（历史记录）

```typescript
interface HistoryRecord {
  id: string;            // 记录 ID
  applicationId: string; // 申请 ID
  action: string;        // 操作类型（submit/review/revoke）
  actionName: string;    // 操作名称
  operatorId: string;    // 操作人 ID
  operatorName: string;  // 操作人姓名
  operatorType: string;  // 操作人类型（teacher/admin）
  comment?: string;      // 备注/意见
  timestamp: string;     // 操作时间
}
```

---

## 四、前端使用示例

### 使用 useRequest Hook

```typescript
import { useRequest } from '@umijs/max';
import * as adjustmentApi from '@/pages/course-adjustment-review/services';

function ApplicationList() {
  const { data, loading, refresh } = useRequest(
    () => adjustmentApi.getApplications({ page: 1, pageSize: 10 }),
    {
      formatResult: (res) => res.data,
      onError: (err) => message.error('加载申请列表失败'),
    },
  );

  return (
    <div>
      {loading ? '加载中...' : JSON.stringify(data)}
    </div>
  );
}
```

### 使用封装的 Hook

```typescript
import { useApplicationData } from '@/pages/course-adjustment-review/hooks/useApplicationData';

function CourseAdjustmentReview() {
  const {
    data,
    loading,
    filters,
    selectedRowKeys,
    handleViewDetail,
    handleReview,
    handleBatchAction,
    refreshData,
  } = useApplicationData();

  return (
    <div>
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onBatchAction={handleBatchAction}
        selectedCount={selectedRowKeys.length}
      />
      <ApplicationTable
        data={data}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onViewDetail={handleViewDetail}
        onReview={handleReview}
        loading={loading}
      />
    </div>
  );
}
```

### 调用 API 示例

```typescript
import { 
  getApplications,
  reviewApplication,
  batchReviewApplications,
  getApplicationStats,
} from '@/pages/course-adjustment-review/services';

// 获取申请列表
const listRes = await getApplications({
  page: 1,
  pageSize: 10,
  status: 'pending',
  urgency: 'high'
});
if (listRes.success) {
  console.log('申请列表:', listRes.data?.list);
}

// 审核单个申请
const reviewRes = await reviewApplication({
  applicationId: 'T2026001',
  status: 'approved',
  reviewComment: '同意',
  reviewerId: 'admin',
  reviewerName: '管理员'
});

// 批量审核
const batchRes = await batchReviewApplications({
  applicationIds: ['T2026001', 'T2026002'],
  status: 'approved',
  reviewComment: '批量通过'
});

// 获取统计数据
const statsRes = await getApplicationStats();
if (statsRes.success) {
  console.log('统计数据:', statsRes.data);
}
```

---

## 五、常见问题

### Q1: 申请状态有哪些？
A: 申请状态包括：pending（待审核）、approved（已通过）、rejected（已驳回）、revoked（已撤销）。

### Q2: 紧急程度如何区分？
A: 紧急程度分为 high（紧急）和 normal（一般）。紧急申请会在列表中优先显示，并用红色标签标识。

### Q3: 驳回申请时有什么要求？
A: 驳回申请时必须填写审核意见，说明驳回原因，以便申请人了解情况并重新提交。

### Q4: 批量审核支持多少个申请？
A: 建议每次批量审核不超过 50 个申请，过多可能导致处理超时。

### Q5: 申请人可以撤销已审核的申请吗？
A: 不可以。只有状态为 pending 的申请可以撤销，已审核（approved/rejected）的申请无法撤销。

### Q6: 如何查看申请的历史记录？
A: 调用 `/api/course-adjustment/history` 接口，传入申请 ID 即可查看该申请的所有操作历史。

---

## 六、版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-13 | 初始版本，包含申请管理、审核、统计等功能 |
