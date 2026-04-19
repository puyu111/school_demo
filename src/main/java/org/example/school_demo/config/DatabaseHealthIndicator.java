package org.example.school_demo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * 数据库连接池健康检查
 * 通过 /actuator/health/db 端点暴露连接池状态
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    @Override
    public Health health() {
        try {
            // 尝试从连接池获取连接
            long startTime = System.currentTimeMillis();
            try (Connection connection = dataSource.getConnection()) {
                long acquireTime = System.currentTimeMillis() - startTime;

                // 验证连接是否有效
                if (connection.isValid(1)) {
                    return Health.up()
                            .withDetail("connectionAcquireTimeMs", acquireTime)
                            .withDetail("dataSource", dataSource.getClass().getSimpleName())
                            .build();
                } else {
                    return Health.down()
                            .withDetail("error", "Connection is not valid")
                            .build();
                }
            }
        } catch (SQLException e) {
            log.error("数据库健康检查失败", e);
            return Health.down(e)
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
