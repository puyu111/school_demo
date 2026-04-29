# 池配置使用指南

## 1. 线程池 (ThreadPoolConfig)

### 配置项 (`application.yml`)

```yaml
threadpool:
  async:
    core-pool-size: 4
    max-pool-size: 8
    queue-capacity: 100
    keep-alive-seconds: 60
    thread-name-prefix: async-scheduler-
    await-termination-seconds: 30
    wait-for-tasks-to-complete-on-shutdown: true
    rejected-execution-handler: caller-runs
```

### 提供的线程池

| Bean 名称 | 用途 | 使用方式 |
|-----------|------|----------|
| `asyncTaskExecutor` | 通用异步任务 | `@Async("asyncTaskExecutor")` |
| `schedulingTaskExecutor` | 排课计算 | `@Async("schedulingTaskExecutor")` |
| `batchTaskExecutor` | 批量处理 | `@Async("batchTaskExecutor")` |

### 使用示例

**方式一：注解方式（推荐）**

```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class DataImportService {

    /** 异步导入数据，不阻塞调用线程 */
    @Async("asyncTaskExecutor")
    public void importData() {
        // 耗时操作
    }
}
```

**方式二：注入 Executor 手动提交**

```java
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import java.util.concurrent.Executor;

@Service
public class SchedulingService {

    private final Executor schedulingExecutor;

    public SchedulingService(@Qualifier("schedulingTaskExecutor") Executor schedulingExecutor) {
        this.schedulingExecutor = schedulingExecutor;
    }

    public void startSchedule() {
        schedulingExecutor.execute(() -> {
            // 排课算法计算
        });
    }
}
```

**方式三：Future 异步返回值**

```java
import org.springframework.scheduling.annotation.Async;
import java.util.concurrent.CompletableFuture;

@Service
public class ReportService {

    @Async("asyncTaskExecutor")
    public CompletableFuture<String> generateReport() {
        // 生成报告
        return CompletableFuture.completedFuture("report.xlsx");
    }
}
```

---

## 2. 对象池 (ObjectPoolConfig)

### 配置项 (`application.yml`)

```yaml
objectpool:
  solution:
    max-total: 50
    max-idle: 20
    min-idle: 5
    block-when-exhausted: true
    test-on-borrow: false
    test-on-return: false
    test-while-idle: true
    time-between-eviction-runs-millis: 30000
    min-evictable-idle-time-millis: 600000
```

### 提供的功能

| 方法 | 说明 |
|------|------|
| `genericObjectPool` Bean | 通用对象池实例 |
| `createPool(factory)` | 自定义类型对象池 |

### 使用示例

**方式一：使用通用对象池**

```java
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.springframework.stereotype.Service;

@Service
public class CostCalculatorService {

    private final GenericObjectPool<CostCalculator> calculatorPool;

    public CostCalculatorService(GenericObjectPool<CostCalculator> calculatorPool) {
        this.calculatorPool = calculatorPool;
    }

    public double calculate() throws Exception {
        CostCalculator calc = calculatorPool.borrowObject();
        try {
            return calc.compute();
        } finally {
            calculatorPool.returnObject(calc);
        }
    }
}
```

**方式二：创建自定义类型对象池**

```java
import org.apache.commons.pool2.PooledObjectFactory;
import org.springframework.stereotype.Service;

@Service
public class SolutionPoolService {

    private final GenericObjectPool<TimetableSolution> solutionPool;

    public SolutionPoolService(ObjectPoolConfig poolConfig) {
        this.solutionPool = poolConfig.createPool(new TimetableSolutionFactory());
    }

    private class TimetableSolutionFactory implements PooledObjectFactory<TimetableSolution> {
        @Override
        public PooledObject<TimetableSolution> makeObject() {
            return new DefaultPooledObject<>(new TimetableSolution());
        }

        @Override
        public void destroyObject(PooledObject<TimetableSolution> p) {
            // 清理资源
        }

        @Override
        public boolean validateObject(PooledObject<TimetableSolution> p) {
            return true;
        }

        // ... 其他方法: activateObject, passivateObject 等
    }
}
```

---

## 3. 数据库连接池 (ConnectionPoolConfig)

### 配置项 (`application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/school_demo
    username: root
    password: 123456
    hikari:
      pool-name: SchedulerHikariPool
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

### 已开启的优化

- 预处理语句缓存（`prepStmtCacheSize=250`）
- 批量写入优化（`rewriteBatchedStatements=true`）
- 连接泄露检测（60秒超时告警）

### 监控

```bash
# 查看连接池健康状态
curl http://localhost:8081/actuator/health

# 查看连接池指标
curl http://localhost:8081/actuator/metrics/hikaricp.connections.active
curl http://localhost:8081/actuator/metrics/hikaricp.connections.idle
curl http://localhost:8081/actuator/metrics/hikaricp.connections.pending
```

### 无需额外使用

`DataSource` Bean 已自动注入到 JPA、MyBatis 等组件中，直接声明 `@Autowired DataSource dataSource` 即可。

---

## 参数调优建议

### 线程池

| 场景 | core-pool-size | max-pool-size | queue-capacity |
|------|---------------|---------------|----------------|
| CPU 密集型（排课计算） | CPU 核心数 | CPU 核心数 × 2 | 50 |
| IO 密集型（数据导入） | CPU 核心数 × 2 | CPU 核心数 × 4 | 200 |
| 混合型 | CPU 核心数 + 1 | CPU 核心数 × 2 | 100 |

### 对象池

- **max-total** 设为预期并发数的 1.5 倍
- **min-idle** 设为 max-total 的 1/4，确保预热数量
- 需要频繁创建/销毁的大对象才需要池化（如 `byte[]`、`SimpleDateFormat`）

### 连接池

- **maximum-pool-size** 公式：`(CPU核心数 × 2) + 磁盘数`，通常 10-30 即可
- **max-lifetime** 必须小于数据库 `wait_timeout`（MySQL 默认 8 小时）
- **leak-detection-threshold** 生产建议设为 60000ms，开发可关闭
