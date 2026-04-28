/**
 * base-data 模块 - 统一日志工具
 * 替代 console.log，便于生产环境控制日志输出
 */

/* eslint-disable no-console */

/** 日志级别 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 日志配置 */
interface LoggerConfig {
  /** 是否启用日志 */
  enabled: boolean;
  /** 最低日志级别 */
  minLevel: LogLevel;
}

/** 日志级别优先级 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** 默认配置：生产环境禁用 debug */
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: true,
  minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
};

/**
 * 日志记录器
 */
class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /** 检查日志级别是否允许 */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /** 格式化消息 */
  private formatMessage(module: string, message: string): string {
    return `[base-data${module ? `/${module}` : ''}] ${message}`;
  }

  debug(module: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(module, message), ...args);
    }
  }

  info(module: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(module, message), ...args);
    }
  }

  warn(module: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(module, message), ...args);
    }
  }

  error(module: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(module, message), ...args);
    }
  }
}

/** 导出单例 */
export const logger = new Logger();

/** 便捷函数 */
export const log = {
  debug: (module: string, message: string, ...args: unknown[]) =>
    logger.debug(module, message, ...args),
  info: (module: string, message: string, ...args: unknown[]) =>
    logger.info(module, message, ...args),
  warn: (module: string, message: string, ...args: unknown[]) =>
    logger.warn(module, message, ...args),
  error: (module: string, message: string, ...args: unknown[]) =>
    logger.error(module, message, ...args),
};
