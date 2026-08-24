<template>
  <ModalDialog v-model="visible" width="340px" @close="handleClose">
    <div class="about-body">
      <div class="about-logo">
        <img class="about-logo__img" :src="logoUrl" alt="logo" />
      </div>
      <div v-if="subtitle" class="about-subtitle">{{ subtitle }}</div>
      <div v-for="row in rows" :key="row.key" class="about-row">
        <span class="about-row__label">{{ row.label }}</span>
        <span class="about-row__value" :title="row.value">
          {{ row.value || '—' }}
        </span>
      </div>
    </div>
  </ModalDialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const buildInfo = ref({
  name: '',
  version: '',
  commitHash: '',
  buildDate: ''
})

const rows = ref([
  { key: 'version', label: '版本', value: '' },
  { key: 'commitHash', label: '提交', value: '' },
  { key: 'buildDate', label: '日期', value: '' }
])

const subtitle = computed(() => buildInfo.value.name || '')
const hasValue = computed(() => rows.value.some((row) => row.value))
const logoUrl = '/app.png'

const hydrate = async () => {
  if (!window.ipcRenderer?.invoke) return
  try {
    const info = await window.ipcRenderer.invoke('get-app-build-info')
    buildInfo.value = {
      name: info?.name || '',
      version: info?.version || '',
      commitHash: info?.commitHash || '',
      buildDate: info?.buildDate || ''
    }
    const map = {
      version: buildInfo.value.version,
      commitHash: buildInfo.value.commitHash,
      buildDate: buildInfo.value.buildDate
    }
    rows.value = rows.value.map((row) => ({
      ...row,
      value: map[row.key] || ''
    }))
  } catch (err) {
    console.error('[AboutDialog] 获取构建信息失败', err)
  }
}

const open = async () => {
  visible.value = true
  await hydrate()
}

const handleClose = () => {
  visible.value = false
}

const handleCopy = async () => {
  const text = rows.value
    .filter((row) => row.value)
    .map((row) => `${row.label}：${row.value}`)
    .join('\n')
  if (!text) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    console.error('[AboutDialog] 复制失败', err)
    ElMessage.error('复制失败，请手动选择')
  }
}

// 主进程菜单「关于」→ menu-about → 打开本弹窗
const onMenuAbout = () => open()

onMounted(() => {
  window.ipcRenderer?.on('menu-about', onMenuAbout)
})

onUnmounted(() => {
  window.ipcRenderer?.off('menu-about', onMenuAbout)
})

defineExpose({ open })
</script>

<style lang="scss" scoped>
.about-body {
  padding: 6px 4px 4px;
}

.about-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  &__img {
    width: 62px;
    height: 62px;
    object-fit: contain;
    border-radius: 16px;
    box-shadow:
      0 6px 18px rgb(0 0 0 / 8%),
      0 0 0 1px var(--color-border-lighter, #ebeef5);
  }
}

.about-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 4px;

  &:last-of-type {
    border-bottom: none;
  }

  &__label {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--color-text-secondary, #606266);
  }

  &__value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary, #303133);
    text-align: right;
    word-break: break-all;
  }
}

.about-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-text-secondary, #909399);
  text-align: center;
}

.about-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}
</style>
