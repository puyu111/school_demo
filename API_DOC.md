# 智能排课系统 - REST API 文档

## 项目结构

```
school_demo/
├── src/main/java/org/example/school_demo/
│   ├── SchoolDemoApplication.java        # 主应用入口
│   ├── algorithm/
│   │   └── SimulatedAnnealingAlgorithm.java  # 模拟退火算法核心
│   ├── config/
│   │   ├── AsyncConfig.java              # 异步配置
│   │   └── SimulatedAnnealingProperties.java  # 算法参数配置
│   ├── controller/
│   │   └── SchedulingController.java     # REST API 控制器
│   ├── dto/
│   │   ├── SchedulingRequest.java        # 排课请求 DTO
│   │   └── SchedulingResult.java         # 排课结果 DTO
│   ├── model/
│   │   ├── Course.java                   # 课程实体
│   │   ├── Teacher.java                  # 教师实体
│   │   ├── Classroom.java                # 教室实体
│   │   ├── TimeSlot.java                 # 时间段实体
│   │   ├── CourseAssignment.java         # 课程分配详情
│   │   └── TimetableSolution.java        # 排课方案
│   └── service/
│       └── SchedulingService.java        # 排课服务
└── src/main/resources/
    └── application.yml                   # 配置文件
```

## API 端点

### 1. 生成排课方案

#### 1.1 使用自定义数据

```bash
POST http://localhost:8080/api/schedule/generate
Content-Type: application/json
```

**请求体示例：**

```json
{
  "courses": [
    {
      "id": "C1",
      "name": "高等数学",
      "requiredPeriods": 2,
      "studentCount": 45,
      "teacherId": "T1",
      "preferredClassroomType": "NORMAL",
      "classId": "CLASS1"
    }
  ],
  "teachers": [
    {
      "id": "T1",
      "name": "张老师",
      "availableSlots": ["Mon-1", "Mon-2", "Tue-1", "Wed-3"],
      "preferredSlots": ["Mon-1", "Wed-3"],
      "maxContinuousPeriods": 3
    }
  ],
  "classrooms": [
    {
      "id": "R1",
      "name": "A-101",
      "capacity": 50,
      "availableSlots": ["Mon-1", "Mon-2", "Tue-1", "Wed-3"],
      "type": "NORMAL"
    }
  ],
  "allTimeSlots": ["Mon-1", "Mon-2", "Mon-3", "Tue-1", "Tue-2", "Wed-1", "Wed-2", "Wed-3"],
  "schedulingParams": {
    "useDefaultParams": true
  }
}
```

**响应：**

```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "排课任务已创建，正在执行中"
}
```

#### 1.2 使用示例数据（快速测试）

```bash
POST http://localhost:8080/api/schedule/generate/sample
Content-Type: application/json
```

**请求体（可选）：**

```json
{
  "useDefaultParams": true
}
```

**响应：**

```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "排课任务已创建，正在执行中"
}
```

### 2. 获取排课结果

```bash
GET http://localhost:8080/api/schedule/result/{taskId}
```

**响应示例：**

```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "solution": {
    "solutionId": "550e8400-e29b-41d4-a716-446655440000",
    "assignments": {
      "C1": {
        "courseId": "C1",
        "timeSlotId": "Mon-1",
        "classroomId": "R1",
        "teacherId": "T1"
      }
    },
    "fitnessScore": 15.5,
    "hardConstraintViolations": 0,
    "softConstraintCost": 15.5,
    "feasible": true
  },
  "iterations": 1523,
  "finalTemperature": 0.095,
  "finalCost": 15.5,
  "foundFeasibleSolution": true,
  "executionTimeMs": 2345,
  "progress": 100
}
```

### 3. 检查任务状态

```bash
GET http://localhost:8080/api/schedule/status/{taskId}
```

**响应示例：**

```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "RUNNING",
  "progress": 45,
  "foundFeasibleSolution": null
}
```

### 4. 取消任务

```bash
POST http://localhost:8080/api/schedule/cancel/{taskId}
```

### 5. 清除已完成任务

```bash
POST http://localhost:8080/api/schedule/clear-completed
```

## cURL 测试示例

### 使用示例数据生成排课方案

```bash
curl -X POST http://localhost:8080/api/schedule/generate/sample \
  -H "Content-Type: application/json" \
  -d '{"useDefaultParams": true}'
```

### 获取排课结果

```bash
curl http://localhost:8080/api/schedule/result/<taskId>
```

### 完整测试流程

```bash
# 1. 提交排课任务
TASK_ID=$(curl -s -X POST http://localhost:8080/api/schedule/generate/sample \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.taskId')

echo "Task ID: $TASK_ID"

# 2. 等待并检查结果
sleep 3
curl http://localhost:8080/api/schedule/result/$TASK_ID | jq
```

## 配置说明

### 调整硬/软约束权重

编辑 `application.yml`：

```yaml
scheduling:
  sa:
    # 硬约束权重（违反则方案无效或给予极大惩罚）
    hard-constraint-weight: 1000.0

    # 软约束权重
    teacher-preference-weight: 1.0      # 教师偏好满足度
    continuous-class-weight: 2.0        # 避免连续上课
    classroom-balance-weight: 1.5       # 教室利用率均衡
```

**权重调整建议：**
- 硬约束权重必须远大于软约束（至少 10 倍）
- 增加 `teacher-preference-weight` 会更倾向于满足教师偏好
- 增加 `continuous-class-weight` 会更严格避免教师连续上课
- 增加 `classroom-balance-weight` 会使教室使用更均衡

### 调整算法参数

```yaml
scheduling:
  sa:
    initial-temperature: 1000.0    # 初始温度（越高搜索越充分）
    min-temperature: 0.1           # 终止温度
    cooling-rate: 0.95             # 冷却率（越大降温越慢）
    iterations-per-temperature: 100  # 每温度迭代次数
    no-improvement-threshold: 50   # 无改进提前终止阈值
```

### 扩展新的邻域操作

在 `SimulatedAnnealingAlgorithm.java` 的 `generateNeighbor` 方法中添加：

```java
private TimetableSolution generateNeighbor(...) {
    int operationType = ThreadLocalRandom.current().nextInt(4); // 改为 4

    switch (operationType) {
        case 0: swapTimeSlots(...); break;
        case 1: moveCourse(...); break;
        case 2: swapClassrooms(...); break;
        case 3: swapTeachers(...); break; // 新增操作
    }
    return neighbor;
}
```

### 接入真实数据库

当前实现使用内存数据存储。接入数据库步骤：

1. **添加 JPA 依赖** (`build.gradle`)：
```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'mysql:mysql-connector-java:8.0.33'
```

2. **创建 Repository 接口**：
```java
public interface CourseRepository extends JpaRepository<Course, String> {}
```

3. **修改 Service 层**从数据库加载数据

## 算法说明

### 模拟退火算法核心组件

1. **初始解生成** (`generateInitialSolution`)
   - 随机但合法地分配课程到 (时间段，教室) 组合
   - 满足所有硬约束

2. **邻域操作** (`generateNeighbor`)
   - Swap: 交换两门课的时间段
   - Move: 移动一门课到空闲时间段
   - Swap Classroom: 交换两门课的教室

3. **代价函数** (`calculateCost`)
   - 硬约束违反：极大惩罚（×1000）
   - 软约束违反：加权求和

4. **温度衰减**
   - 几何冷却：T = T × 0.95

5. **Metropolis 接受准则**
   - 优解必接受
   - 劣解以概率 exp(-ΔE/T) 接受

### 公式

**接受概率：**
```
P(accept) = exp(-ΔE / T)  (当 ΔE > 0)
```

其中：
- ΔE = 新解代价 - 当前解代价
- T = 当前温度
