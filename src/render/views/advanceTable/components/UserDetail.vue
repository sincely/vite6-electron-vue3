<template>
  <div class="user-detail">
    <!-- 用户头部 -->
    <div class="user-detail-header">
      <div class="user-avatar-lg" :style="{ background: row.avatar }">
        {{ row.initial }}
      </div>
      <div class="user-meta">
        <div class="user-name-row">
          <h3 class="user-detail-name">{{ row.name }}</h3>
          <span class="status-tag" :class="`status-${row.status}`">
            <span class="status-dot"></span>
            {{ row.statusLabel }}
          </span>
        </div>
        <p class="user-detail-role">{{ row.role }} · {{ row.department }}</p>
        <p class="user-detail-email">{{ row.email }}</p>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="user-detail-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <!-- 基本信息 -->
      <div v-if="activeTab === 'info'" class="info-grid">
        <div class="info-item">
          <span class="info-label">手机号码</span>
          <span class="info-value">{{ row.phone }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱地址</span>
          <span class="info-value">{{ row.email }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">所属部门</span>
          <span class="info-value">{{ row.department }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">职位角色</span>
          <span class="info-value">{{ row.role }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">入职日期</span>
          <span class="info-value mono">{{ row.joinDate }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">最近登录</span>
          <span class="info-value mono">{{ row.lastLogin }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">参与项目</span>
          <span class="info-value">{{ row.projects }} 个</span>
        </div>
        <div class="info-item">
          <span class="info-label">绩效评分</span>
          <div class="performance-bar-wrap">
            <div
              class="performance-bar"
              :class="performanceClass"
              :style="{ width: row.performance + '%' }"
            ></div>
            <span class="performance-text">{{ row.performance }}%</span>
          </div>
        </div>
      </div>

      <!-- 操作记录 -->
      <div v-else-if="activeTab === 'logs'" class="log-list">
        <div v-for="log in mockLogs" :key="log.id" class="log-item">
          <div class="log-icon" :class="`log-${log.type}`">
            <SvgIcon :icon-class="log.icon" width="14px" height="14px" />
          </div>
          <div class="log-info">
            <span class="log-text">{{ log.text }}</span>
            <span class="log-time">{{ log.time }}</span>
          </div>
        </div>
      </div>

      <!-- 权限设置 -->
      <div v-else-if="activeTab === 'permissions'" class="perm-list">
        <div v-for="perm in mockPermissions" :key="perm.id" class="perm-item">
          <div class="perm-info">
            <span class="perm-name">{{ perm.name }}</span>
            <span class="perm-desc">{{ perm.desc }}</span>
          </div>
          <span class="perm-badge" :class="{ granted: perm.granted }">
            {{ perm.granted ? '已授权' : '未授权' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  row: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const tabs = [
  { id: 'info', label: '基本信息' },
  { id: 'logs', label: '操作记录' },
  { id: 'permissions', label: '权限设置' }
]

const activeTab = ref('info')

const performanceClass = computed(() => {
  const v = props.row.performance
  if (v >= 90) return 'perf-excellent'
  if (v >= 75) return 'perf-good'
  return 'perf-average'
})

const mockLogs = [
  {
    id: 1,
    type: 'login',
    icon: 'online',
    text: '登录系统',
    time: '2024-06-15 09:32:11'
  },
  {
    id: 2,
    type: 'edit',
    icon: 'file-text',
    text: '修改个人资料 - 更新手机号码',
    time: '2024-06-14 16:45:03'
  },
  {
    id: 3,
    type: 'create',
    icon: 'plus',
    text: '创建新项目 "Q3 产品规划"',
    time: '2024-06-13 11:20:45'
  },
  {
    id: 4,
    type: 'login',
    icon: 'online',
    text: '登录系统',
    time: '2024-06-13 08:55:22'
  },
  {
    id: 5,
    type: 'delete',
    icon: 'close',
    text: '删除过期文档 "旧版需求说明"',
    time: '2024-06-12 17:10:38'
  },
  {
    id: 6,
    type: 'edit',
    icon: 'file-text',
    text: '更新项目进度 "用户管理系统"',
    time: '2024-06-11 14:22:56'
  }
]

const mockPermissions = [
  {
    id: 1,
    name: '用户管理',
    desc: '查看、创建、编辑和删除用户',
    granted: true
  },
  { id: 2, name: '角色管理', desc: '管理系统角色和权限分配', granted: true },
  {
    id: 3,
    name: '数据导出',
    desc: '导出系统数据为 Excel / CSV',
    granted: true
  },
  { id: 4, name: '系统设置', desc: '修改系统全局配置参数', granted: false },
  { id: 5, name: '审计日志', desc: '查看系统操作审计日志', granted: false },
  { id: 6, name: 'API 密钥', desc: '管理第三方 API 集成密钥', granted: false }
]

const onOk = () => {
  console.log('确认操作')
}
const onCancel = () => {
  console.log('取消操作')
}
defineExpose({ onOk, onCancel })
</script>

<style lang="scss" scoped>
.user-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// Header
.user-detail-header {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
}

.user-avatar-lg {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 64px;
  height: 64px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-detail-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.user-detail-role {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.user-detail-email {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-text-muted);
}

// Status tag
.status-tag {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.status-active {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success), transparent 90%);

    .status-dot {
      background: var(--color-success);
    }
  }

  &.status-inactive {
    color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning), transparent 90%);

    .status-dot {
      background: var(--color-warning);
    }
  }

  &.status-disabled {
    color: var(--color-text-muted);
    background: var(--color-bg-hover);

    .status-dot {
      background: var(--color-text-muted);
    }
  }
}

// Tabs
.user-detail-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--color-bg-input);
  border-radius: 10px;
}

.tab-item {
  flex: 1;
  height: 34px;
  font-size: 13px;
  font-weight: 500;
  line-height: 34px;
  color: var(--color-text-secondary);
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover:not(.active) {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  &.active {
    font-weight: 600;
    color: var(--color-text-primary);
    background: var(--color-bg-card);
    box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
  }
}

// Tab content
.tab-content {
  min-height: 200px;
}

// Info grid
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
}

.info-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);

  &.mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }
}

// Performance bar
.performance-bar-wrap {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 20px;
}

.performance-bar {
  height: 6px;
  border-radius: 3px;
  transition: width 0.6s ease;

  &.perf-excellent {
    background: var(--color-success);
  }

  &.perf-good {
    background: var(--color-primary);
  }

  &.perf-average {
    background: var(--color-warning);
  }
}

.performance-text {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

// Log list
.log-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: var(--color-bg-hover);
  }
}

.log-icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;

  &.log-login {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
  }

  &.log-edit {
    color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning), transparent 90%);
  }

  &.log-create {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success), transparent 90%);
  }

  &.log-delete {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger), transparent 90%);
  }
}

.log-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.log-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.log-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--color-text-muted);
}

// Permission list
.perm-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.perm-item {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: var(--color-bg-hover);
  }
}

.perm-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.perm-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.perm-desc {
  font-size: 11px;
  color: var(--color-text-muted);
}

.perm-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg-input);
  border-radius: 999px;

  &.granted {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success), transparent 90%);
  }
}
</style>
