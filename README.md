# 智能排课系统 - 项目说明

## 快速开始

### 1. 运行应用

```bash
./gradlew bootRun
```

应用启动后访问：http://localhost:8080

### 2. 测试 API

```bash
# 使用示例数据生成排课方案
curl -X POST http://localhost:8080/api/schedule/generate/sample \
  -H "Content-Type: application/json" \
  -d '{}'

# 获取排课结果（替换 <taskId>）
curl http://localhost:8080/api/schedule/result/<taskId>
```

## 项目结构

```
school_demo/
├── src/main/java/org/example/school_demo/
│   ├── SchoolDemoApplication.java          # 主应用入口
│   │
│   ├── model/                              # 数据模型层
│   │   ├── Course.java                     # 课程实体
│   │   ├── Teacher.java                    # 教师实体
│   │   ├── Classroom.java                  # 教室实体
│   │   ├── TimeSlot.java                   # 时间段实体
│   │   ├── CourseAssignment.java           # 课程分配详情
│   │   └── TimetableSolution.java          # 排课方案
│   │
│   ├── dto/                                # 数据传输对象
│   │   ├── SchedulingRequest.java          # 排课请求 DTO
│   │   └── SchedulingResult.java           # 排课结果 DTO
│   │
│   ├── algorithm/                          # 算法核心层
│   │   └── SimulatedAnnealingAlgorithm.java # 模拟退火算法
│   │
│   ├── service/                            # 服务层
│   │   └── SchedulingService.java          # 排课服务
│   │
│   ├── controller/                         # 控制器层
│   │   └── SchedulingController.java       # REST API 控制器
│   │
│   └── config/                             # 配置层
│       ├── AsyncConfig.java                # 异步配置
│       └── SimulatedAnnealingProperties.java # 算法参数配置
│
└── src/main/resources/
    └── application.yml                     # 应用配置文件
```

## REST API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/schedule/generate` | 使用自定义数据生成排课方案 |
| POST | `/api/schedule/generate/sample` | 使用示例数据生成排课方案（快速测试） |
| GET | `/api/schedule/result/{taskId}` | 获取排课结果 |
| GET | `/api/schedule/status/{taskId}` | 检查任务状态 |
| POST | `/api/schedule/cancel/{taskId}` | 取消任务 |
| POST | `/api/schedule/clear-completed` | 清除已完成任务 |

## 核心数据模型

### Course（课程）
- `id`: 课程 ID
- `name`: 课程名称
- `requiredPeriods`: 所需课时数
- `studentCount`: 学生人数
- `teacherId`: 任课教师 ID
- `preferredClassroomType`: 优先教室类型
- `classId`: 所属班级 ID

### Teacher（教师）
- `id`: 教师 ID
- `name`: 教师姓名
- `availableSlots`: 可用时间段列表
- `preferredSlots`: 偏好时间段列表
- `maxContinuousPeriods`: 最大连续授课节数

### Classroom（教室）
- `id`: 教室 ID
- `name`: 教室名称
- `capacity`: 容量
- `availableSlots`: 可用时间段列表
- `type`: 类型（NORMAL/LAB/COMPUTER/MULTIMEDIA/LECTURE_HALL）

## 约束条件

### 硬约束（必须满足）
1. 同一教师同一时间段只能排一门课
2. 同一教室同一时间段只能排一门课
3. 教室容量 ≥ 课程学生人数
4. 排课时间段必须在教师与教室的可用范围内

### 软约束（尽量优化）
1. 教师偏好时间段满足度
2. 避免同一教师连续上课超过限制
3. 教室利用率均衡

## 算法参数配置

编辑 `application.yml` 调整算法参数：

```yaml
scheduling:
  sa:
    # 算法参数
    initial-temperature: 1000.0    # 初始温度
    min-temperature: 0.1           # 终止温度
    cooling-rate: 0.95             # 冷却率 (0.90-0.99)
    iterations-per-temperature: 100  # 每温度迭代次数
    no-improvement-threshold: 50   # 无改进提前终止阈值

    # 约束权重
    hard-constraint-weight: 1000.0  # 硬约束权重
    teacher-preference-weight: 1.0  # 教师偏好权重
    continuous-class-weight: 2.0    # 连续上课权重
    classroom-balance-weight: 1.5   # 教室均衡权重
```

## 扩展新邻域操作

在 `SimulatedAnnealingAlgorithm.java` 中添加：

```java
// 1. 在 generateNeighbor 方法中添加新操作类型
int operationType = ThreadLocalRandom.current().nextInt(4); // 改为 4

// 2. 添加新的 case 分支
case 3: swapTeachers(neighbor, assignments, teacherMap); break;

// 3. 实现新方法
private void swapTeachers(TimetableSolution solution,
                          List<CourseAssignment> assignments,
                          Map<String, Teacher> teacherMap) {
    // 实现交换教师的逻辑
}
```

## 接入真实数据库

### 1. 添加 JPA 依赖（build.gradle）

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'mysql:mysql-connector-java:8.0.33'
runtimeOnly 'com.h2database:h2'
```

### 2. 创建 Repository 接口

```java
public interface CourseRepository extends JpaRepository<Course, String> {}
public interface TeacherRepository extends JpaRepository<Teacher, String> {}
public interface ClassroomRepository extends JpaRepository<Classroom, String> {}
```

### 3. 修改 Service 层

```java
@Service
@RequiredArgsConstructor
public class SchedulingService {
    private final CourseRepository courseRepo;
    private final TeacherRepository teacherRepo;
    private final ClassroomRepository classroomRepo;

    // 从数据库加载数据
    public List<Course> loadCourses() { return courseRepo.findAll(); }
    public List<Teacher> loadTeachers() { return teacherRepo.findAll(); }
    public List<Classroom> loadClassrooms() { return classroomRepo.findAll(); }
}
```

## 算法说明

### 模拟退火算法流程

```
1. 生成初始解 S₀（随机但合法）
2. 设置初始温度 T₀
3. While T > T_min:
   a. For i = 1 to iterations_per_temperature:
      - 生成邻域解 S' = neighbor(S)
      - 计算代价变化 ΔE = cost(S') - cost(S)
      - If ΔE < 0: 接受 S'
      - Else: 以概率 exp(-ΔE/T) 接受 S'
      - 更新最优解 S_best
   b. 降温：T = T × cooling_rate
4. 返回最优解 S_best
```

### Metropolis 接受准则

```
P(accept) = 1           if ΔE < 0 (优解必接受)
P(accept) = exp(-ΔE/T)  if ΔE ≥ 0 (劣解概率接受)
```

温度 T 越高，接受劣解的概率越大，有利于跳出局部最优。

## Postman 测试集合

导入以下 JSON 到 Postman：

```json
{
  "info": { "name": "智能排课系统 API" },
  "item": [
    {
      "name": "生成排课方案 (示例数据)",
      "request": {
        "method": "POST",
        "url": "http://localhost:8080/api/schedule/generate/sample",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": { "mode": "raw", "raw": "{}" }
      }
    },
    {
      "name": "获取排课结果",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/schedule/result/{{taskId}}"
      }
    },
    {
      "name": "检查任务状态",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/schedule/status/{{taskId}}"
      }
    }
  ]
}
```

## 技术栈

- **框架**: Spring Boot 3.2.0
- **语言**: Java 17
- **构建工具**: Gradle 9.4.1
- **Lombok**: 简化样板代码
- **内嵌服务器**: Tomcat 10.1.16

## 性能指标

示例数据（10 门课，5 名教师，6 间教室，40 个时间段）：
- 迭代次数：~9000
- 执行时间：~200ms
- 找到可行解：是
- 最终代价：~7.0（越小越好）
