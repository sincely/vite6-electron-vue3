/**
 * ESM 加载钩子：为路由指纹工具补充运行时元数据。
 *
 * 本钩子只在 `route-fingerprint.mjs` 启动时注册，不参与应用运行。
 * 它不改变任何业务逻辑，仅给包装后的中间件挂上只读标签：
 *   - errorControllerWrapper(ctrl)  →  __handlerName / __handlerSource
 *   - validateBody(schema)          →  __schemaRef
 *   - validateQuery(schema)         →  __schemaRef
 *   - authorizeRoute(path)          →  __authorizePath
 *
 * 匹配依据是「导出名」而非文件路径，因此重构前后同一份工具可直接复用。
 */

const TAG_ORIGINAL = 'const __origErrorControllerWrapper ='
const TAG_SCHEMA_ORIGINAL = 'const __origValidateBody ='
const TAG_SCHEMA_QUERY_ORIGINAL = 'const __origValidateQuery ='
const TAG_AUTHORIZE_ORIGINAL = 'const __origAuthorizeRoute ='

/**
 * @param {string} source
 * @returns {string}
 */
const patchErrorControllerWrapper = (source) => {
  if (!/export\s+const\s+errorControllerWrapper\s*=/.test(source)) {
    return source
  }

  const patched = source.replace(/export\s+const\s+errorControllerWrapper\s*=/, TAG_ORIGINAL)

  return `${patched}
export const errorControllerWrapper = (controller) => {
  const wrapped = __origErrorControllerWrapper(controller)
  Object.defineProperty(wrapped, '__handlerName', {
    value: controller?.name || 'anonymous',
    configurable: true
  })
  Object.defineProperty(wrapped, '__handlerSource', { value: controller, configurable: true })
  return wrapped
}
`
}

/**
 * @param {string} source
 * @returns {string}
 */
const patchValidation = (source) => {
  const hasBody = /export\s+const\s+validateBody\s*=/.test(source)
  const hasQuery = /export\s+const\s+validateQuery\s*=/.test(source)

  if (!hasBody && !hasQuery) {
    return source
  }

  let patched = source
  if (hasBody) {
    patched = patched.replace(/export\s+const\s+validateBody\s*=/, TAG_SCHEMA_ORIGINAL)
  }
  if (hasQuery) {
    patched = patched.replace(/export\s+const\s+validateQuery\s*=/, TAG_SCHEMA_QUERY_ORIGINAL)
  }

  let appended = ''
  if (hasBody) {
    appended += `
export const validateBody = (schema) => {
  const middleware = __origValidateBody(schema)
  Object.defineProperty(middleware, '__schemaRef', { value: schema, configurable: true })
  return middleware
}
`
  }
  if (hasQuery) {
    appended += `
export const validateQuery = (schema) => {
  const middleware = __origValidateQuery(schema)
  Object.defineProperty(middleware, '__schemaRef', { value: schema, configurable: true })
  return middleware
}
`
  }

  return `${patched}${appended}`
}

/**
 * @param {string} source
 * @returns {string}
 */
const patchAuthorize = (source) => {
  if (!/export\s+const\s+authorizeRoute\s*=/.test(source)) {
    return source
  }

  // 先摘掉原有的 `export default authorizeRoute`，改到补丁末尾重新导出，
  // 否则原始具名导出被改写后，默认导出会引用到尚未初始化的标识符。
  const stripped = source.replace(/export\s+default\s+authorizeRoute\s*;?/g, '')
  const patched = stripped.replace(/export\s+const\s+authorizeRoute\s*=/, TAG_AUTHORIZE_ORIGINAL)

  return `${patched}
export const authorizeRoute = (routePath) => {
  const middleware = __origAuthorizeRoute(routePath)
  Object.defineProperty(middleware, '__authorizePath', {
    value: Array.isArray(routePath) ? routePath.join('|') : String(routePath),
    configurable: true
  })
  return middleware
}

export default authorizeRoute
`
}

/**
 * @param {string} url
 * @param {object} context
 * @param {Function} nextLoad
 */
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context)

  if (!url.startsWith('file:')) {
    return result
  }

  const source = typeof result.source === 'string' ? result.source : (result.source?.toString('utf8') ?? '')
  if (!source) {
    return result
  }

  let patched = source
  patched = patchErrorControllerWrapper(patched)
  patched = patchValidation(patched)
  patched = patchAuthorize(patched)

  if (patched === source) {
    return result
  }

  return { ...result, source: patched }
}
