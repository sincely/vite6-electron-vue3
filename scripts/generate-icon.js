import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const dest = path.join(ROOT, 'resources/icon.png')

const size = 1024

// 绝对清晰版闪电图标
// 去除折痕、去除复杂渐变、去除模糊光晕
// 采用高饱和度纯色 + 硬朗轮廓与高对比边缘
const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 背景投影：保持适度柔和，体现图标层级，但不过于扩散 -->
    <filter id="bg-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- 1. 纯白圆角背景 (带投影) -->
  <!-- 居中：(1024-800)/2 = 112，使背景圆角矩形精确居于画布中心 -->
  <rect x="112" y="112" width="800" height="800" rx="210" ry="210" fill="#ffffff" filter="url(#bg-shadow)" />

  <!-- 2. 闪电组：精确居中 -->
  <!--
       闪电路径几何中心：
         X: (260+820)/2 = 540，Y: (80+944)/2 = 512
       变换步骤：
         1. translate(-540, -512): 将几何中心移到原点
         2. scale(0.72): 缩放至背景内留有视觉呼吸感
         3. translate(512, 512): 移回画布中心，精确居中
  -->
  <g transform="translate(512, 512) scale(0.72) translate(-540, -512)">
    <!-- 2.0 闪电深色描边层 (硬朗锋利) -->
    <!-- stroke-linejoin="miter" 确保尖角锋利 -->
    <path
      d="M580 80 L260 540 L500 540 L420 944 L820 360 L600 360 Z"
      fill="none"
      stroke="#ca6f2a"
      stroke-width="32"
      stroke-linejoin="miter"
      stroke-miterlimit="10"
    />

    <!-- 2.1 闪电主体填充层 -->
    <path
      d="M580 80 L260 540 L500 540 L420 944 L820 360 L600 360 Z"
      fill="#f8c808"
      stroke="none"
    />
  </g>
</svg>
`

if (fs.existsSync(dest)) fs.unlinkSync(dest)

sharp(Buffer.from(svg))
  .resize(size, size)
  .png()
  .toFile(dest)
  .then(() => {
    console.log(`✅ 绝对清晰版图标已生成: ${dest}`)
  })
  .catch((err) => {
    console.error('❌ 生成失败:', err)
    process.exit(1)
  })
