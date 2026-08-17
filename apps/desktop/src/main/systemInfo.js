import os from 'node:os'

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
