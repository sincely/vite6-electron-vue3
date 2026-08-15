<!-- 导出 Excel 文件 -->
<template>
  <ElButton
    :type="type"
    :size="size"
    :loading="isExporting"
    :disabled="disabled || !hasData"
    @click="handleExport"
  >
    <template #loading>
      <ElIcon class="is-loading"><Loading /></ElIcon>
      {{ loadingText }}
    </template>
    <slot>{{ buttonText }}</slot>
  </ElButton>
</template>

<script setup>
import { ref, computed, readonly, nextTick } from 'vue'
import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useThrottleFn } from '@vueuse/core'

defineOptions({ name: 'ExcelExport' })

/**
 * 导出 Excel
 * @property {Array} data 数据源
 * @property {string} filename 文件名（不含扩展名）
 * @property {string} sheetName 工作表名称
 * @property {string} type 按钮类型
 * @property {string} size 按钮尺寸
 * @property {boolean} disabled 是否禁用
 * @property {string} buttonText 按钮文本
 * @property {string} loadingText 加载中文本
 * @property {boolean} autoIndex 是否自动添加序号列
 * @property {string} indexColumnTitle 序号列标题
 * @property {object} columns 列配置映射 { key: { title, width, formatter } }
 * @property {object} headers 表头映射（简化版本）
 * @property {number} maxRows 最大导出行数
 * @property {boolean} showSuccessMessage 是否显示成功消息
 * @property {boolean} showErrorMessage 是否显示错误消息
 * @property {object} workbookOptions 工作簿配置
 */
const props = defineProps({
  data: { type: Array, default: () => [] },
  filename: {
    type: String,
    default: () => `export_${new Date().toISOString().slice(0, 10)}`
  },
  sheetName: { type: String, default: 'Sheet1' },
  type: { type: String, default: 'primary' },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  buttonText: { type: String, default: '导出 Excel' },
  loadingText: { type: String, default: '导出中...' },
  autoIndex: { type: Boolean, default: false },
  indexColumnTitle: { type: String, default: '序号' },
  columns: { type: Object, default: () => ({}) },
  headers: { type: Object, default: () => ({}) },
  maxRows: { type: Number, default: 100000 },
  showSuccessMessage: { type: Boolean, default: true },
  showErrorMessage: { type: Boolean, default: true },
  workbookOptions: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'before-export',
  'export-success',
  'export-error',
  'export-progress'
])

/** 导出错误类型 */
class ExportError extends Error {
  constructor(message, code, details) {
    super(message)
    this.name = 'ExportError'
    this.code = code
    this.details = details
  }
}

const isExporting = ref(false)

/** 是否有数据可导出 */
const hasData = computed(
  () => Array.isArray(props.data) && props.data.length > 0
)

/** 验证导出数据 */
const validateData = (data) => {
  if (!Array.isArray(data)) {
    throw new ExportError('数据必须是数组格式', 'INVALID_DATA_TYPE')
  }

  if (data.length === 0) {
    throw new ExportError('没有可导出的数据', 'NO_DATA')
  }

  if (data.length > props.maxRows) {
    throw new ExportError(
      `数据行数超过限制（${props.maxRows}行）`,
      'EXCEED_MAX_ROWS',
      {
        currentRows: data.length,
        maxRows: props.maxRows
      }
    )
  }
}

/** 格式化单元格值 */
const formatCellValue = (value, key, row, index) => {
  const column = props.columns[key]
  if (column?.formatter) {
    return column.formatter(value, row, index)
  }

  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleDateString('zh-CN')
  if (typeof value === 'boolean') return value ? '是' : '否'
  return String(value)
}

/** 处理数据：字段映射为表头标题并格式化 */
const processData = (data) =>
  data.map((item, index) => {
    const processedItem = {}

    // 添加序号列
    if (props.autoIndex) {
      processedItem[props.indexColumnTitle] = String(index + 1)
    }

    Object.entries(item).forEach(([key, value]) => {
      let columnTitle = key
      if (props.columns[key]?.title) {
        columnTitle = props.columns[key].title
      } else if (props.headers[key]) {
        columnTitle = props.headers[key]
      }

      processedItem[columnTitle] = formatCellValue(value, key, item, index)
    })

    return processedItem
  })

/** 计算列宽度 */
const calculateColumnWidths = (data) => {
  if (data.length === 0) return []

  const sampleSize = Math.min(data.length, 100) // 只取前 100 行计算列宽
  const columns = Object.keys(data[0])

  return columns.map((column) => {
    // 使用配置的列宽度
    const configWidth = Object.values(props.columns).find(
      (col) => col.title === column
    )?.width

    if (configWidth) return { wch: configWidth }

    // 自动计算列宽度
    const maxLength = Math.max(
      column.length,
      ...data
        .slice(0, sampleSize)
        .map((row) => String(row[column] || '').length)
    )

    // 限制最小和最大宽度
    const width = Math.min(Math.max(maxLength + 2, 8), 50)
    return { wch: width }
  })
}

/** 导出到 Excel */
const exportToExcel = async (data, filename, sheetName) => {
  try {
    emit('export-progress', 10)

    const processedData = processData(data)
    emit('export-progress', 30)

    const workbook = XLSX.utils.book_new()

    // 设置工作簿属性
    if (props.workbookOptions) {
      workbook.Props = {
        Title: filename,
        Subject: '数据导出',
        Author: props.workbookOptions.creator || 'Lightning',
        Manager: props.workbookOptions.lastModifiedBy || '',
        Company: '系统导出',
        Category: '数据',
        Keywords: 'excel,export,data',
        Comments: '由系统自动生成',
        CreatedDate: props.workbookOptions.created || new Date(),
        ModifiedDate: props.workbookOptions.modified || new Date()
      }
    }

    emit('export-progress', 50)

    const worksheet = XLSX.utils.json_to_sheet(processedData)
    worksheet['!cols'] = calculateColumnWidths(processedData)
    emit('export-progress', 70)

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    emit('export-progress', 85)

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      compression: true
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    emit('export-progress', 95)

    // 使用时间戳确保文件名唯一
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const finalFilename = `${filename}_${timestamp}.xlsx`

    FileSaver.saveAs(blob, finalFilename)
    emit('export-progress', 100)

    await nextTick()
  } catch (error) {
    throw new ExportError(
      `Excel 导出失败: ${error.message}`,
      'EXPORT_FAILED',
      error
    )
  }
}

/** 处理导出 */
const handleExport = useThrottleFn(async () => {
  if (isExporting.value) return

  isExporting.value = true

  try {
    validateData(props.data)
    emit('before-export', props.data)
    await exportToExcel(props.data, props.filename, props.sheetName)
    emit('export-success', props.filename, props.data.length)

    if (props.showSuccessMessage) {
      ElMessage.success({
        message: `成功导出 ${props.data.length} 条数据`,
        duration: 3000
      })
    }
  } catch (error) {
    const exportError =
      error instanceof ExportError
        ? error
        : new ExportError(`导出失败: ${error.message}`, 'UNKNOWN_ERROR', error)

    emit('export-error', exportError)

    if (props.showErrorMessage) {
      ElMessage.error({
        message: exportError.message,
        duration: 5000
      })
    }

    console.error('Excel 导出错误:', exportError)
  } finally {
    isExporting.value = false
    emit('export-progress', 0)
  }
}, 1000)

defineExpose({
  exportData: handleExport,
  isExporting: readonly(isExporting),
  hasData
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
