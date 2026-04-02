/**
 * hot-update.js — 增量（热）更新模块
 *
 * 流程：
 *  1. 应用启动后请求 {UPDATE_URL}hot-update.json 清单
 *  2. 对比版本号：
 *     - 无更新 → 不做任何事
 *     - 有更新且当前版本 >= minElectronVersion → 执行热更新（下载 zip，解压到 userData）
 *     - 有更新但版本太旧      → 通知渲染层走全量更新
 *  3. 热更新下载完成后，发送 hot-update-ready，由用户确认后调用 applyHotUpdate() 重载窗口
 */

import https from 'node:https'
import http from 'node:http'
import fs, { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { inflateRawSync } from 'node:zlib'
import { app } from 'electron'
import logger from './log'

// ─── 配置 ────────────────────────────────────────────────────────────
const UPDATE_URL = normalizeUrl(process.env.VITE_UPDATE_URL)
const MANIFEST_PATH = 'hot-update.json'
const USER_DATA = app.getPath('userData')
const HOT_UPDATE_BASE = path.join(USER_DATA, 'hot-update')

let _mainWindow = null
let _pendingVersion = null // 已下载待应用的版本
let _pendingDistPath = null // 解压到的目录

function normalizeUrl(url) {
  if (!url) return ''
  return url.endsWith('/') ? url : `${url}/`
}

// ─── 工具：发消息到渲染进程 ────────────────────────────────────────────
function send(channel, payload) {
  _mainWindow?.webContents?.send(channel, payload)
}

// ─── 工具：简单 semver 比较 ────────────────────────────────────────────
// 返回 1 / 0 / -1
function semverCompare(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number)
  const pb = b.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

// ─── 工具：HTTP(S) GET，返回 Buffer / JSON ────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`))
          return
        }
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
      .on('error', reject)
  })
}

// ─── 工具：下载文件到磁盘（带进度通知）─────────────────────────────────
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`下载失败 HTTP ${res.statusCode}`))
          return
        }
        const total = parseInt(res.headers['content-length'] || '0', 10)
        let received = 0
        const file = createWriteStream(destPath)
        res.on('data', (chunk) => {
          received += chunk.length
          file.write(chunk)
          if (total > 0) {
            const percent = ((received / total) * 100).toFixed(1)
            send('hot-update-progress', {
              percent: parseFloat(percent),
              received,
              total
            })
          }
        })
        res.on('end', () => {
          file.end()
          resolve()
        })
        res.on('error', (err) => {
          file.destroy()
          reject(err)
        })
      })
      .on('error', reject)
  })
}

// ─── 工具：解压 ZIP（使用 Node.js 内置 zlib + 自定义 ZIP 解析）────────
// 避免引入第三方库，使用轻量级纯手写 ZIP 中央目录解析
function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    try {
      const buf = fs.readFileSync(zipPath)
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)

      // 查找 End of Central Directory 签名 (0x06054b50)
      let eocdOffset = -1
      for (let i = buf.length - 22; i >= 0; i--) {
        if (
          buf[i] === 0x50 &&
          buf[i + 1] === 0x4b &&
          buf[i + 2] === 0x05 &&
          buf[i + 3] === 0x06
        ) {
          eocdOffset = i
          break
        }
      }
      if (eocdOffset === -1) throw new Error('无效的 ZIP 文件：找不到 EOCD')

      const cdOffset = view.getUint32(eocdOffset + 16, true)
      const cdSize = view.getUint32(eocdOffset + 12, true)
      const cdCount = view.getUint16(eocdOffset + 8, true)

      let pos = cdOffset
      for (let i = 0; i < cdCount; i++) {
        // Central directory file header signature 0x02014b50
        if (
          buf[pos] !== 0x50 ||
          buf[pos + 1] !== 0x4b ||
          buf[pos + 2] !== 0x01 ||
          buf[pos + 3] !== 0x02
        )
          break

        const compressionMethod = view.getUint16(pos + 10, true)
        const compressedSize = view.getUint32(pos + 20, true)
        const uncompressedSize = view.getUint32(pos + 24, true)
        const fileNameLen = view.getUint16(pos + 28, true)
        const extraLen = view.getUint16(pos + 30, true)
        const commentLen = view.getUint16(pos + 32, true)
        const localHeaderOffset = view.getUint32(pos + 42, true)
        const fileName = buf
          .slice(pos + 46, pos + 46 + fileNameLen)
          .toString('utf8')

        pos += 46 + fileNameLen + extraLen + commentLen

        // 跳过目录条目
        if (fileName.endsWith('/')) continue

        // 读取 Local File Header
        const lh = localHeaderOffset
        const lfnLen = view.getUint16(lh + 26, true)
        const lextraLen = view.getUint16(lh + 28, true)
        const dataStart = lh + 30 + lfnLen + lextraLen
        const compressedData = buf.slice(dataStart, dataStart + compressedSize)

        const outPath = path.join(destDir, fileName)
        mkdirSync(path.dirname(outPath), { recursive: true })

        if (compressionMethod === 0) {
          // Stored
          fs.writeFileSync(outPath, compressedData)
        } else if (compressionMethod === 8) {
          // Deflate
          fs.writeFileSync(outPath, inflateRawSync(compressedData))
        } else {
          throw new Error(`不支持的压缩方法：${compressionMethod}`)
        }
      }
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

// ─── 核心：检查热更新 ──────────────────────────────────────────────────
export async function checkHotUpdate() {
  if (!UPDATE_URL) {
    logger.info('[hot-update] 未配置 VITE_UPDATE_URL，跳过热更新检查')
    return false
  }

  let manifest
  try {
    const raw = await fetchUrl(`${UPDATE_URL}${MANIFEST_PATH}`)
    manifest = JSON.parse(raw.toString('utf8'))
    logger.info('[hot-update] 获取到清单:', JSON.stringify(manifest))
  } catch (err) {
    logger.warn('[hot-update] 无法获取热更新清单（可能未配置）:', err.message)
    return false
  }

  const { version, minElectronVersion, hotUpdateUrl, releaseNotes } = manifest
  if (!version || !hotUpdateUrl) {
    logger.warn('[hot-update] 清单字段不完整，跳过')
    return false
  }

  const currentVersion = app.getVersion()

  // 没有新版本
  if (semverCompare(version, currentVersion) <= 0) {
    logger.info(`[hot-update] 已是最新 (${currentVersion})，无需热更新`)
    return false
  }

  // 检查最低兼容版本
  if (
    minElectronVersion &&
    semverCompare(currentVersion, minElectronVersion) < 0
  ) {
    logger.info(
      `[hot-update] 当前版本 ${currentVersion} < minElectronVersion ${minElectronVersion}，需要全量更新`
    )
    send('hot-update-need-full', { version, releaseNotes })
    return false
  }

  logger.info(`[hot-update] 发现新版本 ${version}，触发热更新`)
  send('hot-update-available', { version, releaseNotes })

  // 开始下载
  try {
    const zipDir = path.join(HOT_UPDATE_BASE, version)
    const zipPath = path.join(zipDir, 'renderer.zip')
    mkdirSync(zipDir, { recursive: true })

    logger.info(`[hot-update] 开始下载 ${hotUpdateUrl} → ${zipPath}`)
    await downloadFile(hotUpdateUrl, zipPath)
    logger.info('[hot-update] 下载完成，开始解压...')

    const distPath = path.join(zipDir, 'dist')
    mkdirSync(distPath, { recursive: true })
    await extractZip(zipPath, distPath)

    // 清理 zip
    fs.unlinkSync(zipPath)

    _pendingVersion = version
    _pendingDistPath = distPath
    logger.info(`[hot-update] 解压完成，待应用路径：${distPath}`)
    send('hot-update-ready', { version, releaseNotes })
    return true
  } catch (err) {
    logger.error('[hot-update] 热更新失败:', err.message)
    send('hot-update-error', err.message)
    return false
  }
}

// ─── 应用热更新（重载窗口）────────────────────────────────────────────
export function applyHotUpdate(win) {
  if (!_pendingDistPath || !existsSync(_pendingDistPath)) {
    logger.warn('[hot-update] 无待应用的热更新包')
    return
  }
  const indexPath = path.join(_pendingDistPath, 'index.html')
  if (!existsSync(indexPath)) {
    logger.error('[hot-update] 热更新包中找不到 index.html')
    send('hot-update-error', '热更新包不完整，缺少 index.html')
    return
  }

  logger.info(`[hot-update] 应用热更新 v${_pendingVersion}，加载：${indexPath}`)

  // 标记当前使用的热更新版本（持久化，下次启动也可直接使用）
  const markerPath = path.join(HOT_UPDATE_BASE, 'current.json')
  fs.writeFileSync(
    markerPath,
    JSON.stringify({ version: _pendingVersion, distPath: _pendingDistPath })
  )

  win.webContents.loadFile(indexPath)
  _pendingVersion = null
  _pendingDistPath = null
}

// ─── 启动时恢复上次热更新（如已有缓存）──────────────────────────────────
export function resolveHotUpdatePath() {
  try {
    const markerPath = path.join(HOT_UPDATE_BASE, 'current.json')
    if (!existsSync(markerPath)) return null
    const { version, distPath } = JSON.parse(
      fs.readFileSync(markerPath, 'utf8')
    )
    const indexPath = path.join(distPath, 'index.html')
    if (!existsSync(indexPath)) return null
    logger.info(`[hot-update] 恢复上次热更新 v${version}，路径：${indexPath}`)
    return indexPath
  } catch {
    return null
  }
}

// ─── 初始化 ───────────────────────────────────────────────────────────
export function initHotUpdater(win) {
  _mainWindow = win
  win.on('closed', () => {
    _mainWindow = null
  })
}
