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
  // 本地开发环境 - 接口代理到后端服务器
  dev: {
    // 拖拽排课模块接口代理
    "/api/drag-schedule": {
      target: "http://localhost:8081",
      changeOrigin: true,
      pathRewrite: { "^/api/drag-schedule": "/api/drag-schedule" },
    },
    // 基础数据管理模块接口代理
    "/api/base-data": {
      target: "http://localhost:8081",
      changeOrigin: true,
      pathRewrite: { "^/api/base-data": "/api/base-data" },
    },
    // 智能排课系统接口代理
    "/api/smart-scheduling": {
      target: "http://localhost:8081",
      changeOrigin: true,
      pathRewrite: { "^/api/smart-scheduling": "/api/smart-scheduling" },
    },
    // 调课申请审核模块接口代理
    "/api/course-adjustment": {
      target: "http://localhost:8081",
      changeOrigin: true,
      pathRewrite: { "^/api/course-adjustment": "/api/course-adjustment" },
    },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    "/api/": {
      target: "https://proapi.azurewebsites.net",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
  pre: {
    "/api/": {
      target: "your pre url",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
};
