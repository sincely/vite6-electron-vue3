<template>
  <div class="notification-demo">
    <div class="demo-header">
      <h1>🔔 Electron 通知系统演示</h1>
      <p class="demo-subtitle">
        支持原生 OS 通知 + 应用内 Toast，主进程 & 渲染进程均可使用
      </p>
    </div>

    <div class="demo-grid">
      <!-- 基础通知 -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><SuccessFilled /></el-icon>
            <span>基础通知类型</span>
          </div>
        </template>
        <div class="btn-group">
          <el-button type="success" :icon="SuccessFilled" @click="sendSuccess">
            成功通知
          </el-button>
          <el-button type="warning" :icon="WarningFilled" @click="sendWarning">
            警告通知
          </el-button>
          <el-button type="danger" :icon="CircleCloseFilled" @click="sendError">
            错误通知
          </el-button>
          <el-button type="info" :icon="InfoFilled" @click="sendInfo">
            信息通知
          </el-button>
        </div>
      </el-card>

      <!-- Toast 模式 -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Bell /></el-icon>
            <span>Toast 通知模式</span>
          </div>
        </template>
        <div class="btn-group">
          <el-button type="primary" :icon="Bell" @click="sendToastOnly">
            仅 Toast 通知
          </el-button>
          <el-button
            type="primary"
            :icon="Document"
            @click="sendToastWithLongContent"
          >
            长文本通知
          </el-button>
          <el-button type="primary" :icon="List" @click="sendMultipleToasts">
            连续发送 5 条
          </el-button>
        </div>
      </el-card>

      <!-- 原生通知 -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Promotion /></el-icon>
            <span>系统原生通知</span>
          </div>
        </template>
        <div class="btn-group">
          <el-button type="primary" :icon="Promotion" @click="sendNative">
            原生通知（带回调）
          </el-button>
          <el-button
            type="primary"
            :icon="MuteNotification"
            @click="sendSilent"
          >
            静默通知
          </el-button>
          <el-button type="primary" :icon="Warning" @click="sendCritical">
            紧急通知 (critical)
          </el-button>
        </div>
        <div v-if="nativeResult" class="native-result">
          <el-tag
            :type="nativeResult.success ? 'success' : 'danger'"
            size="small"
          >
            {{
              nativeResult.success
                ? '✓ 原生通知已发送'
                : '✗ 发送失败: ' + nativeResult.error
            }}
          </el-tag>
        </div>
      </el-card>

      <!-- Preload API -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Connection /></el-icon>
            <span>Preload API 调用</span>
          </div>
        </template>
        <div class="btn-group">
          <el-button type="primary" :icon="Connection" @click="sendViaPreload">
            window.notification.show()
          </el-button>
          <el-button :icon="Files" @click="sendViaImport">
            import { showNotification }
          </el-button>
        </div>
        <div class="code-hint">
          <code>window.notification.show({ title, body, onClick })</code>
        </div>
      </el-card>

      <!-- 平台检测 -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Monitor /></el-icon>
            <span>环境 & 平台检测</span>
          </div>
        </template>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">运行环境：</span>
            <el-tag size="small" :type="isMain ? 'warning' : 'success'">
              {{ isMain ? '主进程' : '渲染进程' }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">原生通知支持：</span>
            <el-tag size="small" :type="nativeSupported ? 'success' : 'danger'">
              {{ nativeSupported ? '✓ 支持' : '✗ 不支持' }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 通知中心 -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><ChatDotRound /></el-icon>
            <span>通知中心状态</span>
          </div>
        </template>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">通知总数：</span>
            <el-tag size="small">{{ store.list.length }}</el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">未读数量：</span>
            <el-tag size="small" type="warning">{{ store.unreadCount }}</el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">面板可见：</span>
            <el-tag
              size="small"
              :type="store.panelVisible ? 'success' : 'info'"
            >
              {{ store.panelVisible ? '是' : '否' }}
            </el-tag>
          </div>
        </div>
        <div class="btn-group" style="margin-top: 12px">
          <el-button size="small" @click="store.togglePanel()">
            {{ store.panelVisible ? '关闭' : '打开' }}通知面板
          </el-button>
          <el-button size="small" type="warning" @click="store.markAllRead()">
            全部已读
          </el-button>
          <el-button size="small" type="danger" @click="store.clear()">
            清空通知
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'notification-demo' })
import { ref, computed } from 'vue'
import {
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled,
  InfoFilled,
  Bell,
  Promotion,
  MuteNotification,
  Warning,
  Connection,
  Files,
  Monitor,
  Document,
  List,
  ChatDotRound
} from '@element-plus/icons-vue'
import { useNotificationStore } from '@/store/modules/notification'
import {
  showNotification,
  isNativeNotificationSupported,
  isMain as checkIsMain
} from '../../../shared/notification'

const store = useNotificationStore()
const nativeResult = ref(null)
const isMain = checkIsMain()
const nativeSupported = isNativeNotificationSupported()

// ─── 基础通知类型 ─────────────────────────────────────
const sendSuccess = () => {
  store.push({
    title: '操作成功',
    body: '数据已成功保存到服务器',
    type: 'success'
  })
}

const sendWarning = () => {
  store.push({
    title: '警告提示',
    body: '磁盘空间不足，请及时清理',
    type: 'warning'
  })
}

const sendError = () => {
  store.push({ title: '操作失败', body: '网络连接超时，请重试', type: 'error' })
}

const sendInfo = () => {
  store.push({
    title: '温馨提示',
    body: '系统将于凌晨 2:00 进行维护',
    type: 'info'
  })
}

// ─── Toast 模式 ───────────────────────────────────────
const sendToastOnly = () => {
  store.push({
    title: 'Toast 通知',
    body: '这是一条仅应用内显示的 Toast 通知，不会触发系统原生通知',
    type: 'info'
  })
}

const sendToastWithLongContent = () => {
  store.push({
    title: '长文本通知',
    body: '这是一条包含较长文本内容的通知消息，用于测试 Toast 组件在显示多行文本时的布局效果。超长文本会被自动截断并显示省略号。',
    type: 'info'
  })
}

const sendMultipleToasts = () => {
  const types = ['info', 'success', 'warning', 'error', 'celebrate']
  types.forEach((type, i) => {
    setTimeout(() => {
      store.push({
        title: `通知 #${i + 1}`,
        body: `这是第 ${i + 1} 条连续通知，类型为 ${type}`,
        type
      })
    }, i * 300)
  })
}

// ─── 原生通知 ─────────────────────────────────────────
const sendNative = async () => {
  nativeResult.value = null
  try {
    const result = await showNotification({
      title: '🎉 原生通知测试',
      body: '这是一条系统原生通知，同时应用内也会显示 Toast',
      onClick: () => {
        ElMessage.success('你点击了原生通知！')
      },
      onClose: () => {
        console.log('原生通知已关闭')
      }
    })
    nativeResult.value = { success: true }
  } catch (err) {
    nativeResult.value = { success: false, error: err.message }
  }
}

const sendSilent = async () => {
  await showNotification({
    title: '🔇 静默通知',
    body: '这条通知不会发出提示音',
    silent: true
  })
  ElMessage.info('静默通知已发送')
}

const sendCritical = async () => {
  await showNotification({
    title: '🚨 紧急通知',
    body: '这是一条紧急程度为 critical 的通知（Linux 上可见效果）',
    urgency: 'critical'
  })
  ElMessage.info('紧急通知已发送')
}

// ─── Preload / Import 调用 ────────────────────────────
const sendViaPreload = async () => {
  if (window.notification) {
    await window.notification.show({
      title: 'Preload API',
      body: '通过 window.notification.show() 发送的原生通知',
      onClick: () => {
        ElMessage.success('Preload API 通知被点击！')
      }
    })
    ElMessage.success('已通过 Preload API 发送通知')
  } else {
    ElMessage.warning('window.notification 不可用')
  }
}

const sendViaImport = async () => {
  await showNotification({
    title: 'ES6 Import',
    body: '通过 import { showNotification } 发送的原生通知',
    onClick: () => {
      ElMessage.success('Import API 通知被点击！')
    }
  })
  ElMessage.success('已通过 ES6 Import 发送通知')
}
</script>

<style lang="scss" scoped>
.notification-demo {
  max-width: 1200px;
  height: 100%;
  padding: 24px;
  margin: 0 auto;
  overflow-y: auto;
}

.demo-header {
  margin-bottom: 32px;
  text-align: center;

  h1 {
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .demo-subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.demo-card {
  border-radius: var(--radius-lg);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.card-header {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.info-label {
  color: var(--color-text-secondary);
}

.native-result {
  margin-top: 12px;
}

.code-hint {
  padding: 8px 12px;
  margin-top: 10px;
  font-size: 12px;
  background: var(--color-fill-secondary);
  border-radius: 6px;

  code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: var(--color-primary);
  }
}
</style>
