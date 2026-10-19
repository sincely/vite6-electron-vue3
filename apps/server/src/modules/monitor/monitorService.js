/**
 * @module 系统监控 Service
 * @description 聚合会话、登录、安全、资源与缓存状态，并提供在线会话查询与强制下线
 */

import os from 'os'
import { createHash } from 'crypto'
import monitorDao from './monitorDao.js'
import { businessCode } from '../../config/businessCode.js'
import { redisEnabled } from '../../config/database.js'
import logger from '../../config/logger.js'
import { checkMySQL } from '../../db/connection.js'
import { checkRedis, getRedisClient } from '../../db/redis.js'
import { delAuthCache } from '../../utils/redisCache.js'
import { MAX_ATTEMPTS } from '../../utils/loginLimiter.js'
import { getSessionActivities, clearSessionActivity } from '../../utils/sessionActivity.js'
import { normalizePagination } from '../../schemas/common/paginationSchema.js'

const SCAN_KEY_CAP = 5000

// 缓存分组：key 前缀与 session/redisCache/loginLimiter/sessionActivity 中保持一致
const CACHE_GROUPS = [
  { key: 'session', label: '登录会话', pattern: 'sess:*' },
  { key: 'auth', label: '认证缓存', pattern: 'auth:user:*' },
  { key: 'permission', label: '权限缓存', pattern: 'perm:role:*' },
  { key: 'loginLock', label: '登录锁定', pattern: 'login:lock:*' },
  { key: 'activity', label: '会话活跃', pattern: 'monitor:active:*' }
]

const num = (value) => Number(value) || 0

const pad = (value) => String(value).padStart(2, '0')

const formatLocalDateTime = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const buildDeviceFingerprint = (userAgent, ip) =>
  createHash('sha256')
    .update(`${userAgent || ''}|${ip || ''}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase()

// 单个板块失败时降级，避免拖垮整个总览
const safeSection = async (name, loader, fallback) => {
  try {
    return await loader()
  } catch (err) {
    logger.warn({ err: { message: err.message } }, `监控总览板块加载失败: ${name}`)
    return { ...fallback, error: err.message }
  }
}

const scanKeys = async (redis, pattern) => {
  const keys = []
  let cursor = '0'
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 500)
    cursor = next
    keys.push(...batch)
  } while (cursor !== '0' && keys.length < SCAN_KEY_CAP)
  return { keys, capped: cursor !== '0' }
}

const parseRedisInfo = (text) =>
  String(text || '')
    .split('\r\n')
    .reduce((acc, line) => {
      const index = line.indexOf(':')
      if (index > 0 && !line.startsWith('#')) {
        acc[line.slice(0, index)] = line.slice(index + 1)
      }
      return acc
    }, {})

// ─── 概览板块 ────────────────────────────────────────────

const loadSessions = async () => {
  const stats = await monitorDao.getSessionStats()
  return {
    online: num(stats.online),
    expiringSoon: num(stats.expiringSoon),
    expired: num(stats.expired),
    totalUsers: num(stats.totalUsers),
    enabledUsers: num(stats.enabledUsers),
    disabledUsers: num(stats.disabledUsers)
  }
}

const buildTrend = ({ rows, nowHour }) => {
  const matched = new Map(rows.map((row) => [row.bucket, row]))
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2})/.exec(nowHour || '')
  if (!match) {
    return rows.map((row) => ({
      time: row.bucket,
      label: row.bucket.slice(11, 16),
      success: num(row.success),
      failed: num(row.failed)
    }))
  }

  const end = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]))
  return Array.from({ length: 24 }, (_, index) => {
    const iso = new Date(end - (23 - index) * 3600 * 1000).toISOString()
    const time = `${iso.slice(0, 10)} ${iso.slice(11, 13)}:00:00`
    const row = matched.get(time)
    return { time, label: `${iso.slice(11, 13)}:00`, success: num(row?.success), failed: num(row?.failed) }
  })
}

const loadLogin = async () => {
  const [stats, trend, recentFailures] = await Promise.all([
    monitorDao.getLoginStats(),
    monitorDao.getLoginTrend(),
    monitorDao.listRecentFailures(5)
  ])

  const total = num(stats.total)
  const success = num(stats.success)
  return {
    total,
    success,
    failed: num(stats.failed),
    failedLastHour: num(stats.failedLastHour),
    activeUsers: num(stats.activeUsers),
    successRate: total > 0 ? Math.round((success / total) * 1000) / 10 : null,
    trend: buildTrend(trend),
    recentFailures: recentFailures.map((row) => ({
      username: row.username,
      ipAddress: row.ip_address,
      location: row.location,
      message: row.message,
      createTime: row.create_time
    }))
  }
}

const loadLockedAccounts = async () => {
  const redis = getRedisClient()
  if (!redis) {
    return []
  }

  const { keys } = await scanKeys(redis, 'login:lock:*')
  if (!keys.length) {
    return []
  }

  const pipeline = redis.pipeline()
  keys.forEach((key) => {
    pipeline.get(key)
    pipeline.ttl(key)
  })
  const results = await pipeline.exec()

  return keys
    .map((key, index) => {
      const attempts = num(results[index * 2]?.[1])
      const ttl = num(results[index * 2 + 1]?.[1])
      return { username: key.slice('login:lock:'.length), attempts, retryAfter: Math.max(ttl, 0) }
    })
    .filter((item) => item.attempts >= MAX_ATTEMPTS)
    .sort((a, b) => b.retryAfter - a.retryAfter)
}

const loadSecurity = async () => {
  const [suspiciousIps, lockedAccounts] = await Promise.all([
    monitorDao.listSuspiciousIps(3, 5),
    loadLockedAccounts().catch((err) => {
      logger.warn({ err: { message: err.message } }, '读取登录锁定账号失败')
      return []
    })
  ])

  return {
    lockedAccounts: lockedAccounts.slice(0, 10),
    lockedCount: lockedAccounts.length,
    suspiciousIps: suspiciousIps.map((row) => ({
      ipAddress: row.ip_address,
      failed: num(row.failed),
      lastTime: row.lastTime
    }))
  }
}

const loadResources = async () => {
  const mem = process.memoryUsage()
  const cpuCount = os.cpus().length || 1
  const [load1, load5, load15] = os.loadavg()
  const systemTotal = os.totalmem()
  const systemFree = os.freemem()

  const [mysql, redis] = await Promise.all([checkMySQL(), checkRedis()])

  return {
    uptime: Math.round(process.uptime()),
    nodeVersion: process.version,
    platform: `${os.type()} ${os.release()}`,
    pid: process.pid,
    cpuCount,
    loadAvg: [load1, load5, load15].map((v) => Math.round(v * 100) / 100),
    loadPercent: Math.min(100, Math.round((load1 / cpuCount) * 100)),
    memory: {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      systemTotal,
      systemFree,
      systemUsedPercent: Math.round(((systemTotal - systemFree) / systemTotal) * 1000) / 10
    },
    mysql,
    redis
  }
}

const loadCache = async () => {
  if (!redisEnabled) {
    return { enabled: false, status: 'disabled', groups: [] }
  }

  const redis = getRedisClient()
  const health = await checkRedis()
  if (!redis || health.status === 'down') {
    return { enabled: true, status: 'down', error: health.error, groups: [] }
  }

  const [dbSize, memoryInfo, statsInfo, groupResults] = await Promise.all([
    redis.dbsize(),
    redis.info('memory'),
    redis.info('stats'),
    Promise.all(CACHE_GROUPS.map((group) => scanKeys(redis, group.pattern)))
  ])

  const memory = parseRedisInfo(memoryInfo)
  const stats = parseRedisInfo(statsInfo)
  const hits = num(stats.keyspace_hits)
  const misses = num(stats.keyspace_misses)

  return {
    enabled: true,
    status: health.status,
    latency: health.latency,
    host: health.host,
    dbSize,
    usedMemory: num(memory.used_memory),
    maxMemory: num(memory.maxmemory),
    hitRate: hits + misses > 0 ? Math.round((hits / (hits + misses)) * 1000) / 10 : null,
    groups: CACHE_GROUPS.map((group, index) => ({
      key: group.key,
      label: group.label,
      count: groupResults[index].keys.length,
      capped: groupResults[index].capped
    }))
  }
}

// 汇总整体健康等级与告警
const evaluateHealth = ({ sessions, login, security, resources, cache }) => {
  const alerts = []

  if (resources.mysql?.status !== 'up') {
    alerts.push({ level: 'danger', message: 'MySQL 连接异常' })
  }
  if (resources.redis?.status === 'down') {
    alerts.push({ level: 'danger', message: 'Redis 连接异常，会话与缓存已降级' })
  }
  if (resources.memory?.systemUsedPercent >= 90) {
    alerts.push({ level: 'warning', message: `系统内存使用率 ${resources.memory.systemUsedPercent}%` })
  }
  if (resources.loadPercent >= 90) {
    alerts.push({ level: 'warning', message: `CPU 负载 ${resources.loadPercent}%` })
  }
  if (security.lockedCount > 0) {
    alerts.push({ level: 'warning', message: `${security.lockedCount} 个账号因登录失败被锁定` })
  }
  if (security.suspiciousIps?.length > 0) {
    alerts.push({ level: 'warning', message: `${security.suspiciousIps.length} 个 IP 近 24 小时登录失败 3 次以上` })
  }
  if (login.total >= 10 && login.successRate !== null && login.successRate < 50) {
    alerts.push({ level: 'warning', message: `近 24 小时登录成功率仅 ${login.successRate}%` })
  }
  if (sessions.expired > 0) {
    alerts.push({ level: 'info', message: `${sessions.expired} 个会话已过期但尚未清理` })
  }
  if (cache.status === 'degraded') {
    alerts.push({ level: 'warning', message: 'Redis 响应异常' })
  }

  const status = alerts.some((a) => a.level === 'danger')
    ? 'danger'
    : alerts.some((a) => a.level === 'warning')
      ? 'warning'
      : 'healthy'

  return { status, alerts }
}

/**
 * 监控总览
 */
export const getOverview = async () => {
  const [sessions, login, security, resources, cache] = await Promise.all([
    safeSection('sessions', loadSessions, { online: 0, expiringSoon: 0, expired: 0, totalUsers: 0 }),
    safeSection('login', loadLogin, { total: 0, success: 0, failed: 0, trend: [], recentFailures: [] }),
    safeSection('security', loadSecurity, { lockedAccounts: [], lockedCount: 0, suspiciousIps: [] }),
    safeSection('resources', loadResources, { memory: {}, mysql: { status: 'down' }, redis: { status: 'down' } }),
    safeSection('cache', loadCache, { enabled: redisEnabled, status: 'down', groups: [] })
  ])

  return {
    generatedAt: formatLocalDateTime(Date.now()),
    health: evaluateHealth({ sessions, login, security, resources, cache }),
    sessions,
    login,
    security,
    resources,
    cache
  }
}

// ─── 在线用户 ────────────────────────────────────────────

const formatOnlineRow = (row, activities, currentSessionId) => {
  const ipAddress = row.login_ip || row.last_login_ip || ''
  const activeTs = activities.get(row.session_id)
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    username: row.username,
    nickname: row.nick_name ?? '',
    avatar: row.avatar ?? '',
    roleNames: row.roleNames ? String(row.roleNames).split(',') : [],
    ipAddress,
    location: row.location ?? '',
    browser: row.browser ?? '',
    os: row.os ?? '',
    userAgent: row.user_agent ?? '',
    deviceFingerprint: buildDeviceFingerprint(row.user_agent, ipAddress),
    loginTime: row.last_login_time,
    lastActiveTime: activeTs ? formatLocalDateTime(activeTs) : row.last_login_time,
    expireTime: row.session_expire,
    isCurrent: row.session_id === currentSessionId
  }
}

/**
 * 在线用户（会话粒度）列表
 */
export const listOnlineUsers = async (query, currentSessionId) => {
  const { username, ipAddress } = query
  const { actualPage, actualPageSize } = normalizePagination(query)

  const [list, total] = await Promise.all([
    monitorDao.listOnlineSessions({ page: actualPage, pageSize: actualPageSize, username, ipAddress }),
    monitorDao.countOnlineSessions({ username, ipAddress })
  ])

  const activities = await getSessionActivities(list.map((row) => row.session_id))
  const records = list.map((row) => formatOnlineRow(row, activities, currentSessionId))

  return {
    records,
    // rows 兼容前端 AdvanceTable 读取约定
    rows: records,
    current: actualPage,
    size: actualPageSize,
    total: Number(total)
  }
}

/**
 * 按会话强制下线
 * @param {{ sessionId: string, operatorSessionId?: string }} params
 */
export const forceLogout = async ({ sessionId, operatorSessionId }) => {
  if (sessionId === operatorSessionId) {
    return { success: false, code: businessCode.sessionKickSelfDenied }
  }

  const user = await monitorDao.findOnlineUserBySessionId(sessionId)
  if (!user) {
    return { success: false, code: businessCode.sessionNotFound }
  }

  const affected = await monitorDao.clearSessionById(sessionId)
  if (!affected) {
    return { success: false, code: businessCode.sessionNotFound }
  }

  await Promise.all([delAuthCache(user.id), clearSessionActivity(sessionId)])

  return { success: true, data: { userId: user.id, username: user.username } }
}
