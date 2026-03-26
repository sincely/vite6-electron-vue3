/**
 * 构建体积分析工具配置
 * 用于分析打包后的文件体积并生成报告
 */

import fs from 'fs'
import path from 'path'

// 递归获取目录下所有文件及其大小
function getDirectorySize(dir, basePath = dir) {
  let totalSize = 0
  const files = []

  try {
    const items = fs.readdirSync(dir)

    items.forEach((item) => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        const { size, items: subItems } = getDirectorySize(fullPath, basePath)
        totalSize += size
        files.push(...subItems)
      } else {
        const size = stat.size
        totalSize += size
        const relativePath = path.relative(basePath, fullPath)
        files.push({
          path: relativePath,
          size,
          sizeKB: (size / 1024).toFixed(2)
        })
      }
    })
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return { size: totalSize, items: files }
}

// 格式化字节大小为可读字符串
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 生成体积分析报告
export function analyzeBuildSize() {
  const distPath = path.join(process.cwd(), 'dist')
  const electronPath = path.join(process.cwd(), 'dist-electron')

  console.log('\n========== Build Size Analysis ==========\n')

  if (fs.existsSync(distPath)) {
    const { size, items } = getDirectorySize(distPath)
    console.log(`📦 Web 应用包体积: ${formatBytes(size)}`)
    console.log(`   包含文件数: ${items.length}`)

    // 输出最大的10个文件
    const sortedItems = items.sort((a, b) => b.size - a.size).slice(0, 10)
    console.log('\n   最大的10个文件:')
    sortedItems.forEach((item) => {
      console.log(`   • ${item.path}: ${formatBytes(item.size)}`)
    })
  }

  if (fs.existsSync(electronPath)) {
    const { size, items } = getDirectorySize(electronPath)
    console.log(`\n🔌 Electron 进程包体积: ${formatBytes(size)}`)
    console.log(`   包含文件数: ${items.length}`)

    // 输出最大的5个文件
    const sortedItems = items.sort((a, b) => b.size - a.size).slice(0, 5)
    console.log('\n   最大的5个文件:')
    sortedItems.forEach((item) => {
      console.log(`   • ${item.path}: ${formatBytes(item.size)}`)
    })
  }

  // 计算总体积
  let totalSize = 0
  if (fs.existsSync(distPath)) {
    totalSize += getDirectorySize(distPath).size
  }
  if (fs.existsSync(electronPath)) {
    totalSize += getDirectorySize(electronPath).size
  }

  console.log(`\n📊 总打包体积: ${formatBytes(totalSize)}\n`)
}

export default {
  formatBytes,
  getDirectorySize,
  analyzeBuildSize
}
