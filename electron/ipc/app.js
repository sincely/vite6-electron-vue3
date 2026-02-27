import { createMainWindow, closeLoginWindow } from '../main/windowManager.js'

export default [
  {
    channel: 'open-win',
    type: 'handle',
    handler: async (event, arg) => {
      const { createWindow } = await import('../main/windowManager.js')
      createWindow({
        hash: arg,
        width: 600,
        height: 400,
        title: 'Child Window'
      })
    }
  },
  {
    channel: 'toMain',
    type: 'on',
    handler: (event, data) => {
      closeLoginWindow()
      createMainWindow()
    }
  }
]
