/**
 * 从 CHANGELOG.md 提取指定版本（默认 package.json 版本）的更新说明，写入 RELEASE_NOTES.md，
 * 供 CI 发布 GitHub Release 时作为正文。
 *
 * 用法：node scripts/release-notes.js [version]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHANGELOG = path.join(ROOT, 'CHANGELOG.md')
const OUTPUT = path.join(ROOT, 'RELEASE_NOTES.md')

const version = process.argv[2] || JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf-8')).version

if (!existsSync(CHANGELOG)) {
  console.warn('[release-notes] 未找到 CHANGELOG.md，跳过')
  process.exit(0)
}

// 版本标题形如：## [2.0.3](compare-url) (date) 或 ### 2.0.3 (date)
const VERSION_HEADING = /^#{2,3}\s+\[?v?(\d+\.\d+\.\d+[^\]\s)]*)/
const lines = readFileSync(CHANGELOG, 'utf-8').split(/\r?\n/)

const start = lines.findIndex((line) => VERSION_HEADING.exec(line)?.[1] === version)
if (start === -1) {
  console.warn(`[release-notes] CHANGELOG.md 中未找到 ${version} 的记录，跳过`)
  process.exit(0)
}

let end = lines.findIndex((line, i) => i > start && VERSION_HEADING.test(line))
if (end === -1) end = lines.length

const notes = lines
  .slice(start + 1, end)
  .join('\n')
  .trim()

if (!notes) {
  console.warn(`[release-notes] ${version} 的更新说明为空，跳过`)
  process.exit(0)
}

writeFileSync(OUTPUT, `${notes}\n`)
console.log(`[release-notes] 已生成 ${path.relative(ROOT, OUTPUT)}（v${version}）`)
