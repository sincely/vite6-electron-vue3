// project/electron/ipc/index.js
import path from 'path'
import { readdirSync } from 'fs'
import importSync from 'import-sync'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getIcpMainHandler = () => {
  let allHandler = {}
  // 扫描 handlers 目录下的所有文件
  const dirs = readdirSync(path.join(__dirname, 'handlers'), 'utf8')

  for (const file of dirs) {
    const filePath = path.join(__dirname, 'handlers', file)
    const handlersTemp = importSync(filePath)
    const handlers = {}

    // 分析每个导出的处理器
    for (const key in handlersTemp) {
      const handler = handlersTemp[key]
      let handlerType = Object.prototype.toString.call(handler)
      const match = handlerType.match(/^\[object (\w+)\]$/)
      handlerType = match[1]

      handlers[key] = {
        key,
        type: handlerType,
        val: handler
      }

      allHandler = {
        ...allHandler,
        ...handlers
      }
    }
  }
  return allHandler
}

export const registerHandlerForIcpMain = () => {
  const ipcMainHandlers = getIcpMainHandler()
  // 只执行函数类型的处理器
  for (const key in ipcMainHandlers) {
    const handler = ipcMainHandlers[key]
    if (handler.type.indexOf('Function') > -1) {
      handler.val()
    }
  }
}
