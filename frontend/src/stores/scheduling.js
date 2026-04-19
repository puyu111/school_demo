import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateSchedule, getResult, getStatus, cancelTask } from '@/api/schedule'

export const useSchedulingStore = defineStore('scheduling', () => {
  // 状态
  const currentTaskId = ref('')
  const taskStatus = ref('') // RUNNING, COMPLETED, FAILED, CANCELLED
  const taskResult = ref(null)
  const isLoading = ref(false)
  const progress = ref(0)

  // 触发排课任务
  const startScheduling = async (params) => {
    try {
      isLoading.value = true
      progress.value = 0
      const response = await generateSchedule(params)
      currentTaskId.value = response.taskId
      taskStatus.value = 'RUNNING'

      // 开始轮询任务状态
      pollTaskStatus(response.taskId)

      return response
    } catch (error) {
      isLoading.value = false
      throw error
    }
  }

  // 轮询任务状态
  let pollTimer = null
  const pollTaskStatus = async (taskId) => {
    if (pollTimer) clearInterval(pollTimer)

    pollTimer = setInterval(async () => {
      try {
        const status = await getStatus(taskId)
        taskStatus.value = status.status
        progress.value = status.progress || 0

        if (status.status === 'COMPLETED' || status.status === 'FAILED' || status.status === 'CANCELLED') {
          clearInterval(pollTimer)
          pollTimer = null

          if (status.status === 'COMPLETED') {
            // 获取完整结果
            taskResult.value = await getResult(taskId)
          }
          isLoading.value = false
        }
      } catch (error) {
        clearInterval(pollTimer)
        pollTimer = null
        isLoading.value = false
        taskStatus.value = 'FAILED'
      }
    }, 2000) // 每 2 秒轮询一次
  }

  // 取消任务
  const cancelScheduling = async (taskId) => {
    try {
      await cancelTask(taskId)
      taskStatus.value = 'CANCELLED'
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
      isLoading.value = false
    } catch (error) {
      throw error
    }
  }

  // 重置状态
  const resetState = () => {
    currentTaskId.value = ''
    taskStatus.value = ''
    taskResult.value = null
    isLoading.value = false
    progress.value = 0
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    currentTaskId,
    taskStatus,
    taskResult,
    isLoading,
    progress,
    startScheduling,
    cancelScheduling,
    resetState
  }
})
