package org.example.school_demo.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * 数据库连接池配置 (HikariCP 增强)
 *
 * 监控能力:
 * - JMX 注册，可通过 JConsole/VisualVM 查看连接池状态
 * - 连接泄露检测，防止连接未归还导致池耗尽
 * - 连接池健康指标暴露到 /actuator/metrics
 *
 * 生产调优建议:
 * - maximum-pool-size: 根据数据库 max_connections 和应用实例数计算
 * - max-lifetime: 应小于数据库 wait_timeout 的 60-70%
 * - leak-detection-threshold: 生产环境建议开启
 */
@Slf4j
@Configuration
public class ConnectionPoolConfig {

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.hikari.pool-name:SchedulerHikariPool}")
    private String poolName;

    @Value("${spring.datasource.hikari.maximum-pool-size:20}")
    private int maximumPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minimumIdle;

    @Value("${spring.datasource.hikari.connection-timeout:30000}")
    private int connectionTimeout;

    @Value("${spring.datasource.hikari.idle-timeout:600000}")
    private int idleTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:1800000}")
    private int maxLifetime;

    @Value("${spring.datasource.hikari.leak-detection-threshold:60000}")
    private int leakDetectionThreshold;

    @Value("${spring.datasource.hikari.connection-test-query:SELECT 1}")
    private String connectionTestQuery;

    @Value("${spring.datasource.hikari.jmx-enabled:true}")
    private boolean jmxEnabled;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = buildHikariConfig();
        HikariDataSource ds = new HikariDataSource(config);
        log.info("连接池初始化: name={}, maxPoolSize={}, minIdle={}, leakDetection={}ms",
                poolName, maximumPoolSize, minimumIdle, leakDetectionThreshold);
        return ds;
    }

    private HikariConfig buildHikariConfig() {
        HikariConfig config = new HikariConfig();
        config.setPoolName(poolName);
        config.setDriverClassName(driverClassName);
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);

        // 连接池大小
        config.setMaximumPoolSize(maximumPoolSize);
        config.setMinimumIdle(minimumIdle);

        // 超时配置
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);

        // 连接验证与泄露检测
        config.setConnectionTestQuery(connectionTestQuery);
        config.setLeakDetectionThreshold(leakDetectionThreshold);

        // MySQL 性能优化
        config.addDataSourceProperty("cachePrepStmts", true);
        config.addDataSourceProperty("prepStmtCacheSize", 250);
        config.addDataSourceProperty("prepStmtCacheSqlLimit", 2048);
        config.addDataSourceProperty("useServerPrepStmts", true);
        config.addDataSourceProperty("rewriteBatchedStatements", true);
        return config;
    }
}
