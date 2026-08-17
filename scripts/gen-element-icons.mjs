/**
 * Element Plus 图标按需注册生成脚本
 *
 * 背景：src/render/plugins/icon.js 原先通过 `import * as elementIcons`
 * 把 @element-plus/icons-vue 全部 293 个图标一次性全局注册，导致首屏
 * 静态依赖整个图标库（约 168KB），拖慢应用启动。本脚本扫描项目源码中
 * 实际使用的图标（模板组件标签、`icon: 'Xxx'` 字符串、具名 import），
 * 生成只包含这些图标的注册文件。
 *
 * 新增/更换图标后重新运行：
 *   node scripts/gen-element-icons.mjs
 * 生成文件：src/render/plugins/element-icons.js（勿手动编辑）
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_FILE = path.join(ROOT, 'src/render/plugins/element-icons.js')

const iconsMod = await import('@element-plus/icons-vue')
const allIcons = new Set(Object.keys(iconsMod).filter((k) => /^[A-Z]/.test(k)))

// 收集源码文件
const files = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(vue|js|mjs)$/.test(p)) files.push(p)
  }
}
for (const root of ['src/render', 'src/shared']) {
  walk(path.join(ROOT, root))
}

const kebabToPascal = (s) =>
  s
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('')

const used = new Set()
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  // 模板中的组件标签（PascalCase 与 kebab-case 均识别）
  const tags = content.match(/<\/?[A-Za-z][A-Za-z0-9-]*/g) || []
  for (const t of tags) {
    const raw = t.replace(/<\/?/, '')
    const name = raw.includes('-') ? kebabToPascal(raw) : raw
    if (allIcons.has(name)) used.add(name)
  }
  // 脚本/模板字符串中的图标名（如 icon: 'PieChart'、prefix-icon="User"）
  const strs = content.match(/['"`][A-Z][A-Za-z0-9]*['"`]/g) || []
  for (const s of strs) {
    const name = s.replace(/['"`]/g, '')
    if (allIcons.has(name)) used.add(name)
  }
}

const sorted = [...used].sort()
const importLines = sorted.map((n) => `  ${n},`).join('\n')
const mapLines = sorted.map((n) => `  ${n},`).join('\n')

const content = `// ⚠️ 此文件由 scripts/gen-element-icons.mjs 自动生成，请勿手动编辑。
// 运行 \`node scripts/gen-element-icons.mjs\` 重新生成。
//
// 按需注册项目实际使用的 Element Plus 图标（${sorted.length} 个 / 共 ${allIcons.size} 个），
// 替代原先全量 \`import * as elementIcons\` 注册，避免首屏加载整个图标库。
import {
${importLines}
} from '@element-plus/icons-vue'

export const elementIcons = {
${mapLines}
}
`

writeFileSync(OUT_FILE, content)
console.log(
  `已生成 ${OUT_FILE}（${sorted.length} 个图标，裁剪 ${allIcons.size - sorted.length} 个）`
)
