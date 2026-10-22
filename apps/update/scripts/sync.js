/**
 * 从 release/<from>/ 复用 electron-builder 产物，生成更高版本号的更新目录 public/electron-update/
 * 用法：node scripts/sync.js [--from 2.0.11] [--to 2.0.13]
 * - from 默认取 release/ 下最新且含任一更新清单的版本
 * - to 默认取 max(根 package.json 版本, from) 的 patch + 1，保证高于当前开发版本
 * - 来源目录中存在哪些清单就处理哪些：Windows 打包生成 latest.yml，
 *   macOS 生成 latest-mac.yml，Linux 生成 latest-linux.yml；
 *   electron-updater 按客户端平台向同一 url 请求对应清单，因此一次 sync
 *   可同时产出多平台共用的更新目录
 * 安装包仅改文件名，内容不变，所以 sha512 / size 无需重算
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const RELEASE_DIR = path.join(ROOT, 'release')
const OUT_DIR = path.resolve(import.meta.dirname, '../public/electron-update')

// electron-updater 各平台默认的更新清单文件名
const MANIFESTS = ['latest.yml', 'latest-mac.yml', 'latest-linux.yml']

const parseVer = (v) => v.split('.').map(Number)
const compareVer = (a, b) => {
  const [pa, pb] = [parseVer(a), parseVer(b)]
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

function getArg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}

function findLatestRelease() {
  const versions = fs
    .readdirSync(RELEASE_DIR)
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v) && MANIFESTS.some((m) => fs.existsSync(path.join(RELEASE_DIR, v, m))))
    .sort(compareVer)
  if (!versions.length) {
    throw new Error(`${RELEASE_DIR} 下没有包含更新清单（${MANIFESTS.join(' / ')}）的版本目录，请先打包`)
  }
  return versions.at(-1)
}

const from = getArg('from') || findLatestRelease()
const srcDir = path.join(RELEASE_DIR, from)
const manifests = MANIFESTS.filter((m) => fs.existsSync(path.join(srcDir, m)))
if (!manifests.length) throw new Error(`${srcDir} 中缺少更新清单（${MANIFESTS.join(' / ')}）`)

let to = getArg('to')
if (!to) {
  const rootVer = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version
  const [major, minor, patch] = parseVer(compareVer(rootVer, from) > 0 ? rootVer : from)
  to = `${major}.${minor}.${patch + 1}`
}
if (compareVer(to, from) === 0) throw new Error('目标版本不能与来源版本相同')

fs.rmSync(OUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUT_DIR, { recursive: true })

const copiedFiles = []
function copyWithBlockmap(oldName, newName) {
  for (const suffix of ['', '.blockmap']) {
    const src = path.join(srcDir, oldName + suffix)
    if (!fs.existsSync(src)) {
      if (suffix === '') throw new Error(`缺少安装包：${src}`)
      continue
    }
    const dest = newName + suffix
    if (copiedFiles.includes(dest)) continue
    fs.copyFileSync(src, path.join(OUT_DIR, dest))
    copiedFiles.push(dest)
  }
}

for (const manifest of manifests) {
  // 版本号出现在 version / path / url 中，整体替换即可
  const yml = fs
    .readFileSync(path.join(srcDir, manifest), 'utf8')
    .replaceAll(from, to)
    .replace(/^releaseDate:.*$/m, `releaseDate: '${new Date().toISOString()}'`)

  const fileNames = [...new Set([...yml.matchAll(/^\s*(?:- )?(?:url|path): (.+)$/gm)].map((m) => m[1].trim()))]
  for (const newName of fileNames) {
    copyWithBlockmap(newName.replaceAll(to, from), newName)
  }

  fs.writeFileSync(path.join(OUT_DIR, manifest), yml)
}

fs.writeFileSync(
  path.join(OUT_DIR, 'update-config.json'),
  JSON.stringify({ schemaVersion: 1, eligible: true, disabledClientVersions: [], autoDownload: false }, null, 2)
)

console.log(
  `已生成更新目录：${OUT_DIR}\n版本 ${from} -> ${to}\n清单：${manifests.join(', ')}\n文件：\n  ${copiedFiles.join('\n  ')}`
)
