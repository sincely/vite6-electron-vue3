/**
 * 离线 Iconify 图标集生成脚本
 *
 * 项目使用 @iconify/vue 的 addCollection 离线注册图标（无需网络请求），
 * 图标数据按前缀拆分存放在 src/render/plugins/iconify-data-*.json。
 *
 * 本脚本从 @iconify/json 全量图标库中挑选所需图标，增量合并到对应文件，
 * 已存在的图标保持不变。新增页面/菜单需要图标时，在下方 ICON_PLAN 中
 * 追加图标名后重新运行即可：
 *
 *   esno scripts/gen-iconify-data.js
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PLUGINS_DIR = path.join(ROOT, 'src/render/plugins')

/**
 * 图标扩充计划
 * key 为图标集前缀（对应 @iconify/json 中的集合文件），
 * file 为项目内离线数据文件名，icons 为需要收录的图标名列表
 */
const ICON_PLAN = {
  lucide: {
    file: 'iconify-data.json',
    icons: [
      // 组件中心菜单
      'shapes', // 组件中心（一级菜单）
      'smile', // 图标
      'crop', // 图像裁剪
      'file-spreadsheet', // Excel 导入导出
      'monitor-play', // 视频播放器
      'sigma', // 数字滚动
      'notebook-pen', // 富文本编辑器
      'droplets', // 水印
      'square-mouse-pointer', // 右键菜单
      'qr-code', // 二维码
      'grip-vertical', // 拖拽
      'scroll-text', // 文字滚动
      'party-popper', // 礼花
      // 模板中心菜单
      'messages-square', // 聊天
      // 仪表盘菜单
      'users-round', // 人力资源
      'briefcase', // 职位仪表盘
      'trending-up', // 销售看板
      'share-2', // 社交媒体
      'bitcoin', // 加密货币
      // 功能示例菜单
      'flask-conical', // 功能示例（一级菜单）
      'lock', // 权限管理（分组）
      'user-round', // 切换角色
      'eye', // 页面可见性
      'table', // 基础表格
      'file-input', // 基础表单
      'search', // 搜索表单
      'wifi', // Socket 连接
      'webhook', // 请求演示
      // 用户菜单下拉
      'user', // 个人中心
      'file-text', // 文档
      'log-out' // 退出登录
    ]
  },
  ri: {
    file: 'iconify-data-ri.json',
    icons: [
      // 图标页展示
      'github-fill',
      'copilot-line',
      'edge-line',
      'planet-line',
      'windows-line',
      'thumb-up-line',
      'gift-2-line',
      'apple-line',
      // 右键菜单页
      'file-copy-line',
      'capsule-line',
      'clipboard-line',
      'export-line',
      'file-excel-2-line',
      'file-pdf-2-line',
      'edit-2-line',
      'share-forward-line',
      'delete-bin-line',
      'close-circle-line',
      'arrow-right-s-line',
      // 文字滚动组件
      'volume-down-line',
      'close-fill',
      // 用户菜单下拉
      'question-line' // 问题 & 帮助
    ]
  },
  'svg-spinners': {
    file: 'iconify-data-svg-spinners.json',
    icons: [
      '3-dots-fade',
      '3-dots-bounce',
      '3-dots-move',
      '3-dots-rotate',
      'blocks-shuffle-2',
      'clock',
      'tadpole',
      'blocks-wave'
    ]
  },
  'line-md': {
    file: 'iconify-data-line-md.json',
    icons: [
      'phone-call-twotone-loop',
      'switch-off',
      'sun-rising-filled-loop',
      'volume-high-filled',
      'github-twotone',
      'telegram',
      'reddit-loop',
      'coffee-half-empty-filled-loop'
    ]
  }
}

/** 读取 @iconify/json 中指定前缀的完整集合 */
function loadCollection(prefix) {
  const collectionPath = require.resolve(`@iconify/json/json/${prefix}.json`)
  return JSON.parse(readFileSync(collectionPath, 'utf-8'))
}

/** 读取项目内已有离线数据（不存在则返回空结构，并确保继承源集合的默认宽高） */
function loadLocalData(file, prefix, collection) {
  const filePath = path.join(PLUGINS_DIR, file)
  const local = existsSync(filePath)
    ? JSON.parse(readFileSync(filePath, 'utf-8'))
    : { prefix, icons: {} }
  // 回填缺失的默认宽高（Iconify 缺省按 16x16 渲染，会导致图标偏小）
  if (!local.width && collection.width) local.width = collection.width
  if (!local.height && collection.height) local.height = collection.height
  return local
}

let totalAdded = 0

for (const [prefix, plan] of Object.entries(ICON_PLAN)) {
  const collection = loadCollection(prefix)
  const local = loadLocalData(plan.file, prefix, collection)
  const missing = []
  let added = 0

  for (const name of plan.icons) {
    const icon = collection.icons[name]
    if (!icon) {
      missing.push(name)
      continue
    }
    if (local.icons[name]) continue
    local.icons[name] = icon
    added++
  }

  if (missing.length) {
    console.error(`❌ [${prefix}] 图标库中不存在: ${missing.join(', ')}`)
    process.exit(1)
  }

  const filePath = path.join(PLUGINS_DIR, plan.file)
  writeFileSync(filePath, `${JSON.stringify(local, null, 2)}\n`)
  console.log(
    `✅ [${prefix}] 新增 ${added} 个，共 ${Object.keys(local.icons).length} 个 → ${plan.file}`
  )
  totalAdded += added
}

console.log(`\n✨ 完成，本次共新增 ${totalAdded} 个图标\n`)
