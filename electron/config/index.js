import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url)) // 当前模块文件的目录名

process.env.APP_ROOT = path.join(__dirname, '../..') // 项目根目录

export const main_dist = path.join(process.env.APP_ROOT, 'dist-electron') // 主进程目录
export const renderer_dist = path.join(process.env.APP_ROOT, 'dist') // 渲染进程目录
export const { VITE_DEV_SERVER_URL } = process.env // Vite开发服务器

console.log('📂 项目根目录:', process.env.APP_ROOT)
console.log('📂 主进程目录', main_dist)
console.log('📂 渲染进程目录', renderer_dist)
console.log('⚡ Vite开发服务器URL', VITE_DEV_SERVER_URL)

// 设置公共资源路径，开发环境指向 public 目录，生产环境指向 dist 目录
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : renderer_dist
export const { VITE_PUBLIC } = process.env
