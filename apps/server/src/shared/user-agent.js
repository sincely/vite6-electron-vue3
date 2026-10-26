/**
 * User-Agent 解析
 *
 * 抽离自认证模块与操作日志模块的重复实现，统一浏览器 / 操作系统识别口径。
 */

/**
 * 解析浏览器名称
 * @param {string} ua
 * @returns {string}
 */
export const detectBrowser = (ua) => {
  if (!ua) {
    return 'Unknown'
  }

  if (ua.includes('Edg/')) {
    return 'Microsoft Edge'
  }
  if (ua.includes('Chrome/')) {
    return 'Google Chrome'
  }
  if (ua.includes('Firefox/')) {
    return 'Mozilla Firefox'
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    return 'Safari'
  }
  if (ua.includes('MSIE') || ua.includes('Trident/')) {
    return 'Internet Explorer'
  }

  return 'Unknown'
}

/**
 * 解析操作系统名称
 * @param {string} ua
 * @returns {string}
 */
export const detectOS = (ua) => {
  if (!ua) {
    return 'Unknown'
  }

  if (ua.includes('Windows NT')) {
    const version = ua.match(/Windows NT (\d+\.\d+)/)?.[1]
    const versionMap = {
      '10.0': 'Windows 10/11',
      6.3: 'Windows 8.1',
      6.2: 'Windows 8',
      6.1: 'Windows 7'
    }
    return versionMap[version] || 'Windows'
  }
  if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    return 'macOS'
  }
  if (ua.includes('Linux')) {
    return 'Linux'
  }
  if (ua.includes('Android')) {
    return 'Android'
  }
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    return 'iOS'
  }

  return 'Unknown'
}

/**
 * 解析浏览器与操作系统
 * @param {string} userAgent
 * @returns {{browser: string, os: string}}
 */
export const parseUserAgent = (userAgent) => {
  return {
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent)
  }
}
