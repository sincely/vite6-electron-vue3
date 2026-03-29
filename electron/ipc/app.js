import {
  createMainWindow,
  closeLoginWindow,
  createWindow,
  setCloseAction
} from '../main/windowManager'
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
    channel: 'set-auto-launch',
    type: 'on',
    handler: (event, enable) => {
      // 生产环境下设置开机自启
      if (app.isPackaged) {
        app.setLoginItemSettings({
          openAtLogin: enable,
          openAsHidden: false
        })
      }
    }
  },
  {
    channel: 'set-close-action',
    type: 'on',
    handler: (event, action) => {
      setCloseAction(action)
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
