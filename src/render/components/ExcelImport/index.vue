<!-- 导入 Excel 文件 -->
<template>
  <div class="inline-block">
    <ElUpload :auto-upload="false" accept=".xlsx" :show-file-list="false" @change="handleFileChange">
      <ElButton type="primary">
        <slot>导入 Excel</slot>
      </ElButton>
    </ElUpload>
  </div>
</template>

<script setup>
import { readSheet } from 'read-excel-file/universal'

defineOptions({ name: 'ExcelImport' })

const emit = defineEmits(['import-success', 'import-error'])

// 读取首个工作表，首行作表头，转为对象数组（跳过空单元格与空行）
async function importExcel(file) {
  const [header = [], ...rows] = await readSheet(file)
  return rows
    .map((row) => {
      const item = {}
      header.forEach((key, index) => {
        const value = row[index]
        if (key != null && value != null && value !== '') item[key] = value
      })
      return item
    })
    .filter((item) => Object.keys(item).length > 0)
}

// 处理文件导入
const handleFileChange = async (uploadFile) => {
  try {
    if (!uploadFile.raw) return
    const results = await importExcel(uploadFile.raw)
    emit('import-success', results)
  } catch (error) {
    emit('import-error', error)
  }
}
</script>

<style lang="scss" scoped>
.inline-block {
  display: inline-block;
}
</style>
