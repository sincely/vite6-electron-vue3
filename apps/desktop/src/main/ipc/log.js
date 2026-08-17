import logger from '../log'

/**
 * 日志 IPC 频道
 * 供渲染进程通过 window.logger 调用主进程日志记录
 */
export default [
  {
    channel: 'log',
    type: 'handle',
    handler: (event, level, args) => {
      const validLevels = ['error', 'warn', 'info', 'debug']
      const logLevel = validLevels.includes(level) ? level : 'info'
      const prefix = `[Renderer]`
      logger[logLevel](prefix, ...args)
    }
  }
]
