/**
 * electron-updater 惰性加载
 *
 * electron-updater 及其依赖链（builder-util-runtime / fs-extra 等）只在更新流程
 * 中使用，主进程启动阶段并不需要。这里统一推迟到首次使用（检查更新 / 下载 / 安装）
 * 时再动态加载，减少主进程启动时的模块解析与执行开销。
 *
 * 用法（均返回 Promise<AutoUpdater>）：
 *   const autoUpdater = await getAutoUpdater()
 */
let autoUpdater = null
let loadingPromise = null

export function getAutoUpdater() {
  if (autoUpdater) return Promise.resolve(autoUpdater)
  if (!loadingPromise) {
    loadingPromise = import('electron-updater').then((mod) => {
      autoUpdater = mod.default?.autoUpdater ?? mod.autoUpdater
      return autoUpdater
    })
  }
  return loadingPromise
}
