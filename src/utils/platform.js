// 是否是windows平台
export const isWindows = () => {
  return window.process?.platform === 'win32'
}

// 是否是macos
export const isMac = () => {
  return window.process?.platform === 'darwin'
}

// 是否是linux
export const isLinux = () => {
  return window.process?.platform === 'linux'
}

// 是否是electron平台
export const isElectron = () => {
  return !!(
    window?.process?.type === 'renderer' ||
    window?.process?.versions?.electron ||
    navigator?.userAgent?.includes('Electron')
  )
}
