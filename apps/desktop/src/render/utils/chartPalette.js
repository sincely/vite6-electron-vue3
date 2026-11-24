/**
 * 图表调色板（单一来源）
 *
 * 全项目所有图表的多系列配色都从这里取，不再各自写死十六进制。
 *
 * 规则：
 * - 默认系列色板是有序的 10 槽：主色起、沿色相环展开，相邻槽位色相距离足够大，
 *   保证同一张图里任意两条系列都可区分。
 * - 槽位值来自 themes.scss 的 --chart-series-* 变量，明暗主题各一套；
 *   暗色下同色相提亮一档，保证在深底上的可读性。
 * - 领域标识色（加密货币的资产色、社交平台的品牌色）属于「内容事实」，
 *   不由调色板决定，保留在各自的仪表盘文件里。
 */

/** 槽位数量 */
const SLOT_COUNT = 10

/** 变量缺失时的兜底（与 themes.scss 亮色主题一致） */
const FALLBACK = [
  '#2563eb',
  '#06b6d4',
  '#0d9488',
  '#f59e0b',
  '#e11d48',
  '#7c3aed',
  '#0ea5e9',
  '#ec4899',
  '#10b981',
  '#4f46e5'
]

/**
 * 读取 CSS 变量（每次调用都是最新值）
 * @param {string} name 变量名
 * @param {string} fallback 兜底值
 */
function cssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/**
 * 有序系列色板（10 槽）
 * @returns {string[]} 颜色数组
 */
export function chartPalette() {
  return Array.from({ length: SLOT_COUNT }, (_, i) => cssVar(`--chart-series-${i + 1}`, FALLBACK[i]))
}

/**
 * 按槽位取色，超出长度时循环
 * @param {number} index 槽位序号，从 0 开始
 * @returns {string} 颜色值
 */
export function chartColor(index) {
  const palette = chartPalette()
  return palette[((index % palette.length) + palette.length) % palette.length]
}

/**
 * 按数量取色板前 n 槽
 * @param {number} count 需要的颜色数量
 * @returns {string[]} 颜色数组
 */
export function chartPaletteOf(count) {
  return chartPalette().slice(0, Math.max(1, count))
}

export default { chartPalette, chartColor, chartPaletteOf }
