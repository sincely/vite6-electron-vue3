#!/usr/bin/env node

import inquirer from 'inquirer'
import { execSync } from 'child_process'
async function main() {
  console.log('🚀 Release It - 交互式发布工具\n')

  // 检查当前状态
  try {
    execSync('git status --porcelain', { stdio: 'pipe' })
  } catch (e) {
    const changes = execSync('git status --porcelain').toString()
    if (changes) {
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: '发现未提交的更改，是否继续？',
          default: false
        }
      ])
      if (!proceed) {
        console.log('❌ 请先提交更改')
        process.exit(1)
      }
    }
  }

  const { releaseType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'releaseType',
      message: '选择发布类型:',
      choices: [
        { name: '🟢 补丁版本 (patch) - bug修复', value: 'patch' },
        { name: '🟡 次要版本 (minor) - 新功能', value: 'minor' },
        { name: '🔴 主要版本 (major) - 重大变更', value: 'major' },
        { name: '🔵 预发布版本 (pre-release)', value: 'pre' },
        { name: '⚪ 自定义版本号', value: 'custom' }
      ]
    }
  ])

  let versionArg = ''
  if (releaseType === 'pre') {
    const { preRelease } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preRelease',
        message: '选择预发布类型:',
        choices: [
          { name: 'Alpha', value: 'alpha' },
          { name: 'Beta', value: 'beta' },
          { name: 'RC', value: 'rc' }
        ]
      }
    ])
    versionArg = `--preRelease=${preRelease}`
  } else if (releaseType === 'custom') {
    const { customVersion } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customVersion',
        message: '输入版本号 (例如: 1.2.3):',
        validate: (input) =>
          /^\d+\.\d+\.\d+$/.test(input) || '请输入有效的版本号'
      }
    ])
    versionArg = customVersion
  } else {
    versionArg = releaseType
  }

  // 环境选择部分似乎没有被用到 release-it 命令中，暂时保留
  const { environment } = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: '选择发布环境:',
      choices: [
        { name: '🚀 生产环境', value: 'prod' },
        { name: '🛠️ 预发布环境', value: 'staging' },
        { name: '🧪 测试环境', value: 'test' }
      ]
    }
  ])

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: '确认开始发布流程？',
      default: false
    }
  ])

  if (!confirm) {
    console.log('❌ 发布已取消')
    process.exit(0)
  }

  // 执行发布
  try {
    console.log(`\n📦 开始发布: ${versionArg} (${environment})...\n`)
    // 这里使用 inherited stdio 以便用户能看到 release-it 的交互输出
    execSync(`npm run release -- ${versionArg}`, { stdio: 'inherit' })
  } catch (e) {
    console.error('\n❌ 发布过程中出错')
    process.exit(1)
  }
}

main().catch(console.error)
