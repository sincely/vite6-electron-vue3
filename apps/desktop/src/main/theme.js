import { app, nativeTheme } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import logger from './log'

const themeFile = () => path.join(app.getPath('userData'), 'theme.json')

// 读取主进程持久化的主题模式；缺失或异常时返回 'light'（与渲染进程 store 默认值一致）
function readPersistedTheme() {
  try {
    const raw = fs.readFileSync(themeFile(), 'utf8')
    const theme = JSON.parse(raw)?.theme
    if (theme === 'light' || theme === 'dark' || theme === 'auto') return theme
  } catch {
    // 首次启动文件不存在，或内容损坏：使用默认值
  }
  return 'light'
}

// theme -> nativeTheme.themeSource 映射
function themeToSource(theme) {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return 'system' // auto：跟随系统
}

// 将主题应用到 nativeTheme。
// 设置 themeSource 后，nativeTheme.shouldUseDarkColors 与渲染进程的
// prefers-color-scheme 均跟随应用主题，从而让 windowManager.getWindowBackgroundColor
// 自动返回与应用主题一致的背景色，无需改动该函数。
export function applyAppTheme(theme) {
  const source = themeToSource(theme)
  if (nativeTheme.themeSource !== source) nativeTheme.themeSource = source
}

// 持久化到主进程可读文件。冷启动时 createLoginWindow 早于任何渲染进程启动，
// 渲染进程的 localStorage 主进程无法读取，故需主进程自己持久化一份。
export function persistAppTheme(theme) {
  try {
    fs.writeFileSync(themeFile(), JSON.stringify({ theme }))
  } catch (e) {
    logger.error(`持久化主题失败: ${e?.message || e}`)
  }
}

// 冷启动初始化：读取文件 → 应用到 nativeTheme。
// 必须在 createLoginWindow 之前调用，确保首个窗口 backgroundColor 与应用主题一致，
// 避免 ready-to-show 前原生画布色与应用主题不符造成的闪烁。
export function initAppTheme() {
  applyAppTheme(readPersistedTheme())
}

// 运行时设置主题（由渲染进程通过 'set-app-theme' IPC 调用）：
// 即时更新 nativeTheme（影响后续新建窗口与 prefers-color-scheme），并持久化供下次冷启动。
export function setAppTheme(theme) {
  if (theme !== 'light' && theme !== 'dark' && theme !== 'auto') return
  applyAppTheme(theme)
  persistAppTheme(theme)
}
