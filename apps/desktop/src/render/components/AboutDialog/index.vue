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
      0 0 0 1px var(--color-border-lighter);
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
    color: var(--color-text-secondary);
  }

  &__value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    text-align: right;
    word-break: break-all;
  }
}

.about-subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
}

.about-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}
</style>
