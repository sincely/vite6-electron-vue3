import process from 'node:process'
globalThis._importMeta_ = { url: import.meta.url, env: process.env }
import { tmpdir } from 'node:os'
import { Server } from 'node:http'
import { resolve, dirname, join } from 'node:path'
import nodeCrypto from 'node:crypto'
import { parentPort, threadId } from 'node:worker_threads'
import wsAdapter from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/crossws@0.3.5/node_modules/crossws/dist/adapters/node.mjs'
import {
  defineEventHandler,
  handleCacheHeaders,
  splitCookiesString,
  createEvent,
  fetchWithEvent,
  isEvent,
  eventHandler,
  setHeaders,
  sendRedirect,
  proxyRequest,
  getRequestURL,
  getRequestHeader,
  getResponseHeader,
  getRequestHeaders,
  setResponseHeaders,
  setResponseStatus,
  send,
  createApp,
  createRouter as createRouter$1,
  toNodeListener,
  lazyEventHandler,
  createError,
  getRouterParam,
  readBody,
  getQuery as getQuery$1,
  deleteCookie,
  setCookie,
  getCookie,
  getHeader,
  defineWebSocketHandler
} from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/h3@1.15.11/node_modules/h3/dist/index.mjs'
import destr from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs'
import { createHooks } from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs'
import {
  createFetch,
  Headers as Headers$1
} from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/ofetch@1.5.1/node_modules/ofetch/dist/node.mjs'
import {
  fetchNodeRequestHandler,
  callNodeRequestHandler
} from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/node-mock-http@1.0.5/node_modules/node-mock-http/dist/index.mjs'
import {
  parseURL,
  withoutBase,
  joinURL,
  getQuery,
  withQuery
} from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/ufo@1.6.4/node_modules/ufo/dist/index.mjs'
import {
  createStorage,
  prefixStorage
} from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/unstorage@1.17.5_@netlify+blobs@9.1.2_db0@0.3.4_ioredis@5.11.1/node_modules/unstorage/dist/index.mjs'
import unstorage_47drivers_47fs from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/unstorage@1.17.5_@netlify+blobs@9.1.2_db0@0.3.4_ioredis@5.11.1/node_modules/unstorage/drivers/fs.mjs'
import { digest } from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs'
import { klona } from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs'
import defu, {
  defuFn
} from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/defu@6.1.7/node_modules/defu/dist/defu.mjs'
import { snakeCase } from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs'
import {
  toRouteMatcher,
  createRouter
} from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs'
import { readFile } from 'node:fs/promises'
import consola from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs'
import { ErrorParser } from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/youch-core@0.3.3/node_modules/youch-core/build/index.js'
import { Youch } from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/youch@4.1.1/node_modules/youch/build/index.js'
import { SourceMapConsumer } from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/source-map@0.7.6/node_modules/source-map/source-map.js'
import jwt from 'file://D:/project/vite6-electron-vue3/node_modules/.pnpm/jsonwebtoken@9.0.2/node_modules/jsonwebtoken/index.js'

const serverAssets = [
  {
    baseName: 'server',
    dir: 'D:/project/vite6-electron-vue3/apps/backend/assets'
  }
]

const assets = createStorage()

for (const asset of serverAssets) {
  assets.mount(
    asset.baseName,
    unstorage_47drivers_47fs({ base: asset.dir, ignore: asset?.ignore || [] })
  )
}

const storage = createStorage({})

storage.mount('/assets', assets)

storage.mount(
  'root',
  unstorage_47drivers_47fs({
    driver: 'fs',
    readOnly: true,
    base: 'D:/project/vite6-electron-vue3/apps/backend'
  })
)
storage.mount(
  'src',
  unstorage_47drivers_47fs({
    driver: 'fs',
    readOnly: true,
    base: 'D:/project/vite6-electron-vue3/apps/backend'
  })
)
storage.mount(
  'build',
  unstorage_47drivers_47fs({
    driver: 'fs',
    readOnly: false,
    base: 'D:/project/vite6-electron-vue3/apps/backend/.nitro'
  })
)
storage.mount(
  'cache',
  unstorage_47drivers_47fs({
    driver: 'fs',
    readOnly: false,
    base: 'D:/project/vite6-electron-vue3/apps/backend/.nitro/cache'
  })
)
storage.mount(
  'data',
  unstorage_47drivers_47fs({
    driver: 'fs',
    base: 'D:/project/vite6-electron-vue3/apps/backend/.data/kv'
  })
)

function useStorage(base = '') {
  return base ? prefixStorage(storage, base) : storage
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = ''
    #context = /* @__PURE__ */ new Map()
    write(str) {
      this.buff += str
    }
    dispatch(value) {
      const type = value === null ? 'null' : typeof value
      return this[type](value)
    }
    object(object) {
      if (object && typeof object.toJSON === 'function') {
        return this.object(object.toJSON())
      }
      const objString = Object.prototype.toString.call(object)
      let objType = ''
      const objectLength = objString.length
      objType =
        objectLength < 10
          ? 'unknown:[' + objString + ']'
          : objString.slice(8, objectLength - 1)
      objType = objType.toLowerCase()
      let objectNumber = null
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size)
      } else {
        return this.dispatch('[CIRCULAR:' + objectNumber + ']')
      }
      if (
        typeof Buffer !== 'undefined' &&
        Buffer.isBuffer &&
        Buffer.isBuffer(object)
      ) {
        this.write('buffer:')
        return this.write(object.toString('utf8'))
      }
      if (
        objType !== 'object' &&
        objType !== 'function' &&
        objType !== 'asyncfunction'
      ) {
        if (this[objType]) {
          this[objType](object)
        } else {
          this.unknown(object, objType)
        }
      } else {
        const keys = Object.keys(object).sort()
        const extraKeys = []
        this.write('object:' + (keys.length + extraKeys.length) + ':')
        const dispatchForKey = (key) => {
          this.dispatch(key)
          this.write(':')
          this.dispatch(object[key])
          this.write(',')
        }
        for (const key of keys) {
          dispatchForKey(key)
        }
        for (const key of extraKeys) {
          dispatchForKey(key)
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered
      this.write('array:' + arr.length + ':')
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry)
        }
        return
      }
      const contextAdditions = /* @__PURE__ */ new Map()
      const entries = arr.map((entry) => {
        const hasher = new Hasher2()
        hasher.dispatch(entry)
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value)
        }
        return hasher.toString()
      })
      this.#context = contextAdditions
      entries.sort()
      return this.array(entries, false)
    }
    date(date) {
      return this.write('date:' + date.toJSON())
    }
    symbol(sym) {
      return this.write('symbol:' + sym.toString())
    }
    unknown(value, type) {
      this.write(type)
      if (!value) {
        return
      }
      this.write(':')
      if (value && typeof value.entries === 'function') {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        )
      }
    }
    error(err) {
      return this.write('error:' + err.toString())
    }
    boolean(bool) {
      return this.write('bool:' + bool)
    }
    string(string) {
      this.write('string:' + string.length + ':')
      this.write(string)
    }
    function(fn) {
      this.write('fn:')
      if (isNativeFunction(fn)) {
        this.dispatch('[native]')
      } else {
        this.dispatch(fn.toString())
      }
    }
    number(number) {
      return this.write('number:' + number)
    }
    null() {
      return this.write('Null')
    }
    undefined() {
      return this.write('Undefined')
    }
    regexp(regex) {
      return this.write('regex:' + regex.toString())
    }
    arraybuffer(arr) {
      this.write('arraybuffer:')
      return this.dispatch(new Uint8Array(arr))
    }
    url(url) {
      return this.write('url:' + url.toString())
    }
    map(map) {
      this.write('map:')
      const arr = [...map]
      return this.array(arr, false)
    }
    set(set) {
      this.write('set:')
      const arr = [...set]
      return this.array(arr, false)
    }
    bigint(number) {
      return this.write('bigint:' + number.toString())
    }
  }
  for (const type of [
    'uint8array',
    'uint8clampedarray',
    'unt8array',
    'uint16array',
    'unt16array',
    'uint32array',
    'unt32array',
    'float32array',
    'float64array'
  ]) {
    Hasher2.prototype[type] = function (arr) {
      this.write(type + ':')
      return this.array([...arr], false)
    }
  }
  function isNativeFunction(f) {
    if (typeof f !== 'function') {
      return false
    }
    return (
      Function.prototype.toString.call(f).slice(
        -15
        /* "[native code] }".length */
      ) === '[native code] }'
    )
  }
  return Hasher2
})()
function serialize(object) {
  const hasher = new Hasher()
  hasher.dispatch(object)
  return hasher.buff
}
function hash(value) {
  return digest(typeof value === 'string' ? value : serialize(value))
    .replace(/[-_]/g, '')
    .slice(0, 10)
}

function defaultCacheOptions() {
  return {
    name: '_',
    base: '/cache',
    swr: true,
    maxAge: 1
  }
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts }
  const pending = {}
  const group = opts.group || 'nitro/functions'
  const name = opts.name || fn.name || '_'
  const integrity = opts.integrity || hash([fn, opts])
  const validate = opts.validate || ((entry) => entry.value !== void 0)
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + '.json']
      .filter(Boolean)
      .join(':')
      .replace(/:\/$/, ':index')
    let entry =
      (await useStorage()
        .getItem(cacheKey)
        .catch((error) => {
          console.error(`[cache] Cache read error.`, error)
          useNitroApp().captureError(error, { event, tags: ['cache'] })
        })) || {}
    if (typeof entry !== 'object') {
      entry = {}
      const error = new Error('Malformed data read from cache.')
      console.error('[cache]', error)
      useNitroApp().captureError(error, { event, tags: ['cache'] })
    }
    const ttl = (opts.maxAge ?? 0) * 1e3
    if (ttl) {
      entry.expires = Date.now() + ttl
    }
    const expired =
      shouldInvalidateCache ||
      entry.integrity !== integrity ||
      (ttl && Date.now() - (entry.mtime || 0) > ttl) ||
      validate(entry) === false
    const _resolve = async () => {
      const isPending = pending[key]
      if (!isPending) {
        if (
          entry.value !== void 0 &&
          (opts.staleMaxAge || 0) >= 0 &&
          opts.swr === false
        ) {
          entry.value = void 0
          entry.integrity = void 0
          entry.mtime = void 0
          entry.expires = void 0
        }
        pending[key] = Promise.resolve(resolver())
      }
      try {
        entry.value = await pending[key]
      } catch (error) {
        if (!isPending) {
          delete pending[key]
        }
        throw error
      }
      if (!isPending) {
        entry.mtime = Date.now()
        entry.integrity = integrity
        delete pending[key]
        if (validate(entry) !== false) {
          let setOpts
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge }
          }
          const promise = useStorage()
            .setItem(cacheKey, entry, setOpts)
            .catch((error) => {
              console.error(`[cache] Cache write error.`, error)
              useNitroApp().captureError(error, { event, tags: ['cache'] })
            })
          if (event?.waitUntil) {
            event.waitUntil(promise)
          }
        }
      }
    }
    const _resolvePromise = expired ? _resolve() : Promise.resolve()
    if (entry.value === void 0) {
      await _resolvePromise
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise)
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error)
        useNitroApp().captureError(error, { event, tags: ['cache'] })
      })
      return entry
    }
    return _resolvePromise.then(() => entry)
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args)
    if (shouldBypassCache) {
      return fn(...args)
    }
    const key = await (opts.getKey || getKey)(...args)
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args)
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    )
    let value = entry.value
    if (opts.transform) {
      value = (await opts.transform(entry, ...args)) || value
    }
    return value
  }
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts)
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : ''
}
function escapeKey(key) {
  return String(key).replace(/\W/g, '')
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || [])
    .filter(Boolean)
    .map((h) => h.toLowerCase())
    .sort()
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event)
      if (customKey) {
        return escapeKey(customKey)
      }
      const _path =
        event.node.req.originalUrl || event.node.req.url || event.path
      let _pathname
      try {
        _pathname =
          escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || 'index'
      } catch {
        _pathname = '-'
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`
      const _headers = variableHeaderNames
        .map((header) => [header, event.node.req.headers[header]])
        .map(([name, value]) => `${escapeKey(name)}.${hash(value)}`)
      return [_hashedPath, ..._headers].join(':')
    },
    validate: (entry) => {
      if (!entry.value) {
        return false
      }
      if (entry.value.code >= 400) {
        return false
      }
      if (entry.value.body === void 0) {
        return false
      }
      if (
        entry.value.headers.etag === 'undefined' ||
        entry.value.headers['last-modified'] === 'undefined'
      ) {
        return false
      }
      return true
    },
    group: opts.group || 'nitro/handlers',
    integrity: opts.integrity || hash([handler, opts])
  }
  const _cachedHandler = cachedFunction(async (incomingEvent) => {
    const variableHeaders = {}
    for (const header of variableHeaderNames) {
      const value = incomingEvent.node.req.headers[header]
      if (value !== void 0) {
        variableHeaders[header] = value
      }
    }
    const reqProxy = cloneWithProxy(incomingEvent.node.req, {
      headers: variableHeaders
    })
    const resHeaders = {}
    let _resSendBody
    const resProxy = cloneWithProxy(incomingEvent.node.res, {
      statusCode: 200,
      writableEnded: false,
      writableFinished: false,
      headersSent: false,
      closed: false,
      getHeader(name) {
        return resHeaders[name]
      },
      setHeader(name, value) {
        resHeaders[name] = value
        return this
      },
      getHeaderNames() {
        return Object.keys(resHeaders)
      },
      hasHeader(name) {
        return name in resHeaders
      },
      removeHeader(name) {
        delete resHeaders[name]
      },
      getHeaders() {
        return resHeaders
      },
      end(chunk, arg2, arg3) {
        if (typeof chunk === 'string') {
          _resSendBody = chunk
        }
        if (typeof arg2 === 'function') {
          arg2()
        }
        if (typeof arg3 === 'function') {
          arg3()
        }
        return this
      },
      write(chunk, arg2, arg3) {
        if (typeof chunk === 'string') {
          _resSendBody = chunk
        }
        if (typeof arg2 === 'function') {
          arg2(void 0)
        }
        if (typeof arg3 === 'function') {
          arg3()
        }
        return true
      },
      writeHead(statusCode, headers2) {
        this.statusCode = statusCode
        if (headers2) {
          if (Array.isArray(headers2) || typeof headers2 === 'string') {
            throw new TypeError('Raw headers  is not supported.')
          }
          for (const header in headers2) {
            const value = headers2[header]
            if (value !== void 0) {
              this.setHeader(header, value)
            }
          }
        }
        return this
      }
    })
    const event = createEvent(reqProxy, resProxy)
    event.fetch = (url, fetchOptions) =>
      fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      })
    event.$fetch = (url, fetchOptions) =>
      fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      })
    event.waitUntil = incomingEvent.waitUntil
    event.context = incomingEvent.context
    event.context.cache = {
      options: _opts
    }
    const body = (await handler(event)) || _resSendBody
    const headers = event.node.res.getHeaders()
    headers.etag = String(headers.Etag || headers.etag || `W/"${hash(body)}"`)
    headers['last-modified'] = String(
      headers['Last-Modified'] ||
        headers['last-modified'] ||
        /* @__PURE__ */ new Date().toUTCString()
    )
    const cacheControl = []
    if (opts.swr) {
      if (opts.maxAge) {
        cacheControl.push(`s-maxage=${opts.maxAge}`)
      }
      if (opts.staleMaxAge) {
        cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`)
      } else {
        cacheControl.push('stale-while-revalidate')
      }
    } else if (opts.maxAge) {
      cacheControl.push(`max-age=${opts.maxAge}`)
    }
    if (cacheControl.length > 0) {
      headers['cache-control'] = cacheControl.join(', ')
    }
    const cacheEntry = {
      code: event.node.res.statusCode,
      headers,
      body
    }
    return cacheEntry
  }, _opts)
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return
      }
      return handler(event)
    }
    const response = await _cachedHandler(event)
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body
    }
    if (
      handleCacheHeaders(event, {
        modifiedTime: new Date(response.headers['last-modified']),
        etag: response.headers.etag,
        maxAge: opts.maxAge
      })
    ) {
      return
    }
    event.node.res.statusCode = response.code
    for (const name in response.headers) {
      const value = response.headers[name]
      if (name === 'set-cookie') {
        event.node.res.appendHeader(name, splitCookiesString(value))
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value)
        }
      }
    }
    return response.body
  })
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property]
      }
      return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value
        return true
      }
      return Reflect.set(target, property, value, receiver)
    }
  })
}
const cachedEventHandler = defineCachedEventHandler

const inlineAppConfig = {}

const appConfig = defuFn(inlineAppConfig)

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase()
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  )
}
function _isObject(input) {
  return typeof input === 'object' && !Array.isArray(input)
}
function applyEnv(obj, opts, parentKey = '') {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key
    const envValue = getEnv(subKey, opts)
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue }
        applyEnv(obj[key], opts, subKey)
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey)
      } else {
        obj[key] = envValue ?? obj[key]
      }
    } else {
      obj[key] = envValue ?? obj[key]
    }
    if (opts.envExpansion && typeof obj[key] === 'string') {
      obj[key] = _expandFromEnv(obj[key])
    }
  }
  return obj
}
const envExpandRx = /\{\{([^{}]*)\}\}/g
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match
  })
}

const _inlineRuntimeConfig = {
  app: {
    baseURL: '/'
  },
  nitro: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': '*',
          'access-control-allow-headers': '*',
          'access-control-max-age': '0',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers':
            'Accept, Authorization, Content-Length, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-CSRF-TOKEN, X-Requested-With',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': '*'
        }
      }
    }
  }
}
const envOptions = {
  prefix: 'NITRO_',
  altPrefix:
    _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? '_',
  envExpansion:
    _inlineRuntimeConfig.nitro.envExpansion ??
    process.env.NITRO_ENV_EXPANSION ??
    false
}
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
)
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig
  }
}
_deepFreeze(klona(appConfig))
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object)
  for (const name of propNames) {
    const value = object[name]
    if (value && typeof value === 'object') {
      _deepFreeze(value)
    }
  }
  return Object.freeze(object)
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      'Please use `useRuntimeConfig()` instead of accessing config directly.'
    )
    const runtimeConfig = useRuntimeConfig()
    if (prop in runtimeConfig) {
      return runtimeConfig[prop]
    }
    return void 0
  }
})

const config = useRuntimeConfig()
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
)
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event)
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers)
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to
      if (target.endsWith('/**')) {
        let targetPath = event.path
        const strpBase = routeRules.redirect._redirectStripBase
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase)
        }
        target = joinURL(target.slice(0, -3), targetPath)
      } else if (event.path.includes('?')) {
        const query = getQuery(event.path)
        target = withQuery(target, query)
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode)
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to
      if (target.endsWith('/**')) {
        let targetPath = event.path
        const strpBase = routeRules.proxy._proxyStripBase
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase)
        }
        target = joinURL(target.slice(0, -3), targetPath)
      } else if (event.path.includes('?')) {
        const query = getQuery(event.path)
        target = withQuery(target, query)
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      })
    }
  })
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {}
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split('?')[0], useRuntimeConfig().app.baseURL)
    )
  }
  return event.context._nitro.routeRules
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse())
}

function _captureError(error, type) {
  console.error(`[${type}]`, error)
  useNitroApp().captureError(error, { tags: [type] })
}
function trapUnhandledNodeErrors() {
  process.on('unhandledRejection', (error) =>
    _captureError(error, 'unhandledRejection')
  )
  process.on('uncaughtException', (error) =>
    _captureError(error, 'uncaughtException')
  )
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(', ') : String(value)
}
function normalizeFetchResponse(response) {
  if (!response.headers.has('set-cookie')) {
    return response
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  })
}
function normalizeCookieHeader(header = '') {
  return splitCookiesString(joinHeaders(header))
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers()
  for (const [name, header] of headers) {
    if (name === 'set-cookie') {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append('set-cookie', cookie)
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header))
    }
  }
  return outgoingHeaders
}

const errorHandler$2 = function (error, event) {
  event.node.res.end(`[Error Handler] ${error.stack}`)
}

function defineNitroErrorHandler(handler) {
  return handler
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event)
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers)
    }
    setResponseStatus(event, res.status, res.statusText)
    return send(
      event,
      typeof res.body === 'string'
        ? res.body
        : JSON.stringify(res.body, null, 2)
    )
  }
)
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal
  const statusCode = error.statusCode || 500
  const statusMessage = error.statusMessage || 'Server Error'
  const url = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true
  })
  if (statusCode === 404) {
    const baseURL = '/'
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`
      return {
        status: 302,
        statusText: 'Found',
        headers: { location: redirectTo },
        body: `Redirecting...`
      }
    }
  }
  await loadStackTrace(error).catch(consola.error)
  const youch = new Youch()
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && '[unhandled]', error.fatal && '[fatal]']
      .filter(Boolean)
      .join(' ')
    const ansiError = await (
      await youch.toANSI(error)
    ).replaceAll(process.cwd(), '.')
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    )
  }
  const useJSON =
    opts?.json || !getRequestHeader(event, 'accept')?.includes('text/html')
  const headers = {
    'content-type': useJSON ? 'application/json' : 'text/html',
    // Prevent browser from guessing the MIME types of resources.
    'x-content-type-options': 'nosniff',
    // Prevent error page from being embedded in an iframe
    'x-frame-options': 'DENY',
    // Prevent browsers from sending the Referer header
    'referrer-policy': 'no-referrer',
    // Disable the execution of any js
    'content-security-policy':
      "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  }
  if (statusCode === 404 || !getResponseHeader(event, 'cache-control')) {
    headers['cache-control'] = 'no-cache'
  }
  const body = useJSON
    ? {
        error: true,
        url,
        statusCode,
        statusMessage,
        message: error.message,
        data: error.data,
        stack: error.stack?.split('\n').map((line) => line.trim())
      }
    : await youch.toHTML(error, {
        request: {
          url: url.href,
          method: event.method,
          headers: getRequestHeaders(event)
        }
      })
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  }
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return
  }
  const parsed = await new ErrorParser()
    .defineSourceLoader(sourceLoader)
    .parse(error)
  const stack =
    error.message +
    '\n' +
    parsed.frames.map((frame) => fmtFrame(frame)).join('\n')
  Object.defineProperty(error, 'stack', { value: stack })
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error)
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== 'fs' || frame.type === 'native') {
    return
  }
  if (frame.type === 'app') {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, 'utf8').catch(
      () => {}
    )
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap)
      const originalPosition = consumer.originalPositionFor({
        line: frame.lineNumber,
        column: frame.columnNumber
      })
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(
          dirname(frame.fileName),
          originalPosition.source
        )
        frame.lineNumber = originalPosition.line
        frame.columnNumber = originalPosition.column || 0
      }
    }
  }
  const contents = await readFile(frame.fileName, 'utf8').catch(() => {})
  return contents ? { contents } : void 0
}
function fmtFrame(frame) {
  if (frame.type === 'native') {
    return frame.raw
  }
  const src = `${frame.fileName || ''}:${frame.lineNumber}:${frame.columnNumber})`
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`
}

const errorHandlers = [errorHandler$2, errorHandler$1]

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler })
      if (event.handled) {
        return // Response handled
      }
    } catch (error) {
      // Handler itself thrown, log and continue
      console.error(error)
    }
  }
  // H3 will handle fallback
}

const plugins = []

const _m6EfgO = defineEventHandler(async (event) => {
  event.node.res.setHeader(
    'Access-Control-Allow-Origin',
    event.headers.get('Origin') ?? '*'
  )
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.statusMessage = 'No Content.'
    return 'OK'
  }
})

const _lazy_B08JDz = () =>
  Promise.resolve().then(function () {
    return login_post$1
  })
const _lazy_VDk8tj = () =>
  Promise.resolve().then(function () {
    return logout_post$1
  })
const _lazy_AxW_5y = () =>
  Promise.resolve().then(function () {
    return refresh_post$1
  })
const _lazy_5EyCO7 = () =>
  Promise.resolve().then(function () {
    return detail$1
  })
const _lazy_AdjA6L = () =>
  Promise.resolve().then(function () {
    return list$1
  })
const _lazy_igBQbH = () =>
  Promise.resolve().then(function () {
    return create_post$5
  })
const _lazy_7oxHP4 = () =>
  Promise.resolve().then(function () {
    return delete_post$5
  })
const _lazy_dV_PiG = () =>
  Promise.resolve().then(function () {
    return list_get$7
  })
const _lazy_w4pslt = () =>
  Promise.resolve().then(function () {
    return update_put$5
  })
const _lazy_LRYkqM = () =>
  Promise.resolve().then(function () {
    return create_post$3
  })
const _lazy_vnNmPT = () =>
  Promise.resolve().then(function () {
    return delete_post$3
  })
const _lazy_Xaw8kJ = () =>
  Promise.resolve().then(function () {
    return list_get$5
  })
const _lazy_uaDzMC = () =>
  Promise.resolve().then(function () {
    return update_put$3
  })
const _lazy_WrzT8O = () =>
  Promise.resolve().then(function () {
    return create_post$1
  })
const _lazy_QUk5Lx = () =>
  Promise.resolve().then(function () {
    return delete_post$1
  })
const _lazy_B4Loi2 = () =>
  Promise.resolve().then(function () {
    return list_get$3
  })
const _lazy_zVHRGF = () =>
  Promise.resolve().then(function () {
    return update_put$1
  })
const _lazy_biy5FC = () =>
  Promise.resolve().then(function () {
    return list_get$1
  })
const _lazy_GTqxcV = () =>
  Promise.resolve().then(function () {
    return info$1
  })
const _lazy_UhBpyF = () =>
  Promise.resolve().then(function () {
    return _____$1
  })
const _lazy_3sRJeg = () =>
  Promise.resolve().then(function () {
    return chat$1
  })

const handlers = [
  {
    route: '',
    handler: _m6EfgO,
    lazy: false,
    middleware: true,
    method: undefined
  },
  {
    route: '/api/auth/login',
    handler: _lazy_B08JDz,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/auth/logout',
    handler: _lazy_VDk8tj,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/auth/refresh',
    handler: _lazy_AxW_5y,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/product/detail',
    handler: _lazy_5EyCO7,
    lazy: true,
    middleware: false,
    method: undefined
  },
  {
    route: '/api/product/list',
    handler: _lazy_AdjA6L,
    lazy: true,
    middleware: false,
    method: undefined
  },
  {
    route: '/api/system/menus/create',
    handler: _lazy_igBQbH,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/system/menus/delete',
    handler: _lazy_7oxHP4,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/system/menus/list',
    handler: _lazy_dV_PiG,
    lazy: true,
    middleware: false,
    method: 'get'
  },
  {
    route: '/api/system/menus/update',
    handler: _lazy_w4pslt,
    lazy: true,
    middleware: false,
    method: 'put'
  },
  {
    route: '/api/system/roles/create',
    handler: _lazy_LRYkqM,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/system/roles/delete',
    handler: _lazy_vnNmPT,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/system/roles/list',
    handler: _lazy_Xaw8kJ,
    lazy: true,
    middleware: false,
    method: 'get'
  },
  {
    route: '/api/system/roles/update',
    handler: _lazy_uaDzMC,
    lazy: true,
    middleware: false,
    method: 'put'
  },
  {
    route: '/api/system/users/create',
    handler: _lazy_WrzT8O,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/system/users/delete',
    handler: _lazy_QUk5Lx,
    lazy: true,
    middleware: false,
    method: 'post'
  },
  {
    route: '/api/system/users/list',
    handler: _lazy_B4Loi2,
    lazy: true,
    middleware: false,
    method: 'get'
  },
  {
    route: '/api/system/users/update',
    handler: _lazy_zVHRGF,
    lazy: true,
    middleware: false,
    method: 'put'
  },
  {
    route: '/api/table/list',
    handler: _lazy_biy5FC,
    lazy: true,
    middleware: false,
    method: 'get'
  },
  {
    route: '/api/user/info',
    handler: _lazy_GTqxcV,
    lazy: true,
    middleware: false,
    method: undefined
  },
  {
    route: '/**',
    handler: _lazy_UhBpyF,
    lazy: true,
    middleware: false,
    method: undefined
  },
  {
    route: '/ws/chat',
    handler: _lazy_3sRJeg,
    lazy: true,
    middleware: false,
    method: undefined
  }
]

function createNitroApp() {
  const config = useRuntimeConfig()
  const hooks = createHooks()
  const captureError = (error, context = {}) => {
    const promise = hooks
      .callHookParallel('error', error, context)
      .catch((error_) => {
        console.error('Error while capturing another error', error_)
      })
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors
      if (errors) {
        errors.push({ error, context })
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise)
      }
    }
  }
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ['request'] })
      return errorHandler(error, event)
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] }
      const fetchContext = event.node.req?.__unenv__
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        }
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil
      }
      event.fetch = (req, init) =>
        fetchWithEvent(event, req, init, { fetch: localFetch })
      event.$fetch = (req, init) =>
        fetchWithEvent(event, req, init, {
          fetch: $fetch
        })
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = []
        }
        event.context.nitro._waitUntilPromises.push(promise)
        if (event.context.waitUntil) {
          event.context.waitUntil(promise)
        }
      }
      event.captureError = (error, context) => {
        captureError(error, { event, ...context })
      }
      await nitroApp$1.hooks.callHook('request', event).catch((error) => {
        captureError(error, { event, tags: ['request'] })
      })
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks
        .callHook('beforeResponse', event, response)
        .catch((error) => {
          captureError(error, { event, tags: ['request', 'response'] })
        })
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks
        .callHook('afterResponse', event, response)
        .catch((error) => {
          captureError(error, { event, tags: ['request', 'response'] })
        })
    }
  })
  const router = createRouter$1({
    preemptive: true
  })
  const nodeHandler = toNodeListener(h3App)
  const localCall = (aRequest) => callNodeRequestHandler(nodeHandler, aRequest)
  const localFetch = (input, init) => {
    if (!input.toString().startsWith('/')) {
      return globalThis.fetch(input, init)
    }
    return fetchNodeRequestHandler(nodeHandler, input, init).then((response) =>
      normalizeFetchResponse(response)
    )
  }
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  })
  globalThis.$fetch = $fetch
  h3App.use(createRouteRulesHandler({ localFetch }))
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || '/')).replace(
        /\/+/g,
        '/'
      )
      h3App.use(middlewareBase, handler)
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, '_')
      )
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: 'nitro/routes',
          ...routeRules.cache
        })
      }
      router.use(h.route, handler, h.method)
    }
  }
  h3App.use(config.app.baseURL, router.handler)
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  }
  return app
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2)
    } catch (error) {
      nitroApp2.captureError(error, { tags: ['plugin'] })
      throw error
    }
  }
}
const nitroApp$1 = createNitroApp()
function useNitroApp() {
  return nitroApp$1
}
runNitroPlugins(nitroApp$1)

const scheduledTasks = false

const tasks = {}

const __runningTasks__ = {}
async function runTask(name, { payload = {}, context = {} } = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name]
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    })
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    })
  }
  const handler = await tasks[name].resolve()
  const taskEvent = { name, payload, context }
  __runningTasks__[name] = handler.run(taskEvent)
  try {
    const res = await __runningTasks__[name]
    return res
  } finally {
    delete __runningTasks__[name]
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env
trapUnhandledNodeErrors()
parentPort?.on('message', (msg) => {
  if (msg && msg.event === 'shutdown') {
    shutdown()
  }
})
const nitroApp = useNitroApp()
const server = new Server(toNodeListener(nitroApp.h3App))
let listener
listen()
  .catch(() =>
    listen(
      true
      /* use random port */
    )
  )
  .catch((error) => {
    console.error('Dev worker failed to listen:', error)
    return shutdown()
  })
{
  const { handleUpgrade } = wsAdapter(nitroApp.h3App.websocket)
  server.on('upgrade', handleUpgrade)
}
nitroApp.router.get(
  '/_nitro/tasks',
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.()
        return [name, { description: _task?.meta?.description }]
      })
    )
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    }
  })
)
nitroApp.router.use(
  '/_nitro/tasks/:name',
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'name')
    const payload = {
      ...getQuery$1(event),
      ...(await readBody(event)
        .then((r) => r?.payload)
        .catch(() => ({})))
    }
    return await runTask(name, { payload })
  })
)
function listen(
  useRandomPort = Boolean(
    NITRO_NO_UNIX_SOCKET ||
      process.versions.webcontainer ||
      ('Bun' in globalThis && process.platform === 'win32')
  )
) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address()
        parentPort?.postMessage({
          event: 'listen',
          address:
            typeof address === 'string'
              ? { socketPath: address }
              : { host: 'localhost', port: address?.port }
        })
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`
  if (process.platform === 'win32') {
    return join(String.raw`\\.\pipe`, socketName)
  }
  if (process.platform === 'linux') {
    const nodeMajor = Number.parseInt(process.versions.node.split('.')[0], 10)
    if (nodeMajor >= 20) {
      return `\0${socketName}`
    }
  }
  return join(tmpdir(), socketName)
}
async function shutdown() {
  server.closeAllConnections?.()
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook('close').catch(console.error)
  ])
  parentPort?.postMessage({ event: 'exit' })
}

function clearRefreshTokenCookie(event) {
  deleteCookie(event, 'jwt', {
    httpOnly: true,
    sameSite: 'none',
    secure: true
  })
}

function setRefreshTokenCookie(event, refreshToken) {
  setCookie(event, 'jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60, // unit: seconds
    sameSite: 'none',
    secure: true
  })
}

function getRefreshTokenFromCookie(event) {
  const refreshToken = getCookie(event, 'jwt')
  return refreshToken
}

const MOCK_USERS = [
  {
    id: 0,
    password: '123456',
    realName: '测试用户',
    avatar:
      'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
    roles: ['user'],
    username: 'user',
    phone: '13900139000',
    permissions: [
      'system:user:view',
      'system:role:view',
      'system:menu:view',
      'example:view'
    ]
  },
  {
    id: 2,
    password: '123456',
    realName: '运营编辑',
    avatar:
      'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
    roles: ['editor'],
    username: 'editor',
    phone: '13700137000',
    permissions: [
      'system:user:view',
      'example:view',
      'example:add',
      'example:edit'
    ]
  },
  {
    id: 1,
    password: '123456',
    realName: '管理员',
    avatar:
      'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
    roles: ['admin'],
    username: 'admin',
    phone: '13800138000',
    permissions: ['*:*:*']
  },
  {
    id: 1,
    password: '123456',
    realName: '管理员',
    avatar:
      'https://img12.360buyimg.com/imagetools/jfs/t1/143702/31/16654/116794/5fc6f541Edebf8a57/4138097748889987.png',
    roles: ['admin'],
    username: 'admin',
    phone: '15651376325',
    permissions: ['*:*:*']
  }
]

const MOCK_PRODUCTS = [
  {
    id: 1,
    imgUrl:
      '//img10.360buyimg.com/n2/s400x400_jfs/t1/210890/22/4728/163829/6163a590Eb7c6f4b5/6390526d49791cb9.jpg!q70.jpg',
    title:
      '【活蟹】湖塘煙雨 阳澄湖大闸蟹公4.5两 母3.5两 4对8只 鲜活生鲜螃蟹现货水产礼盒海鲜水',
    price: '388',
    vipPrice: '378',
    shopDesc: '自营',
    delivery: '厂商配送',
    shopName: '阳澄湖大闸蟹自营店',
    description:
      '新鲜捕捞，顺丰冷链配送，保证鲜活到家。公蟹膏满黄肥，母蟹籽多肉嫩。'
  },
  {
    id: 2,
    imgUrl:
      '//m.360buyimg.com/mobilecms/s400x400_jfs/t1/181328/3/31476/203233/63b66ef1F60f5f0f8/f4e8c4b6df4194d6.jpg!q70.dpg.webp',
    title:
      '【礼券】湖塘烟雨 海鲜卡券海产提货礼品卡春节年夜饭年货生鲜过年海鲜礼盒大礼包',
    price: '598',
    vipPrice: '378',
    shopDesc: '自营',
    delivery: '厂商配送',
    shopName: '阳澄湖大闸蟹自营店',
    description: '精选海鲜礼盒，包含多种海产品，送礼体面大方。'
  },
  {
    id: 3,
    imgUrl:
      '//m.360buyimg.com/mobilecms/s400x400_jfs/t1/214199/39/25134/127357/63c2b3adFed9c98f4/54126e85c23d0893.jpg!q80.dpg',
    title:
      '苏泊尔（SUPOR） 电饭煲远红外加热IH本釜内胆 电饭锅4L智能预约家用煮饭锅一键柴火饭SF40HC81',
    price: '1759',
    vipPrice: '1749',
    shopDesc: '自营',
    delivery: '厂商配送',
    shopName: '苏泊尔官方自营店',
    description: '远红外加热，IH本釜内胆，4L大容量，一键柴火饭，智能预约。'
  },
  {
    id: 4,
    imgUrl:
      '//m.360buyimg.com/mobilecms/s1265x1265_jfs/t20280402/412326/20/12475/54533/69cf75afFc560cac6/0a02320320cce0f2.jpg!q70.dpg.webp',
    title: 'Apple/苹果 iPhone 17 256GB 白色 支持移动联通电信5G 双卡双待手机',
    price: '5999',
    vipPrice: '5999',
    shopDesc: '自营',
    delivery: '京东物流',
    shopName: '华为官方自营店',
    description:
      '搭载A19芯片，6.1英寸超视网膜XDR显示屏，支持5G网络，双卡双待设计，提供卓越性能和流畅体验。'
  },
  {
    id: 5,
    imgUrl:
      'https://img10.360buyimg.com/pcpubliccms/s400x400_jfs/t1/414103/33/18764/70114/69eae2e4F9e33854b/00832ee3e88e35b0.jpg!q80.dpg',
    title: '戴森（Dyson）V12 Detect Slim 轻量智能无绳吸尘器 激光探测',
    price: '3990',
    vipPrice: '3890',
    shopDesc: '自营',
    delivery: '京东物流',
    shopName: '戴森官方旗舰店',
    description: '激光探测微尘，智能调节吸力，轻巧机身仅1.5kg。'
  }
]

// TODO: Replace with your own secret key
const ACCESS_TOKEN_SECRET = 'access_token_secret'
const REFRESH_TOKEN_SECRET = 'refresh_token_secret'

function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'
  })
}

function verifyAccessToken(event) {
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer')) {
    return null
  }

  const tokenParts = authHeader.split(' ')
  if (tokenParts.length !== 2) {
    return null
  }
  const token = tokenParts[1]
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET)

    const username = decoded.username
    const user = MOCK_USERS.find((item) => item.username === username)
    if (!user) {
      return null
    }
    const { password: _pwd, ...userinfo } = user
    return userinfo
  } catch {
    return null
  }
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET)
    const username = decoded.username
    const user = MOCK_USERS.find((item) => item.username === username)
    if (!user) {
      return null
    }
    const { password: _pwd, ...userinfo } = user
    return userinfo
  } catch {
    return null
  }
}

function useResponseSuccess(data) {
  return {
    code: 0,
    data,
    error: null,
    message: 'ok'
  }
}

function usePageResponseSuccess(page, pageSize, list, { message = 'ok' } = {}) {
  const pageData = pagination(
    Number.parseInt(`${page}`),
    Number.parseInt(`${pageSize}`),
    list
  )

  return {
    ...useResponseSuccess({
      items: pageData,
      total: list.length
    }),
    message
  }
}

function useResponseError(message, error = null) {
  return {
    code: -1,
    data: null,
    error,
    message
  }
}

function forbiddenResponse(event, message = 'Forbidden Exception') {
  setResponseStatus(event, 403)
  return useResponseError(message, message)
}

function unAuthorizedResponse(event) {
  setResponseStatus(event, 401)
  return useResponseError('Unauthorized Exception', 'Unauthorized Exception')
}

function pagination(pageNo, pageSize, array) {
  const offset = (pageNo - 1) * Number(pageSize)
  return offset + Number(pageSize) >= array.length
    ? array.slice(offset)
    : array.slice(offset, offset + Number(pageSize))
}

const login_post = defineEventHandler(async (event) => {
  const { password, username } = await readBody(event)
  if (!password || !username) {
    setResponseStatus(event, 400)
    return useResponseError(
      'BadRequestException',
      'Username and password are required'
    )
  }

  // 支持用户名或手机号登录
  const findUser = MOCK_USERS.find(
    (item) =>
      (item.username === username || item.phone === username) &&
      item.password === password
  )

  if (!findUser) {
    clearRefreshTokenCookie(event)
    return forbiddenResponse(event, '用户名或密码错误')
  }

  const accessToken = generateAccessToken(findUser)
  const refreshToken = generateRefreshToken(findUser)

  setRefreshTokenCookie(event, refreshToken)

  const { password: _pwd, ...userinfo } = findUser
  return useResponseSuccess({
    ...userinfo,
    accessToken
  })
})

const login_post$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: login_post
})

const logout_post = defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event)
  if (!refreshToken) {
    return useResponseSuccess('')
  }

  clearRefreshTokenCookie(event)

  return useResponseSuccess('')
})

const logout_post$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: logout_post
})

const refresh_post = defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event)
  if (!refreshToken) {
    return forbiddenResponse(event, '登录状态已失效')
  }

  clearRefreshTokenCookie(event)

  const userinfo = verifyRefreshToken(refreshToken)
  if (!userinfo) {
    return forbiddenResponse(event, '登录状态已失效')
  }

  const findUser = MOCK_USERS.find(
    (item) => item.username === userinfo.username
  )
  if (!findUser) {
    return forbiddenResponse(event, '登录状态已失效')
  }
  const accessToken = generateAccessToken(findUser)

  setRefreshTokenCookie(event, refreshToken)

  return useResponseSuccess(accessToken)
})

const refresh_post$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: refresh_post
})

const detail = eventHandler((event) => {
  const { id } = getQuery$1(event)
  const product = MOCK_PRODUCTS.find(
    (item) => item.id === Number.parseInt(String(id), 10)
  )
  if (!product) {
    return useResponseError('商品不存在')
  }
  return useResponseSuccess(product)
})

const detail$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: detail
})

const list = eventHandler((event) => {
  const { page, pageSize } = getQuery$1(event)
  if (page && pageSize) {
    return usePageResponseSuccess(String(page), String(pageSize), MOCK_PRODUCTS)
  }
  return useResponseSuccess(MOCK_PRODUCTS)
})

const list$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: list
})

/**
 * 系统管理模块 mock 数据（用户 / 角色 / 菜单）
 * 模块级可变状态，CRUD 操作在进程生命周期内生效
 */

const roleNames = [
  '超级管理员',
  '系统管理员',
  '运维工程师',
  '审计专员',
  '内容运营',
  '产品经理',
  '财务专员',
  '人事经理',
  '客服主管',
  '访客角色'
]

const permissionOptions = [
  'system:user:view',
  'system:user:create',
  'system:user:update',
  'system:user:delete',
  'system:role:view',
  'system:role:create',
  'system:role:update',
  'system:role:delete',
  'system:menu:view',
  'system:menu:create',
  'system:menu:update',
  'system:menu:delete'
]

const userStatusOptions = ['1', '0']
const genderOptions = ['男', '女']

function createUserSeed(count = 28) {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1
    const gender = genderOptions[index % genderOptions.length]
    const roleId = (index % roleNames.length) + 1
    return {
      id,
      username: `user_${String(id).padStart(3, '0')}`,
      nickname: ['张晨', '李静', '王涛', '陈雪', '刘洋', '赵敏', '周凯'][
        index % 7
      ],
      gender,
      mobile: `13${String(100000000 + id * 321).slice(0, 9)}`,
      email: `user${id}@example.com`,
      status: userStatusOptions[index % userStatusOptions.length],
      roleIds: [roleId],
      roleNames: [roleNames[roleId - 1]],
      remark: `${roleNames[roleId - 1]}账号`,
      createTime: `2026-03-${String((index % 28) + 1).padStart(2, '0')} 10:${String(index % 60).padStart(2, '0')}:00`
    }
  })
}

let userList = createUserSeed()

let roleList = roleNames.map((name, index) => ({
  id: index + 1,
  roleName: name,
  roleCode: `ROLE_${String(index + 1).padStart(2, '0')}`,
  sort: index + 1,
  status: index === 9 ? '0' : '1',
  userCount: Math.max(1, 12 - index),
  permissions: permissionOptions.filter((_, permissionIndex) => {
    return permissionIndex % 3 !== index % 3
  }),
  remark: `${name}的系统权限集合`,
  createTime: `2026-02-${String(index + 1).padStart(2, '0')} 09:30:00`
}))

const menuTree = [
  {
    id: 1,
    parentId: 0,
    menuType: 'MENU',
    menuName: '首页',
    icon: 'home',
    routeName: 'home',
    path: '/home',
    component: '@/views/home/index.vue',
    permission: 'dashboard:view',
    status: '1',
    visible: '1',
    sort: 1
  },
  {
    id: 2,
    parentId: 0,
    menuType: 'DIR',
    menuName: '系统功能',
    icon: 'settings',
    routeName: 'system',
    path: '/manage',
    component: '',
    permission: '',
    status: '1',
    visible: '1',
    sort: 2,
    children: [
      {
        id: 21,
        parentId: 2,
        menuType: 'MENU',
        menuName: '用户管理',
        icon: 'user',
        routeName: 'system-user',
        path: '/manage/user',
        component: '@/views/system/user/index.vue',
        permission: 'system:user:view',
        status: '1',
        visible: '1',
        sort: 1
      },
      {
        id: 22,
        parentId: 2,
        menuType: 'MENU',
        menuName: '角色管理',
        icon: 'shield-check',
        routeName: 'system-role',
        path: '/manage/role',
        component: '@/views/system/role/index.vue',
        permission: 'system:role:view',
        status: '1',
        visible: '1',
        sort: 2
      },
      {
        id: 23,
        parentId: 2,
        menuType: 'MENU',
        menuName: '菜单管理',
        icon: 'list',
        routeName: 'system-menu',
        path: '/manage/menu',
        component: '@/views/system/menu/index.vue',
        permission: 'system:menu:view',
        status: '1',
        visible: '1',
        sort: 3
      }
    ]
  },
  {
    id: 3,
    parentId: 0,
    menuType: 'MENU',
    menuName: '关于',
    icon: 'info',
    routeName: 'about',
    path: '/about',
    component: '@/views/about/index.vue',
    permission: 'about:view',
    status: '1',
    visible: '0',
    sort: 99
  }
]

// ── 可变状态操作 ──────────────────────────────────────

function setUserList(next) {
  userList = next
}

function setRoleList(next) {
  roleList = next
}

// ── 通用辅助函数 ──────────────────────────────────────

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function includesText(source, keyword) {
  return normalizeText(source).includes(normalizeText(keyword))
}

function paginate(list, pageNum = 1, pageSize = 10) {
  const current = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  const start = (current - 1) * size
  return {
    rows: list.slice(start, start + size),
    total: list.length
  }
}

function flattenMenus(list, parentId = 0) {
  return list.reduce((result, item) => {
    const current = {
      ...item,
      parentId: item.parentId ?? parentId
    }
    result.push(current)
    if (item.children?.length) {
      result.push(...flattenMenus(item.children, item.id))
    }
    return result
  }, [])
}

function findMenuNode(list, id) {
  for (const item of list) {
    if (item.id === id) return item
    if (item.children?.length) {
      const target = findMenuNode(item.children, id)
      if (target) return target
    }
  }
  return null
}

function updateMenuNode(list, id, updater) {
  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    if (item.id === id) {
      list[index] = updater(item)
      return true
    }
    if (item.children?.length && updateMenuNode(item.children, id, updater)) {
      return true
    }
  }
  return false
}

function removeMenuNode(list, ids) {
  for (let index = list.length - 1; index >= 0; index--) {
    const item = list[index]
    if (ids.includes(item.id)) {
      list.splice(index, 1)
      continue
    }
    if (item.children?.length) {
      removeMenuNode(item.children, ids)
    }
  }
}

function createNextId(list) {
  return Math.max(...list.map((item) => item.id), 0) + 1
}

const create_post$4 = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const flat = flattenMenus(menuTree)
  const id = createNextId(flat)
  const menu = {
    id,
    parentId: Number(body.parentId || 0),
    menuType: body.menuType,
    menuName: body.menuName,
    icon: body.icon || '',
    routeName: body.routeName || '',
    path: body.path || '',
    component: body.component || '',
    permission: body.permission || '',
    status: body.status,
    visible: body.visible,
    sort: Number(body.sort || 1),
    remark: body.remark || ''
  }

  if (!menu.parentId) {
    menuTree.push(menu)
  } else {
    const parent = findMenuNode(menuTree, menu.parentId)
    if (!parent) {
      return useResponseError('父级菜单不存在')
    }
    if (!parent.children) parent.children = []
    parent.children.push(menu)
  }

  return useResponseSuccess({ id })
})

const create_post$5 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: create_post$4
})

const delete_post$4 = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = Array.isArray(body.ids) ? body.ids : []

  removeMenuNode(menuTree, ids)

  return useResponseSuccess(true)
})

const delete_post$5 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: delete_post$4
})

const list_get$6 = eventHandler((event) => {
  const { menuName = '', status = '', menuType = '' } = getQuery$1(event)
  const source = clone(menuTree)

  const filterTree = (list) => {
    return list
      .map((item) => {
        const children = item.children ? filterTree(item.children) : []
        const matchedSelf =
          includesText(item.menuName, menuName) &&
          (!status || item.status === status) &&
          (!menuType || item.menuType === menuType)
        if (matchedSelf || children.length) {
          return {
            ...item,
            children
          }
        }
        return null
      })
      .filter(Boolean)
  }

  const rows = filterTree(source)
  return useResponseSuccess({
    rows,
    total: flattenMenus(rows).length
  })
})

const list_get$7 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: list_get$6
})

const update_put$4 = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const flat = flattenMenus(menuTree)
  const current = flat.find((item) => item.id === body.id)
  if (!current) {
    return useResponseError('菜单不存在')
  }

  const nextParentId = Number(body.parentId || 0)
  if (current.parentId !== nextParentId) {
    removeMenuNode(menuTree, [body.id])
    const nextNode = {
      ...current,
      ...body,
      parentId: nextParentId
    }
    if (!nextParentId) {
      menuTree.push(nextNode)
    } else {
      const parent = findMenuNode(menuTree, nextParentId)
      if (!parent) {
        return useResponseError('父级菜单不存在')
      }
      if (!parent.children) parent.children = []
      parent.children.push(nextNode)
    }
  } else {
    updateMenuNode(menuTree, body.id, (item) => ({
      ...item,
      ...body,
      parentId: nextParentId
    }))
  }

  return useResponseSuccess(true)
})

const update_put$5 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: update_put$4
})

const create_post$2 = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = createNextId(roleList)

  roleList.unshift({
    id,
    roleName: body.roleName,
    roleCode: body.roleCode,
    sort: body.sort ?? id,
    status: body.status,
    userCount: body.userCount ?? 0,
    permissions: body.permissions || [],
    remark: body.remark || '',
    createTime: '2026-04-16 10:00:00'
  })

  return useResponseSuccess({ id })
})

const create_post$3 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: create_post$2
})

const delete_post$2 = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = Array.isArray(body.ids) ? body.ids : []

  const nextRoleList = roleList.filter((item) => !ids.includes(item.id))

  // 级联清理用户身上被删除的角色
  const nextUserList = userList.map((user) => {
    const nextRoleIds = user.roleIds.filter((roleId) => !ids.includes(roleId))
    return {
      ...user,
      roleIds: nextRoleIds,
      roleNames: nextRoleList
        .filter((role) => nextRoleIds.includes(role.id))
        .map((role) => role.roleName)
    }
  })

  setRoleList(nextRoleList)
  setUserList(nextUserList)

  return useResponseSuccess(true)
})

const delete_post$3 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: delete_post$2
})

const list_get$4 = eventHandler((event) => {
  const {
    pageNum = 1,
    pageSize = 10,
    roleName = '',
    roleCode = '',
    status = ''
  } = getQuery$1(event)

  const filtered = roleList.filter((item) => {
    return (
      includesText(item.roleName, roleName) &&
      includesText(item.roleCode, roleCode) &&
      (!status || item.status === status)
    )
  })

  return useResponseSuccess(paginate(filtered, pageNum, pageSize))
})

const list_get$5 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: list_get$4
})

const update_put$2 = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const target = roleList.find((item) => item.id === body.id)
  if (!target) {
    return useResponseError('角色不存在')
  }

  Object.assign(target, body, {
    permissions: body.permissions || []
  })

  return useResponseSuccess(true)
})

const update_put$3 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: update_put$2
})

const create_post = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = createNextId(userList)
  const roleIds = Array.isArray(body.roleIds) ? body.roleIds : []
  const roleNamesOfUser = roleList
    .filter((role) => roleIds.includes(role.id))
    .map((role) => role.roleName)

  userList.unshift({
    id,
    username: body.username,
    nickname: body.nickname,
    gender: body.gender,
    mobile: body.mobile,
    email: body.email,
    status: body.status,
    roleIds,
    roleNames: roleNamesOfUser,
    remark: body.remark || '',
    createTime: '2026-04-16 10:00:00'
  })

  return useResponseSuccess({ id })
})

const create_post$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: create_post
})

const delete_post = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = Array.isArray(body.ids) ? body.ids : []

  setUserList(userList.filter((item) => !ids.includes(item.id)))

  return useResponseSuccess(true)
})

const delete_post$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: delete_post
})

const list_get$2 = eventHandler((event) => {
  const {
    pageNum = 1,
    pageSize = 10,
    username = '',
    gender = '',
    nickname = '',
    mobile = '',
    email = '',
    status = ''
  } = getQuery$1(event)

  const filtered = userList.filter((item) => {
    return (
      includesText(item.username, username) &&
      includesText(item.nickname, nickname) &&
      includesText(item.mobile, mobile) &&
      includesText(item.email, email) &&
      (!gender || item.gender === gender) &&
      (!status || item.status === status)
    )
  })

  return useResponseSuccess(paginate(filtered, pageNum, pageSize))
})

const list_get$3 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: list_get$2
})

const update_put = defineEventHandler(async (event) => {
  const body = await readBody(event)
  const target = userList.find((item) => item.id === body.id)
  if (!target) {
    return useResponseError('用户不存在')
  }

  const roleIds = Array.isArray(body.roleIds) ? body.roleIds : []
  const roleNamesOfUser = roleList
    .filter((role) => roleIds.includes(role.id))
    .map((role) => role.roleName)

  Object.assign(target, body, {
    roleIds,
    roleNames: roleNamesOfUser
  })

  return useResponseSuccess(true)
})

const update_put$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: update_put
})

/**
 * 高级表格模块 mock 数据（员工列表）
 */

const departments = [
  '技术部',
  '产品部',
  '设计部',
  '市场部',
  '运营部',
  '财务部',
  '人事部'
]
const roles = ['超级管理员', '部门经理', '普通员工', '实习生', '外包人员']
const statuses = ['active', 'inactive', 'disabled']
const statusLabels = { active: '在职', inactive: '休假中', disabled: '已离职' }

const firstNames = [
  '张伟',
  '李娜',
  '王芳',
  '刘洋',
  '陈明',
  '杨丽',
  '赵强',
  '黄磊',
  '周敏',
  '吴杰',
  '林峰',
  '孙婷',
  '马超',
  '朱红',
  '胡军',
  '郭靖',
  '何雨',
  '罗琳',
  '梁博',
  '宋佳'
]
const avatarColors = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#10b981',
  '#06b6d4',
  '#3b82f6'
]
const pinyin = [
  'zhangwei',
  'lina',
  'wangfang',
  'liuyang',
  'chenming',
  'yangli',
  'zhaoqiang',
  'huanglei',
  'zhoumin',
  'wujie',
  'linfeng',
  'sunting',
  'machao',
  'zhuhong',
  'hujun',
  'guojing',
  'heyu',
  'luolin',
  'liangbo',
  'songjia'
]

function randomDate(start, end) {
  const d = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

function generateUser(index) {
  const name = firstNames[index % firstNames.length]
  const dept = departments[Math.floor(Math.random() * departments.length)]
  const role = roles[Math.floor(Math.random() * roles.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const color = avatarColors[index % avatarColors.length]

  return {
    id: index,
    name,
    avatar: color,
    initial: name.charAt(0),
    email: `${pinyin[index % pinyin.length]}@lightning.app`,
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    department: dept,
    role,
    status,
    statusLabel: statusLabels[status],
    joinDate: randomDate(new Date(2020, 0, 1), new Date(2024, 5, 1)),
    lastLogin: randomDate(new Date(2024, 5, 1), new Date(2024, 6, 15)),
    projects: Math.floor(Math.random() * 20) + 1,
    performance: Math.floor(Math.random() * 40) + 60 // 60-100
  }
}

const allUsers = []
for (let i = 1; i <= 100; i++) {
  allUsers.push(generateUser(i))
}

const userStats = () => ({
  totalUsers: allUsers.length,
  activeUsers: allUsers.filter((u) => u.status === 'active').length,
  inactiveUsers: allUsers.filter((u) => u.status === 'inactive').length,
  disabledUsers: allUsers.filter((u) => u.status === 'disabled').length
})

const list_get = eventHandler((event) => {
  const {
    pageNum = 1,
    pageSize = 10,
    name = '',
    department = '',
    status = ''
  } = getQuery$1(event)

  let filtered = [...allUsers]

  if (name) {
    filtered = filtered.filter(
      (u) => includesText(u.name, name) || includesText(u.email, name)
    )
  }
  if (department) {
    filtered = filtered.filter((u) => u.department === department)
  }
  if (status) {
    filtered = filtered.filter((u) => u.status === status)
  }

  const total = filtered.length
  const current = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  const start = (current - 1) * size
  const rows = filtered.slice(start, start + size)

  return useResponseSuccess({
    rows,
    total,
    // 统计信息
    stats: userStats()
  })
})

const list_get$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: list_get
})

const info = eventHandler((event) => {
  const userinfo = verifyAccessToken(event)
  if (!userinfo) {
    return unAuthorizedResponse(event)
  }
  return useResponseSuccess(userinfo)
})

const info$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: info
})

const _____ = defineEventHandler(() => {
  return `
<h1>Lightning Mock Server</h1>
<h2>Mock service is running</h2>
<ul>
<li><a href="/api/auth/login">/api/auth/login (POST)</a></li>
<li><a href="/api/auth/logout">/api/auth/logout (POST)</a></li>
<li><a href="/api/auth/refresh">/api/auth/refresh (POST)</a></li>
<li><a href="/api/user/info">/api/user/info</a></li>
<li><a href="/api/product/list">/api/product/list</a></li>
<li><a href="/api/product/detail?id=1">/api/product/detail?id=1</a></li>
</ul>
`
})

const _____$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: _____
})

/**
 * WebSocket 演示路由（配合 nitro.config.mjs 的 experimental.websocket: true）
 *
 * h3 内置 crossws：defineWebSocketHandler 创建的 handler 携带 websocket hooks，
 * dev/node 运行时在 upgrade 请求时按路径解析对应 hooks 完成协议升级。
 */
const peers = new Set()

const broadcast = (payload) => {
  for (const peer of peers) {
    peer.send(payload)
  }
}

const chat = defineWebSocketHandler({
  open(peer) {
    peers.add(peer)
    // 欢迎消息 + 广播在线人数变化
    peer.send(
      JSON.stringify({
        type: 'system',
        text: '连接成功，欢迎使用 Lightning mock WebSocket 服务！',
        time: Date.now()
      })
    )
    broadcast(
      JSON.stringify({ type: 'online', count: peers.size, time: Date.now() })
    )
  },
  message(peer, message) {
    const raw = message.text()
    // 客户端心跳：ping → pong
    if (raw === 'ping') {
      peer.send(JSON.stringify({ type: 'pong', time: Date.now() }))
      return
    }
    // 聊天消息广播给所有连接（含发送者自身，便于前端直接入列展示）
    broadcast(JSON.stringify({ type: 'message', text: raw, time: Date.now() }))
  },
  close(peer) {
    peers.delete(peer)
    broadcast(
      JSON.stringify({ type: 'offline', count: peers.size, time: Date.now() })
    )
  },
  error(peer) {
    peers.delete(peer)
  }
})

const chat$1 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  default: chat
})
//# sourceMappingURL=index.mjs.map
