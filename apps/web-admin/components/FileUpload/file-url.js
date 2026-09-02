// URL / 预览相关的纯函数：解析后端响应里的图片字段、识别图片类型、按需创建对象 URL。

import { getValueByPath } from './helpers'

const IMAGE_EXT_REGEX = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i

/**
 * 从服务端响应里抽取文件 URL：
 * - response 是字符串时直接返回；
 * - 否则优先按 responseUrlKey（如 'data.url'）读嵌套字段；
 * - 退而求其次在常见字段中查找（url / path / data.url / data.path / result.url / data.result.url）。
 */
export const getResponseUrl = (response, responseUrlKey = 'url') => {
  if (!response) return ''
  if (typeof response === 'string') return response

  const configuredUrl = getValueByPath(response, responseUrlKey)
  if (typeof configuredUrl === 'string') return configuredUrl

  const commonUrl = [
    response.url,
    response.path,
    response.data?.url,
    response.data?.path,
    response.result?.url,
    response.data?.result?.url
  ].find((value) => typeof value === 'string' && value)

  return commonUrl || ''
}

/** 是否图片：兼容 isImage 标记、MIME、扩展名三种判定 */
export const isImageFile = (file, responseUrlKey) => {
  if (!file) return false
  if (file.isImage === true) return true
  if (file.type?.startsWith('image/')) return true
  if (file.raw?.type?.startsWith('image/')) return true
  const url = file.url || getResponseUrl(file.response, responseUrlKey)
  return IMAGE_EXT_REGEX.test(url || '')
}

/** 释放某个 uid 对应的预览对象 URL，避免内存泄漏 */
export const releaseObjectUrl = (uid, objectUrlMap) => {
  const objectUrl = objectUrlMap.get(uid)
  if (objectUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
    URL.revokeObjectURL(objectUrl)
  }
  objectUrlMap.delete(uid)
}

/**
 * 生成绑定到组件 objectUrlMap 的「获取预览 URL」函数。
 * - 先用 file.url；
 * - 再用服务端响应 URL；
 * - 最后对本地 raw File 按需 createObjectURL 并缓存。
 * 用工厂模式是因为 objectUrlMap 是组件实例级状态，且需要响应式 responseUrlKey。
 */
export const createPreviewUrlGetter =
  (objectUrlMap, getResponseUrlKey) => (file) => {
    if (!file) return ''
    const responseUrlKey = getResponseUrlKey()
    if (file.url) return file.url

    const responseUrl = getResponseUrl(file.response, responseUrlKey)
    if (responseUrl) return responseUrl

    if (
      file.raw &&
      isImageFile(file, responseUrlKey) &&
      typeof URL !== 'undefined' &&
      URL.createObjectURL
    ) {
      if (!objectUrlMap.has(file.uid)) {
        objectUrlMap.set(file.uid, URL.createObjectURL(file.raw))
      }
      return objectUrlMap.get(file.uid)
    }

    return ''
  }
