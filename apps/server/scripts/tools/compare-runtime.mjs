#!/usr/bin/env node
/**
 * 重构前后响应对比（真实运行时验证）
 *
 * 同时启动「重构前」（git worktree）与「重构后」两个服务，
 * 对同一批 HTTP 请求逐条比对响应体，验证重构未改变对外行为。
 *
 * 用法：node scripts/tools/compare-runtime.mjs <baselineDir> <baselinePort> <newPort>
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(scriptDir, '../..')

const baselineDir = process.argv[2]
const baselinePort = Number(process.argv[3] || 5321)
const newPort = Number(process.argv[4] || 5320)

/** 需要在响应中抹平的易变字段 */
const VOLATILE_KEYS = new Set([
  'token',
  'refreshToken',
  'sessionId',
  'requestId',
  'uptime',
  'memory',
  'timestamp',
  'generatedAt',
  'createTime',
  'updateTime',
  'lastLoginTime',
  'lastLoginIp',
  'sessionExpire',
  'location'
])

/**
 * 递归抹平响应中的易变字段
 * @param {unknown} value
 * @returns {unknown}
 */
const normalize = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalize)
  }
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value).sort()) {
      if (VOLATILE_KEYS.has(key)) {
        out[key] = '<volatile>'
      } else {
        out[key] = normalize(value[key])
      }
    }
    return out
  }
  return value
}

/**
 * 确认端口未被占用（避免与本地已运行的服务冲突，导致测试结果失真）
 * @param {number} port
 */
const assertPortFree = async (port) => {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`)
    if (res.ok) {
      throw new Error(`端口 ${port} 已被其他服务占用，请换端口后重试`)
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('已被其他服务占用')) {
      throw err
    }
    // 连接失败 = 端口空闲，符合预期
  }
}

/**
 * 等待端口就绪
 * @param {number} port
 * @param {number} timeoutMs
 */
const waitForPort = async (port, timeoutMs = 20000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`)
      if (res.ok) {
        return true
      }
    } catch {
      // 还没起来，继续等
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`端口 ${port} 未在超时内就绪`)
}

/**
 * 启动一个服务实例
 * @param {string} cwd
 * @param {number} port
 */
const startServer = (cwd, port) => {
  const child = spawn(process.execPath, ['src/app.js'], {
    cwd,
    env: { ...process.env, NODE_ENV: 'development', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  // 消费子进程输出，避免管道写满导致阻塞
  child.stdout.on('data', () => undefined)
  child.stderr.on('data', () => undefined)
  return child
}

/**
 * 发起请求
 * @param {number} port
 * @param {string} method
 * @param {string} urlPath
 * @param {object} [body]
 * @param {string} [token]
 */
const request = async (port, method, urlPath, body, token) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  try {
    const res = await fetch(`http://127.0.0.1:${port}${urlPath}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
    const text = await res.text()
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
    return { status: res.status, body: parsed }
  } catch (err) {
    return { status: 0, body: `FETCH_ERROR: ${err.message}` }
  }
}

/**
 * 登录并取 token
 * @param {number} port
 * @param {string} username
 * @param {string} password
 */
const login = async (port, username, password) => {
  const res = await request(port, 'POST', '/api/user/auth/login', { userName: username, password })
  if (res.body && res.body.data && res.body.data.token) {
    return res.body.data.token
  }
  return null
}

/** 全部对比用例：未认证部分 + 认证后部分 */
const CASES = [
  { method: 'GET', path: '/api/health' },
  { method: 'GET', path: '/api/health?deep' },
  { method: 'GET', path: '/api/route/getConstantRoutes' },
  { method: 'GET', path: '/api/user/getUserInfo' },
  { method: 'GET', path: '/api/user/info' },
  { method: 'GET', path: '/api/systemManage/getRoleList' },
  { method: 'GET', path: '/api/systemManage/getUserList' },
  { method: 'GET', path: '/api/systemManage/getMenuList' },
  { method: 'GET', path: '/api/systemManage/getDictList' },
  { method: 'GET', path: '/api/systemManage/getAllRoles' },
  { method: 'GET', path: '/api/systemManage/getRoleRouteIds?roleId=1' },
  { method: 'GET', path: '/api/system/roles/menuIds?roleId=1' },
  { method: 'GET', path: '/api/systemManage/getMenuTree' },
  { method: 'GET', path: '/api/systemManage/getAllPages' },
  { method: 'GET', path: '/api/system/menus/tree' },
  { method: 'GET', path: '/api/log/getOperationLogList' },
  { method: 'GET', path: '/api/log/getLoginLogList' },
  { method: 'GET', path: '/api/log/getOperationLogDetail?id=1' },
  { method: 'GET', path: '/api/log/getLoginLogDetail?id=1' },
  { method: 'GET', path: '/api/monitor/overview' },
  { method: 'GET', path: '/api/monitor/online/list' },
  { method: 'GET', path: '/api/message/getMessageList' },
  { method: 'GET', path: '/api/message/getMessageUnreadCount' },
  { method: 'GET', path: '/api/route/getUserRoutes' },
  { method: 'GET', path: '/api/route/isRouteExist?routeName=home' },
  { method: 'GET', path: '/api/ai/status' },
  { method: 'GET', path: '/api/user/auth/error?code=500&msg=test' },
  // 错误路径
  { method: 'POST', path: '/api/user/auth/login', body: { userName: 'no-such-user', password: 'x' } },
  { method: 'POST', path: '/api/user/auth/refreshToken', body: {} },
  { method: 'GET', path: '/api/route/isRouteExist' },
  { method: 'GET', path: '/api/systemManage/getRoleRouteIds' },
  // 校验失败路径（请求体非法，校验阶段即拒绝，不产生写操作）
  { method: 'POST', path: '/api/systemManage/saveUser', body: { username: 'x' } },
  { method: 'POST', path: '/api/systemManage/saveRole', body: { roleName: 'x' } },
  { method: 'POST', path: '/api/systemManage/saveDict', body: { dictName: 'x' } },
  { method: 'POST', path: '/api/systemManage/saveMenu', body: {} },
  { method: 'POST', path: '/api/systemManage/updateRoleRouteIds', body: {} },
  { method: 'POST', path: '/api/systemManage/deleteUser', body: {} },
  { method: 'POST', path: '/api/systemManage/batchDeleteUser', body: { ids: [] } },
  { method: 'POST', path: '/api/message/readMessage', body: {} },
  { method: 'POST', path: '/api/systemManage/saveNotification', body: {} }
]

const PASSWORD_CANDIDATES = ['123456', 'admin123', 'admin', '123456789', 'super123']

/**
 * 清掉测试账号的登录锁定（测试会用错误密码打接口，会触发锁定）
 * @param {string} username
 */
const clearLoginLock = async (username) => {
  try {
    const { getRedisClient } = await import(path.join(serverRoot, 'src/infrastructure/redis/client.js'))
    const redis = getRedisClient()
    if (redis) {
      await redis.del(`login:lock:${username}`)
    }
  } catch {
    // Redis 不可用时忽略
  }
}

const main = async () => {
  await assertPortFree(baselinePort)
  await assertPortFree(newPort)

  console.log('启动重构前服务...')
  const baseline = startServer(path.join(baselineDir, 'apps/server'), baselinePort)
  console.log('启动重构后服务...')
  const current = startServer(serverRoot, newPort)

  try {
    await Promise.all([waitForPort(baselinePort), waitForPort(newPort)])
    console.log('两个服务均已就绪\n')

    // 找到可用的登录凭据
    let credentials = null
    for (const password of PASSWORD_CANDIDATES) {
      const token = await login(baselinePort, 'admin', password)
      if (token) {
        credentials = { username: 'admin', password }
        break
      }
    }
    if (!credentials) {
      console.log('未找到可用登录凭据，仅对比未认证用例')
    } else {
      console.log(`登录凭据可用: ${credentials.username}\n`)
    }

    /**
     * 跑一轮全部用例
     * @param {number} port
     * @returns {Promise<Map<string, object>>}
     */
    const runSuite = async (port) => {
      const results = new Map()

      // 未认证用例
      for (const testCase of CASES) {
        const res = await request(port, testCase.method, testCase.path, testCase.body)
        results.set(`${testCase.method} ${testCase.path}`, res)
      }

      // 认证用例（独立登录，避免单设备登录互相踢下线）
      if (credentials) {
        const token = await login(port, credentials.username, credentials.password)
        if (token) {
          for (const testCase of CASES) {
            const res = await request(port, testCase.method, testCase.path, testCase.body, token)
            results.set(`AUTH ${testCase.method} ${testCase.path}`, res)
          }
        }
      }

      return results
    }

    await clearLoginLock('admin')
    console.log('执行重构前用例...')
    const beforeResults = await runSuite(baselinePort)
    await clearLoginLock('admin')
    console.log('执行重构后用例...')
    const afterResults = await runSuite(newPort)

    let same = 0
    const diffs = []

    for (const [key, before] of beforeResults) {
      const after = afterResults.get(key)
      if (!after) {
        diffs.push({ key, reason: '重构后缺少该用例结果' })
        continue
      }
      const beforeNorm = JSON.stringify(normalize(before.body))
      const afterNorm = JSON.stringify(normalize(after.body))
      const statusSame = before.status === after.status

      if (beforeNorm === afterNorm && statusSame) {
        same += 1
      } else {
        diffs.push({
          key,
          statusBefore: before.status,
          statusAfter: after.status,
          before: beforeNorm,
          after: afterNorm
        })
      }
    }

    console.log('\n' + '='.repeat(78))
    console.log(`对比用例总数: ${beforeResults.size}   完全一致: ${same}   存在差异: ${diffs.length}`)
    console.log('='.repeat(78))

    if (diffs.length === 0) {
      console.log('\n*** 全部用例响应完全一致（含 HTTP 状态码）***\n')
      process.exitCode = 0
    } else {
      console.log('\n存在差异的用例：\n')
      for (const diff of diffs) {
        console.log(`▌${diff.key}`)
        if (diff.reason) {
          console.log(`  ${diff.reason}`)
        } else {
          console.log(`  HTTP 状态: ${diff.statusBefore} → ${diff.statusAfter}`)
          console.log(`  重构前: ${String(diff.before).slice(0, 400)}`)
          console.log(`  重构后: ${String(diff.after).slice(0, 400)}`)
        }
        console.log('')
      }
      process.exitCode = 1
    }
  } finally {
    baseline.kill('SIGKILL')
    current.kill('SIGKILL')
  }
}

main().catch((err) => {
  console.error('对比脚本执行失败:', err)
  process.exit(1)
})
