# 智能排课系统 - 生产版集成指南

## 项目目录结构

```
school_demo/
├── src/main/java/org/example/school_demo/
│   ├── SchoolDemoApplication.java          # 主应用入口
│   ├── algorithm/
│   │   └── SimulatedAnnealingAlgorithm.java # 模拟退火算法核心（保持不变）
│   ├── config/
│   │   ├── AsyncConfig.java                # 异步配置（已废弃，由 ThreadPoolConfig 替代）
│   │   ├── DatabaseHealthIndicator.java    # 数据库健康检查
│   │   ├── ObjectPoolConfig.java           # 对象池配置（Apache Commons Pool 2）
│   │   ├── SimulatedAnnealingProperties.java # SA 算法参数配置
│   │   └── ThreadPoolConfig.java           # 线程池配置（自定义）
│   ├── controller/
│   │   └── SchedulingController.java       # REST API 控制器
│   ├── dto/
│   │   ├── SchedulingRequest.java          # 排课请求 DTO
│   │   └── SchedulingResult.java           # 排课结果 DTO
│   ├── entity/                             # JPA 实体层（新增）
│   │   ├── ClassroomEntity.java            # 教室实体
│   │   ├── ClassroomAvailableSlotEntity.java
│   │   ├── CourseEntity.java               # 课程实体
│   │   ├── SchedulingTaskEntity.java       # 排课任务实体
│   │   ├── TeacherEntity.java              # 教师实体
│   │   ├── TeacherAvailableSlotEntity.java
│   │   ├── TeacherPreferredSlotEntity.java
│   │   ├── TimeSlotEntity.java             # 时间段实体
│   │   └── TimetableRecordEntity.java      # 排课结果实体
│   ├── model/                              # 内存模型（保持不变）
│   │   ├── Classroom.java
│   │   ├── Course.java
│   │   ├── CourseAssignment.java
│   │   ├── Teacher.java
│   │   ├── TimeSlot.java
│   │   └── TimetableSolution.java
│   ├── repository/                         # JPA Repository 层（新增）
│   │   ├── ClassroomRepository.java
│   │   ├── CourseRepository.java
│   │   ├── SchedulingTaskRepository.java
│   │   ├── TeacherRepository.java
│   │   ├── TimeSlotRepository.java
│   │   └── TimetableRecordRepository.java
│   └── service/
│       ├── SchedulingService.java          # 排课服务（集成线程池）
│       └── SchedulingDataService.java      # 数据服务（集成对象池 + JPA）
├── src/main/resources/
│   ├── application.yml                     # 主配置文件
│   └── db/
│       └── schema.sql                      # 数据库建表脚本
└── frontend/                               # Vue 3 前端项目（新增）
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.js
        ├── App.vue
        ├── api/
        │   └── schedule.js
        ├── components/
        │   └── TimetableGantt.vue
        ├── router/
        │   └── index.js
        ├── stores/
        │   └── scheduling.js
        └── views/
            └── SchedulingView.vue
```

---

## 1. MySQL 数据库集成

### 1.1 建表脚本

执行 `src/main/resources/db/schema.sql` 创建数据库和表：

```bash
mysql -u root -p < src/main/resources/db/schema.sql
```

### 1.2 数据库配置

`application.yml` 中配置 MySQL 连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/school_scheduler?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: ${DB_PASSWORD:root123}
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 1.3 JPA 实体类映射

| 数据库表 | 实体类 | 说明 |
|---------|--------|------|
| `time_slot` | `TimeSlotEntity` | 时间段 |
| `teacher` | `TeacherEntity` | 教师 |
| `teacher_available_slot` | `TeacherAvailableSlotEntity` | 教师可用时间段 |
| `teacher_preferred_slot` | `TeacherPreferredSlotEntity` | 教师偏好时间段 |
| `classroom` | `ClassroomEntity` | 教室 |
| `classroom_available_slot` | `ClassroomAvailableSlotEntity` | 教室可用时间段 |
| `course` | `CourseEntity` | 课程 |
| `timetable_record` | `TimetableRecordEntity` | 排课结果 |
| `scheduling_task` | `SchedulingTaskEntity` | 排课任务 |

---

## 2. 数据库连接池配置（HikariCP）

### 2.1 生产级调优参数

```yaml
spring:
  datasource:
    hikari:
      pool-name: SchedulerHikariPool
      maximum-pool-size: 20        # 最大连接数
      minimum-idle: 5              # 最小空闲连接
      connection-timeout: 30000    # 连接超时（毫秒）
      idle-timeout: 600000         # 空闲超时（10 分钟）
      max-lifetime: 1800000        # 最大生命周期（30 分钟）
      leak-detection-threshold: 60000  # 泄露检测阈值（60 秒）
```

### 2.2 验证连接池状态

通过 Actuator 端点检查：

```bash
curl http://localhost:8080/actuator/health/db
```

响应示例：

```json
{
  "status": "UP",
  "details": {
    "connectionAcquireTimeMs": 2,
    "dataSource": "HikariDataSource"
  }
}
```

---

## 3. 对象池配置（Apache Commons Pool 2）

### 3.1 对象池配置

```yaml
objectpool:
  solution:
    max-total: 50                  # 最大总对象数
    max-idle: 20                   # 最大空闲对象数
    min-idle: 5                    # 最小空闲对象数
    block-when-exhausted: true     # 池耗尽时阻塞
    test-on-borrow: false          # 借出时不验证
    test-while-idle: true          # 空闲时验证
    time-between-eviction-runs-millis: 30000
```

### 3.2 对象池使用示例

```java
@Service
@RequiredArgsConstructor
public class SchedulingDataService {
    private final GenericObjectPool<TimetableSolution> solutionPool;

    // 从对象池获取对象
    public TimetableSolution borrowSolution() throws Exception {
        return solutionPool.borrowObject();
    }

    // 归还对象到对象池
    public void returnSolution(TimetableSolution solution) {
        try {
            solutionPool.returnObject(solution);
        } catch (Exception e) {
            log.error("归还对象失败", e);
        }
    }
}
```

### 3.3 性能说明

**何时使用对象池：**
- 对象创建成本高（如大型数据结构、复杂初始化）
- 频繁创建/销毁对象
- 对象可安全重用

**何时不使用：**
- 对象轻量级（如简单 POJO）
- 池化开销大于创建开销
- 对象状态复杂、难以重置

在 SA 算法中，`TimetableSolution` 的副本创建是高频操作，使用对象池可以：
1. 减少 GC 压力
2. 提高内存分配效率
3. 降低延迟波动

---

## 4. 线程池配置

### 4.1 自定义线程池配置

```yaml
threadpool:
  async:
    core-pool-size: 4              # 核心线程数（建议 CPU 核心数 + 1）
    max-pool-size: 8               # 最大线程数
    queue-capacity: 100            # 队列容量
    keep-alive-seconds: 60         # 空闲线程存活时间
    thread-name-prefix: async-scheduler-
    wait-for-tasks-to-complete-on-shutdown: true
    await-termination-seconds: 30
    rejected-execution-handler: caller-runs
```

### 4.2 使用@Async 绑定自定义线程池

```java
@Service
public class SchedulingService {

    // 使用自定义线程池执行排课任务
    @Async("schedulingTaskExecutor")
    public CompletableFuture<String> generateSchedule(...) {
        // 异步执行逻辑
    }
}
```

### 4.3 优雅停机

```java
@Configuration
public class ThreadPoolConfig {
    @Bean(name = "schedulingTaskExecutor")
    public Executor schedulingTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // ... 配置 ...

        // 优雅停机
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);

        return executor;
    }
}
```

---

## 5. 前端项目（Vue 3 + Vite + Element Plus）

### 5.1 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（自动代理到后端）
npm run dev
```

访问：http://localhost:5173

### 5.2 前端功能

- 算法参数配置表单
- 一键触发排课
- 任务状态实时轮询（每 2 秒）
- 排课结果表格展示
- 教室 - 时间甘特图可视化

### 5.3 生产构建

```bash
npm run build
```

输出到 `frontend/dist`，可部署到 Nginx 或其他静态服务器。

---

## 6. 快速开始

### 6.1 启动数据库

```bash
# 使用 Docker 快速启动 MySQL
docker run -d \
  --name mysql-scheduler \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -p 3306:3306 \
  -v $(pwd)/src/main/resources/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql \
  mysql:8.0
```

### 6.2 启动后端

```bash
./gradlew bootRun
```

### 6.3 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 6.4 访问系统

1. 浏览器访问：http://localhost:5173
2. 配置算法参数
3. 点击"开始排课"
4. 等待任务完成
5. 查看排课结果和甘特图

---

## 7. API 测试（cURL）

### 7.1 从数据库触发排课

```bash
curl -X POST http://localhost:8080/api/schedule/generate/db \
  -H "Content-Type: application/json" \
  -d '{"useDefaultParams": true}'
```

### 7.2 查询任务状态

```bash
curl http://localhost:8080/api/schedule/status/<taskId>
```

### 7.3 获取排课结果

```bash
curl http://localhost:8080/api/schedule/result/<taskId>
```

---

## 8. 关键集成点总结

| 组件 | 配置类 | 集成方式 |
|------|--------|----------|
| HikariCP 连接池 | `application.yml` | Spring Boot 自动配置 |
| 自定义线程池 | `ThreadPoolConfig.java` | `@Async("schedulingTaskExecutor")` |
| 对象池 | `ObjectPoolConfig.java` | `GenericObjectPool<TimetableSolution>` 注入 |
| JPA Repository | `*Repository.java` | `@Repository` 接口继承 `JpaRepository` |
| 数据库健康检查 | `DatabaseHealthIndicator.java` | `/actuator/health/db` 端点 |

---

## 9. 常见问题

### Q1: 如何调整硬/软约束权重？

编辑 `application.yml`：

```yaml
scheduling:
  sa:
    hard-constraint-weight: 1000.0  # 硬约束权重
    teacher-preference-weight: 1.0  # 教师偏好权重
    continuous-class-weight: 2.0    # 连续上课权重
    classroom-balance-weight: 1.5   # 教室均衡权重
```

### Q2: 如何扩展新的邻域操作？

编辑 `SimulatedAnnealingAlgorithm.java`：

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

### Q3: 如何接入真实数据库？

1. 修改 `application.yml` 中的数据库连接
2. 执行 `schema.sql` 创建表结构
3. 使用 `POST /api/schedule/generate/db` 接口从数据库加载数据
4. 排课结果自动保存到 `timetable_record` 表

---

## 10. 性能调优建议

### 数据库层
- 根据并发量调整 `maximum-pool-size`
- 为高频查询字段添加索引（已在 schema.sql 中提供）
- 定期归档历史排课记录

### 线程池层
- 根据 CPU 核心数调整 `core-pool-size`
- 监控队列等待情况，调整 `queue-capacity`

### 算法层
- 大规模数据（>100 门课）增加 `initial-temperature` 和 `iterations-per-temperature`
- 对实时性要求高可降低迭代次数，使用更激进的冷却率

---

**版本**: 2.0.0-production
**最后更新**: 2026-04-13
