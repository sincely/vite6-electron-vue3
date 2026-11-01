import { watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { hexToRGB, rgbToHex } from '@/utils/color'
import { chartPalette } from '@/utils/chartPalette'

/**
 * 图表主题工具
 * 统一从 CSS 变量读取主题色，并在明暗主题切换后重建 echarts options
 */
export function useChartTheme() {
  const appStore = useAppStore()
  const { isDark } = storeToRefs(appStore)

  // 读取 CSS 变量（每次调用都是最新值）
  function c(name, fallback = '') {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  }

  function getThemeColors() {
    return {
      primary: c('--color-primary', '#2563eb'),
      success: c('--color-success', '#10b981'),
      warning: c('--color-warning', '#f59e0b'),
      danger: c('--color-danger', '#ef4444'),
      info: c('--color-info', '#0ea5e9'),
      violet: c('--color-violet', '#7c3aed'),
      textPrimary: c('--color-text-primary', '#0f172a'),
      textSecondary: c('--color-text-secondary', '#475569'),
      textMuted: c('--color-text-muted', '#64748b'),
      border: c('--color-border', '#eff1f3'),
      bgCard: c('--color-bg-card', '#ffffff')
    }
  }

  // ============================================================
  // 图表中性色（轴线 / 网格 / 标签 / 参考线 / tooltip）
  // 全部来自 themes.scss 的 --color-chart-* 变量，
  // 避免每张图各自写死一套灰阶导致暗色模式下失配。
  // ============================================================
  function getChartColors() {
    return {
      axis: c('--color-chart-axis', '#e2e8f0'),
      grid: c('--color-chart-grid', '#eff1f3'),
      label: c('--color-chart-label', '#64748b'),
      dashed: c('--color-chart-dashed', 'rgb(100 116 139 / 28%)'),
      tooltipBg: c('--color-chart-tooltip-bg', 'rgb(255 255 255 / 96%)'),
      tooltipBorder: c('--color-chart-tooltip-border', '#e2e8f0'),
      tooltipText: c('--color-chart-tooltip-text', '#0f172a')
    }
  }

  // 通用 tooltip 样式
  function tooltipBase(colors = getThemeColors()) {
    return {
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      textStyle: { color: colors.textPrimary, fontSize: 12 }
    }
  }

  // 主题切换时等待 DOM 更新后重建（CSS 变量已被 setTheme / setThemeColors 更新）
  // 需要同时监听两类变化：
  // 1. isDark —— 明暗主题切换，影响坐标轴/tooltip/图例等中性色；
  // 2. themeColors —— 主题色切换（主色/辅助色），影响系列色板与渐变。
  // 只监听 isDark 会导致切换主题色后图表颜色不实时更新。
  function onThemeChange(rebuild) {
    watch(
      [isDark, () => appStore.themeColors],
      () => {
        nextTick(rebuild)
      },
      { immediate: true, deep: true }
    )
  }

  // ============================================================
  // ECharts 样式助手（模板中心图表组件使用）
  // ============================================================

  /** 默认图表高度 */
  const CHART_HEIGHT = '16rem'
  /** 轴标签字体配置（颜色随主题实时读取，见 getChartColors） */
  const CHART_FONT = { size: 13, color: '#64748b' }

  /**
   * hex 颜色转 rgba（非法输入时原样返回）
   * @param {string} hex 16 进制颜色
   * @param {number} opacity 透明度 0-1
   */
  function hexToRgba(hex, opacity = 1) {
    const alpha = Math.max(0, Math.min(1, opacity))
    try {
      const { r, g, b } = hexToRGB(hex)
      return {
        red: r,
        green: g,
        blue: b,
        rgba: `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
    } catch {
      return { red: 0, green: 0, blue: 0, rgba: hex }
    }
  }

  /**
   * 将 hex 颜色与白色混合得到更浅的颜色
   * @param {string} hex 16 进制颜色
   * @param {number} weight 混合比例 0-1，越大越浅
   */
  function lightenColor(hex, weight = 0.4) {
    try {
      const { r, g, b } = hexToRGB(hex)
      return rgbToHex({
        r: r + (255 - r) * weight,
        g: g + (255 - g) * weight,
        b: b + (255 - b) * weight
      })
    } catch {
      return hex
    }
  }

  /** 主题色（实时读取 CSS 变量） */
  function getThemeColor() {
    return c('--color-primary', '#2563eb')
  }

  /** 默认多系列色板（实时读取 CSS 变量，主题切换后可取到新值） */
  function getDefaultColors() {
    return getChartPalette().slice(0, 6)
  }

  /**
   * 图表系列色板（有序 10 槽，实时读取 CSS 变量）
   *
   * 槽位顺序即默认配色顺序：主色起、沿色相环展开，相邻槽位色相距离足够大，
   * 保证同一张图里任意两条系列都可区分。
   * 所有图表的多系列配色统一从这里取，不再各自写死十六进制。
   */
  function getChartPalette() {
    return chartPalette()
  }

  /** 坐标轴线样式 */
  function getAxisLineStyle(show = true) {
    return {
      show,
      lineStyle: {
        color: getChartColors().axis,
        width: 1
      }
    }
  }

  /** 分割线样式 */
  function getSplitLineStyle(show = true) {
    return {
      show,
      lineStyle: {
        color: getChartColors().grid,
        width: 1,
        type: 'dashed'
      }
    }
  }

  /** 坐标轴标签样式 */
  function getAxisLabelStyle(show = true) {
    return {
      show,
      color: getChartColors().label,
      fontSize: CHART_FONT.size
    }
  }

  /** 坐标轴刻度样式 */
  function getAxisTickStyle() {
    return { show: false }
  }

  /** 动画配置 */
  function getAnimationConfig(animationDelay = 50, animationDuration = 1500) {
    return {
      animationDelay: (idx) => idx * animationDelay + 200,
      animationDuration: (idx) => animationDuration - idx * 50,
      animationEasing: 'quarticOut'
    }
  }

  /** 统一的 tooltip 配置 */
  function getTooltipStyle(trigger = 'axis', customOptions = {}) {
    const chart = getChartColors()
    return {
      trigger,
      backgroundColor: chart.tooltipBg,
      borderColor: chart.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: chart.tooltipText
      },
      ...customOptions
    }
  }

  /** 统一的图例配置 */
  function getLegendStyle(position = 'bottom', customOptions = {}) {
    const baseConfig = {
      textStyle: {
        color: getChartColors().label
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      ...customOptions
    }

    switch (position) {
      case 'bottom':
        return {
          ...baseConfig,
          bottom: 0,
          left: 'center',
          orient: 'horizontal',
          icon: 'roundRect'
        }
      case 'top':
        return {
          ...baseConfig,
          top: 0,
          left: 'center',
          orient: 'horizontal',
          icon: 'roundRect'
        }
      case 'left':
        return {
          ...baseConfig,
          left: 0,
          top: 'center',
          orient: 'vertical',
          icon: 'roundRect'
        }
      case 'right':
        return {
          ...baseConfig,
          right: 0,
          top: 'center',
          orient: 'vertical',
          icon: 'roundRect'
        }
      default:
        return baseConfig
    }
  }

  /** 根据图例位置计算 grid 配置 */
  function getGridWithLegend(showLegend, legendPosition = 'bottom', baseGrid = {}) {
    const defaultGrid = {
      top: 15,
      right: 15,
      bottom: 8,
      left: 0,
      containLabel: true,
      ...baseGrid
    }

    if (!showLegend) return defaultGrid

    switch (legendPosition) {
      case 'bottom':
        return { ...defaultGrid, bottom: 40 }
      case 'top':
        return { ...defaultGrid, top: 40 }
      case 'left':
        return { ...defaultGrid, left: 120 }
      case 'right':
        return { ...defaultGrid, right: 120 }
      default:
        return defaultGrid
    }
  }

  return {
    isDark,
    c,
    getThemeColors,
    getChartColors,
    getChartPalette,
    tooltipBase,
    onThemeChange,
    CHART_HEIGHT,
    CHART_FONT,
    hexToRgba,
    lightenColor,
    getThemeColor,
    getDefaultColors,
    getAxisLineStyle,
    getSplitLineStyle,
    getAxisLabelStyle,
    getAxisTickStyle,
    getAnimationConfig,
    getTooltipStyle,
    getLegendStyle,
    getGridWithLegend
  }
}
