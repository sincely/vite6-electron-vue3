import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron') // 主进程
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist') // 渲染进程
export const { VITE_DEV_SERVER_URL } = process.env // Vite开发服务器

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
export const { VITE_PUBLIC } = process.env
