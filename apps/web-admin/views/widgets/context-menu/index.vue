<!-- 组件中心 - 右键菜单 -->
<template>
  <div class="context-menu-page">
    <PageHeader
      title="右键菜单"
      subtitle="自定义右键上下文菜单，支持子菜单、分割线与禁用项"
      icon="list"
    />

    <ElCard class="page-card">
      <div class="trigger-area">
        <ElButton @contextmenu.prevent="showMenu">右键触发菜单</ElButton>
        <p v-if="lastAction" class="last-action">最近操作：{{ lastAction }}</p>
      </div>
    </ElCard>

    <!-- 右键菜单组件 -->
    <ContextMenu
      ref="menuRef"
      :menu-items="menuItems"
      :menu-width="180"
      :submenu-width="140"
      :border-radius="10"
      @select="handleSelect"
      @show="onMenuShow"
      @hide="onMenuHide"
    />
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WidgetsContextMenu' })

const menuRef = ref()
const lastAction = ref('')

/**
 * 右键菜单选项配置
 */
const menuItems = computed(() => [
  {
    key: 'copy',
    label: '复制',
    icon: 'ri:file-copy-line'
  },
  {
    key: 'paste',
    label: '粘贴',
    icon: 'ri:capsule-line'
  },
  {
    key: 'cut',
    label: '剪切',
    icon: 'ri:clipboard-line',
    showLine: true
  },
  {
    key: 'export',
    label: '导出选项',
    icon: 'ri:export-line',
    children: [
      {
        key: 'exportExcel',
        label: '导出 Excel',
        icon: 'ri:file-excel-2-line'
      },
      {
        key: 'exportPdf',
        label: '导出 PDF',
        icon: 'ri:file-pdf-2-line'
      }
    ]
  },
  {
    key: 'edit',
    label: '编辑选项',
    icon: 'ri:edit-2-line',
    children: [
      {
        key: 'rename',
        label: '重命名'
      },
      {
        key: 'duplicate',
        label: '复制副本'
      }
    ]
  },
  {
    key: 'share',
    label: '分享',
    icon: 'ri:share-forward-line',
    showLine: true
  },
  {
    key: 'delete',
    label: '删除',
    icon: 'ri:delete-bin-line'
  },
  {
    key: 'disabled',
    label: '禁用选项',
    icon: 'ri:close-circle-line',
    disabled: true
  }
])

/**
 * 处理菜单项选择
 */
const handleSelect = (item) => {
  lastAction.value = `${item.label} (${item.key})`
  ElMessage.success(`执行操作: ${item.label}`)
}

/**
 * 显示右键菜单
 */
const showMenu = (e) => {
  e.preventDefault()
  e.stopPropagation()

  nextTick(() => {
    menuRef.value?.show(e)
  })
}

const onMenuShow = () => {
  console.log('菜单显示')
}

const onMenuHide = () => {
  console.log('菜单隐藏')
}
</script>

<style lang="scss" scoped>
.context-menu-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.trigger-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;

  .last-action {
    margin: 0;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}
</style>
