<!-- 组件中心 - Excel 导入导出 -->
<template>
  <div class="excel-page">
    <PageHeader
      title="Excel 导入导出"
      subtitle="基于 xlsx 的文件解析与导出，支持表头映射、列宽与格式化"
      icon="excel"
    />

    <ElCard class="page-card">
      <div class="action-bar">
        <ExcelImport
          @import-success="handleImportSuccess"
          @import-error="handleImportError"
        >
          上传 Excel
        </ExcelImport>

        <ExcelExport
          :data="tableData"
          filename="用户数据-1"
          sheet-name="用户列表"
          type="success"
          :headers="headers"
          auto-index
          :columns="columnConfig"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
          @export-progress="handleProgress"
        >
          导出 Excel
        </ExcelExport>

        <ElButton type="danger" @click="handleClear">清除数据</ElButton>
      </div>

      <ElTable :data="tableData" class="data-table">
        <ElTableColumn
          v-for="(label, key) in headers"
          :key="key"
          :prop="key"
          :label="label"
        />
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WidgetsExcel' })

/**
 * 表格数据
 */
const tableData = ref([
  { name: '李四', age: 20, city: '上海' },
  { name: '张三', age: 25, city: '北京' },
  { name: '王五', age: 30, city: '广州' },
  { name: '赵六', age: 35, city: '深圳' },
  { name: '孙七', age: 28, city: '杭州' },
  { name: '周八', age: 32, city: '成都' },
  { name: '吴九', age: 27, city: '武汉' },
  { name: '郑十', age: 40, city: '南京' },
  { name: '刘一', age: 22, city: '重庆' },
  { name: '陈二', age: 33, city: '西安' }
])

/**
 * 表头映射配置
 * 用于 Excel 导入导出时的字段映射
 */
const headers = {
  name: '姓名',
  age: '年龄',
  city: '城市'
}

/**
 * 列配置
 * 用于 Excel 导出时的列宽和格式化
 */
const columnConfig = {
  name: {
    title: '姓名',
    width: 20,
    formatter: (value) => (value ? String(value) : '未知')
  },
  age: {
    title: '年龄',
    width: 10,
    formatter: (value) => (value ? `${value}岁` : '0岁')
  },
  city: {
    title: '城市',
    width: 12,
    formatter: (value) => (value ? `${value}市` : '未知')
  }
}

/**
 * 处理 Excel 导入成功
 * 将导入的数据转换为表格数据格式
 */
const handleImportSuccess = (data) => {
  const formattedData = data.map((item) => ({
    name: String(item['姓名'] || ''),
    age: Number(item['年龄']) || 0,
    city: String(item['城市'] || '')
  }))
  tableData.value = formattedData
  ElMessage.success(`成功导入 ${formattedData.length} 条数据`)
}

/**
 * 处理 Excel 导入错误
 */
const handleImportError = (error) => {
  console.error('导入失败:', error)
  ElMessage.error(`导入失败: ${error.message}`)
}

/**
 * 处理 Excel 导出成功
 */
const handleExportSuccess = () => {
  console.log('导出成功')
}

/**
 * 处理 Excel 导出错误
 */
const handleExportError = (error) => {
  ElMessage.error(`导出失败: ${error.message}`)
}

/**
 * 处理导出进度
 */
const handleProgress = (progress) => {
  console.log('导出进度:', progress)
}

/**
 * 清空表格数据
 */
const handleClear = () => {
  tableData.value = []
  ElMessage.info('已清空数据')
}
</script>

<style lang="scss" scoped>
.excel-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.data-table {
  width: 100%;
}
</style>
