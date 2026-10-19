<template>
  <div class="system-page">
    <PageHeader
      title="在线用户"
      subtitle="查看当前在线会话、设备指纹与最近活跃时间，支持按会话强制下线"
      icon="online"
    />

    <DynamicSearchBar :items="searchItems" :params="searchParams" @query="handleQuery" @reset="handleReset" />

    <AdvanceTable
      ref="tableRef"
      :columns="columns"
      :func="getOnlineUserList"
      :params="searchParams"
      :config="tableConfig"
    >
      <template #account="{ row }">
        <div class="account-cell">
          <span class="account-avatar">{{ (row.nickname || row.username).slice(0, 1).toUpperCase() }}</span>
          <div class="account-info">
            <div class="account-name">
              <span>{{ row.username }}</span>
              <el-tag v-if="row.isCurrent" size="small" type="success" effect="light" round>当前会话</el-tag>
            </div>
            <div class="account-sub">
              <span v-if="row.nickname" class="text-muted">{{ row.nickname }}</span>
              <el-tag v-for="role in row.roleNames.slice(0, 2)" :key="role" size="small" effect="plain" round>
                {{ role }}
              </el-tag>
              <el-tooltip v-if="row.roleNames.length > 2" :content="row.roleNames.slice(2).join('、')">
                <el-tag size="small" type="info" effect="plain" round>+{{ row.roleNames.length - 2 }}</el-tag>
              </el-tooltip>
            </div>
          </div>
        </div>
      </template>

      <template #device="{ row }">
        <el-tooltip :content="row.userAgent || '无 User-Agent'" placement="top" :show-after="300">
          <div class="device-cell">
            <span class="device-name">{{ row.browser || 'Unknown' }} · {{ row.os || 'Unknown' }}</span>
            <code class="code-chip">{{ row.deviceFingerprint }}</code>
          </div>
        </el-tooltip>
      </template>

      <template #ip="{ row }">
        <div class="ip-cell">
          <span>{{ row.ipAddress || '-' }}</span>
          <span class="text-muted">{{ row.location || '-' }}</span>
        </div>
      </template>

      <template #lastActiveTime="{ row }">
        <span class="status-badge" :class="`is-${activeLevel(row)}`">
          <span class="status-dot" />
          {{ row.lastActiveTime || '-' }}
        </span>
      </template>

      <template #action="{ row }">
        <div class="table-action">
          <el-tooltip v-if="row.isCurrent" content="不能强制下线当前登录会话">
            <span>
              <el-button v-permission="'monitor:online:kick'" link type="danger" size="small" disabled>
                强制下线
              </el-button>
            </span>
          </el-tooltip>
          <el-button
            v-else
            v-permission="'monitor:online:kick'"
            link
            type="danger"
            size="small"
            @click="handleForceLogout(row)"
          >
            强制下线
          </el-button>
        </div>
      </template>
    </AdvanceTable>
  </div>
</template>

<script setup>
defineOptions({ name: 'monitor-online' })
import { forceLogoutSession, getOnlineUserList } from '@/api/monitor'

const tableRef = ref()

const searchParams = reactive({
  username: '',
  ipAddress: ''
})

const tableConfig = {
  requestDelay: 200,
  table: {
    rowKey: 'sessionId',
    highlightCurrentRow: true
  },
  pagination: {
    pageSizes: [10, 20, 50]
  }
}

const columns = [
  { type: 'index', label: '序号', width: 70, align: 'center' },
  { prop: 'username', label: '账号', minWidth: 240, slot: 'account' },
  { prop: 'device', label: '设备 / 指纹', minWidth: 240, slot: 'device' },
  { prop: 'ipAddress', label: '登录 IP / 归属地', minWidth: 180, slot: 'ip' },
  { prop: 'loginTime', label: '登录时间', minWidth: 170, align: 'center', showOverflowTooltip: true },
  { prop: 'lastActiveTime', label: '最近活跃', minWidth: 210, align: 'center', slot: 'lastActiveTime' },
  { prop: 'expireTime', label: '会话过期', minWidth: 170, align: 'center', showOverflowTooltip: true },
  { label: '操作', width: 110, align: 'center', slot: 'action', fixed: 'right' }
]

const searchItems = [
  { prop: 'username', label: '用户名', type: 'input' },
  { prop: 'ipAddress', label: '登录 IP', type: 'input' }
]

// 5 分钟内为活跃，30 分钟内为空闲，其余为长时间无操作
const activeLevel = (row) => {
  const ts = Date.parse(String(row.lastActiveTime || '').replace(' ', 'T'))
  if (Number.isNaN(ts)) return 'idle'
  const diff = Date.now() - ts
  if (diff <= 5 * 60 * 1000) return 'active'
  if (diff <= 30 * 60 * 1000) return 'idle'
  return 'stale'
}

const handleQuery = () => {
  tableRef.value?.getList()
}

const handleReset = () => {
  tableRef.value?.resetQuery()
}

const handleForceLogout = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认强制下线账号「${row.username}」的该会话？对方将在下一次请求时被退出登录。`,
      '强制下线',
      { type: 'warning', confirmButtonText: '确定下线', cancelButtonText: '取消' }
    )
  } catch {
    return
  }

  try {
    await forceLogoutSession({ sessionId: row.sessionId })
    ElMessage.success('已强制下线')
  } catch (error) {
    ElMessage.error(error?.message || '强制下线失败')
  }
  tableRef.value?.getList()
}
</script>

<style scoped lang="scss">
.system-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.text-muted {
  color: var(--color-text-muted);
}

.account-cell {
  display: flex;
  gap: 10px;
  align-items: center;

  .account-avatar {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 32px;
    height: 32px;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-indigo);
    background: var(--color-indigo-soft);
    border-radius: 50%;
  }

  .account-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .account-name {
    display: flex;
    gap: 6px;
    align-items: center;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .account-sub {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    font-size: 12px;
  }
}

.device-cell,
.ip-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.ip-cell {
  font-size: 13px;

  .text-muted {
    font-size: 12px;
  }
}

.device-name {
  font-size: 13px;
  color: var(--color-text-primary);
}

.code-chip {
  padding: 1px 8px;
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  color: var(--color-violet);
  background: var(--color-violet-soft);
  border-radius: 6px;
}

.status-badge {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.is-active {
    color: var(--color-success);
    background: var(--color-teal-soft);

    .status-dot {
      background: var(--color-success);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success), transparent 75%);
    }
  }

  &.is-idle {
    color: var(--color-amber);
    background: var(--color-amber-soft);

    .status-dot {
      background: var(--color-amber);
    }
  }

  &.is-stale {
    color: var(--color-text-muted);
    background: var(--color-bg-input);

    .status-dot {
      background: var(--color-text-muted);
    }
  }
}
</style>
