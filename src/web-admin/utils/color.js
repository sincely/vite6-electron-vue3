const rgbWhite = {
  r: 255,
  g: 255,
  b: 255
}
const rgbBlack = {
  r: 0,
  g: 0,
  b: 0
}

function componentToHex(c) {
  const hex = Math.round(c).toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

function rgbToHex(rgb) {
  return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(
    rgb.b
  )}`
}

function mix(color, mixColor, weight) {
  return {
    r: color.r * (1 - weight) + mixColor.r * weight,
    g: color.g * (1 - weight) + mixColor.g * weight,
    b: color.b * (1 - weight) + mixColor.b * weight
  }
}

/**
 * hex 转换为 rgb
 * @param hex 例如 #FF0000
 */
function hexToRGB(hex) {
  if (!/^[0-9A-Fa-f]{3}$|[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error('请传入合法的16进制颜色值，eg: #FF0000')
  }
  // 移除可能存在的 # 符号
  hex = hex.replace('#', '')
  // 确保十六进制代码是有效的

  // 返回 RGB 对象
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  }
}

/**
 * 修改 element-plus的颜色主题
 */
function updateElementPlusTheme(type, baseColor) {
  // 针对 element-plus 进行修改
  const colorArray = [
    {
      className: `--el-color-${type}`,
      color: rgbToHex(mix(hexToRGB(baseColor), rgbBlack, 0))
    },
    {
      className: `--el-color-${type}-dark-2`,
      color: rgbToHex(mix(hexToRGB(baseColor), rgbBlack, 0.2))
    },
    {
      className: `--el-color-${type}-light-3`,
      color: rgbToHex(mix(hexToRGB(baseColor), rgbWhite, 0.3))
    },
    {
      className: `--el-color-${type}-light-5`,
      color: rgbToHex(mix(hexToRGB(baseColor), rgbWhite, 0.5))
    },
    {
      className: `--el-color-${type}-light-7`,
      color: rgbToHex(mix(hexToRGB(baseColor), rgbWhite, 0.7))
    },
    {
      className: `--el-color-${type}-light-8`,
      color: rgbToHex(mix(hexToRGB(baseColor), rgbWhite, 0.78))
    },
    {
      className: `--el-color-${type}-light-9`,
      color: rgbToHex(mix(hexToRGB(baseColor), rgbWhite, 0.85))
    }
  ]

  colorArray.forEach((item) => {
    document.documentElement.style.setProperty(item.className, item.color)
  })
}

export { hexToRGB, rgbToHex, updateElementPlusTheme }
