import pkg from 'electron-updater'
const { autoUpdater } = pkg
export default [
  {
    channel: 'check-for-updates',
    type: 'on',
    handler: () => {
      autoUpdater.checkForUpdates()
    }
  },
  {
    channel: 'install-update',
    type: 'on',
    handler: () => {
      autoUpdater.quitAndInstall()
    }
  }
]
