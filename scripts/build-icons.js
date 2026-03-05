/**
 * 多平台图标生成脚本
 * 从 resources/icon.png（建议 1024×1024）按平台分目录生成所有图标
 *
 * 输出结构：
 *   resources/
 *     icon.png                 ← 源文件（1024×1024）
 *     icons/
 *       mac/
 *         app.icns             ← macOS 应用图标
 *         tray.png             ← 托盘 1x（18×18，灰度模板）
 *         tray@2x.png          ← 托盘 2x（36×36，Retina 灰度模板）
 *       win/
 *         app.ico              ← Windows 应用图标（16~256px 多尺寸合并）
 *         tray.ico             ← Windows 托盘 ICO（16px）
 *         tray.png             ← Windows 托盘 PNG（降级备用）
 *       linux/
 *         app/                 ← 多分辨率目录（electron-builder 自动选最优尺寸）
 *           16.png  32.png  48.png  64.png  128.png  256.png  512.png  1024.png
 *         tray.png             ← Linux 托盘图标（22×22）
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

// 各平台图标输出目录
const MAC_DIR = path.join(ROOT, 'resources/icons/mac')
const WIN_DIR = path.join(ROOT, 'resources/icons/win')
const LINUX_DIR = path.join(ROOT, 'resources/icons/linux')
const LINUX_APP_DIR = path.join(LINUX_DIR, 'app')

// 确保目录存在
for (const dir of [MAC_DIR, WIN_DIR, LINUX_DIR, LINUX_APP_DIR]) {
  fs.mkdirSync(dir, { recursive: true })
}

/**
 * 生成指定尺寸 PNG
 * @param {number} size     目标尺寸（正方形）
 * @param {boolean} greyscale  是否灰度（macOS 托盘模板图像需要）
 * @param {boolean} trimSrc    是否先裁掉源图透明边距（App 图标需要，托盘不需要）
 */
const makePng = (size, greyscale = false, trimSrc = false) => {
  // trimSrc: 先裁掉透明边距，确保图标内容填满画布
  // 这是让程序坞图标与其他 App 大小一致的关键
  const src = trimSrc ? sharp(SOURCE).trim() : sharp(SOURCE)
  let pipeline = src.resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  if (greyscale) pipeline = pipeline.greyscale()
  return pipeline.png()
}

// ──────────────────────────────────────────────
//  执行
// ──────────────────────────────────────────────
const run = async () => {
  if (!fs.existsSync(SOURCE)) {
    console.error(`\n❌  源文件未找到: ${SOURCE}`)
    console.error(
      '    请将 1024×1024 PNG 放到 resources/icon.png 后重新运行。\n'
    )
    process.exit(1)
  }

  console.log(`\n🎨  多平台图标生成（按平台分目录）`)
  console.log(`    源文件: ${SOURCE}\n`)

  // ── macOS 托盘（灰度模板图像）──────────────────────────────────────
  console.log('  [macOS - 托盘图标]')
  for (const [size, name] of [
    [18, 'tray.png'],
    [36, 'tray@2x.png']
  ]) {
    await makePng(size, true).toFile(path.join(MAC_DIR, name))
    console.log(
      `    ✅  ${String(size).padStart(4)}×${size}  → icons/mac/${name}`
    )
  }

  // ── Windows 托盘（PNG + ICO）────────────────────────────────────────
  console.log('\n  [Windows - 托盘图标]')
  const winTrayPng = path.join(WIN_DIR, 'tray.png')
  await makePng(16).toFile(winTrayPng)
  console.log(`    ✅    16×16  → icons/win/tray.png`)
  const winTrayIco = await pngToIco([winTrayPng])
  fs.writeFileSync(path.join(WIN_DIR, 'tray.ico'), winTrayIco)
  console.log(`    ✅    16px   → icons/win/tray.ico`)

  // ── Linux 托盘 ──────────────────────────────────────────────────────
  console.log('\n  [Linux - 托盘图标]')
  await makePng(22).toFile(path.join(LINUX_DIR, 'tray.png'))
  console.log(`    ✅    22×22  → icons/linux/tray.png`)

  // ── Linux 应用图标（多分辨率目录）──────────────────────────────────
  console.log('\n  [Linux - 应用图标（多分辨率）]')
  for (const size of [16, 32, 48, 64, 128, 256, 512, 1024]) {
    await makePng(size, false, true).toFile(
      path.join(LINUX_APP_DIR, `${size}.png`)
    )
    console.log(
      `    ✅  ${String(size).padStart(4)}×${size}  → icons/linux/app/${size}.png`
    )
  }

  // ── Windows 应用图标 ICO（多尺寸合并）──────────────────────────────
  console.log('\n  [Windows - 应用图标]')
  const icoSizes = [16, 32, 48, 64, 128, 256]
  const tmpDir = path.join(ROOT, '.tmp-ico')
  fs.mkdirSync(tmpDir, { recursive: true })
  const icoPngs = []
  for (const size of icoSizes) {
    const tmp = path.join(tmpDir, `${size}.png`)
    await makePng(size, false, true).toFile(tmp)
    icoPngs.push(tmp)
  }
  const appIco = await pngToIco(icoPngs)
  fs.writeFileSync(path.join(WIN_DIR, 'app.ico'), appIco)
  fs.rmSync(tmpDir, { recursive: true, force: true })
  console.log(`    ✅  ${icoSizes.join('/')}px → icons/win/app.ico`)

  // ── macOS .icns（仅在 macOS 上执行，依赖系统 iconutil）────────────
  if (process.platform === 'darwin') {
    console.log('\n  [macOS - 应用图标 .icns]')
    const { execSync } = await import('node:child_process')
    const iconsetDir = path.join(ROOT, 'icon.iconset')
    try {
      fs.mkdirSync(iconsetDir, { recursive: true })
      // iconset 命名规范：icon_<w>x<h>[@2x].png
      const iconsetMap = [
        [16, 'icon_16x16.png'],
        [32, 'icon_16x16@2x.png'],
        [32, 'icon_32x32.png'],
        [64, 'icon_32x32@2x.png'],
        [128, 'icon_128x128.png'],
        [256, 'icon_128x128@2x.png'],
        [256, 'icon_256x256.png'],
        [512, 'icon_256x256@2x.png'],
        [512, 'icon_512x512.png'],
        [1024, 'icon_512x512@2x.png']
      ]
      for (const [size, name] of iconsetMap) {
        await makePng(size, false, true).toFile(path.join(iconsetDir, name))
      }
      const icnsDest = path.join(MAC_DIR, 'app.icns')
      execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsDest}"`)
      console.log(`    ✅  app.icns → icons/mac/app.icns`)
    } catch (err) {
      console.error(`    ❌  .icns 生成失败: ${err.message}`)
    } finally {
      fs.rmSync(iconsetDir, { recursive: true, force: true })
    }
  } else {
    console.log('\n  [macOS - 应用图标 .icns] 跳过（需在 macOS 上运行）')
  }

  console.log('\n✨  全平台图标生成完成！\n')
  console.log('  输出目录:')
  console.log('    resources/icons/mac/     → macOS 图标（app.icns + 托盘）')
  console.log('    resources/icons/win/     → Windows 图标（app.ico + 托盘）')
  console.log(
    '    resources/icons/linux/   → Linux 图标（多分辨率 app/ + 托盘）\n'
  )
}

run()
