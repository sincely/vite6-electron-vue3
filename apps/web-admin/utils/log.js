/**
 * 渲染进程日志工具
 *
 * 浏览器环境(无 Electron 主进程):使用 console 包装,
 * 保持与 electron-log/renderer 等价的 .info/.warn/.error/.debug API。
 *
 * 原实现:封装 electron-log/renderer,将日志转发到主进程统一处理。
 * 迁移到 web-admin(纯浏览器 SPA)后,electron-log 已无意义,
 * 此处用 console 替换,业务调用方式保持不变。
 *
 * @example
 * import logger from '@/utils/log'
 * logger.info('页面加载完成')
 * logger.error('请求失败', error)
 */

const format = (level, args) =>
  `[${new Date().toISOString()}] [browser] ${level}: ` +
  args.map((a) => (a instanceof Error ? a.stack || a.message : a)).join(' ')

const log = {
  info: (...args) => console.info(format('INFO', args)),
  warn: (...args) => console.warn(format('WARN', args)),
  error: (...args) => console.error(format('ERROR', args)),
  debug: (...args) => console.debug(format('DEBUG', args)),
  log: (...args) => console.log(format('LOG', args))
}

export default log
