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
