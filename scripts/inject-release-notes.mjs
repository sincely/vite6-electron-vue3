/**
 * inject-release-notes.mjs
 *
 * 打包前自动从 CHANGELOG.md 中提取当前版本的更新内容，
 * 写入 electron-builder.json 的 releaseInfo.releaseNotes 字段。
 *
 * 支持以下 CHANGELOG 版本标题格式：
 *   ## v0.0.6
 *   ## [0.0.6](...)
 *   ## 0.0.6
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// ── 读取当前版本号 ────────────────────────────────────────────
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
// 去掉 pre-release 后缀：0.0.6-0 → 0.0.6
const version = pkg.version.replace(/-[^.]*$/, '')

// ── 从 CHANGELOG.md 提取对应版本内容 ─────────────────────────
const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf-8')

/**
 * 匹配如下格式的版本标题（忽略大小写）：
 *   ## v0.0.6
 *   ## v0.0.6 (2026-03-04)
 *   ## [0.0.6](https://...)
 *   ## 0.0.6
 */
const escapedVer = version.replace(/\./g, '\\.')
const pattern = new RegExp(`^##\\s+(?:v?${escapedVer}|\\[v?${escapedVer}\\][^\\n]*)[ \\t]*$`, 'm')

let releaseNotes = `v${version} 版本更新` // 默认值，找不到时使用

const matchIndex = changelog.search(pattern)
if (matchIndex !== -1) {
  // 截取从标题行下一行开始，到下一个 ## 标题（或文件末尾）之间的内容
  const afterHeading = changelog.slice(matchIndex).split('\n').slice(1).join('\n')
  const nextSectionIndex = afterHeading.search(/^##\s/m)
  const section = nextSectionIndex !== -1 ? afterHeading.slice(0, nextSectionIndex) : afterHeading

  // 按子章节解析，跳过 Contributors，给每条目保留章节 emoji 前缀
  const sectionLines = section.split('\n')
  let currentEmoji = ''
  let skipSection = false
  const items = []

  for (const rawLine of sectionLines) {
    const line = rawLine.trim()

    // ### 子章节标题，如 ### 🚀 Enhancements
    if (/^###\s+/.test(line)) {
      const heading = line.replace(/^###\s+/, '')
      // Contributors 段整体跳过（不进入发布说明）
      skipSection = /contributor/i.test(heading)
      // 提取标题最前面的 emoji 字符作为本节条目前缀
      const m = heading.match(/^([^\x20-\x7E]+)/)
      currentEmoji = m ? m[1].trim() + ' ' : ''
      continue
    }

    if (skipSection) continue

    // 列表项（- 或 * 开头）
    if (/^[-*]\s+/.test(line)) {
      const text = line
        .replace(/^[-*]\s+/, '')
        .replace(/\s*\(\[[\da-f]+\]\(https?:\/\/[^)]+\)\)/g, '') // 去除 git commit 链接
        .trim()
      if (text) items.push(currentEmoji + text)
    }
  }

  if (items.length) releaseNotes = items.join('; ')
}

// ── 写入 electron-builder.json ───────────────────────────────
const configPath = resolve(root, 'electron-builder.json')
const builderConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
builderConfig.releaseInfo = { releaseNotes }
writeFileSync(configPath, JSON.stringify(builderConfig, null, 2) + '\n', 'utf-8')

// ── 输出摘要 ─────────────────────────────────────────────────
const preview = releaseNotes.length > 120 ? releaseNotes.slice(0, 120) + '…' : releaseNotes
console.log(`✅ [inject-release-notes] v${version} 更新内容已写入 electron-builder.json`)
console.log('─'.repeat(60))
console.log(preview)
console.log('─'.repeat(60))
