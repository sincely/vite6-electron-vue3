#!/usr/bin/env node
/**
 * 路由指纹对比工具
 *
 * 对比两份 route-fingerprint.mjs 生成的快照，输出 API 表面积差异。
 * 重构后应做到「零差异」，任何差异都需要逐条确认。
 *
 * 用法：node scripts/tools/fingerprint-diff.mjs <before.json> <after.json>
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(scriptDir, '../..')

const [beforeArg, afterArg] = process.argv.slice(2)

if (!beforeArg || !afterArg) {
  console.error('用法: node scripts/tools/fingerprint-diff.mjs <before.json> <after.json>')
  process.exit(1)
}

const read = (file) => JSON.parse(fs.readFileSync(path.resolve(serverRoot, file), 'utf8'))

/**
 * 把指纹条目转成可比较的单行文本
 *
 * Dto 标签形如 `validate:modules/role/roleDto.js#RoleListQueryDto`，
 * 其中路径与 Dto 名字的后缀（Schema / DTO / Dto）会随内部重构变化，
 * 对比时归一化，只保留 Dto 的语义名。
 * @param {object} entry
 * @returns {string}
 */
const render = (entry) => {
  const normalize = (line) =>
    line.replace(/validate:[^#\]]*#([A-Za-z0-9_]+)/g, (_, name) => `validate:${name.replace(/(Schema|DTO|Dto)$/, '')}`)

  if (entry.kind === 'route') {
    return normalize(`ROUTE ${entry.methods.join(',')} ${entry.path} [${entry.chain.join(' , ')}] -> ${entry.handler}`)
  }
  return normalize(`MW    ${entry.path} [${entry.chain.join(' , ')}]`)
}

const before = read(beforeArg)
const after = read(afterArg)

const beforeLines = before.entries.map(render)
const afterLines = after.entries.map(render)

console.log(`before: ${beforeLines.length} 条（路由 ${before.summary.routes}）`)
console.log(`after : ${afterLines.length} 条（路由 ${after.summary.routes}）`)
console.log('─'.repeat(78))

// 先做集合比对，定位「新增 / 消失」的条目
const beforeSet = new Map()
const afterSet = new Map()
for (const line of beforeLines) {
  beforeSet.set(line, (beforeSet.get(line) || 0) + 1)
}
for (const line of afterLines) {
  afterSet.set(line, (afterSet.get(line) || 0) + 1)
}

const removed = []
const added = []

for (const [line, count] of beforeSet) {
  const delta = count - (afterSet.get(line) || 0)
  if (delta > 0) {
    for (let i = 0; i < delta; i += 1) {
      removed.push(line)
    }
  }
}
for (const [line, count] of afterSet) {
  const delta = count - (beforeSet.get(line) || 0)
  if (delta > 0) {
    for (let i = 0; i < delta; i += 1) {
      added.push(line)
    }
  }
}

if (removed.length === 0 && added.length === 0) {
  console.log('*** API 表面积完全一致：零差异 ***')
  process.exit(0)
}

if (removed.length) {
  console.log(`\n消失的条目 (${removed.length})：`)
  for (const line of removed) {
    console.log(`  - ${line}`)
  }
}
if (added.length) {
  console.log(`\n新增的条目 (${added.length})：`)
  for (const line of added) {
    console.log(`  + ${line}`)
  }
}

console.log('\n── 顺序差异（条目集合相同，仅排列顺序不同）──')
const max = Math.max(beforeLines.length, afterLines.length)
let orderDiff = 0
for (let i = 0; i < max; i += 1) {
  if (beforeLines[i] !== afterLines[i]) {
    orderDiff += 1
    console.log(`  @${i}\n    - ${beforeLines[i] ?? '(none)'}\n    + ${afterLines[i] ?? '(none)'}`)
  }
}
if (orderDiff === 0) {
  console.log('  无')
}

process.exit(1)
