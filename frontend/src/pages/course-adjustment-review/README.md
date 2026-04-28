# 调课申请审核模块组件化说明

## 目录结构

```
src/pages/course-adjustment-review/
├── components/           # 组件目录
│   ├── FilterBar.tsx          # 筛选区域组件
│   ├── ApplicationTable.tsx   # 申请表格组件
│   ├── DetailModal.tsx        # 详情弹窗组件
│   ├── ReviewForm.tsx         # 审核表单组件
│   └── index.ts               # 组件统一导出
├── hooks/              # 自定义 Hooks 目录
│   └── useApplicationData.ts    # 申请数据管理 Hook
├── services/           # API 服务层
│   └── index.ts               # API 接口定义
├── types/              # TypeScript 类型定义
│   └── index.ts               # 类型定义
├── index.tsx           # 主页面组件
└── README.md           # 本说明文档
```

## 组件说明

### 1. FilterBar（筛选区域）

**功能**: 提供申请状态筛选、紧急程度筛选和批量操作按钮

**Props**:
```typescript
interface FilterBarProps {
  filters: FilterOptions;           // 当前筛选条件
  onFilterChange: (filters) => void; // 筛选条件变化回调
  onBatchAction: (action) => void;   // 批量操作回调
  selectedCount: number;             // 已选择数量
}
```

**使用示例**:
```tsx
<FilterBar
  filters={filters}
  onFilterChange={setFilters}
  onBatchAction={handleBatchAction}
  selectedCount={selectedRowKeys.length}
/>
```

---

### 2. ApplicationTable（申请表格）

**功能**: 显示调课申请列表，支持行选择、查看详情、审核操作

**Props**:
```typescript
interface ApplicationTableProps {
  data: CourseAdjustmentRecord[];     // 申请数据
  selectedRowKeys: Key[];             // 已选择行 keys
  onSelectionChange: (keys) => void;   // 选择变化回调
  onViewDetail: (record) => void;      // 查看详情回调
  onReview: (record, status) => void;  // 审核回调
  loading?: boolean;                   // 加载状态
}
```

**使用示例**:
```tsx
<ApplicationTable
  data={data}
  selectedRowKeys={selectedRowKeys}
  onSelectionChange={setSelectedRowKeys}
  onViewDetail={handleViewDetail}
  onReview={handleTableReview}
  loading={loading}
/>
```

---

### 3. DetailModal（详情弹窗）

**功能**: 显示调课申请的完整详细信息

**Props**:
```typescript
interface DetailModalProps {
  visible: boolean;                    // 弹窗显示状态
  record: CourseAdjustmentRecord | null; // 当前记录
  onClose: () => void;                  // 关闭回调
}
```

**使用示例**:
```tsx
<DetailModal
  visible={modalVisible}
  record={selectedRecord}
  onClose={handleCloseDetail}
/>
```

---

### 4. ReviewForm（审核表单）

**功能**: 审核调课申请，可选择通过/驳回并填写审核意见

**Props**:
```typescript
interface ReviewFormProps {
  record: CourseAdjustmentRecord;           // 申请记录
  onSubmit: (status, comment) => void;      // 提交回调
  onCancel: () => void;                     // 取消回调
}
```

**使用示例**:
```tsx
<ReviewForm
  record={reviewingRecord}
  onSubmit={handleSubmitReview}
  onCancel={handleCloseReviewModal}
/>
```

---

## Hook 说明

### useApplicationData

**功能**: 管理申请列表数据、筛选条件、审核操作等状态和逻辑

**返回值**:
```typescript
{
  // 数据
  data: CourseAdjustmentRecord[];     // 筛选后的数据
  allData: CourseAdjustmentRecord[];  // 原始数据
  loading: boolean;                    // 加载状态
  filters: FilterOptions;              // 当前筛选条件
  selectedRowKeys: Key[];              // 已选择行 keys
  modalVisible: boolean;               // 详情弹窗状态
  selectedRecord: CourseAdjustmentRecord | null;

  // 状态管理
  setFilters: (filters) => void;
  setSelectedRowKeys: (keys) => void;
  setModalVisible: (visible) => void;
  setSelectedRecord: (record) => void;

  // 方法
  loadApplications: () => void;        // 加载申请列表
  refreshData: () => void;             // 刷新数据
  handleViewDetail: (record) => void;  // 查看详情
  handleCloseDetail: () => void;       // 关闭详情
  handleReview: (record, status, comment) => void;
  handleBatchAction: (action) => void; // 批量审核
}
```

**使用示例**:
```tsx
const {
  data,
  loading,
  filters,
  selectedRowKeys,
  handleViewDetail,
  handleReview,
  handleBatchAction,
} = useApplicationData();
```

---

## 类型定义

### CourseAdjustmentRecord（调课申请记录）
```typescript
interface CourseAdjustmentRecord {
  key: string;                    // 表格行 key
  id: string;                     // 申请编号
  teacherId?: string;             // 教师 ID
  teacherName: string;            // 教师姓名
  department: string;             // 所在院系
  originalCourse: string;         // 原课程信息
  targetCourse: string;           // 调整后课程信息
  reason: string;                 // 调课原因
  applyTime: string;              // 申请时间
  status: ApplicationStatus;      // 审核状态
  urgency: UrgencyLevel;          // 紧急程度
  reviewComment?: string;         // 审核意见
  reviewerId?: string;            // 审核人 ID
  reviewerName?: string;          // 审核人姓名
  reviewTime?: string;            // 审核时间
}
```

### ApplicationStatus（申请状态）
```typescript
type ApplicationStatus = 'pending' | 'approved' | 'rejected';
```

### UrgencyLevel（紧急程度）
```typescript
type UrgencyLevel = 'high' | 'normal';
```

---

## API 接口

### 获取申请列表
```typescript
GET /api/course-adjustment/applications
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| status | string | 否 | 状态筛选 |
| urgency | string | 否 | 紧急程度筛选 |
| department | string | 否 | 院系筛选 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "T2023001",
        "teacherName": "张三",
        "department": "数学系",
        "originalCourse": "高等数学 周一 1-2 节 A101",
        "targetCourse": "周三 3-4 节 B203",
        "reason": "参加学术会议",
        "applyTime": "2023-10-26 09:30",
        "status": "pending",
        "urgency": "high"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 审核申请
```typescript
POST /api/course-adjustment/applications/review
```

**请求体**:
```json
{
  "applicationId": "T2023001",
  "status": "approved",
  "reviewComment": "同意"
}
```

### 批量审核
```typescript
POST /api/course-adjustment/applications/batch-review
```

**请求体**:
```json
{
  "applicationIds": ["T2023001", "T2023002"],
  "status": "approved",
  "reviewComment": "统一调整"
}
```

---

## 使用示例

### 基础用法
```tsx
import CourseAdjustmentReview from '@/pages/course-adjustment-review';

// 直接在路由中使用
<Route path="/review" element={<CourseAdjustmentReview />} />
```

### 自定义组件组合
```tsx
import {
  FilterBar,
  ApplicationTable,
  DetailModal,
  useApplicationData,
} from '@/pages/course-adjustment-review/components';

function CustomReviewPage() {
  const {
    data,
    filters,
    selectedRowKeys,
    handleViewDetail,
    handleReview,
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
      />
    </div>
  );
}
```

---

## 与 drag-schedule-test 对比

| 模块 | drag-schedule-test | course-adjustment-review |
|------|-------------------|-------------------------|
| 组件化方式 | 按功能划分组件 | 按功能划分组件 |
| 数据结构 | 课程 + 配置数据 | 申请记录数据 |
| 核心 Hook | useScheduleData / useApi | useApplicationData |
| 服务层 | /service/index.ts | /services/index.ts |
| 类型定义 | /types/index.ts | /types/index.ts |
| 主要交互 | 拖拽排课 | 筛选 + 审核 |

---

## 待办事项

1. [ ] 接入实际后端 API
2. [ ] 添加院系筛选功能
3. [ ] 添加搜索关键词功能
4. [ ] 添加统计数据展示
5. [ ] 添加导出功能
6. [ ] 添加审核历史记录

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-13 | 初始组件化版本 |
