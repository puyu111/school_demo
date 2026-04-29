package org.example.school_demo.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 通用对象池配置
 * 基于 Apache Commons Pool 2，提供可复用的对象池
 *
 * 使用方式:
 * <pre>
 * {@code
 * @Autowired
 * private GenericObjectPool<MyReusableObject> objectPool;
 *
 * // 借出对象
 * MyReusableObject obj = objectPool.borrowObject();
 * try {
 *     obj.doSomething();
 * } finally {
 *     // 归还对象
 *     objectPool.returnObject(obj);
 * }
 * }
 * </pre>
 */
@Slf4j
@Configuration
@SuppressWarnings("deprecation")
public class ObjectPoolConfig {

    @Value("${objectpool.solution.max-total:50}")
    private int maxTotal;

    @Value("${objectpool.solution.max-idle:20}")
    private int maxIdle;

    @Value("${objectpool.solution.min-idle:5}")
    private int minIdle;

    @Value("${objectpool.solution.block-when-exhausted:true}")
    private boolean blockWhenExhausted;

    @Value("${objectpool.solution.test-on-borrow:false}")
    private boolean testOnBorrow;

    @Value("${objectpool.solution.test-on-return:false}")
    private boolean testOnReturn;

    @Value("${objectpool.solution.test-while-idle:true}")
    private boolean testWhileIdle;

    @Value("${objectpool.solution.time-between-eviction-runs-millis:30000}")
    private long timeBetweenEvictionRunsMillis;

    @Value("${objectpool.solution.min-evictable-idle-time-millis:600000}")
    private long minEvictableIdleTimeMillis;

    // ==================== 通用对象池 Bean ====================

    @Bean
    public GenericObjectPool<PooledObject<?>> genericObjectPool() {
        GenericObjectPoolConfig<PooledObject<?>> config = new GenericObjectPoolConfig<>();
        config.setMaxTotal(maxTotal);
        config.setMaxIdle(maxIdle);
        config.setMinIdle(minIdle);
        config.setBlockWhenExhausted(blockWhenExhausted);
        config.setTestOnBorrow(testOnBorrow);
        config.setTestOnReturn(testOnReturn);
        config.setTestWhileIdle(testWhileIdle);
        config.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
        config.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);

        log.info("对象池初始化: maxTotal={}, maxIdle={}, minIdle={}", maxTotal, maxIdle, minIdle);
        return new GenericObjectPool<>(null, config);
    }

    // ==================== 工具方法：创建自定义对象池 ====================

    /**
     * 创建指定类型的对象池
     *
     * @param factory 对象工厂
     * @param <T>     对象类型
     * @return 配置好的对象池
     */
    public <T> GenericObjectPool<T> createPool(PooledObjectFactory<T> factory) {
        GenericObjectPoolConfig<T> config = new GenericObjectPoolConfig<>();
        config.setMaxTotal(maxTotal);
        config.setMaxIdle(maxIdle);
        config.setMinIdle(minIdle);
        config.setBlockWhenExhausted(blockWhenExhausted);
        config.setTestOnBorrow(testOnBorrow);
        config.setTestOnReturn(testOnReturn);
        config.setTestWhileIdle(testWhileIdle);
        config.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
        config.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);

        GenericObjectPool<T> pool = new GenericObjectPool<>(factory, config);
        log.info("自定义对象池已创建: maxTotal={}, maxIdle={}, minIdle={}", maxTotal, maxIdle, minIdle);
        return pool;
    }
}
