/**
 * 自定义协议 app:// 注册
 *
 * 解决生产环境 file:// 加载带来的问题：
 *  - 跨平台路径不一致（Windows / macOS / Linux 路径格式差异）
 *  - Chromium 安全策略拦截部分资源（字体、图片等可能 404）
 *  - 无法上架 Microsoft Store / Mac App Store（审核视为安全风险）
 *
 * 使用方式：
 *   开发环境照常使用 Vite 开发服务器（loadURL）
 *   生产环境统一使用 app://renderer/index.html 加载页面
 */

import { protocol, net } from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderer_dist } from './config'

/**
 * 注册 app 协议为标准特权方案
 * ⚠️ 必须在 app.whenReady() 之前调用
 */
export function registerSchemes() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true, // 遵循标准 URL 规范（支持 //host/path）
        secure: true, // 被视为安全来源（等同于 https://）
        supportFetchAPI: true, // 支持 fetch API
        corsEnabled: false // 同源，无需 CORS
      }
    }
  ])
}

/**
 * 注册协议处理器，将 app:// 请求映射到本地 dist 目录
 * ⚠️ 必须在 app.whenReady() 之后调用
 */
export function setupProtocol() {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url)
    // 用 pathToFileURL 生成标准 file:// URL：
    // 直接字符串拼接在 Windows 上会得到 file://C:\...（缺少一个斜杠），导致页面加载失败白屏
    return net.fetch(pathToFileURL(path.join(renderer_dist, pathname)).href)
  })
}
