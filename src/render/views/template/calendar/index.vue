<!-- 模板中心 - 日历：支持事件的增删改查、跨日期事件 -->
<template>
  <div class="template-calendar-page">
    <PageHeader
      title="日历"
      subtitle="点击日期添加事件，点击事件进行编辑"
      icon="template"
    />

    <div class="calendar-panel">
      <ElCalendar v-model="currentDate">
        <template #date-cell="{ data }">
          <div
            class="calendar-cell"
            :class="{ 'is-selected': data.isSelected }"
            @click="handleCellClick(data.day)"
          >
            <!-- 日期显示 -->
            <p class="calendar-cell__date">{{ formatDate(data.day) }}</p>

            <!-- 事件列表 -->
            <div class="calendar-cell__events">
              <div
                v-for="event in getEvents(data.day)"
                :key="`${event.date}-${event.content}`"
                @click.stop="handleEventClick(event)"
              >
                <div
                  class="calendar-event"
                  :class="`calendar-event--${event.type || 'primary'}`"
                >
                  {{ event.content }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </ElCalendar>
    </div>

    <!-- 事件编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @closed="resetForm"
    >
      <ElForm :model="eventForm" label-width="80px">
        <ElFormItem label="活动标题" required>
          <ElInput v-model="eventForm.content" placeholder="请输入活动标题" />
        </ElFormItem>
        <ElFormItem label="事件颜色">
          <ElRadioGroup v-model="eventForm.type">
            <ElRadio
              v-for="type in eventTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="开始日期" required>
          <ElDatePicker
            v-model="eventForm.date"
            style="width: 100%"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </ElFormItem>
        <ElFormItem label="结束日期">
          <ElDatePicker
            v-model="eventForm.endDate"
            style="width: 100%"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :min-date="eventForm.date"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton v-if="isEditing" type="danger" @click="handleDeleteEvent">
            删除
          </ElButton>
          <ElButton type="primary" @click="handleSaveEvent">
            {{ isEditing ? '更新' : '添加' }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import PageHeader from '@/components/PageHeader/index.vue'

defineOptions({ name: 'template-calendar' })

/**
 * 事件类型选项
 */
const eventTypes = [
  { label: '基本', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' }
]

/**
 * 示例事件基于当前月份动态生成（超出当月天数时收敛到最后一天）
 */
const monthStart = dayjs().startOf('month')
const daysInMonth = monthStart.daysInMonth()
const day = (n) =>
  monthStart.add(Math.min(n, daysInMonth) - 1, 'day').format('YYYY-MM-DD')

const currentDate = ref(new Date())
const dialogVisible = ref(false)
const dialogTitle = ref('添加事件')
const editingEventIndex = ref(-1)

/**
 * 事件列表数据
 */
const events = ref([
  { date: day(1), content: '产品需求评审', type: 'primary' },
  {
    date: day(3),
    endDate: day(5),
    content: '项目周报会议（跨日期）',
    type: 'primary'
  },
  { date: day(10), content: '瑜伽课程', type: 'success' },
  { date: day(15), content: '团队建设活动', type: 'primary' },
  { date: day(20), content: '健身训练', type: 'success' },
  { date: day(20), content: '代码评审', type: 'danger' },
  { date: day(20), content: '团队午餐', type: 'primary' },
  { date: day(20), content: '项目进度汇报', type: 'warning' },
  { date: day(28), content: '月度总结会', type: 'warning' }
])

/**
 * 事件表单数据
 */
const eventForm = ref({
  date: '',
  endDate: '',
  content: '',
  type: 'primary'
})

/**
 * 是否处于编辑模式
 */
const isEditing = computed(() => editingEventIndex.value >= 0)

/**
 * 格式化日期，只显示日
 * @param {string} date 完整日期字符串
 */
const formatDate = (date) => date.split('-')[2]

/**
 * 获取指定日期的所有事件（支持跨日期事件）
 * @param {string} currentDay 日期字符串
 */
const getEvents = (currentDay) => {
  return events.value.filter((event) => {
    const eventDate = new Date(event.date)
    const cellDate = new Date(currentDay)
    const endDate = event.endDate
      ? new Date(event.endDate)
      : new Date(event.date)

    return cellDate >= eventDate && cellDate <= endDate
  })
}

/**
 * 重置表单数据
 */
const resetForm = () => {
  eventForm.value = {
    date: '',
    endDate: '',
    content: '',
    type: 'primary'
  }
  editingEventIndex.value = -1
}

/**
 * 处理日历单元格点击事件，打开添加事件弹窗
 * @param {string} currentDay 点击的日期
 */
const handleCellClick = (currentDay) => {
  dialogTitle.value = '添加事件'
  eventForm.value = {
    date: currentDay,
    content: '',
    type: 'primary'
  }
  editingEventIndex.value = -1
  dialogVisible.value = true
}

/**
 * 处理事件点击，打开编辑事件弹窗
 * @param {object} event 点击的事件对象
 */
const handleEventClick = (event) => {
  dialogTitle.value = '编辑事件'
  eventForm.value = { ...event }
  editingEventIndex.value = events.value.findIndex(
    (e) => e.date === event.date && e.content === event.content
  )
  dialogVisible.value = true
}

/**
 * 保存事件，编辑模式更新、新增模式追加
 */
const handleSaveEvent = () => {
  if (!eventForm.value.content || !eventForm.value.date) return

  if (isEditing.value) {
    events.value[editingEventIndex.value] = { ...eventForm.value }
  } else {
    events.value.push({ ...eventForm.value })
  }

  dialogVisible.value = false
  resetForm()
}

/**
 * 删除事件
 */
const handleDeleteEvent = () => {
  if (isEditing.value) {
    events.value.splice(editingEventIndex.value, 1)
    dialogVisible.value = false
    resetForm()
  }
}
</script>

<style lang="scss" scoped>
.template-calendar-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.calendar-panel {
  padding: 8px 12px 12px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.calendar-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 120px;
  max-height: 120px;
  padding: 4px;
  overflow: hidden;
  cursor: pointer;

  &__date {
    position: absolute;
    top: 4px;
    right: 4px;
    margin: 0;
    font-size: 14px;
    color: var(--color-text-primary);
  }

  &__events {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    max-height: 84px;
    padding-right: 4px;
    margin-top: 24px;
    overflow-y: auto;
  }
}

.calendar-event {
  min-width: 100px;
  padding: 6px 12px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 4px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &--primary {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  }

  &--success {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 12%, transparent);
  }

  &--warning {
    color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  }

  &--danger {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  }
}

:deep(.el-calendar) {
  height: 100%;
  background: transparent;
}

:deep(.el-calendar__body) {
  height: calc(100% - 70px);
}

:deep(.el-calendar-table) {
  height: 100%;
}

:deep(.el-calendar-table td) {
  border-color: var(--color-border);
}

:deep(.is-selected) {
  background-color: color-mix(
    in srgb,
    var(--color-primary) 8%,
    transparent
  ) !important;
}

:deep(.el-calendar-day) {
  height: 100%;
}

:deep(.el-calendar-day:hover) {
  background-color: transparent !important;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style>
