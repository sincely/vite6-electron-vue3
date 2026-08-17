import { watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { hexToRGB, rgbToHex } from '@/utils/color'

/**
 * 图表主题工具
 * 统一从 CSS 变量读取主题色，并在明暗主题切换后重建 echarts options
 */
export function useChartTheme() {
  const appStore = useAppStore()
  const { isDark } = storeToRefs(appStore)

  // 读取 CSS 变量（每次调用都是最新值）
  function c(name, fallback = '') {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    )
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

  // 通用 tooltip 样式
  function tooltipBase(colors = getThemeColors()) {
    return {
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      textStyle: { color: colors.textPrimary, fontSize: 12 }
    }
  }

  // 主题切换时等待 DOM 更新后重建（CSS 变量已被 setTheme 更新）
  function onThemeChange(rebuild) {
    watch(
      isDark,
      () => {
        nextTick(rebuild)
      },
      { immediate: true }
    )
  }

  // ============================================================
  // ECharts 样式助手（模板中心图表组件使用）
  // ============================================================

  /** 默认图表高度 */
  const CHART_HEIGHT = '16rem'
  /** 轴标签字体配置 */
  const CHART_FONT = { size: 13, color: '#999' }

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
    return [
      c('--color-primary', '#2563eb'),
      c('--color-info', '#0ea5e9'),
      c('--color-teal', '#14b8a6'),
      c('--color-amber', '#f59e0b'),
      c('--color-rose', '#f43f5e'),
      c('--color-violet', '#7c3aed')
    ]
  }

  /** 坐标轴线样式 */
  function getAxisLineStyle(show = true) {
    return {
      show,
      lineStyle: {
        color: isDark.value ? '#444' : '#EDEDED',
        width: 1
      }
    }
  }

  /** 分割线样式 */
  function getSplitLineStyle(show = true) {
    return {
      show,
      lineStyle: {
        color: isDark.value ? '#444' : '#EDEDED',
        width: 1,
        type: 'dashed'
      }
    }
  }

  /** 坐标轴标签样式 */
  function getAxisLabelStyle(show = true) {
    return {
      show,
      color: CHART_FONT.color,
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
    return {
      trigger,
      backgroundColor: isDark.value
        ? 'rgba(0, 0, 0, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark.value ? '#333' : '#ddd',
      borderWidth: 1,
      textStyle: {
        color: isDark.value ? '#fff' : '#333'
      },
      ...customOptions
    }
  }

  /** 统一的图例配置 */
  function getLegendStyle(position = 'bottom', customOptions = {}) {
    const baseConfig = {
      textStyle: {
        color: isDark.value ? '#fff' : '#333'
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
  function getGridWithLegend(
    showLegend,
    legendPosition = 'bottom',
    baseGrid = {}
  ) {
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
