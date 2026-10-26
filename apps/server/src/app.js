/**
 * HTTP 服务入口
 *
 * 仅做三件事：创建应用 → 注册进程级异常处理 → 启动监听。
 * 装配逻辑见 `core/createApp.js`，生命周期逻辑见 `core/bootstrap.js`。
 *
 * 注意：本文件路径被 `vercel.json` 引用，勿移动。
 */
import { createApp } from './core/createApp.js'
import { startServer, registerProcessHandlers } from './core/bootstrap.js'

const app = createApp()

// 进程级未捕获异常处理（任何部署形态都需生效）
registerProcessHandlers()

// 仅在非 Vercel 环境下启动服务器（Vercel 由平台负责监听）
if (!process.env.VERCEL) {
  startServer(app)
}

// 导出 app 实例，用于 Vercel 等 serverless 平台部署
export default app
