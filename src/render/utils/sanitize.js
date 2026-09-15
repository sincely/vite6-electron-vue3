import DOMPurify from 'dompurify'

/**
 * 净化 HTML，防止 XSS 攻击
 * 保留常见富文本标签与安全属性（如 a/img/table/style），移除脚本、事件处理器与危险协议
 * 供 v-html 等直接渲染 HTML 的场景使用
 * @param {string} dirtyHtml 待净化的 HTML 字符串
 * @returns {string} 净化后的安全 HTML
 */
export const sanitizeHtml = (dirtyHtml) => {
  if (!dirtyHtml) return ''
  return DOMPurify.sanitize(dirtyHtml)
}
