# 课表数据 API 对接指南

## 概述

本文档描述如何将课表预览组件对接后端 API，替换原有的 Mock 数据。

---

## 目录结构

```
src/pages/Schedule/
├── services/
│   ├── api.ts              # API 服务接口（已优化）
│   └── mockData.ts         # Mock 数据（开发测试用）
├── hooks/
│   ├── useSchedule.ts      # 本地 Hooks（步骤、视图控制）
│   └── useScheduleData.ts  # 数据 Hooks（已优化）
├── constants/
│   └── index.ts            # 常量配置（已优化）
└── types/
    └── index.ts            # TypeScript 类型定义
```

---

## 快速开始

### 1. 使用优化后的 Hook

```typescript
import { useScheduleData } from '@/pages/Schedule/hooks/useScheduleData';

function CourseSchedulePreview() {
  const currentWeek = 5;
  const {
    courses,
    loading,
    error,
    refreshSchedule,
    addCourse,
    updateCourse,
    removeCourse,
    moveCourses,
    saveSchedule,
  } = useScheduleData(currentWeek);

  if (loading) {
    return <Spin tip="加载课表数据中..." />;
  }

  if (error) {
    return <Alert message="加载失败" type="error" />;
  }

  return <ScheduleTable courses={courses} />;
}
```

### 2. 直接调用 API

```typescript
import * as scheduleApi from '@/pages/Schedule/services/api';

// 获取课表
const courses = await scheduleApi.getScheduleData({
  week: 5,
  classId: 'C001',
});

// 创建课程
const newCourse = await scheduleApi.createCourse({
  courseName: '数据结构',
  teacherId: 'T002',
  teacherName: '李四',
  classId: 'C001',
  className: '计算机 1 班',
  roomId: 'R002',
  roomName: 'B-201',
  weekDay: 2,
  startTime: '10:10',
  endTime: '11:50',
  duration: 100,
  weeks: [1, 2, 3, 4, 5],
  color: '#52c41a',
  studentCount: 45,
});

// 更新课程
await scheduleApi.updateCourse('1', {
  weekDay: 3,
  startTime: '14:00',
});

// 删除课程
await scheduleApi.deleteCourse('1');

// 保存课表
await scheduleApi.saveSchedule({
  week: 5,
  courses,
});
```

---

## Mock 数据切换

### 开发环境使用 Mock

```typescript
// src/pages/Schedule/services/api.ts
import { USE_MOCK } from '../constants';
import * as mockApi from './mockData';
import * as realApi from './api';

// 根据环境自动选择
const api = USE_MOCK ? mockApi : realApi;
```

### 手动切换

```typescript
// 使用 Mock 数据
import * as scheduleApi from '@/pages/Schedule/services/mockData';

// 使用真实 API
import * as scheduleApi from '@/pages/Schedule/services/api';
```

---

## API 配置

### 环境变量

在 `.env.development` 或 `.env.production` 中配置：

```bash
# API 基础路径
API_BASE_URL=/api

# 是否使用 Mock
USE_MOCK=false
```

### 请求拦截器

在 `src/requestErrorConfig.ts` 中添加 token：

```typescript
requestInterceptors: [
  (config: RequestOptions) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
],
```

---

## 完整示例 - 课表预览组件

```typescript
import React, { useState, useCallback } from 'react';
import { Spin, Alert, message, Button, Space } from 'antd';
import { useScheduleData } from '@/pages/Schedule/hooks/useScheduleData';
import ScheduleTable from './ScheduleTable';
import CourseForm from './CourseForm';

const CourseSchedulePreview: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const {
    courses,
    loading,
    error,
    refreshSchedule,
    addCourse,
    updateCourse,
    removeCourse,
    saveSchedule,
  } = useScheduleData(currentWeek);

  // 处理刷新
  const handleRefresh = useCallback(async () => {
    await refreshSchedule();
  }, [refreshSchedule]);

  // 处理保存
  const handleSave = useCallback(async () => {
    try {
      await saveSchedule();
      message.success('课表已保存');
    } catch (err) {
      // 错误已在 hook 中处理
    }
  }, [saveSchedule]);

  // 处理添加课程
  const handleAddCourse = useCallback(async (courseData: any) => {
    const newCourse = await addCourse(courseData);
    setShowForm(false);
    return newCourse;
  }, [addCourse]);

  // 处理更新课程
  const handleUpdateCourse = useCallback(async (id: string, updates: any) => {
    return await updateCourse(id, updates);
  }, [updateCourse]);

  // 处理删除课程
  const handleDeleteCourse = useCallback(async (id: string) => {
    return await removeCourse(id);
  }, [removeCourse]);

  if (loading) {
    return <Spin size="large" tip="加载课表数据中..." />;
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error.message}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            重试
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleRefresh} loading={loading}>
          刷新
        </Button>
        <Button onClick={handleSave} type="primary">
          保存课表
        </Button>
        <Button onClick={() => setShowForm(true)}>
          添加课程
        </Button>
      </Space>

      <ScheduleTable
        courses={courses}
        onUpdate={handleUpdateCourse}
        onDelete={handleDeleteCourse}
      />

      {showForm && (
        <CourseForm
          onSubmit={handleAddCourse}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default CourseSchedulePreview;
```

---

## 错误处理

### Hook 内置错误处理

```typescript
const { error } = useScheduleData(currentWeek);

if (error) {
  // error.name === 'BizError' 时包含详细信息
  console.error('错误:', error.message);
}
```

### 自定义错误处理

```typescript
import { useScheduleData as useScheduleDataRaw } from '@/pages/Schedule/hooks/useScheduleData';
import { message } from 'antd';

// 包装 Hook 自定义错误处理
export const useScheduleData = (week: number) => {
  const { courses, loading, error, ...rest } = useScheduleDataRaw(week);

  // 可以在这里添加额外的错误处理逻辑
  useEffect(() => {
    if (error) {
      // 记录日志到监控系统
      logError(error);
    }
  }, [error]);

  return { courses, loading, error, ...rest };
};
```

---

## 性能优化

### 1. 避免重复请求

```typescript
// 使用 React Query 或 SWR 等库进行缓存
import { useQuery } from '@tanstack/react-query';

export const useScheduleDataQuery = (week: number) => {
  return useQuery({
    queryKey: ['schedule', week],
    queryFn: () => scheduleApi.getScheduleData({ week }),
    staleTime: 5 * 60 * 1000, // 5 分钟内不重复请求
  });
};
```

### 2. 请求取消

```typescript
import { useEffect, useCallback, useRef } from 'react';
import { AbortController } from 'abort-controller';

export const useScheduleData = (week: number) => {
  const controllerRef = useRef<AbortController | null>(null);

  const loadSchedule = useCallback(async (weekNumber: number) => {
    // 取消上一个请求
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    try {
      const data = await scheduleApi.getScheduleData(
        { week: weekNumber },
        { signal: controllerRef.current.signal }
      );
      // 处理数据...
    } catch (error) {
      if (error.name === 'AbortError') {
        // 请求被取消，忽略
        return;
      }
      // 处理其他错误...
    }
  }, []);

  useEffect(() => {
    return () => {
      // 组件卸载时取消请求
      controllerRef.current?.abort();
    };
  }, []);
};
```

---

## 测试

### 单元测试

```typescript
import { renderHook, act } from '@testing-library/react';
import { useScheduleData } from './useScheduleData';
import * as scheduleApi from '@/pages/Schedule/services/api';

// Mock API
jest.mock('@/pages/Schedule/services/api');

describe('useScheduleData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该加载课表数据', async () => {
    const mockCourses = [{ id: '1', courseName: '测试课程' }];
    (scheduleApi.getScheduleData as jest.Mock).mockResolvedValue(mockCourses);

    const { result } = renderHook(() => useScheduleData(5));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.courses).toEqual(mockCourses);
    expect(result.current.loading).toBe(false);
  });
});
```

---

## 常见问题

### Q: 如何添加新的 API 接口？

A: 在 `services/api.ts` 中添加新函数：

```typescript
export const getNewFeature = async (params: Params): Promise<Data> => {
  return request<ApiResponse<Data>>('/api/schedule/new-feature', {
    method: 'GET',
    params,
  }).then(res => res.data);
};
```

### Q: 如何处理分页？

A: 修改 API 接口添加分页参数：

```typescript
export const getScheduleData = async (params: {
  week: number;
  page: number;
  pageSize: number;
}): Promise<PaginationResponse<Course>> => {
  return request<ApiResponse<PaginationResponse<Course>>>(`${API_BASE}/courses`, {
    method: 'GET',
    params,
  }).then(res => res.data);
};
```

### Q: 如何批量导入课程？

A: 使用 `importSchedule` 接口：

```typescript
const handleFileUpload = async (file: File) => {
  const result = await scheduleApi.importSchedule(file, {
    overrideExisting: true,
    skipConflicting: true,
  });
  message.success(`导入${result.importedCount}门课程`);
};
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-04-10 | v1.0 | 初始版本，完整的 API 对接 |

---

**文档维护**: 开发团队
**最后更新**: 2026-04-10
