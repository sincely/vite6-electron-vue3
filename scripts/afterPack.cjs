/**
 * afterPack 钩子：清理 macOS 产物中 Electron Framework 内未使用的语言文件。
 *
 * electron-builder 的 electronLanguages 在 mac 上只清理
 * `lightning.app/Contents/Resources/*.lproj`（应用级 InfoPlist.strings），
 * 不会处理 `Electron Framework.framework/Versions/A/Resources/` 内的
 * 220 个 *.lproj（每个含 locale.pak，共约 58M），此处按白名单手动裁剪。
 */
const fs = require("fs/promises")
const path = require("path")

// Framework 内 lproj 为下划线命名（zh_CN.lproj），
// xx_FEMININE/_MASCULINE/_NEUTER 语法性别变体不在白名单内，一并删除
const KEEP_LPROJ = new Set(["en.lproj", "zh_CN.lproj"])

exports.afterPack = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") {
    return
  }

  const appName = context.packager.appInfo.productFilename
  const resourcesDir = path.join(
    context.appOutDir,
    `${appName}.app`,
    "Contents",
    "Frameworks",
    "Electron Framework.framework",
    "Versions",
    "A",
    "Resources"
  )

  let entries
  try {
    entries = await fs.readdir(resourcesDir)
  } catch (error) {
    console.warn(`[afterPack] 跳过语言清理，目录不存在：${resourcesDir}`)
    return
  }

  const targets = entries.filter(entry => entry.endsWith(".lproj") && !KEEP_LPROJ.has(entry))
  await Promise.all(
    targets.map(entry => fs.rm(path.join(resourcesDir, entry), { recursive: true, force: true }))
  )

  console.log(
    `[afterPack] 已清理 ${targets.length} 个 framework 语言目录，保留 ${[...KEEP_LPROJ].join(", ")}`
  )
}
