import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import logger from './log'

// 开机自启时附带的启动参数，Windows 据此识别"由登录项启动"
export const LOGIN_ARG = '--launched-at-login'

const launchFile = () => path.join(app.getPath('userData'), 'launch.json')

function readSilentLaunch() {
  try {
    return !!JSON.parse(fs.readFileSync(launchFile(), 'utf8'))?.silentLaunch
  } catch {
    return false
  }
}

let silentLaunch = null
let silentStart = null // 本次冷启动是否需要静默（仅开机自启触发时生效）

export function getSilentLaunch() {
  if (silentLaunch === null) silentLaunch = readSilentLaunch()
  return silentLaunch
}

export function setSilentLaunch(value) {
  silentLaunch = !!value
  try {
    fs.writeFileSync(launchFile(), JSON.stringify({ silentLaunch }))
  } catch (e) {
    logger.error(`持久化静默启动失败: ${e?.message || e}`)
  }
}

function wasLaunchedAtLogin() {
  if (process.argv.includes(LOGIN_ARG)) return true
  if (process.platform === 'darwin') return app.getLoginItemSettings().wasOpenedAtLogin
  return false
}

// 本次启动是否应静默（不显示窗口，仅驻留托盘）
export function isSilentStart() {
  if (silentStart === null) silentStart = getSilentLaunch() && wasLaunchedAtLogin()
  return silentStart
}

// 用户主动唤起窗口或静默窗口已隐藏后，恢复正常显示行为
export function clearSilentStart() {
  silentStart = false
}
