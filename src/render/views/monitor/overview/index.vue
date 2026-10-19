<template>
  <div v-loading="loading && !overview" class="monitor-page">
    <PageHeader title="监控总览" subtitle="聚合会话、登录、安全、资源与缓存状态，用于开站前后的稳定性巡检" icon="gauge">
      <template #actions>
        <div class="header-actions">
          <span v-if="overview" class="update-time">更新于 {{ overview.generatedAt }}</span>
          <el-switch v-model="autoRefresh" inline-prompt active-text="自动" inactive-text="手动" />
          <el-button :loading="loading" @click="loadOverview">
            <SvgIcon icon-class="refresh" width="14px" height="14px" />
            <span>刷新</span>
          </el-button>
        </div>
      </template>
    </PageHeader>

    <template v-if="overview">
      <!-- 整体健康 -->
      <section class="health-banner" :class="`is-${overview.health.status}`">
        <div class="health-main">
          <span class="health-dot" />
          <span class="health-title">{{ healthMap[overview.health.status].text }}</span>
          <span class="health-desc">{{ healthMap[overview.health.status].desc }}</span>
        </div>
        <ul v-if="overview.health.alerts.length" class="alert-list">
          <li v-for="alert in overview.health.alerts" :key="alert.message" :class="`is-${alert.level}`">
            {{ alert.message }}
          </li>
        </ul>
      </section>

      <!-- 核心指标 -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">在线会话</span>
          <span class="kpi-value">{{ overview.sessions.online }}</span>
          <span class="kpi-sub">
            {{ overview.sessions.expiringSoon }} 个 1 小时内到期 · 账号总数 {{ overview.sessions.totalUsers }}
          </span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">24h 登录成功率</span>
          <span class="kpi-value" :class="{ 'is-danger': isLowSuccessRate }">
            {{ overview.login.successRate === null ? '-' : `${overview.login.successRate}%` }}
          </span>
          <span class="kpi-sub">
            成功 {{ overview.login.success }} · 失败 {{ overview.login.failed }} · 活跃账号
            {{ overview.login.activeUsers }}
          </span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">锁定账号</span>
          <span class="kpi-value" :class="{ 'is-warning': overview.security.lockedCount > 0 }">
            {{ overview.security.lockedCount }}
          </span>
          <span class="kpi-sub">近 1 小时失败登录 {{ overview.login.failedLastHour }} 次</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">系统内存</span>
          <span class="kpi-value" :class="{ 'is-warning': memoryPercent >= 90 }">{{ memoryPercent }}%</span>
          <span class="kpi-sub">
            已用 {{ formatBytes(memory.systemTotal - memory.systemFree) }} / {{ formatBytes(memory.systemTotal) }}
          </span>
        </div>
      </section>

      <div class="panel-grid">
        <!-- 登录趋势 -->
        <section class="panel panel-wide">
          <header class="panel-header">
            <h3>近 24 小时登录趋势</h3>
            <div class="legend">
              <span>
                <i class="dot is-success" />
                成功
              </span>
              <span>
                <i class="dot is-danger" />
                失败
              </span>
            </div>
          </header>
          <div class="trend">
            <div
              v-for="item in overview.login.trend"
              :key="item.time"
              class="trend-col"
              :title="`${item.time.slice(5, 16)}  成功 ${item.success} / 失败 ${item.failed}`"
            >
              <div class="trend-bars">
                <span class="bar is-danger" :style="{ height: barHeight(item.failed) }" />
                <span class="bar is-success" :style="{ height: barHeight(item.success) }" />
              </div>
              <span class="trend-label">{{ item.label.slice(0, 2) }}</span>
            </div>
          </div>
        </section>

        <!-- 安全 -->
        <section class="panel">
          <header class="panel-header">
            <h3>安全态势</h3>
          </header>
          <div class="sub-title">锁定账号</div>
          <ul v-if="overview.security.lockedAccounts.length" class="plain-list">
            <li v-for="item in overview.security.lockedAccounts" :key="item.username">
              <span class="strong">{{ item.username }}</span>
              <span class="text-muted">{{ formatDuration(item.retryAfter) }}后解锁</span>
            </li>
          </ul>
          <div v-else class="empty-tip">暂无锁定账号</div>

          <div class="sub-title">高频失败 IP（24h ≥ 3 次）</div>
          <ul v-if="overview.security.suspiciousIps.length" class="plain-list">
            <li v-for="item in overview.security.suspiciousIps" :key="item.ipAddress">
              <span class="strong">{{ item.ipAddress }}</span>
              <span class="text-danger">{{ item.failed }} 次</span>
            </li>
          </ul>
          <div v-else class="empty-tip">暂无可疑来源</div>
        </section>

        <!-- 最近失败 -->
        <section class="panel panel-wide">
          <header class="panel-header">
            <h3>最近失败登录</h3>
          </header>
          <el-table v-if="overview.login.recentFailures.length" :data="overview.login.recentFailures" size="small">
            <el-table-column prop="createTime" label="时间" min-width="160" />
            <el-table-column prop="username" label="账号" min-width="110" show-overflow-tooltip />
            <el-table-column prop="ipAddress" label="来源 IP" min-width="130" show-overflow-tooltip />
            <el-table-column prop="location" label="归属地" min-width="110" show-overflow-tooltip />
            <el-table-column prop="message" label="原因" min-width="160" show-overflow-tooltip />
          </el-table>
          <div v-else class="empty-tip">近期没有失败登录记录</div>
        </section>

        <!-- 服务依赖 -->
        <section class="panel">
          <header class="panel-header">
            <h3>服务依赖</h3>
          </header>
          <ul class="plain-list">
            <li>
              <span class="strong">MySQL</span>
              <span class="status-pill" :class="`is-${serviceTone(resources.mysql?.status)}`">
                {{ serviceText(resources.mysql?.status) }}
                <template v-if="resources.mysql?.latency != null">· {{ resources.mysql.latency }}ms</template>
              </span>
            </li>
            <li>
              <span class="strong">Redis</span>
              <span class="status-pill" :class="`is-${serviceTone(resources.redis?.status)}`">
                {{ serviceText(resources.redis?.status) }}
                <template v-if="resources.redis?.latency != null">· {{ resources.redis.latency }}ms</template>
              </span>
            </li>
            <li v-if="resources.mysql?.pool?.total != null">
              <span class="text-muted">MySQL 连接池</span>
              <span>空闲 {{ resources.mysql.pool.free }} / 共 {{ resources.mysql.pool.total }}</span>
            </li>
          </ul>
          <div v-if="resources.mysql?.error || resources.redis?.error" class="error-text">
            {{ resources.mysql?.error || resources.redis?.error }}
          </div>
        </section>

        <!-- 运行资源 -->
        <section class="panel panel-wide">
          <header class="panel-header">
            <h3>运行资源</h3>
          </header>
          <div class="meter-grid">
            <div class="meter">
              <div class="meter-head">
                <span>系统内存</span>
                <span>{{ memoryPercent }}%</span>
              </div>
              <el-progress :percentage="memoryPercent" :show-text="false" :status="progressStatus(memoryPercent)" />
            </div>
            <div class="meter">
              <div class="meter-head">
                <span>CPU 负载（1 分钟 / {{ resources.cpuCount }} 核）</span>
                <span>{{ resources.loadPercent ?? 0 }}%</span>
              </div>
              <el-progress
                :percentage="resources.loadPercent ?? 0"
                :show-text="false"
                :status="progressStatus(resources.loadPercent ?? 0)"
              />
            </div>
            <div class="meter">
              <div class="meter-head">
                <span>进程堆内存</span>
                <span>{{ formatBytes(memory.heapUsed) }} / {{ formatBytes(memory.heapTotal) }}</span>
              </div>
              <el-progress :percentage="heapPercent" :show-text="false" />
            </div>
          </div>
          <dl class="info-grid">
            <div>
              <dt>运行时长</dt>
              <dd>{{ formatDuration(resources.uptime) }}</dd>
            </div>
            <div>
              <dt>进程 RSS</dt>
              <dd>{{ formatBytes(memory.rss) }}</dd>
            </div>
            <div>
              <dt>Node 版本</dt>
              <dd>{{ resources.nodeVersion || '-' }}</dd>
            </div>
            <div>
              <dt>平台 / PID</dt>
              <dd>{{ resources.platform || '-' }} / {{ resources.pid ?? '-' }}</dd>
            </div>
            <div>
              <dt>负载均值</dt>
              <dd>{{ (resources.loadAvg || []).join(' / ') || '-' }}</dd>
            </div>
          </dl>
        </section>

        <!-- 缓存 -->
        <section class="panel">
          <header class="panel-header">
            <h3>缓存状态</h3>
            <span class="status-pill" :class="`is-${serviceTone(cache.status)}`">{{ serviceText(cache.status) }}</span>
          </header>
          <template v-if="cache.enabled && cache.groups.length">
            <dl class="info-grid is-compact">
              <div>
                <dt>总 Key 数</dt>
                <dd>{{ cache.dbSize }}</dd>
              </div>
              <div>
                <dt>已用内存</dt>
                <dd>{{ formatBytes(cache.usedMemory) }}</dd>
              </div>
              <div>
                <dt>命中率</dt>
                <dd>{{ cache.hitRate === null ? '-' : `${cache.hitRate}%` }}</dd>
              </div>
            </dl>
            <ul class="plain-list">
              <li v-for="group in cache.groups" :key="group.key">
                <span class="text-muted">{{ group.label }}</span>
                <span class="strong">{{ group.count }}{{ group.capped ? '+' : '' }}</span>
              </li>
            </ul>
          </template>
          <div v-else-if="!cache.enabled" class="empty-tip">Redis 未启用，会话与缓存直接使用数据库</div>
          <div v-else class="empty-tip">{{ cache.error || 'Redis 不可用，缓存已降级' }}</div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
defineOptions({ name: 'monitor-overview' })
import { ElMessage } from 'element-plus'
import { getMonitorOverview } from '@/api/monitor'

const REFRESH_INTERVAL = 30_000

const healthMap = {
  healthy: { text: '运行正常', desc: '各项指标处于健康范围' },
  warning: { text: '存在告警', desc: '建议在开站前处理以下事项' },
  danger: { text: '存在故障', desc: '关键依赖异常，请立即排查' }
}

const loading = ref(false)
const overview = ref(null)
const autoRefresh = ref(true)

const resources = computed(() => overview.value?.resources || {})
const memory = computed(() => resources.value.memory || {})
const cache = computed(() => overview.value?.cache || { groups: [] })

const memoryPercent = computed(() => memory.value.systemUsedPercent ?? 0)
const heapPercent = computed(() =>
  memory.value.heapTotal ? Math.round((memory.value.heapUsed / memory.value.heapTotal) * 100) : 0
)
const isLowSuccessRate = computed(() => {
  const login = overview.value?.login
  return !!login && login.total >= 10 && login.successRate !== null && login.successRate < 50
})

const trendMax = computed(() =>
  Math.max(1, ...(overview.value?.login.trend || []).map((item) => item.success + item.failed))
)
const barHeight = (value) => `${(value / trendMax.value) * 100}%`

const formatBytes = (bytes) => {
  const value = Number(bytes) || 0
  if (value < 1024) return `${value} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let size = value / 1024
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[index]}`
}

const formatDuration = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  if (days) return `${days} 天 ${hours} 小时`
  if (hours) return `${hours} 小时 ${minutes} 分`
  if (minutes) return `${minutes} 分钟`
  return `${total} 秒`
}

const serviceTone = (status) => {
  if (status === 'up') return 'success'
  if (status === 'degraded') return 'warning'
  if (status === 'down') return 'danger'
  return 'muted'
}

const serviceText = (status) =>
  ({ up: '正常', degraded: '响应异常', down: '不可用', disabled: '未启用' })[status] || '未知'

const progressStatus = (percent) => (percent >= 90 ? 'exception' : percent >= 75 ? 'warning' : undefined)

const loadOverview = async () => {
  loading.value = true
  try {
    overview.value = await getMonitorOverview()
  } catch (error) {
    ElMessage.error(error?.message || '获取监控数据失败')
  } finally {
    loading.value = false
  }
}

let timer = null
const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
const startTimer = () => {
  stopTimer()
  if (autoRefresh.value) {
    timer = setInterval(loadOverview, REFRESH_INTERVAL)
  }
}

watch(autoRefresh, startTimer)

// keep-alive 场景：首次进入由 onMounted 加载，再次激活时刷新并恢复定时器
let mounted = false
onMounted(() => {
  mounted = true
  loadOverview()
  startTimer()
})
onActivated(() => {
  if (!mounted) return
  loadOverview()
  startTimer()
})
onDeactivated(stopTimer)
onBeforeUnmount(stopTimer)
</script>

<style scoped lang="scss">
.monitor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  padding: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;

  .update-time {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.text-muted {
  color: var(--color-text-muted);
}

.text-danger {
  font-weight: 600;
  color: var(--color-danger);
}

.strong {
  font-weight: 600;
  color: var(--color-text-primary);
}

// 整体健康横幅
.health-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-left-width: 4px;
  border-radius: var(--radius-lg);

  .health-main {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .health-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .health-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .health-desc {
    font-size: 13px;
    color: var(--color-text-muted);
  }

  &.is-healthy {
    border-left-color: var(--color-success);

    .health-dot {
      background: var(--color-success);
    }
  }

  &.is-warning {
    border-left-color: var(--color-warning);

    .health-dot {
      background: var(--color-warning);
    }
  }

  &.is-danger {
    border-left-color: var(--color-danger);

    .health-dot {
      background: var(--color-danger);
    }
  }
}

.alert-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    padding: 2px 12px;
    font-size: 12px;
    border-radius: 20px;

    &.is-danger {
      color: var(--color-danger);
      background: var(--color-rose-soft);
    }

    &.is-warning {
      color: var(--color-amber);
      background: var(--color-amber-soft);
    }

    &.is-info {
      color: var(--color-info);
      background: var(--color-bg-input);
    }
  }
}

// KPI
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  .kpi-label {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .kpi-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text-primary);

    &.is-warning {
      color: var(--color-warning);
    }

    &.is-danger {
      color: var(--color-danger);
    }
  }

  .kpi-sub {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

// 面板网格
.panel-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  .panel-wide {
    grid-column: span 2;
  }
}

@media (width <= 1100px) {
  .panel-grid {
    grid-template-columns: minmax(0, 1fr);

    .panel-wide {
      grid-column: auto;
    }
  }
}

.panel {
  min-width: 0;
  padding: 16px 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.legend {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-muted);

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 4px;
    border-radius: 2px;

    &.is-success {
      background: var(--color-success);
    }

    &.is-danger {
      background: var(--color-danger);
    }
  }
}

// 登录趋势柱状图
.trend {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 160px;

  .trend-col {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
    height: 100%;
  }

  .trend-bars {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-end;
    min-height: 0;
  }

  .bar {
    display: block;
    min-height: 0;

    &.is-success {
      background: var(--color-success);
      border-radius: 3px 3px 0 0;
    }

    &.is-danger {
      background: var(--color-danger);
    }
  }

  .trend-label {
    font-size: 10px;
    color: var(--color-text-muted);
    text-align: center;
  }
}

.sub-title {
  margin: 12px 0 6px;
  font-size: 12px;
  color: var(--color-text-muted);

  &:first-of-type {
    margin-top: 0;
  }
}

.plain-list {
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 0;
    font-size: 13px;
    color: var(--color-text-secondary);
    border-bottom: 1px dashed var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }
}

.empty-tip {
  padding: 12px 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.error-text {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-danger);
  word-break: break-all;
}

.status-pill {
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;

  &.is-success {
    color: var(--color-success);
    background: var(--color-teal-soft);
  }

  &.is-warning {
    color: var(--color-amber);
    background: var(--color-amber-soft);
  }

  &.is-danger {
    color: var(--color-danger);
    background: var(--color-rose-soft);
  }

  &.is-muted {
    color: var(--color-text-muted);
    background: var(--color-bg-input);
  }
}

// 资源仪表
.meter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px 24px;
}

.meter-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px 16px;
  margin: 16px 0 0;

  &.is-compact {
    margin: 0 0 8px;
  }

  dt {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  dd {
    margin: 2px 0 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    word-break: break-all;
  }
}
</style>
