/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  // 拖拽排课模块接口代理
  "/api/drag-schedule": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  // 基础数据管理模块接口代理
  "/api/base-data": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  // 智能排课系统接口代理
  "/api/smart-scheduling": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  // 调课申请审核模块接口代理
  "/api/course-adjustment": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  // 课表发布与统计模块接口代理
  "/api/schedule": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  // 规则配置模块接口代理
  "/api/rules": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  "/api/teachers": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  "/api/unavailable-dates": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  "/api/rule-weights": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
  // 排课算法接口代理
  "/api/algorithm": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true,
  },
};
