/**
 * 会话活跃时间追踪
 *
 * authenticate 通过后记录 sessionId 的最近活跃时间，供在线用户监控读取。
 *  - Redis 可用：写入 monitor:active:{sessionId}（TTL 7 天），多进程共享
 *  - Redis 不可用：仅保留进程内记录
 * 写入按会话节流，避免每个请求都产生一次 Redis 写。
 */

import { getRedisClient } from '../db/redis.js'

const KEY_PREFIX = 'monitor:active:'
const TTL_SECONDS = 7 * 24 * 3600
const THROTTLE_MS = 30_000
const MAX_MEMORY_ENTRIES = 5000

/** @type {Map<string, number>} sessionId -> 最近一次记录的时间戳（毫秒） */
const lastTouch = new Map()

// 活跃记录属于尽力而为，Redis 写失败不影响主流程
const ignoreError = () => undefined

const safeRedis = () => {
  try {
    return getRedisClient()
  } catch {
    return null
  }
}

/**
 * 记录会话活跃（节流）
 * @param {string} sessionId
 */
export const touchSessionActivity = (sessionId) => {
  if (!sessionId) {
    return
  }

  const now = Date.now()
  if (now - (lastTouch.get(sessionId) || 0) < THROTTLE_MS) {
    return
  }

  // 超出上限时丢弃最早的记录
  if (lastTouch.size >= MAX_MEMORY_ENTRIES) {
    lastTouch.delete(lastTouch.keys().next().value)
  }
  lastTouch.set(sessionId, now)

  const redis = safeRedis()
  if (redis) {
    redis.setex(`${KEY_PREFIX}${sessionId}`, TTL_SECONDS, String(now)).catch(ignoreError)
  }
}

/**
 * 批量读取会话最近活跃时间
 * @param {string[]} sessionIds
 * @returns {Promise<Map<string, number>>} sessionId -> 时间戳（毫秒），无记录的会话不在结果中
 */
export const getSessionActivities = async (sessionIds) => {
  const result = new Map()
  if (!sessionIds.length) {
    return result
  }

  const redis = safeRedis()
  if (redis) {
    try {
      const values = await redis.mget(sessionIds.map((id) => `${KEY_PREFIX}${id}`))
      values.forEach((value, index) => {
        const ts = Number(value)
        if (ts) {
          result.set(sessionIds[index], ts)
        }
      })
    } catch {
      // Redis 异常时回退到进程内记录
    }
  }

  sessionIds.forEach((id) => {
    if (!result.has(id) && lastTouch.has(id)) {
      result.set(id, lastTouch.get(id))
    }
  })

  return result
}

/**
 * 清除会话活跃记录（强制下线 / 登出时调用）
 * @param {string} sessionId
 */
export const clearSessionActivity = async (sessionId) => {
  if (!sessionId) {
    return
  }

  lastTouch.delete(sessionId)
  const redis = safeRedis()
  if (redis) {
    await redis.del(`${KEY_PREFIX}${sessionId}`).catch(ignoreError)
  }
}
