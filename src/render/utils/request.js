/**
 * 渲染进程请求模块
 *
 * 只负责把请求参数透传给主进程 axios 代理；并在此处统一拆业务信封，
 * 主进程代理只做通用 HTTP 转发，返回 { code: <HTTP status>, data: <后端响应体>, message }。
 * 后端约定的业务信封 { code, msg, data } 由本模块识别：
 *   - 业务成功（code === 200）：resolve 业务本体（envelope.data）
 *   - 业务失败（code !== 200）：reject 一个 Error（带 msg）
 *   - token 过期 / 账号被踢（code 1001 / 1002）：自动清除登录态并退回登录窗口
 *   - HTTP 失败 / 超时：reject 主进程抛出的错误
 */

import { toRaw } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

// 需要自动退回登录页的业务码：token 过期 / 账号被踢下线
const AUTH_EXPIRED_CODES = new Set([1001, 1002])

// 并发请求可能同时返回 1001，用标志位防止重复弹窗 + 重复切换窗口
let isHandlingAuthExpired = false

/**
 * 处理登录态失效：清除用户状态 → 提示 → 切换到登录窗口
 * 与手动退出登录走同一 IPC 通道（主进程创建新登录窗口并关闭主窗口）
 */
function handleAuthExpired(err) {
  if (isHandlingAuthExpired) return
  isHandlingAuthExpired = true

  const userStore = useUserStore()
  userStore.resetUserState()

  ElMessage.error(err.message || '登录状态已失效，请重新登录')

  // 切换到登录窗口；窗口切换后本轮渲染进程即被销毁
  window.ipcRenderer?.send('logout')

  // 保险重置：应对 IPC 不可用（纯 Web 模式）时原地恢复
  setTimeout(() => {
    isHandlingAuthExpired = false
  }, 3000)
}

function genRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 业务信封拆层：
 *   - 识别带 code 字段的对象视为业务信封
 *   - code === 200 → 返回业务本体（envelope.data）
 *   - 其他 → 玷带 msg 的 Error，并把 businessCode / businessData 挂到 err 上便于调用方诊断
 *   - 非业务信封（后端直返非标准结构 / 第三方接口）原样透传
 */
function unwrapBusinessEnvelope(body) {
  console.log('body', body)
  if (body && typeof body === 'object' && 'code' in body) {
    if (body.code === 200) {
      return body.data ?? null
    } else {
      const err = new Error(body.msg || body.message || '业务请求失败')
      err.businessCode = body.code
      err.businessData = body.data
      throw err
    }
  }
}

/**
 * @param {Object} config 请求配置（普通对象，字段透传给主进程）
 * @param {string} config.url          请求路径
 * @param {string} [config.method]     请求方法，默认 'get'
 * @param {Object} [config.params]     URL 查询参数
 * @param {Object} [config.data]       请求体
 * @param {Object} [config.headers]    自定义请求头
 * @param {boolean} [config.isForm]    是否表单请求（主进程构造 URLSearchParams）
 * @param {string} [config.responseType] 响应类型（json / text / blob / arraybuffer）
 * @param {number} [config.timeout]    超时时间（ms）
 * @param {string} [config.token]      显式覆盖 Bearer token（默认读 userStore.token）
 * @param {string} [config.requestId]  取消标识（不传时自动生成）
 * @returns {Promise<any>} 业务本体（envelope 已剥层）
 */
async function request(config = {}) {
  const userStore = useUserStore()
  // Vue reactive() 返回的 Proxy 无法被 Electron IPC 结构化克隆，
  // toRaw 仅剥离 Proxy 包装，保留原始数据结构（Date / 嵌套对象等不变）。
  const result = await window.request.send({
    url: config.url,
    method: (config.method || 'get').toLowerCase(),
    params: toRaw(config.params),
    data: toRaw(config.data),
    headers: toRaw(config.headers),
    isForm: !!config.isForm,
    responseType: config.responseType || 'json',
    timeout: config.timeout,
    token: config.token !== undefined ? config.token : userStore.token,
    requestId: config.requestId || genRequestId()
  })

  console.log('主进程返回消息体', result)
  try {
    return unwrapBusinessEnvelope(result?.data)
  } catch (err) {
    // token 过期 / 账号被踢：自动清除登录态并退回登录窗口
    if (AUTH_EXPIRED_CODES.has(err.businessCode)) {
      handleAuthExpired(err)
    }
    throw err
  }
}

export default request
