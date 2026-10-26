#!/usr/bin/env node
/**
 * 路由指纹工具
 *
 * 用途：在目录重构前后生成「API 表面积快照」，用于证明路由的
 * 方法、路径、处理器与中间件链完全一致（业务逻辑零改动）。
 *
 * 用法：
 *   node scripts/tools/route-fingerprint.mjs <根路由模块路径> <输出文件>
 *
 * 例：
 *   node scripts/tools/route-fingerprint.mjs src/routers/index.js .fingerprint/before.json
 *
 * 实现原理：
 *   1. 注册 fingerprint-loader.mjs，给 errorControllerWrapper / validateBody /
 *      validateQuery / authorizeRoute 的返回值挂上只读标签。
 *   2. 导入根路由。@koa/router 在 use() 时会把子路由克隆并加前缀平铺进
 *      父路由的 stack，因此根路由 stack 即为完整扁平的路由表。
 *   3. 遍历 stack，输出有序的路由与中间件条目。
 */
import { register } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const rootRouterModule = args[0]
const outputFile = args[1]

if (!rootRouterModule || !outputFile) {
  console.error('用法: node scripts/tools/route-fingerprint.mjs <根路由模块路径> <输出文件>')
  process.exit(1)
}

const scriptDir = path.dirname(new URL(import.meta.url).pathname)
const serverRoot = path.resolve(scriptDir, '../..')
const srcDir = path.join(serverRoot, 'src')

// 必须在导入任何路由模块之前注册钩子
register('./fingerprint-loader.mjs', import.meta.url)

/**
 * 递归收集 src 下所有「Dto」相关模块路径。
 * Dto 定义在各业务模块内部（*Dto.js），因此按文件名匹配而非固定目录。
 * @param {string} dir
 * @param {string[]} acc
 * @returns {string[]}
 */
const collectSchemaFiles = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        continue
      }
      collectSchemaFiles(full, acc)
    } else if (entry.isFile() && /(dto|schema)/i.test(entry.name) && entry.name.endsWith('.js')) {
      acc.push(full)
    }
  }
  return acc
}

/**
 * 判断一个导出值是否为 zod Dto 定义。
 * @param {unknown} value
 * @returns {boolean}
 */
const isZodSchema = (value) => {
  if (!value || typeof value !== 'object') {
    return false
  }
  return Boolean(value._zod || value.def)
}

/**
 * 构建 Dto 对象 → 导出名 的映射，用于把校验中间件还原成具体 Dto 名。
 * @returns {Promise<Map<object, string>>}
 */
const buildSchemaIdentityMap = async () => {
  const map = new Map()
  const files = collectSchemaFiles(srcDir)

  for (const file of files) {
    let mod
    try {
      mod = await import(pathToFileURL(file).href)
    } catch {
      continue
    }

    const relative = path.relative(srcDir, file).replace(/\\/g, '/')
    for (const [name, value] of Object.entries(mod)) {
      if (isZodSchema(value) && !map.has(value)) {
        map.set(value, `${relative}#${name}`)
      }
    }
  }

  return map
}

/**
 * 为中间件函数生成稳定的可比较标识。
 * @param {Function} middleware
 * @param {Map<object, string>} schemaMap
 * @returns {string}
 */
const identifyMiddleware = (middleware, schemaMap) => {
  if (typeof middleware !== 'function') {
    return `non-function:${String(middleware)}`
  }

  if (middleware.__handlerName) {
    return `handler:${middleware.__handlerName}`
  }

  if (middleware.__schemaRef) {
    return `validate:${schemaMap.get(middleware.__schemaRef) || 'unknown-dto'}`
  }

  if (middleware.__authorizePath !== undefined) {
    return `authorize:${middleware.__authorizePath}`
  }

  if (middleware.name) {
    return `fn:${middleware.name}`
  }

  // 匿名中间件：使用归一化后的源码摘要，保证重构前后可比较
  const normalized = middleware.toString().replace(/\s+/g, ' ').trim()
  return `anon:${normalized.slice(0, 160)}`
}

const main = async () => {
  const schemaMap = await buildSchemaIdentityMap()

  const routerModulePath = path.isAbsolute(rootRouterModule)
    ? rootRouterModule
    : path.join(serverRoot, rootRouterModule)

  const mod = await import(pathToFileURL(routerModulePath).href)
  const rootRouter = mod.default

  if (!rootRouter || !Array.isArray(rootRouter.stack)) {
    throw new Error(`模块 ${rootRouterModule} 未导出可用的 Koa Router`)
  }

  const entries = []

  rootRouter.stack.forEach((layer, index) => {
    const methods = layer.methods || []
    const chain = (layer.stack || []).map((mw) => identifyMiddleware(mw, schemaMap))

    if (methods.length === 0) {
      entries.push({
        index,
        kind: 'middleware',
        path: layer.path,
        chain
      })
      return
    }

    const handler = chain[chain.length - 1] || 'none'
    entries.push({
      index,
      kind: 'route',
      methods: methods.filter((m) => m !== 'HEAD'),
      path: layer.path,
      handler,
      chain: chain.slice(0, -1)
    })
  })

  const routes = entries.filter((e) => e.kind === 'route')
  const fingerprint = {
    generatedAt: new Date().toISOString(),
    rootRouterModule,
    summary: {
      total: entries.length,
      routes: routes.length,
      middlewareLayers: entries.length - routes.length
    },
    entries
  }

  fs.mkdirSync(path.dirname(path.resolve(serverRoot, outputFile)), { recursive: true })
  fs.writeFileSync(path.resolve(serverRoot, outputFile), `${JSON.stringify(fingerprint, null, 2)}\n`, 'utf8')

  console.log(`路由指纹已生成: ${outputFile}`)
  console.log(`  路由条目: ${fingerprint.summary.routes}  中间件层: ${fingerprint.summary.middlewareLayers}`)
}

main().catch((err) => {
  console.error('路由指纹生成失败:', err)
  process.exit(1)
})
