import logger from 'electron-log/main'
import { app } from 'electron'
import path from 'path'

// 初始化 electron-log，启用 preload IPC 通道
// 允许渲染进程通过 electron-log/renderer 将日志转发到主进程
logger.initialize({ preload: true })

// 获取应用的安装目录路径
const installPath = path.dirname(app.getPath('exe'))

// 设置日志文件路径到安装路径
// 在 electron-log v5+ 中，建议使用 resolvePathFn 替代已弃用的 resolvePath
logger.transports.file.resolvePathFn = () =>
  path.join(installPath, 'logs', 'app.log')

logger.transports.console.level = 'debug' // 控制台输出的日志等级
logger.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}] {level}: {text}' // 自定义控制台输出的日志格式
logger.transports.console.inspectOptions = { depth: null } // 完整展开嵌套对象，避免 [Object] 截断
logger.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}]: {text}' // 自定义文件日志格式
logger.transports.file.inspectOptions = { depth: null } // 完整展开嵌套对象，避免 [Object] 截断
logger.transports.file.level =
  process.env.NODE_ENV === 'development' ? false : 'info' // 设置日志写入文件的级别

// 设置日志文件最大大小为 5MB，超过该大小会自动滚动
logger.transports.file.maxSize = 5 * 1024 * 1024 // 5MB

// 剥离 ANSI 颜色码：彩色日志只进终端（console），写入日志文件前还原为纯文本
logger.hooks.logMessage = (msg, transport) => {
  if (transport === logger.transports.file && typeof msg === 'string') {
    return msg.replace(/\u001b\[[0-9;]*m/g, '')
  }
  return msg
}

export default logger
