package org.example.school_demo.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.function.Supplier;

/**
 * 通用对象池配置
 * 基于 Apache Commons Pool 2，提供可复用的对象池
 *
 * 使用方式（在 Service 中注入 ObjectPoolConfig）:
 * <pre>
 * {@code
 * // 方式一：使用工厂创建
 * GenericObjectPool<MyObject> pool = objectPoolConfig.createPool(
 *     new PooledObjectFactory<MyObject>() { ... }
 * );
 *
 * // 方式二：使用便捷方法
 * GenericObjectPool<Buffer> pool = objectPoolConfig.createBufferPool(() -> new byte[1024]);
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

    /**
     * 暴露池配置，方便其他组件复用
     */
    @Bean("objectPoolGlobalConfig")
    public GenericObjectPoolConfig<Object> genericObjectPoolConfig() {
        GenericObjectPoolConfig<Object> config = new GenericObjectPoolConfig<>();
        config.setMaxTotal(maxTotal);
        config.setMaxIdle(maxIdle);
        config.setMinIdle(minIdle);
        config.setBlockWhenExhausted(blockWhenExhausted);
        config.setTestOnBorrow(testOnBorrow);
        config.setTestOnReturn(testOnReturn);
        config.setTestWhileIdle(testWhileIdle);
        config.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis);
        config.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis);
        log.info("对象池配置初始化: maxTotal={}, maxIdle={}, minIdle={}", maxTotal, maxIdle, minIdle);
        return config;
    }

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

    /**
     * 便捷方法：用 Supplier 快速创建对象池
     *
     * @param supplier 对象创建器
     * @param <T>      对象类型
     * @return 配置好的对象池
     */
    public <T> GenericObjectPool<T> createPool(Supplier<T> supplier) {
        return createPool(new SimplePooledObjectFactory<>(supplier));
    }

    /**
     * 简易对象工厂实现，基于 Supplier 创建对象
     */
    private static class SimplePooledObjectFactory<T> implements PooledObjectFactory<T> {

        private final Supplier<T> supplier;

        SimplePooledObjectFactory(Supplier<T> supplier) {
            this.supplier = supplier;
        }

        @Override
        public PooledObject<T> makeObject() {
            return new DefaultPooledObject<>(supplier.get());
        }

        @Override
        public void destroyObject(PooledObject<T> p) {
            // 默认无清理
        }

        @Override
        public boolean validateObject(PooledObject<T> p) {
            return true;
        }

        @Override
        public void activateObject(PooledObject<T> p) {
            // 默认无操作
        }

        @Override
        public void passivateObject(PooledObject<T> p) {
            // 默认无操作
        }
    }
}
