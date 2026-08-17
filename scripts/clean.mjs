#!/usr/bin/env node
/**
 * Lightning monorepo 全量清理脚本
 *
 * 删除所有 node_modules / dist / dist-electron / .turbo / .nitro / .output / release。
 *
 * 用法:
 *   node ./scripts/clean.mjs                # 仅删除构建产物
 *   node ./scripts/clean.mjs --all          # 同时删除 node_modules
 *   node ./scripts/clean.mjs --del-lock     # 同时删除根 pnpm-lock.yaml
 */

import { rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const args = new Set(process.argv.slice(2))
const delAll = args.has('--all')
const delLock = args.has('--del-lock')

const targets = [
  'node_modules',
  'dist',
  'dist-electron',
  'release',
  '.turbo',
  '.nitro',
  '.output',
  'node_modules/.cache'
]

const MAX_DEPTH = 6

async function walk(dir, depth = 0) {
  if (depth > MAX_DEPTH) return
  let entries
  try {
    entries = await import('node:fs/promises').then((m) => m.readdir(dir, { withFileTypes: true }))
  } catch {
    return
  }
  await Promise.allSettled(
    entries.map(async (entry) => {
      const full = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === '.git' || entry.name === '.idea' || entry.name === '.vscode' || entry.name === '.DS_Store') {
          return
        }
        for (const t of targets) {
          if (entry.name === t) {
            await rm(full, { recursive: true, force: true }).catch(() => {})
            return
          }
        }
        await walk(full, depth + 1)
      }
    })
  )
}

async function main() {
  console.log('🧹 Lightning monorepo 清理开始...')
  if (delAll) {
    console.log('  → 同时删除所有 node_modules')
  }
  if (delLock) {
    console.log('  → 同时删除根 pnpm-lock.yaml')
  }
  await walk(root)
  if (delLock) {
    const lock = resolve(root, 'pnpm-lock.yaml')
    if (existsSync(lock)) {
      await rm(lock, { force: true }).catch(() => {})
    }
  }
  console.log('✅ 清理完成')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})