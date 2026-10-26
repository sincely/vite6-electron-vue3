#!/usr/bin/env node
/**
 * 导入冒烟测试
 *
 * 动态导入 src 下每个 .js 文件，捕获以下问题：
 *   - 失效的相对路径（文件搬走但 import 没改）
 *   - 命名导出不存在
 *   - 循环依赖导致的初始化时序错误
 *   - 语法错误
 *
 * 用法：node scripts/tools/import-smoke.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(scriptDir, '../..')
const srcDir = path.join(serverRoot, 'src')

/**
 * 收集 src 下全部 .js 文件
 * @param {string} dir
 * @param {string[]} acc
 * @returns {string[]}
 */
const collect = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collect(full, acc)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      acc.push(full)
    }
  }
  return acc
}

const files = collect(srcDir)
const failures = []

for (const file of files) {
  const relative = path.relative(serverRoot, file)
  try {
    await import(pathToFileURL(file).href)
  } catch (err) {
    failures.push({ file: relative, message: err.message, stack: err.stack?.split('\n').slice(0, 4).join('\n') })
  }
}

console.log(`导入冒烟测试：共 ${files.length} 个文件`)

if (failures.length === 0) {
  console.log('*** 全部导入成功 ***')
  process.exit(0)
}

console.log(`\n失败 ${failures.length} 个：\n`)
for (const failure of failures) {
  console.log(`  ✗ ${failure.file}`)
  console.log(`    ${failure.message}`)
}
process.exit(1)
