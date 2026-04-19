package org.example.school_demo.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.example.school_demo.model.TimetableSolution;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 对象池配置
 * 为模拟退火算法中的高频创建对象提供池化支持
 *
 * 性能说明：
 * - 适用场景：对象创建成本高、频繁创建/销毁、对象可重用
 * - 不适用场景：对象轻量级、池化开销大于创建开销、对象状态复杂难重置
 *
 * 在 SA 算法中，TimetableSolution 的副本创建是高频操作，使用对象池可以：
 * 1. 减少 GC 压力
 * 2. 提高内存分配效率
 * 3. 降低延迟波动
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "objectpool.solution")
public class ObjectPoolConfig {

    /**
     * 最大总对象数
     */
    private int maxTotal = 50;

    /**
     * 最大空闲对象数
     */
    private int maxIdle = 20;

    /**
     * 最小空闲对象数
     */
    private int minIdle = 5;

    /**
     * 当池耗尽时是否阻塞
     */
    private boolean blockWhenExhausted = true;

    /**
     * 借出时是否验证
     */
    private boolean testOnBorrow = false;

    /**
     * 归还时是否验证
     */
    private boolean testOnReturn = false;

    /**
     * 空闲时验证
     */
    private boolean testWhileIdle = true;

    /**
     * 验证间隔（毫秒）
     */
    private long timeBetweenEvictionRunsMillis = 30000;

    /**
     * 对象最小空闲时间（毫秒）
     */
    private long minEvictableIdleTimeMillis = 600000;

    /**
     * JMX 名称前缀（设为空禁用 JMX 注册，避免与 Spring Actuator 冲突）
     */
    private String jmxNamePrefix = "";

    /**
     * 是否启用 JMX 注册（禁用以避免与 Spring Boot Actuator 冲突）
     */
    private boolean jmxEnabled = false;

    /**
     * 创建 TimetableSolution 对象池
     */
    @Bean(name = "timetableSolutionPool")
    public GenericObjectPool<TimetableSolution> timetableSolutionPool() {
        GenericObjectPoolConfig<TimetableSolution> poolConfig = new GenericObjectPoolConfig<>();

        // 池大小配置
        poolConfig.setMaxTotal(maxTotal);
        poolConfig.setMaxIdle(maxIdle);
        poolConfig.setMinIdle(minIdle);
        poolConfig.setBlockWhenExhausted(blockWhenExhausted);

        // 验证配置
        poolConfig.setTestOnBorrow(testOnBorrow);
        poolConfig.setTestOnReturn(testOnReturn);
        poolConfig.setTestWhileIdle(testWhileIdle);

        // 空闲回收配置
        poolConfig.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
        poolConfig.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);

        // 禁用 JMX 注册（避免与 Spring Boot Actuator 冲突）
        poolConfig.setJmxEnabled(jmxEnabled);
        poolConfig.setJmxNamePrefix(jmxNamePrefix);

        // 创建工厂
        TimetableSolutionFactory factory = new TimetableSolutionFactory();

        GenericObjectPool<TimetableSolution> pool = new GenericObjectPool<>(factory, poolConfig);

        log.info("TimetableSolution 对象池初始化完成 - maxTotal: {}, maxIdle: {}, minIdle: {}",
                maxTotal, maxIdle, minIdle);

        return pool;
    }

    /**
     * TimetableSolution 对象池工厂
     */
    static class TimetableSolutionFactory implements PooledObjectFactory<TimetableSolution> {

        @Override
        public PooledObject<TimetableSolution> makeObject() throws Exception {
            TimetableSolution solution = new TimetableSolution();
            log.debug("创建新的 TimetableSolution 对象");
            return new DefaultPooledObject<>(solution);
        }

        @Override
        public void destroyObject(PooledObject<TimetableSolution> p) throws Exception {
            TimetableSolution solution = p.getObject();
            // 清空对象状态，便于 GC 回收
            if (solution != null) {
                solution.getAssignments().clear();
                solution.getCourses().clear();
                solution.getTeachers().clear();
                solution.getClassrooms().clear();
                solution.getAllTimeSlots().clear();
            }
            log.debug("销毁 TimetableSolution 对象");
        }

        @Override
        public boolean validateObject(PooledObject<TimetableSolution> p) {
            // 验证对象是否有效
            return p != null && p.getObject() != null;
        }

        @Override
        public void activateObject(PooledObject<TimetableSolution> p) throws Exception {
            // 激活对象，重置状态
            TimetableSolution solution = p.getObject();
            if (solution != null) {
                solution.getAssignments().clear();
                solution.setFitnessScore(null);
                solution.setHardConstraintViolations(0);
                solution.setSoftConstraintCost(0.0);
                solution.setFeasible(null);
            }
        }

        @Override
        public void passivateObject(PooledObject<TimetableSolution> p) throws Exception {
            // 钝化对象，清理状态准备归还
            TimetableSolution solution = p.getObject();
            if (solution != null) {
                solution.getAssignments().clear();
            }
        }
    }
}
