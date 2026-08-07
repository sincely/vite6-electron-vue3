import os from 'node:os'
import logger from './log'

/**
 * 获取系统运行环境信息（纯数据，供 IPC 返回给渲染进程）
 * @returns {object} 系统信息对象
 */
export function getSystemInfo() {
  const arch = os.arch()
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const uptime = os.uptime()

  const cpuList = cpus.map((cpu, idx) => {
    const times = cpu.times
    const total = times.idle + times.user + times.nice + times.sys + times.irq
    return {
      index: idx,
      model: cpu.model,
      speed: cpu.speed,
      usage: ((1 - times.idle / total) * 100).toFixed(2)
    }
  })

  const isAppleSilicon =
    arch === 'arm64' || cpus.some((item) => item.model.includes('Apple'))

  return {
    arch,
    kernel: os.type(),
    platform: os.platform(),
    hostname: os.hostname(),
    homedir: os.homedir(),
    release: os.release(),
    cpus: cpuList,
    isAppleSilicon,
    totalMem: (totalMem / 1024 / 1024 / 1024).toFixed(2),
    freeMem: (freeMem / 1024 / 1024 / 1024).toFixed(2),
    uptime: {
      days: Math.floor(uptime / 86400),
      hours: Math.floor((uptime % 86400) / 3600),
      minutes: Math.floor((uptime % 3600) / 60)
    }
  }
}

/**
 * 收集并记录当前系统运行环境信息到日志
 */
export function logSystemInfo() {
  // CPU 架构
  const arch = os.arch()
  logger.warn('cpu架构：' + arch)

  // 操作系统内核
  const kernel = os.type()
  logger.warn('操作系统内核：' + kernel)

  // 操作系统平台
  const pf = os.platform()
  logger.warn('平台：' + pf)

  // 主机名
  const hn = os.hostname()
  logger.warn('主机名：' + hn)

  // 主目录
  const hdir = os.homedir()
  logger.warn('主目录：' + hdir)

  // CPU 信息
  const cpus = os.cpus()
  logger.warn('*****cpu信息*******')
  cpus.forEach((cpu, idx) => {
    const times = cpu.times
    logger.warn(`cpu${idx}：`)
    logger.warn(`型号：${cpu.model}`)
    logger.warn(`频率：${cpu.speed}MHz`)
    logger.warn(
      `使用率：${((1 - times.idle / (times.idle + times.user + times.nice + times.sys + times.irq)) * 100).toFixed(2)}%`
    )
  })

  // 判断当前电脑芯片是不是 Apple Silicon (M1/M2/M3/...)
  const isAppleSilicon =
    arch === 'arm64' || cpus.some((item) => item.model.includes('Apple'))
  logger.warn('isAppleSilicon', isAppleSilicon)

  // 内存信息
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  logger.warn(`总内存：${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`)
  logger.warn(`空闲内存：${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`)

  // 操作系统版本
  logger.warn('操作系统版本：' + os.release())

  // 系统运行时间
  const uptime = os.uptime()
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  logger.warn(`系统运行时间：${days}天 ${hours}小时 ${minutes}分钟`)
}
