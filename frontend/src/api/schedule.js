import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    ElMessage.error(error.response?.data?.message || error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request

/**
 * 触发排课任务（示例数据）
 */
export const generateSchedule = (params) => {
  return request({
    url: '/schedule/generate/sample',
    method: 'post',
    data: params
  })
}

/**
 * 触发排课任务（数据库数据）
 */
export const generateScheduleFromDb = (params) => {
  return request({
    url: '/schedule/generate/db',
    method: 'post',
    data: params
  })
}

/**
 * 获取排课结果
 */
export const getResult = (taskId) => {
  return request({
    url: `/schedule/result/${taskId}`,
    method: 'get'
  })
}

/**
 * 检查任务状态
 */
export const getStatus = (taskId) => {
  return request({
    url: `/schedule/status/${taskId}`,
    method: 'get'
  })
}

/**
 * 取消任务
 */
export const cancelTask = (taskId) => {
  return request({
    url: `/schedule/cancel/${taskId}`,
    method: 'post'
  })
}
