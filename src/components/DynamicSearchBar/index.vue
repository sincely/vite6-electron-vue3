<template>
  <div class="search-bar glass-card">
    <el-form
      ref="formRef"
      :model="localParams"
      :inline="true"
      label-width="80px"
      size="default"
      class="search-form"
    >
      <!-- 显示项 -->
      <template v-for="item in displayedItems" :key="item.prop">
        <el-form-item :label="item.label" class="search-item">
          <!-- input -->
          <el-input
            v-if="item.type === 'input'"
            v-model="localParams[item.prop]"
            v-bind="item.component"
            :placeholder="`请输入${item.label}`"
            clearable
            @keyup.enter="handleSearch"
          />
          <!-- select -->
          <el-select
            v-else-if="item.type === 'select'"
            v-model="localParams[item.prop]"
            v-bind="item.component"
            :placeholder="item.component?.placeholder || `请选择${item.label}`"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="opt in item.component.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <!-- date-picker -->
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="localParams[item.prop]"
            v-bind="item.component"
            style="width: 100%"
            :placeholder="item.component?.placeholder || `请选择${item.label}`"
            @change="handleSearch"
          />
          <!-- tree-select -->
          <el-tree-select
            v-else-if="item.type === 'tree-select'"
            v-model="localParams[item.prop]"
            v-bind="item.component"
            :placeholder="item.component?.placeholder || `请选择${item.label}`"
            @change="handleSearch"
          />
        </el-form-item>
      </template>

      <!-- 操作按钮 -->
      <el-form-item class="search-actions">
        <el-button type="primary" :icon="Search" @click="handleSearch">
          查询
        </el-button>
        <el-button :icon="RefreshRight" @click="resetAll">重置</el-button>
        <el-button
          v-if="items.length > 3"
          type="primary"
          link
          class="expand-btn"
          @click="toggleExpand"
        >
          {{ isExpanded ? '收起' : '展开' }}
          <SvgIcon
            :icon-class="isExpanded ? 'chevron-up' : 'chevron-down'"
            width="12px"
            height="12px"
            style="margin-left: 4px"
          />
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { RefreshRight, Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  params: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  },
  tableRef: {
    type: Object,
    default: () => ({})
  }
})

// 响应式数据
const localParams = reactive({})
const isExpanded = ref(false)
const userStore = useUserStore()

// 计算显示项（折叠逻辑）
const displayedItems = computed(() => {
  if (isExpanded.value || props.items.length <= 3) {
    return props.items
  }
  return props.items.slice(0, 3)
})

// 同步外部 params
watch(
  () => props.params,
  (newVal) => {
    Object.assign(localParams, newVal)
  },
  { immediate: true, deep: true }
)

// 同步到外部
watch(
  localParams,
  (newVal) => {
    Object.assign(props.params, newVal)
  },
  { deep: true }
)

// 查询
const handleSearch = () => {
  if (props.tableRef?.getList) {
    props.tableRef.getList()
  }
  // 触发事件
  emit('query', { ...localParams })
}

// 重置
const resetAll = () => {
  // 重置为初始值
  for (const key in localParams) {
    localParams[key] = ''
  }
  handleSearch()
  emit('reset')
}

// 切换展开
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 权限指令（示例）
const vHasPermi = {
  mounted: (el, binding) => {
    const { value } = binding
    if (value && !checkPermission(value)) {
      el.style.display = 'none'
    }
  },
  updated: (el, binding) => {
    const { value } = binding
    el.style.display = value && !checkPermission(value) ? 'none' : ''
  }
}

// 兼容 mock 场景下的超级权限和精确权限
const checkPermission = (permi) => {
  const userPermi = userStore.permissions || []
  const hasAllPermission =
    userPermi.includes('*:*:*') || userPermi.includes('*') || !userPermi.length

  if (hasAllPermission) {
    return true
  }

  if (Array.isArray(permi)) {
    return permi.some((p) => userPermi.includes(p))
  }
  return userPermi.includes(permi)
}

const emit = defineEmits(['query', 'reset'])
</script>

<style lang="scss" scoped>
.search-bar {
  padding: 16px 16px 0;
  margin-bottom: 16px;
  background: var(--glass-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-surface-border);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-item {
  width: 280px;
}

.search-actions {
  margin-left: auto;
}

.expand-btn {
  display: flex;
  align-items: center;
  font-weight: 500;
}
</style>
