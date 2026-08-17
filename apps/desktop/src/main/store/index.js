import Store from 'electron-store'

/**
 * 应用持久化存储
 *
 * 使用 electron-store 将关键设置项持久化到本地 JSON 文件
 * 存储路径：app.getPath('userData')/app-settings.json
 *
 * @example
 * import store from './store'
 * store.get('appSettings.closeAction')
 * store.set('appSettings.closeAction', 'quit')
 */
const store = new Store({
  name: 'app-settings',
  defaults: {
    appSettings: {
      closeAction: 'minimize',
      autoLaunch: false,
      theme: 'light',
      layoutMode: 'left',
      sidebarCollapsed: false,
      tagsView: true,
      tagsViewStyle: 'card',
      footerVisible: true,
      footerHeight: 26,
      transitionEnabled: true,
      transitionType: 'page',
      contentWidth: 'full',
      contentWidthValue: 1600,
      themeColors: {
        useAlgorithm: false,
        primary: '#2563eb',
        infoFollowPrimary: true,
        info: '#0ea5e9',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    }
  }
})

export default store
