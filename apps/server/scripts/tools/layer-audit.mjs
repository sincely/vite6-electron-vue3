#!/usr/bin/env node
/**
 * 分层规范审计
 *
 * 检查代码是否遵守项目约定的分层边界与编码规范：
 *   1. SQL 只允许出现在 *Dao.js
 *   2. 跨模块协作只允许经模块公开 API，禁止跨模块引用 Dao
 *   3. Controller / 中间件不得直接 import Dao
 *   4. Dto 层不得依赖 Service / Dao
 *   5. Service 返回「对象字面量」时必须包含 success 字段
 *
 * 关于 Service 返回契约的两类函数（约定见 README「编码规范」）：
 *   - 业务操作 / 列表查询：返回 { success, code?, msg?, data? }
 *   - 取值辅助（单条查询、存在性判断、集合查询）：直接返回数据本身
 * 本工具只校验第一类中「返回对象字面量」的情况，避免误报辅助函数。
 *
 * 用法：node scripts/tools/layer-audit.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(scriptDir, '../..')
const srcDir = path.join(serverRoot, 'src')

const SQL_PATTERN = /\b(select\s+[\s\S]*?\sfrom\s|insert\s+into|update\s+\w+\s+set|delete\s+from)/i

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

/**
 * 取相对 src/ 的模块目录（modules/<domain> 或 modules/<domain>/<sub>）
 * @param {string} relative
 * @returns {string}
 */
const moduleDirOf = (relative) => {
  const parts = relative.split('/')
  if (parts[0] !== 'modules') {
    return ''
  }
  return parts.slice(0, 2).join('/')
}

const files = collect(srcDir)
const issues = []

/**
 * 判断某个位置是否位于「嵌套函数」内部
 * 嵌套函数指箭头函数体（=> { ... }）或 function 表达式体。
 * @param {string} content
 * @param {Array<[number, number]>} exportedRanges
 * @param {number} position
 * @returns {boolean}
 */
const isInsideNestedFunction = (content, exportedRanges, position) => {
  // 只在所属导出函数体内查找
  const range = exportedRanges.find(([start, end]) => position >= start && position <= end)
  if (!range) {
    return false
  }
  const [fnStart, fnEnd] = range

  // 找出该函数体内所有箭头函数 / function 表达式的函数体区间
  const nestedRanges = []
  const arrowPattern = /=>\s*\{/g
  let match
  while ((match = arrowPattern.exec(content)) !== null) {
    if (match.index < fnStart || match.index > fnEnd) {
      continue
    }
    const bodyStart = content.indexOf('{', match.index)
    let depth = 0
    for (let i = bodyStart; i < content.length; i += 1) {
      if (content[i] === '{') {
        depth += 1
      } else if (content[i] === '}') {
        depth -= 1
        if (depth === 0) {
          nestedRanges.push([bodyStart, i])
          break
        }
      }
    }
  }

  return nestedRanges.some(([start, end]) => position >= start && position <= end)
}

for (const file of files) {
  const relative = path.relative(srcDir, file).split(path.sep).join('/')
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')

  const isDao = relative.endsWith('Dao.js')
  const isService = relative.endsWith('Service.js')
  const isController = relative.endsWith('Controller.js')
  const isDto = relative.endsWith('Dto.js')
  const isMiddleware = relative.startsWith('middleware/')
  const isModuleFile = relative.startsWith('modules/')
  const currentModule = moduleDirOf(relative)

  lines.forEach((line, index) => {
    const lineNo = index + 1
    const code = line.trim()

    // 注释里的 SQL 关键字不计入
    if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*')) {
      return
    }

    // 规则 1：SQL 越层
    if (!isDao && SQL_PATTERN.test(line)) {
      issues.push({ rule: 'SQL 越层', file: relative, line: lineNo, detail: code.slice(0, 90) })
    }

    // 规则 4：Dto 层不得依赖 Service / Dao（Dto 只描述数据传输契约）
    if (isDto && /\bfrom\s+'[^']*(Service|Dao)\.js'/.test(line)) {
      issues.push({
        rule: 'Dto 层依赖 Service/Dao',
        file: relative,
        line: lineNo,
        detail: `${code.slice(0, 90)} → Dto 只应依赖 zod 与 shared 工具`
      })
    }

    // 规则 2/3：直接引用 Dao
    const daoImport = line.match(/import\s+([\w{},\s*]+)\s+from\s+'([^']*Dao\.js)'/)
    if (daoImport) {
      const target = daoImport[2]
      const resolved = path
        .relative(srcDir, path.resolve(path.dirname(file), target))
        .split(path.sep)
        .join('/')
      const targetModule = moduleDirOf(resolved)

      if (isModuleFile && targetModule && currentModule && targetModule !== currentModule) {
        issues.push({
          rule: '跨模块引用 Dao',
          file: relative,
          line: lineNo,
          detail: `${target} → 应改用 ${targetModule}/index.js 暴露的 service`
        })
      }

      if (isController || isMiddleware) {
        issues.push({
          rule: isController ? 'Controller 直连 Dao' : '中间件直连 Dao',
          file: relative,
          line: lineNo,
          detail: `${target} → 应改用 service`
        })
      }
    }
  })

  // 规则 4：Service 导出函数返回对象字面量时必须带 success
  if (isService) {
    // 先定位所有导出函数的代码区间，私有辅助函数不受此约束
    const exportedRanges = []
    const exportPattern = /^export\s+(?:const|let|function|async\s+function)\s+([\w$]+)/gm
    let exportMatch
    while ((exportMatch = exportPattern.exec(content)) !== null) {
      const bodyStart = content.indexOf('{', exportMatch.index)
      if (bodyStart === -1) {
        continue
      }
      let depth = 0
      for (let i = bodyStart; i < content.length; i += 1) {
        if (content[i] === '{') {
          depth += 1
        } else if (content[i] === '}') {
          depth -= 1
          if (depth === 0) {
            exportedRanges.push([bodyStart, i])
            break
          }
        }
      }
    }

    const objectReturns = [...content.matchAll(/return\s*\{/g)]
    for (const match of objectReturns) {
      const isInsideExported = exportedRanges.some(([start, end]) => match.index >= start && match.index <= end)
      if (!isInsideExported) {
        continue
      }

      // 嵌套函数（箭头函数 / function 表达式）内部的 return 不属于导出函数的返回值
      if (isInsideNestedFunction(content, exportedRanges, match.index)) {
        continue
      }

      // 取出该 return 语句所属的块（从 { 到配对的 }）
      const start = match.index + match[0].length - 1
      let depth = 0
      let end = -1
      for (let i = start; i < content.length; i += 1) {
        if (content[i] === '{') {
          depth += 1
        } else if (content[i] === '}') {
          depth -= 1
          if (depth === 0) {
            end = i
            break
          }
        }
      }
      if (end === -1) {
        continue
      }
      const block = content.slice(start, end + 1)
      if (!/\bsuccess\s*:/.test(block)) {
        const lineNo = content.slice(0, match.index).split('\n').length
        issues.push({
          rule: 'Service 返回契约不统一',
          file: relative,
          line: lineNo,
          detail: `return { ... } 缺少 success 字段`
        })
      }
    }
  }
}

console.log(`分层规范审计：扫描 ${files.length} 个文件\n`)

if (issues.length === 0) {
  console.log('*** 未发现分层违规 ***')
  process.exit(0)
}

const byRule = new Map()
for (const issue of issues) {
  if (!byRule.has(issue.rule)) {
    byRule.set(issue.rule, [])
  }
  byRule.get(issue.rule).push(issue)
}

for (const [rule, list] of byRule) {
  console.log(`▌${rule} (${list.length})`)
  for (const issue of list) {
    console.log(`  ${issue.file}:${issue.line}  ${issue.detail}`)
  }
  console.log('')
}

process.exit(1)
