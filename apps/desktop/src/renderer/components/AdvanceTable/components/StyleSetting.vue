<template>
  <el-popover
    placement="bottom-end"
    trigger="click"
    width="260"
    popper-class="style-setting-popover"
  >
    <template #reference>
      <span class="style-setting-trigger" title="表格样式设置">
        <Icon icon="ri:settings-line" width="18" height="18" />
      </span>
    </template>

    <div class="style-setting">
      <div class="setting-header">
        <span class="setting-title">表格样式</span>
        <el-button type="primary" link @click="reset">重置</el-button>
      </div>
      <el-divider style="margin: 12px 0" />
      <div class="setting-body">
        <div class="setting-style-item">
          <span class="setting-style-label">斑马纹</span>
          <el-switch v-model="localStripe" size="small" />
        </div>
        <div class="setting-style-item">
          <span class="setting-style-label">边框</span>
          <el-switch v-model="localBorder" size="small" />
        </div>
        <div class="setting-style-item">
          <span class="setting-style-label">表头背景</span>
          <el-color-picker
            v-model="localHeaderBg"
            size="small"
            show-alpha
            :predefine="predefineColors"
          />
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  // 是否显示斑马纹
  stripe: {
    type: Boolean,
    default: true
  },
  // 是否显示边框
  border: {
    type: Boolean,
    default: true
  },
  // 表头背景色（空字符串表示使用主题默认背景）
  headerBg: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:stripe', 'update:border', 'update:header-bg'])

// 表格样式初始值备份，用于重置
const initialStyle = {
  stripe: props.stripe,
  border: props.border,
  headerBg: props.headerBg
}

// 表格样式双向绑定
const localStripe = computed({
  get: () => props.stripe,
  set: (val) => emit('update:stripe', val)
})
const localBorder = computed({
  get: () => props.border,
  set: (val) => emit('update:border', val)
})
// 空字符串 -> null（选择器显示为空），清除颜色时回传空字符串
const localHeaderBg = computed({
  get: () => props.headerBg || null,
  set: (val) => emit('update:header-bg', val || '')
})

// 表头背景预设色
const predefineColors = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#fafafa', '#f0f9ff']

const reset = () => {
  emit('update:stripe', initialStyle.stripe)
  emit('update:border', initialStyle.border)
  emit('update:header-bg', initialStyle.headerBg)
}
</script>

<style scoped lang="scss">
.style-setting-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--el-text-color-regular);
  cursor: pointer;
}

.setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  .setting-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.setting-body {
  padding: 0 4px;
}

.setting-style-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;

  .setting-style-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
}
</style>
