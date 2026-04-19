<template>
  <div class="gantt-wrapper">
    <div class="gantt-table">
      <!-- 表头：时间段 -->
      <div class="gantt-header">
        <div class="header-cell classroom-header">教室</div>
        <div v-for="slot in timeSlots" :key="slot" class="header-cell time-slot">
          {{ formatSlot(slot) }}
        </div>
      </div>

      <!-- 表体：教室行 -->
      <div v-for="classroom in classrooms" :key="classroom" class="gantt-row">
        <div class="row-label classroom-label">{{ classroom }}</div>
        <div
          v-for="slot in timeSlots"
          :key="slot"
          class="gantt-cell"
          :class="{ 'has-class': getAssignment(classroom, slot) }"
        >
          <div v-if="getAssignment(classroom, slot)" class="class-block" :title="getAssignmentTitle(classroom, slot)">
            {{ getAssignmentTitle(classroom, slot) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  assignments: {
    type: Array,
    required: true
  }
})

// 所有时间段（周一至周五，每天 8 节）
const timeSlots = computed(() => {
  const slots = []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  for (const day of days) {
    for (let period = 1; period <= 8; period++) {
      slots.push(`${day}-${period}`)
    }
  }
  return slots
})

// 所有教室
const classrooms = computed(() => {
  const set = new Set()
  props.assignments.forEach(a => {
    if (a.classroomId) set.add(a.classroomId)
  })
  return Array.from(set).sort()
})

// 构建查找表：classroomId + timeSlotId -> assignment
const assignmentMap = computed(() => {
  const map = {}
  props.assignments.forEach(a => {
    const key = `${a.classroomId}|${a.timeSlotId}`
    map[key] = a
  })
  return map
})

// 获取指定教室和时间段的分配
const getAssignment = (classroom, slot) => {
  const key = `${classroom}|${slot}`
  return assignmentMap.value[key]
}

// 获取显示标题（课程名或课程 ID）
const getAssignmentTitle = (classroom, slot) => {
  const assignment = getAssignment(classroom, slot)
  return assignment ? assignment.courseId : ''
}

// 格式化时间段显示
const formatSlot = (slot) => {
  const [day, period] = slot.split('-')
  const dayMap = { Mon: '一', Tue: '二', Wed: '三', Thu: '四', Fri: '五' }
  return `${dayMap[day] || day}-${period}`
}
</script>

<style scoped lang="scss">
.gantt-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.gantt-table {
  min-width: 800px;
}

.gantt-header {
  display: grid;
  grid-template-columns: 100px repeat(40, 1fr);
  background: #f5f7fa;
  border-bottom: 2px solid #dcdfe6;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-cell {
  padding: 10px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #606266;
  border-right: 1px solid #e4e7ed;

  &.classroom-header {
    position: sticky;
    left: 0;
    background: #f5f7fa;
    font-size: 13px;
    z-index: 11;
  }

  &.time-slot {
    &:nth-of-type(9n + 2) {
      background: rgba(102, 126, 234, 0.1);
    }
  }
}

.gantt-row {
  display: grid;
  grid-template-columns: 100px repeat(40, 1fr);
  border-bottom: 1px solid #ebeef5;

  &:hover {
    background: #f9fafc;
  }
}

.row-label {
  position: sticky;
  left: 0;
  background: white;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  border-right: 2px solid #dcdfe6;
  z-index: 5;
}

.gantt-cell {
  height: 36px;
  border-right: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  position: relative;

  &.has-class {
    background: rgba(102, 126, 234, 0.15);
  }
}

.class-block {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }
}
</style>
