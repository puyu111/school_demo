# 调课审核模块实现方案

## 结构

```
src/main/java/org/example/school_demo/
├── entity/
│   ├── CourseAdjustmentApplication.java
│   └── ReviewHistory.java
│
├── repository/
│   ├── CourseAdjustmentApplicationRepository.java
│   └── ReviewHistoryRepository.java
│
├── controller/course_adjustment/
│   └── CourseAdjustmentController.java
│
├── service/course_adjustment/
│   ├── CourseAdjustmentService.java
│   └── impl/
│       └── CourseAdjustmentServiceImpl.java
│
└── dto/course_adjustment/
    ├── request/
    │   ├── ApplicationListReq.java
    │   ├── ApplicationCreateReq.java
    │   ├── ApplicationReviewReq.java
    │   ├── BatchReviewReq.java
    │   └── HistoryQueryReq.java
    └── response/
        ├── ApplicationListResp.java
        ├── ApplicationDetailResp.java
        ├── ApplicationCreateResp.java
        ├── ApplicationReviewResp.java
        ├── BatchReviewResp.java
        ├── ApplicationRevokeResp.java
        ├── ApplicationDeleteResp.java
        ├── ApplicationStatsResp.java
        ├── DepartmentStatsResp.java
        └── ReviewHistoryResp.java
```

## 设计原则

1. **Entity/Repository 放 flat 层**，其余按 `course_adjustment` 包组织（同 base_data 风格）
2. **遵循 base_data 模式**：Service 返回 `Map<String, Object>`，Controller 拆包成 `Result<T>`
3. **业务异常直接 return**，不 throw
4. **JSON 字段**（`original_detail`、`target_detail`、`attachments`）存为 String，Jackson 手动序列化/反序列化
5. **不设 JPA 实体关联**，查询时手动查（避免双向耦合）
6. **不引入新依赖**

## 10个端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/course-adjustment/applications` | 分页列表（status/urgency/department/keyword） |
| GET | `/api/course-adjustment/applications/{id}` | 详情 |
| POST | `/api/course-adjustment/applications` | 提交申请 |
| POST | `/api/course-adjustment/applications/review` | 审核（通过/驳回） |
| POST | `/api/course-adjustment/applications/batch-review` | 批量审核 |
| POST | `/api/course-adjustment/applications/{id}/revoke` | 撤销 |
| DELETE | `/api/course-adjustment/applications/{id}` | 删除 |
| GET | `/api/course-adjustment/stats` | 统计数据 |
| GET | `/api/course-adjustment/stats/departments` | 院系统计 |
| GET | `/api/course-adjustment/history` | 审核历史 |

## Service 逻辑要点

- **提交**: 生成ID(T+yyyymm+3位流水) → 写 ReviewHistory(submit)
- **审核**: 校验 pending 状态 → 校验驳回时 comment 必填 → 写 ReviewHistory(review)
- **批量**: 逐条审核，部分失败不整体回滚
- **撤销**: 仅 pending 状态可撤销
- **删除**: 级联删 review_history
- **统计**: count by status + thisWeek/thisMonth
