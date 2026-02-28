import { createMainWindow, closeLoginWindow, createWindow } from '../main/windowManager.js'
import { app } from 'electron'

export default [
  {
    channel: 'open-win',
    type: 'handle',
    handler: (event, arg) => {
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
  },
  {
    channel: 'get-app-version',
    type: 'handle',
    handler: () => {
      return app.getVersion()
    }
  }
]
