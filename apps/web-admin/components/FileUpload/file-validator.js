// 文件类型 / 大小校验：与具体组件状态解耦，调用方传入已解析的 fileTypes 与 maxSize 即可。

import { formatFileSize, getExtension } from './helpers'

/**
 * 文件是否匹配单条规则：
 * - 通配符 `'*'` 或 `'*\/ *'` → 任意文件
 * - `'image\/*'` → MIME 前缀匹配
 * - `'.png'` → 后缀（大小写不敏感）
 * - `'png'` / `'pdf'` → 当作后缀
 * - `'image\/png'` → 完整 MIME
 */
export const matchesFileType = (file, rule) => {
  const normalizedRule = String(rule || '')
    .trim()
    .toLowerCase()
  if (!normalizedRule || normalizedRule === '*/*' || normalizedRule === '*') {
    return true
  }

  const fileType = String(file?.type || '').toLowerCase()
  const fileExtension = getExtension(file?.name)
  if (normalizedRule.endsWith('/*')) {
    return fileType.startsWith(normalizedRule.slice(0, -1))
  }
  if (normalizedRule.startsWith('.')) {
    return fileExtension === normalizedRule
  }
  if (!normalizedRule.includes('/')) {
    return fileExtension === `.${normalizedRule}`
  }
  return fileType === normalizedRule
}

/** 校验单文件：返回空字符串表示通过；非空为用户提示文案 */
export const validateFile = (file, fileTypes = [], maxSize = 0) => {
  const rules = Array.isArray(fileTypes) ? fileTypes : []
  if (rules.length && !rules.some((rule) => matchesFileType(file, rule))) {
    return `文件类型不符合要求，仅支持：${rules.join('、')}`
  }

  if (maxSize && file.size > maxSize) {
    return `文件大小不能超过 ${formatFileSize(maxSize)}`
  }

  return ''
}

/** 用于提示：把 fileTypes 数组拼接成中文顿号分隔的字符串 */
export const getTypeLabel = (fileTypes = []) =>
  (Array.isArray(fileTypes) ? fileTypes : []).join('、')
