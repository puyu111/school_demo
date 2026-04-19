# 智能排课系统 - 生产版 v2.0

## 完整项目目录树

```
school_demo/
├── build.gradle                              # Gradle 构建配置（含所有依赖）
├── settings.gradle                           # Gradle 设置
├── README.md                                 # 项目说明
├── INTEGRATION_GUIDE.md                      # 集成指南（含 5 项核心设施）
├── API_DOC.md                                # API 文档
├── HELP.md                                   # Spring Boot 帮助
│
├── src/main/java/org/example/school_demo/
│   ├── SchoolDemoApplication.java            # 主应用入口（@EnableAsync, @EnableScheduling）
│   │
│   ├── algorithm/                            # 【算法层 - 保持不变】
│   │   └── SimulatedAnnealingAlgorithm.java  # 模拟退火算法核心
│   │                                         # - 初始解生成
│   │                                         # - 邻域操作（Swap/Move/Swap Classroom）
│   │                                         # - 代价函数（硬约束 + 软约束）
│   │                                         # - Metropolis 接受准则
│   │                                         # - 温度衰减策略
│   │
│   ├── config/                               # 【配置层 - 新增】
│   │   ├── AsyncConfig.java                  # 异步配置（旧，可删除）
│   │   ├── DatabaseHealthIndicator.java      # 数据库健康检查（Actuator）
│   │   ├── ObjectPoolConfig.java             # 对象池配置（Apache Commons Pool 2）
│   │   │                                     # - TimetableSolution 对象池
│   │   │                                     # - PooledObjectFactory 实现
│   │   │                                     # - GenericObjectPool 配置
│   │   ├── SimulatedAnnealingProperties.java # SA 算法参数配置
│   │   └── ThreadPoolConfig.java             # 线程池配置（自定义）
│   │                                         # - ThreadPoolTaskExecutor
│   │                                         # - @Async("schedulingTaskExecutor") 绑定
│   │                                         # - 优雅停机支持
│   │
│   ├── controller/                           # 【控制器层 - 升级】
│   │   └── SchedulingController.java         # REST API 控制器
│   │                                         # - POST /api/schedule/generate（内存数据）
│   │                                         # - POST /api/schedule/generate/db（数据库数据）
│   │                                         # - GET /api/schedule/result/{taskId}
│   │                                         # - GET /api/schedule/status/{taskId}
│   │                                         # - POST /api/schedule/cancel/{taskId}
│   │
│   ├── dto/                                  # 【数据传输对象】
│   │   ├── SchedulingRequest.java            # 排课请求 DTO
│   │   └── SchedulingResult.java             # 排课结果 DTO
│   │
│   ├── entity/                               # 【JPA 实体层 - 新增】
│   │   ├── ClassroomEntity.java              # 教室实体
│   │   ├── ClassroomAvailableSlotEntity.java # 教室 - 时间段关联
│   │   ├── CourseEntity.java                 # 课程实体
│   │   ├── SchedulingTaskEntity.java         # 排课任务实体
│   │   ├── TeacherEntity.java                # 教师实体
│   │   ├── TeacherAvailableSlotEntity.java   # 教师 - 时间段关联
│   │   ├── TeacherPreferredSlotEntity.java   # 教师偏好时间段
│   │   ├── TimeSlotEntity.java               # 时间段实体
│   │   └── TimetableRecordEntity.java        # 排课结果实体
│   │
│   ├── model/                                # 【内存模型 - 保持不变】
│   │   ├── Classroom.java                    # 教室（算法内部使用）
│   │   ├── Course.java                       # 课程（算法内部使用）
│   │   ├── CourseAssignment.java             # 课程分配
│   │   ├── Teacher.java                      # 教师（算法内部使用）
│   │   ├── TimeSlot.java                     # 时间段（算法内部使用）
│   │   └── TimetableSolution.java            # 排课方案（对象池化对象）
│   │
│   ├── repository/                           # 【JPA Repository 层 - 新增】
│   │   ├── ClassroomRepository.java
│   │   ├── CourseRepository.java
│   │   ├── SchedulingTaskRepository.java
│   │   ├── TeacherRepository.java
│   │   ├── TimeSlotRepository.java
│   │   └── TimetableRecordRepository.java
│   │
│   └── service/                              # 【服务层 - 升级】
│       ├── SchedulingService.java            # 排课服务
│       │                                     # - @Async("schedulingTaskExecutor") 绑定
│       │                                     # - 异步执行 SA 算法
│       │                                     # - 任务状态管理
│       │
│       └── SchedulingDataService.java        # 数据服务（新增）
│                                             # - JPA Repository 集成
│                                             # - 对象池集成（borrow/return Solution）
│                                             # - 数据库持久化
│
├── src/main/resources/
│   ├── application.yml                       # 主配置文件
│   │                                         # - Spring Boot 配置
│   │                                         # - MySQL 数据源 + HikariCP
│   │                                         # - JPA/Hibernate 配置
│   │                                         # - SA 算法参数
│   │                                         # - 线程池配置
│   │                                         # - 对象池配置
│   │                                         # - Actuator 监控端点
│   │
│   └── db/
│       └── schema.sql                        # 数据库建表脚本
│                                             # - 5 张主表 + 3 张关联表
│                                             # - 索引 + 外键约束
│                                             # - 初始化时间段数据
│
└── frontend/                                 # 【Vue 3 前端项目 - 新增】
    ├── index.html                            # HTML 入口
    ├── package.json                          # npm 依赖配置
    ├── vite.config.js                        # Vite 构建配置（含代理）
    │
    └── src/
        ├── main.js                           # Vue 应用入口
        ├── App.vue                           # 根组件
        │
        ├── api/
        │   └── schedule.js                   # API 调用封装
        │                                     # - generateSchedule()
        │                                     # - getResult()
        │                                     # - getStatus()
        │                                     # - cancelTask()
        │
        ├── components/
        │   └── TimetableGantt.vue            # 甘特图组件
        │                                     # - 教室 - 时间可视化
        │                                     # - 课程分配展示
        │
        ├── router/
        │   └── index.js                      # Vue Router 配置
        │
        ├── stores/
        │   └── scheduling.js                 # Pinia 状态管理
        │                                     # - 任务状态管理
        │                                     # - 轮询逻辑
        │
        └── views/
            └── SchedulingView.vue            # 主视图
                                              # - 算法参数配置表单
                                              # - 任务状态显示
                                              # - 排课结果表格
                                              # - 甘特图可视化
```

---

## 5 项核心基础设施升级总结

| # | 设施 | 技术选型 | 配置文件 | 集成方式 |
|---|------|----------|----------|----------|
| 1 | MySQL 数据库集成 | Spring Data JPA | `application.yml` + `schema.sql` | `JpaRepository` 接口继承 |
| 2 | 数据库连接池 | HikariCP（Spring Boot 默认） | `application.yml` | Spring 自动配置 + Actuator 健康检查 |
| 3 | 对象池 | Apache Commons Pool 2 | `ObjectPoolConfig.java` | `GenericObjectPool<TimetableSolution>` 注入 |
| 4 | 线程池 | `ThreadPoolTaskExecutor` | `ThreadPoolConfig.java` | `@Async("schedulingTaskExecutor")` 绑定 |
| 5 | 前端 | Vue 3 + Vite + Element Plus | `frontend/` 目录 | REST API + Axios 代理 |

---

## 快速开始（5 分钟）

### 1. 启动 MySQL

```bash
docker run -d --name mysql-scheduler -e MYSQL_ROOT_PASSWORD=root123 -p 3306:3306 mysql:8.0
```

### 2. 初始化数据库

```bash
mysql -u root -proot123 < src/main/resources/db/schema.sql
```

### 3. 启动后端

```bash
./gradlew bootRun
```

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 5. 访问系统

浏览器打开：http://localhost:5173

---

## 技术栈总览

### 后端
- **框架**: Spring Boot 3.2.0
- **语言**: Java 17
- **ORM**: Spring Data JPA + Hibernate
- **数据库**: MySQL 8.0+
- **连接池**: HikariCP
- **对象池**: Apache Commons Pool 2
- **异步**: `ThreadPoolTaskExecutor` + `@Async`

### 前端
- **框架**: Vue 3.4 + Vite 5
- **UI 库**: Element Plus 2.5
- **状态管理**: Pinia 2
- **HTTP 客户端**: Axios
- **构建工具**: Vite

---

## 性能指标参考

| 场景 | 配置 | 性能 |
|------|------|------|
| 10 门课 + 5 教师 + 6 教室 | 默认参数 | ~200ms, ~9000 次迭代 |
| 50 门课 + 20 教师 + 20 教室 | 增加初始温度至 2000 | ~2-3s, ~50000 次迭代 |
| 100 门课 + 50 教师 + 40 教室 | 增加线程池至 16 核 | ~5-8s, ~100000 次迭代 |

---

**版本**: 2.0.0-production
**构建日期**: 2026-04-13
**作者**: 智能排课系统团队
