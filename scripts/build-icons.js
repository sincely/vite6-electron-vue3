/**
 * 多平台图标生成脚本
 * 从 resources/icon.png（建议 1024×1024）生成各平台所需图标
 *
 * 输出结构：
 *   resources/
 *     tray/
 *       tray-mac.png       18×18   macOS 托盘模板图（灰度）
 *       tray-mac@2x.png    36×36   macOS Retina 托盘模板图（灰度）
 *       tray-win.png       16×16   Windows 托盘
 *       tray-linux.png     22×22   Linux 托盘
 *     icons/
 *       16.png  32.png  48.png  64.png  128.png  256.png  512.png  1024.png
 *
 * 使用:
 *   npm run build:icons
 */

import sharp from 'sharp'
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// png-to-ico 是 CommonJS 模块，需通过 createRequire 加载
const require = createRequire(import.meta.url)
const { default: pngToIco } = require('png-to-ico')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'resources/icon.png')
const TRAY_DIR = path.join(ROOT, 'resources/tray')
const ICONS_DIR = path.join(ROOT, 'resources/icons')

// 确保目录存在
;[TRAY_DIR, ICONS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

// ──────────────────────────────────────────────
//  任务列表
// ──────────────────────────────────────────────
const trayTasks = [
  // macOS 模板图像（灰度 + 透明背景）
  { file: 'tray-mac.png', size: 18, mac: true, label: 'macOS tray 1x  (18×18)' },
  { file: 'tray-mac@2x.png', size: 36, mac: true, label: 'macOS tray 2x  (36×36 Retina)' },
  // Windows
  { file: 'tray-win.png', size: 16, mac: false, label: 'Windows tray   (16×16)' },
  // Linux
  { file: 'tray-linux.png', size: 22, mac: false, label: 'Linux tray     (22×22)' }
]

const appIconSizes = [16, 32, 48, 64, 128, 256, 512, 1024]

// ──────────────────────────────────────────────
//  执行
// ──────────────────────────────────────────────
const run = async () => {
  if (!fs.existsSync(SOURCE)) {
    console.error(`\n❌  源文件未找到: ${SOURCE}`)
    console.error('    请将 1024×1024 的 PNG 图标放到 resources/icon.png 后重新运行。\n')
    process.exit(1)
  }

  console.log(`\n🎨  多平台图标生成`)
  console.log(`    源文件: ${SOURCE}\n`)

  // —— 托盘图标 ——
  console.log('  [托盘图标]')
  for (const { file, size, mac, label } of trayTasks) {
    const dest = path.join(TRAY_DIR, file)
    try {
      let pipeline = sharp(SOURCE).resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      if (mac) pipeline = pipeline.greyscale() // macOS 模板图像必须灰度
      await pipeline.png().toFile(dest)
      console.log(`    ✅  ${label.padEnd(32)} → resources/tray/${file}`)
    } catch (err) {
      console.error(`    ❌  ${label}: ${err.message}`)
    }
  }

  // —— 应用图标（各尺寸 PNG）——
  console.log('\n  [应用图标 PNG]')
  for (const size of appIconSizes) {
    const file = `${size}.png`
    const dest = path.join(ICONS_DIR, file)
    try {
      await sharp(SOURCE)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(dest)
      console.log(`    ✅  ${String(size).padStart(4)}×${size}   → resources/icons/${file}`)
    } catch (err) {
      console.error(`    ❌  ${size}×${size}: ${err.message}`)
    }
  }

  // —— Windows ICO（多尺寸合并，直接写入文件，避免 PowerShell 重定向损坏二进制）——
  console.log('\n  [Windows ICO]')
  try {
    const icoSizes = [16, 32, 48, 64, 128, 256]
    const icoPngs = icoSizes.map((s) => path.join(ICONS_DIR, `${s}.png`))
    const icoBuffer = await pngToIco(icoPngs)
    const icoDest = path.join(ROOT, 'resources/icon.ico')
    fs.writeFileSync(icoDest, icoBuffer)
    console.log(`    ✅  ICO (${icoSizes.join('/') + 'px'})           → resources/icon.ico`)
  } catch (err) {
    console.error(`    ❌  ICO 生成失败: ${err.message}`)
  }

  console.log(`
✨  生成完成！

📝  macOS .icns 生成（需在 macOS 上执行）：
      mkdir icon.iconset
      sips -z 1024 1024 resources/icon.png --out icon.iconset/icon_512x512@2x.png
      iconutil -c icns icon.iconset -o resources/app.icns
    或在线工具: https://cloudconvert.com/png-to-icns
`)
}

run()
