<template>
  <div class="request-demo">
    <div class="demo-header">
      <h1>🚀 请求规范演示</h1>
      <p class="demo-subtitle">
        调用方只传普通对象，
        <code>@/utils/request</code>
        统一构造请求体并归一化响应；业务层无需关心网络层细节
      </p>
    </div>

    <el-card class="env-card" shadow="never">
      <div class="env-row">
        <span class="env-label">当前请求通道</span>
        <el-tag type="success" size="default">
          {{ modeLabel }}
        </el-tag>
        <span class="env-label">数据流</span>
        <code class="env-flow">{{ dataFlow }}</code>
      </div>
    </el-card>

    <div class="demo-grid">
      <!-- JSON POST -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Postcard /></el-icon>
            <span>JSON 请求</span>
            <el-tag size="small" type="info">
              Content-Type: application/json
            </el-tag>
          </div>
        </template>
        <el-form :model="jsonForm" label-width="80px" size="default">
          <el-form-item label="用户名">
            <el-input v-model="jsonForm.username" placeholder="admin" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="jsonForm.password"
              type="password"
              placeholder="123456"
              show-password
            />
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          :icon="Postcard"
          :loading="loading.json"
          @click="handleJsonLogin"
        >
          发起 JSON 登录
        </el-button>
        <ResponsePanel :response="lastResponse.json" />
      </el-card>

      <!-- 表单 POST -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Tickets /></el-icon>
            <span>表单请求</span>
            <el-tag size="small" type="info">
              application/x-www-form-urlencoded
            </el-tag>
          </div>
        </template>
        <el-form :model="formPayload" label-width="80px" size="default">
          <el-form-item label="用户名">
            <el-input v-model="formPayload.username" placeholder="admin" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="formPayload.password"
              type="password"
              placeholder="123456"
              show-password
            />
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          :icon="Tickets"
          :loading="loading.form"
          @click="handleFormLogin"
        >
          发起表单登录
        </el-button>
        <ResponsePanel :response="lastResponse.form" />
      </el-card>

      <!-- GET 带参 -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><Search /></el-icon>
            <span>GET 带查询参数</span>
            <el-tag size="small" type="info">?pageNum=1&pageSize=5</el-tag>
          </div>
        </template>
        <el-form :model="queryForm" label-width="80px" size="default">
          <el-form-item label="页码">
            <el-input-number v-model="queryForm.pageNum" :min="1" />
          </el-form-item>
          <el-form-item label="每页">
            <el-input-number v-model="queryForm.pageSize" :min="1" :max="50" />
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          :icon="Search"
          :loading="loading.list"
          @click="handleList"
        >
          查询表格数据
        </el-button>
        <ResponsePanel :response="lastResponse.list" />
      </el-card>

      <!-- 鉴权 GET -->
      <el-card class="demo-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="20"><User /></el-icon>
            <span>携带 Token</span>
            <el-tag size="small" type="info">Authorization: Bearer ...</el-tag>
          </div>
        </template>
        <p class="hint">
          简化版不再自动注入 token —— 调用方登录后从 userStore 取 token 显式传入
        </p>
        <el-button
          type="primary"
          :icon="User"
          :loading="loading.info"
          @click="handleUserInfo"
        >
          获取当前用户
        </el-button>
        <ResponsePanel :response="lastResponse.info" />
      </el-card>
    </div>

    <el-card class="tips-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><Document /></el-icon>
          <span>规范要点</span>
        </div>
      </template>
      <ul class="tips-list">
        <li>
          调用方永远只传普通对象，
          <code>URLSearchParams</code>
          由底层统一构造，避免业务层手写序列化
        </li>
        <li>
          表单请求只需在 config 里加
          <code>isForm: true</code>
          ，底层负责设置 Content-Type 与构造表单体
        </li>
        <li>
          所有请求必须经过
          <code>@/utils/request</code>
          ，统一 token 注入 / 结果归一化 / 错误处理
        </li>
        <li>
          返回统一为
          <code>{ code, data, message }</code>
          ，业务本体位于
          <code>res.data.data</code>
          ，由调用方决定如何剥层使用
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script setup>
defineOptions({ name: 'request-demo' })
import {
  Postcard,
  Tickets,
  Search,
  User,
  Document
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import {
  loginByJson,
  loginByForm,
  getTableList,
  getUserInfo
} from '@/api/request-demo'
import ResponsePanel from './ResponsePanel.vue'

const userStore = useUserStore()

// 当前请求通道：调用方只负责交互与参数传递，
// 所有真实 HTTP 由 @/utils/request 内的 axios 统一完成
const modeLabel = 'axios 统一请求层（token 注入 / 归一化）'
const dataFlow = '调用方 → @/utils/request (axios) → 后端'

// ─── 表单状态 ─────────────────────────────────────
// 默认账号与 apps/backend/utils/mock-data.mjs 中 MOCK_USERS 对齐（密码 123456）
const jsonForm = reactive({ username: 'admin', password: '123456' })
const formPayload = reactive({ username: 'admin', password: '123456' })
const queryForm = reactive({ pageNum: 1, pageSize: 5 })

const loading = reactive({ json: false, form: false, list: false, info: false })
const lastResponse = reactive({
  json: null,
  form: null,
  list: null,
  info: null
})

const record = (key, ok, payload, error) => {
  lastResponse[key] = {
    ok,
    payload,
    error,
    timestamp: new Date().toLocaleTimeString()
  }
}

// ─── 响应解包 ─────────────────────────────────────
// request 返回的是 axios 原始响应 { status, headers, data }，
// data 又是后端的业务信封 { code, data, error, message }，
// 这里连续拆两层，把真正的业务数据交给面板展示。
const unwrapBiz = (result) => {
  const body = result?.data
  if (body && typeof body === 'object' && 'code' in body) {
    return body.data ?? body.result ?? null
  }
  return body
}

// ─── 请求处理 ─────────────────────────────────────
const handleJsonLogin = async () => {
  loading.json = true
  try {
    const result = await loginByJson(jsonForm)
    const biz = unwrapBiz(result)
    if (biz?.accessToken) userStore.setToken(biz.accessToken)
    record('json', true, biz)
    ElMessage.success('JSON 登录成功')
  } catch (err) {
    record('json', false, null, err.message)
    ElMessage.error(err.message)
  } finally {
    loading.json = false
  }
}

const handleFormLogin = async () => {
  loading.form = true
  try {
    const result = await loginByForm(formPayload)
    const biz = unwrapBiz(result)
    if (biz?.accessToken) userStore.setToken(biz.accessToken)
    record('form', true, biz)
    ElMessage.success('表单登录成功')
  } catch (err) {
    record('form', false, null, err.message)
    ElMessage.error(err.message)
  } finally {
    loading.form = false
  }
}

const handleList = async () => {
  loading.list = true
  try {
    const result = await getTableList(queryForm)
    const biz = unwrapBiz(result)
    record('list', true, biz)
    ElMessage.success(`查询到 ${biz?.total ?? 0} 条数据`)
  } catch (err) {
    record('list', false, null, err.message)
    ElMessage.error(err.message)
  } finally {
    loading.list = false
  }
}

const handleUserInfo = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录获取 token')
    record('info', false, null, '未登录')
    return
  }
  loading.info = true
  try {
    const result = await getUserInfo(userStore.token)
    const biz = unwrapBiz(result)
    record('info', true, biz)
    ElMessage.success(`已获取：${biz?.username || biz?.name || '当前用户'}`)
  } catch (err) {
    record('info', false, null, err.message)
    ElMessage.error(err.message)
  } finally {
    loading.info = false
  }
}
</script>

<style lang="scss" scoped>
.request-demo {
  max-width: 1200px;
  height: 100%;
  padding: 24px;
  margin: 0 auto;
  overflow-y: auto;
}

.demo-header {
  margin-bottom: 24px;
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

.env-card {
  margin-bottom: 20px;

  .env-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .env-label {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .env-flow {
    padding: 4px 10px;
    font-size: 12px;
    color: var(--color-primary);
    background: var(--color-fill-secondary);
    border-radius: 4px;
  }
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
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

.hint {
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.tips-card {
  margin-bottom: 24px;
}

.tips-list {
  padding-left: 20px;
  margin: 0;
  font-size: 13px;
  line-height: 1.9;
  color: var(--color-text-primary);

  code {
    padding: 1px 6px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: var(--color-primary);
    background: var(--color-fill-secondary);
    border-radius: 3px;
  }
}
</style>
