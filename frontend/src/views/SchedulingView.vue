<template>
  <div class="scheduling-container">
    <el-header class="page-header">
      <h1><el-icon><Calendar /></el-icon> 智能排课系统</h1>
      <span class="subtitle">基于模拟退火算法的课程自动排课</span>
    </el-header>

    <el-main class="main-content">
      <!-- 参数配置卡片 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span><el-icon><Setting /></el-icon> 算法参数配置</span>
          </div>
        </template>

        <el-form :model="configForm" label-width="140px" size="default">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="初始温度">
                <el-input-number v-model="configForm.initialTemperature" :min="100" :max="10000" :step="100" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="终止温度">
                <el-input-number v-model="configForm.minTemperature" :min="0.01" :max="10" :step="0.01" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="冷却率">
                <el-input-number v-model="configForm.coolingRate" :min="0.9" :max="0.99" :step="0.01" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="每温度迭代次数">
                <el-input-number v-model="configForm.iterationsPerTemperature" :min="50" :max="500" :step="50" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="无改进阈值">
                <el-input-number v-model="configForm.noImprovementThreshold" :min="20" :max="200" :step="10" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="硬约束权重">
                <el-input-number v-model="configForm.hardConstraintWeight" :min="100" :max="10000" :step="100" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="form-actions">
          <el-button type="primary" size="large" @click="startScheduling" :loading="isLoading" :disabled="isLoading">
            <el-icon><Rocket /></el-icon> 开始排课
          </el-button>
          <el-button @click="resetConfig">重置参数</el-button>
          <el-button v-if="isLoading" type="danger" @click="cancelTask">
            <el-icon><CircleClose /></el-icon> 取消任务
          </el-button>
        </div>
      </el-card>

      <!-- 任务状态卡片 -->
      <el-card v-if="currentTaskId" class="status-card">
        <template #header>
          <div class="card-header">
            <span><el-icon><Loading /></el-icon> 任务状态</span>
            <el-tag :type="statusTagType">{{ taskStatus }}</el-tag>
          </div>
        </template>

        <div class="status-content">
          <p><strong>任务 ID:</strong> {{ currentTaskId }}</p>
          <el-progress :percentage="progress" :status="progressStatus" :stroke-width="20" />
          <div class="status-details" v-if="taskResult">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="迭代次数">{{ taskResult.iterations }}</el-descriptions-item>
              <el-descriptions-item label="最终温度">{{ taskResult.finalTemperature?.toFixed(4) }}</el-descriptions-item>
              <el-descriptions-item label="最终代价">{{ taskResult.finalCost?.toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="执行时间">{{ taskResult.executionTimeMs }} ms</el-descriptions-item>
              <el-descriptions-item label="可行解">
                <el-tag :type="taskResult.foundFeasibleSolution ? 'success' : 'danger'">
                  {{ taskResult.foundFeasibleSolution ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>

      <!-- 排课结果卡片 -->
      <el-card v-if="taskResult && taskResult.solution" class="result-card">
        <template #header>
          <div class="card-header">
            <span><el-icon><Document /></el-icon> 排课结果</span>
            <el-button @click="exportResult" size="small">
              <el-icon><Download /></el-icon> 导出结果
            </el-button>
          </div>
        </template>

        <!-- 结果表格 -->
        <el-table :data="assignmentList" border stripe size="default" max-height="500">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="courseId" label="课程 ID" width="100" />
          <el-table-column prop="teacherId" label="教师 ID" width="100" />
          <el-table-column prop="timeSlotId" label="时间段" width="120">
            <template #default="{ row }">
              {{ formatTimeSlot(row.timeSlotId) }}
            </template>
          </el-table-column>
          <el-table-column prop="classroomId" label="教室 ID" width="100" />
          <el-table-column label="星期" width="80">
            <template #default="{ row }">
              {{ getDayName(row.timeSlotId) }}
            </template>
          </el-table-column>
          <el-table-column label="节次" width="80">
            <template #default="{ row }">
              第{{ getPeriod(row.timeSlotId) }}节
            </template>
          </el-table-column>
        </el-table>

        <!-- 甘特图 -->
        <div class="gantt-container">
          <h3><el-icon><Grid /></el-icon> 教室 - 时间甘特图</h3>
          <TimetableGantt :assignments="assignmentList" />
        </div>
      </el-card>
    </el-main>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useSchedulingStore } from '@/stores/scheduling'
import TimetableGantt from '@/components/TimetableGantt.vue'

// 使用 Pinia store
const schedulingStore = useSchedulingStore()

// 配置表单
const configForm = reactive({
  initialTemperature: 1000,
  minTemperature: 0.1,
  coolingRate: 0.95,
  iterationsPerTemperature: 100,
  noImprovementThreshold: 50,
  hardConstraintWeight: 1000
})

// 计算属性
const currentTaskId = computed(() => schedulingStore.currentTaskId)
const taskStatus = computed(() => schedulingStore.taskStatus)
const taskResult = computed(() => schedulingStore.taskResult)
const isLoading = computed(() => schedulingStore.isLoading)
const progress = computed(() => schedulingStore.progress)

const statusTagType = computed(() => {
  const map = {
    RUNNING: 'warning',
    COMPLETED: 'success',
    FAILED: 'danger',
    CANCELLED: 'info'
  }
  return map[taskStatus.value] || 'info'
})

const progressStatus = computed(() => {
  if (taskStatus.value === 'COMPLETED') return 'success'
  if (taskStatus.value === 'FAILED' || taskStatus.value === 'CANCELLED') return 'exception'
  return undefined
})

const assignmentList = computed(() => {
  if (!taskResult.value?.solution?.assignments) return []
  return Object.values(taskResult.value.solution.assignments)
})

// 方法
const startScheduling = async () => {
  try {
    await schedulingStore.startScheduling({
      useDefaultParams: false,
      ...configForm
    })
    ElMessage.success('排课任务已启动')
  } catch (error) {
    ElMessage.error('启动排课任务失败')
  }
}

const cancelTask = async () => {
  try {
    await schedulingStore.cancelScheduling(currentTaskId.value)
    ElMessage.warning('任务已取消')
  } catch (error) {
    ElMessage.error('取消任务失败')
  }
}

const resetConfig = () => {
  configForm.initialTemperature = 1000
  configForm.minTemperature = 0.1
  configForm.coolingRate = 0.95
  configForm.iterationsPerTemperature = 100
  configForm.noImprovementThreshold = 50
  configForm.hardConstraintWeight = 1000
  ElMessage.success('参数已重置')
}

const exportResult = () => {
  if (!taskResult.value?.solution) {
    ElMessage.warning('暂无可导出的结果')
    return
  }

  const data = JSON.stringify(taskResult.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `排课结果_${currentTaskId.value}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('结果已导出')
}

// 时间段格式化
const formatTimeSlot = (slotId) => {
  if (!slotId) return ''
  const [day, period] = slotId.split('-')
  const dayMap = { Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日' }
  return `${dayMap[day] || day} 第${period}节`
}

const getDayName = (slotId) => {
  if (!slotId) return ''
  const dayMap = { Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日' }
  return dayMap[slotId.split('-')[0]] || ''
}

const getPeriod = (slotId) => {
  if (!slotId) return ''
  return slotId.split('-')[1]
}
</script>

<style scoped lang="scss">
.scheduling-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;

  h1 {
    font-size: 28px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.9;
  }
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.config-card, .status-card, .result-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.status-content {
  p {
    margin-bottom: 15px;
    word-break: break-all;
  }

  .status-details {
    margin-top: 20px;
  }
}

.gantt-container {
  margin-top: 30px;

  h3 {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
