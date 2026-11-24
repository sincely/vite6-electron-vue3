/**
 * 在系统默认浏览器中打开外部链接
 *
 * Electron 环境下 window.open 会被主进程 setWindowOpenHandler 拦截，
 * 转交 shell.openExternal 唤起系统浏览器；普通浏览器环境则打开新标签页
 * @param {string} url http(s) 外链地址
 */
export function openExternalLink(url) {
  if (!/^https?:\/\//i.test(url)) return
  window.open(url, '_blank', 'noopener')
}
