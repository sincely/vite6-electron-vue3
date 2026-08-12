/**
 * 渲染进程日志工具
 *
 * 封装 electron-log/renderer，将日志转发到主进程统一处理
 * 主进程日志配置见 src/main/log.js
 *
 * @example
 * import logger from '@/utils/log'
 * logger.info('页面加载完成')
 * logger.error('请求失败', error)
 */
import log from 'electron-log/renderer'

// 设置渲染进程的日志级别
log.transports.console.level = 'debug'
log.transports.console.format =
  '[{y}-{m}-{d} {h}:{i}:{s}] [{processType}] {level}: {text}'

export default log
