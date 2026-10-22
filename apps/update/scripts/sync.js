/**
 * 从 release/<from>/ 复用 electron-builder 产物，生成更高版本号的更新目录 public/electron-update/
 * 用法：node scripts/sync.js [--from 2.0.11] [--to 2.0.13]
 * - from 默认取 release/ 下最新且含 latest.yml 的版本
 * - to 默认取 max(根 package.json 版本, from) 的 patch + 1，保证高于当前开发版本
 * 安装包仅改文件名，内容不变，所以 sha512 / size 无需重算
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const RELEASE_DIR = path.join(ROOT, 'release')
const OUT_DIR = path.resolve(import.meta.dirname, '../public/electron-update')

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
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v) && fs.existsSync(path.join(RELEASE_DIR, v, 'latest.yml')))
    .sort(compareVer)
  if (!versions.length) throw new Error(`${RELEASE_DIR} 下没有包含 latest.yml 的版本目录，请先打包`)
  return versions.at(-1)
}

const from = getArg('from') || findLatestRelease()
const srcDir = path.join(RELEASE_DIR, from)
if (!fs.existsSync(path.join(srcDir, 'latest.yml'))) throw new Error(`${srcDir} 中缺少 latest.yml`)

let to = getArg('to')
if (!to) {
  const rootVer = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version
  const [major, minor, patch] = parseVer(compareVer(rootVer, from) > 0 ? rootVer : from)
  to = `${major}.${minor}.${patch + 1}`
}
if (compareVer(to, from) === 0) throw new Error('目标版本不能与来源版本相同')

// 版本号出现在 version / path / url 中，整体替换即可
const yml = fs
  .readFileSync(path.join(srcDir, 'latest.yml'), 'utf8')
  .replaceAll(from, to)
  .replace(/^releaseDate:.*$/m, `releaseDate: '${new Date().toISOString()}'`)

const fileNames = [...yml.matchAll(/^\s*(?:- )?(?:url|path): (.+)$/gm)].map((m) => m[1].trim())

fs.rmSync(OUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUT_DIR, { recursive: true })

for (const newName of new Set(fileNames)) {
  const oldName = newName.replaceAll(to, from)
  for (const suffix of ['', '.blockmap']) {
    const src = path.join(srcDir, oldName + suffix)
    if (!fs.existsSync(src)) {
      if (suffix === '') throw new Error(`缺少安装包：${src}`)
      continue
    }
    fs.copyFileSync(src, path.join(OUT_DIR, newName + suffix))
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'latest.yml'), yml)
fs.writeFileSync(
  path.join(OUT_DIR, 'update-config.json'),
  JSON.stringify({ schemaVersion: 1, eligible: true, disabledClientVersions: [], autoDownload: false }, null, 2)
)

console.log(`已生成更新目录：${OUT_DIR}\n版本 ${from} -> ${to}\n文件：${[...new Set(fileNames)].join(', ')}`)
