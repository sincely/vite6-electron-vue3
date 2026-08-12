import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url)) // 当前模块文件的目录名

process.env.APP_ROOT = path.join(__dirname, '../..') // 项目根目录

export const main_dist = path.join(process.env.APP_ROOT, 'dist-electron') // 主进程目录
export const renderer_dist = path.join(process.env.APP_ROOT, 'dist') // 渲染进程目录
export const { VITE_DEV_SERVER_URL } = process.env // 这个变量是 vite-plugin-electron 在开发模式下自动注入到 process.env 的，值是 Vite 开发服务器的地址，比如 http://localhost:3200。
console.log(VITE_DEV_SERVER_URL)

// 设置公共资源路径，开发环境指向 public 目录，生产环境指向 dist 目录
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : renderer_dist
export const { VITE_PUBLIC } = process.env
