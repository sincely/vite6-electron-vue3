import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { updateElementPlusTheme } from '@/utils/color'
import { startThemeTransition } from '@/utils/themeTransition'

// 系统主题监听的内部引用。
// 注意：不能挂在 store 上（this._xxx），否则会成为 store 的可枚举属性，
// 值为 null 时会导致 storeToRefs() 抛错（Cannot read properties of null (reading 'effect')）
let systemThemeListener = null
let systemThemeMediaQuery = null

export const useAppStore = defineStore(
  'app',
  () => {
    const theme = ref('light') // 当前主题，默认是亮色主题
    const layoutMode = ref('left') // 布局模式：left | top | top-mixed | dual
    const dualMenuShowText = ref(false) // 双列模式下第一列是否显示菜单文字
    const sidebarCollapsed = ref(false) // 侧边栏是否折叠
    const mixedSubmenuCollapsible = ref(true) // 顶部混合模式下是否启用二级菜单伸缩/展开功能（设置开关）
    const mixedSubmenuCollapsed = ref(false) // 顶部混合模式下二级菜单当前是否处于收起状态
    const footerVisible = ref(true) // 是否显示底部状态栏
    const footerHeight = ref(26) // 底部状态栏高度（px）
    const tagsView = ref(true) // 是否显示多标签导航
    const tagsViewStyle = ref('card') // 多标签导航风格：default（默认）| card（卡片）| google（谷歌）
    const breadCrumb = ref(true) // 是否在标题栏显示面包屑导航
    const fastEnter = ref(true) // 是否在标题栏显示快速入口（九宫格面板）
    const refreshBtn = ref(true) // 是否在标题栏显示全局刷新按钮
    const showNProgress = ref(true) // 是否显示顶部加载进度条
    const watermarkVisible = ref(false) // 是否显示全局水印
    const transitionEnabled = ref(true) // 是否启用页面切换动画
    const transitionType = ref('page') // 页面切换动画类型
    const contentWidth = ref('full') // 内容容器宽度模式：full（铺满）| fixed（定宽）
    const contentWidthValue = ref(1200) // 定宽模式下的具体宽度值（px）
    const settingsVisible = ref(false) // 设置弹窗是否可见
    const refresh = ref(false) // 是否刷新当前页面（由 reloadPage 翻转，内容区监听后销毁重建路由视图）
    const loading = ref(false) // 是否显示加载中状态
    const loadingTargets = ref([]) // 加载中状态的目标元素
    const autoLaunch = ref(false) // 开机自启
    const closeAction = ref('minimize') // 关闭窗口行为：minimize | quit
    const themeColors = ref({
      useAlgorithm: false,
      primary: '#2563eb',
      infoFollowPrimary: true,
      info: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    })

    // ── getters ──────────────────────────────────────────────
    const isDark = computed(() => theme.value === 'dark')
    const isAutoLaunch = computed(() => autoLaunch.value)
    const windowCloseAction = computed(() => closeAction.value)
    const currentLayoutMode = computed(() => layoutMode.value)

    // ── actions ──────────────────────────────────────────────
    function setLayoutMode(mode) {
      layoutMode.value = mode
    }

    // 设置双列模式第一列的图标/文字显示
    function setDualMenuShowText(val) {
      dualMenuShowText.value = !!val
    }

    // 切换设置弹窗可见性
    function toggleSettings(visible) {
      settingsVisible.value = visible === undefined ? !settingsVisible.value : visible
    }

    // 切换开机自启
    function toggleAutoLaunch(value) {
      const newValue = value === undefined ? !autoLaunch.value : value
      autoLaunch.value = newValue

      // 通过 IPC 调用主进程方法设置开机自启
      if (window.ipcRenderer) {
        try {
          window.ipcRenderer.send('set-auto-launch', newValue)
        } catch (error) {
          console.error('设置开机自启失败:', error)
        }
      }

      // 同步到 electron-store 持久化
      if (window.store) {
        window.store.set('appSettings.autoLaunch', newValue).catch(() => {})
      }
    }

    function setCloseAction(action) {
      const value = action === 'quit' ? 'quit' : 'minimize'
      closeAction.value = value
      if (window.ipcRenderer) {
        window.ipcRenderer.send('set-close-action', value)
      }

      // 同步到 electron-store 持久化
      if (window.store) {
        window.store.set('appSettings.closeAction', value).catch(() => {})
      }
    }

    function syncDesktopSettings() {
      if (window.ipcRenderer) {
        window.ipcRenderer.send('set-auto-launch', autoLaunch.value)
        window.ipcRenderer.send('set-close-action', closeAction.value)
      }

      // 批量同步到 electron-store
      if (window.store) {
        window.store.set('appSettings.autoLaunch', autoLaunch.value).catch(() => {})
        window.store.set('appSettings.closeAction', closeAction.value).catch(() => {})
      }
    }

    async function initDesktopSettings() {
      if (!window.ipcRenderer) return
      try {
        // 优先从 electron-store 读取持久化设置
        if (window.store) {
          const storeSettings = await window.store.get('appSettings')
          if (storeSettings) {
            if (storeSettings.closeAction !== undefined) {
              closeAction.value = storeSettings.closeAction
            }
            if (storeSettings.autoLaunch !== undefined) {
              autoLaunch.value = !!storeSettings.autoLaunch
            }
          }
        }

        // 从主进程获取 autoLaunch 状态（以系统实际值为准）
        const value = await window.ipcRenderer.invoke('get-auto-launch')
        autoLaunch.value = !!value
      } catch (error) {
        console.error('获取开机自启状态失败:', error)
      } finally {
        // 确保关闭行为也同步到主进程
        window.ipcRenderer.send('set-close-action', closeAction.value)
      }
    }

    // 切换主题
    function toggleTheme() {
      // 如果当前是 auto，切换到 light
      if (theme.value === 'auto') {
        setTheme('light')
        return
      }
      // light -> dark -> auto -> light
      const nextTheme = theme.value === 'light' ? 'dark' : 'auto'
      setTheme(nextTheme)
    }

    // 切换主题时添加过渡动画（View Transition 圆形扩散，参考 art-design-pro）
    // 支持直接指定目标主题（如 'light' / 'dark'），否则回退到三态循环
    function toggleThemeWithTransition(event, targetTheme) {
      startThemeTransition(event, () => {
        if (targetTheme === 'light' || targetTheme === 'dark') {
          setTheme(targetTheme)
        } else {
          toggleTheme()
        }
      })
    }

    // 设置主题
    function setTheme(value) {
      theme.value = value

      let effectiveTheme = value
      if (value === 'auto') {
        // 如果是自动模式，检测系统偏好
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        effectiveTheme = isSystemDark ? 'dark' : 'light'

        // 监听系统主题变化
        if (!systemThemeListener) {
          systemThemeListener = (e) => {
            if (theme.value === 'auto') {
              const newTheme = e.matches ? 'dark' : 'light'
              document.documentElement.setAttribute('data-theme', newTheme)
              if (newTheme === 'dark') {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            }
          }
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          mediaQuery.addEventListener('change', systemThemeListener)
          // 保存 mediaQuery 引用以便后续移除监听
          systemThemeMediaQuery = mediaQuery
        }
      } else {
        // 移除监听器
        if (systemThemeListener && systemThemeMediaQuery) {
          systemThemeMediaQuery.removeEventListener('change', systemThemeListener)
          systemThemeListener = null
          systemThemeMediaQuery = null
        }
      }

      document.documentElement.setAttribute('data-theme', effectiveTheme)
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // 同步主题到主进程：驱动 nativeTheme.themeSource（影响原生窗口背景色与
      // prefers-color-scheme），并持久化到主进程文件供下次冷启动 createLoginWindow 前读取。
      // 渲染进程的 localStorage 主进程无法读取，故需经 IPC 同步。
      window.ipcRenderer.send('set-app-theme', value)
    }

    // 初始化主题
    function initTheme() {
      setTheme(theme.value)
      initThemeColors()
    }

    // 初始化主题颜色
    function initThemeColors() {
      const colors = themeColors.value || {
        useAlgorithm: false,
        primary: '#2563eb',
        infoFollowPrimary: true,
        info: '#0ea5e9',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
      setThemeColors(colors)
    }

    // 应用预设主题色（参照 art-design-pro 的 colorHandlers.selectColor）
    // 点击预设色圆点时调用：仅替换主色，其它辅助色保持不变，
    // 同时根据 infoFollowPrimary 自动同步 info。
    function setPresetThemeColor(color) {
      if (typeof color !== 'string' || !color) return
      setThemeColors({
        primary: color,
        infoFollowPrimary: themeColors.value.infoFollowPrimary,
        info: themeColors.value.infoFollowPrimary ? color : themeColors.value.info
      })
    }

    // 设置主题颜色
    function setThemeColors(colors) {
      themeColors.value = { ...themeColors.value, ...colors }

      const { primary, infoFollowPrimary, info, success, warning, error } = themeColors.value
      const effectiveInfo = infoFollowPrimary ? primary : info

      const updateColor = (type, color) => {
        updateElementPlusTheme(type, color)
        // 同时更新我们自己定义的 CSS 变量
        const cssVarName = type === 'error' ? '--color-danger' : `--color-${type}`
        document.documentElement.style.setProperty(cssVarName, color)
      }

      updateColor('primary', primary)
      updateColor('info', effectiveInfo)
      updateColor('success', success)
      updateColor('warning', warning)
      updateColor('error', error)

      // 更新主题色衍生变量
      document.documentElement.style.setProperty('--brand-accent', primary)
      document.documentElement.style.setProperty('--brand-accent-alt', primary)
    }

    // 切换侧边栏折叠状态
    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    // 设置侧边栏折叠状态
    function setSidebarCollapsed(val) {
      sidebarCollapsed.value = val
    }

    // 设置顶部混合模式二级菜单伸缩功能的启用状态；
    // 关闭功能时复位收起状态，避免二级菜单停留在不可见的收起态
    function setMixedSubmenuCollapsible(val) {
      mixedSubmenuCollapsible.value = !!val
      if (!val) mixedSubmenuCollapsed.value = false
    }

    // 切换顶部混合模式二级菜单的收起/展开
    function toggleMixedSubmenuCollapsed() {
      mixedSubmenuCollapsed.value = !mixedSubmenuCollapsed.value
    }

    // 设置底部栏显示状态
    function setFooterVisible(val) {
      footerVisible.value = !!val
    }

    // 设置多标签导航显示状态
    function setTagsView(val) {
      tagsView.value = !!val
    }

    // 设置多标签导航风格：default | card | google
    function setTagsViewStyle(style) {
      const allowed = ['default', 'card', 'google']
      tagsViewStyle.value = allowed.includes(style) ? style : 'card'
    }

    // 设置面包屑导航显示状态
    function setBreadCrumb(val) {
      breadCrumb.value = !!val
    }

    // 设置快速入口显示状态
    function setFastEnter(val) {
      fastEnter.value = !!val
    }

    // 设置全局刷新按钮显示状态
    function setRefreshBtn(val) {
      refreshBtn.value = !!val
    }

    // 设置顶部加载进度条显示状态
    function setShowNProgress(val) {
      showNProgress.value = !!val
    }

    // 设置全局水印显示状态
    function setWatermarkVisible(val) {
      watermarkVisible.value = !!val
    }

    // 设置底部栏高度（限制 20~80）
    function setFooterHeight(val) {
      const height = Number(val)
      if (!Number.isFinite(height)) return
      footerHeight.value = Math.min(80, Math.max(20, Math.round(height)))
    }

    // 设置内容容器宽度模式：full | fixed
    function setContentWidth(mode) {
      contentWidth.value = mode === 'fixed' ? 'fixed' : 'full'
    }

    // 设置定宽模式下的具体宽度值
    function setContentWidthValue(val) {
      const width = Number(val)
      if (!Number.isFinite(width)) return
      contentWidthValue.value = Math.min(1920, Math.max(800, Math.round(width)))
    }

    // 刷新当前页面：翻转 refresh，内容区监听后销毁并重建 RouterView
    // （全局软刷新：不重置布局框架，仅内容区重渲染，任意组件均可触发）
    function reloadPage() {
      refresh.value = !refresh.value
    }

    // 设置loading状态
    function setLoading(val) {
      loading.value = val
    }

    // 添加loading目标
    function addLoadingTarget(target) {
      if (!loadingTargets.value.includes(target)) {
        loadingTargets.value.push(target)
      }
    }

    // 移除loading目标
    function removeLoadingTarget(target) {
      const index = loadingTargets.value.indexOf(target)
      if (index > -1) {
        loadingTargets.value.splice(index, 1)
      }
    }

    // 清空所有loading目标
    function clearLoadingTargets() {
      loadingTargets.value = []
    }

    // 重置应用状态
    function resetAppState() {
      // theme.value = 'light'
      // sidebarCollapsed.value = false
      loading.value = false
      clearLoadingTargets()
      settingsVisible.value = false
      // autoLaunch.value = false
    }

    return {
      theme,
      layoutMode,
      dualMenuShowText,
      sidebarCollapsed,
      mixedSubmenuCollapsible,
      mixedSubmenuCollapsed,
      footerVisible,
      footerHeight,
      tagsView,
      tagsViewStyle,
      breadCrumb,
      fastEnter,
      refreshBtn,
      showNProgress,
      watermarkVisible,
      transitionEnabled,
      transitionType,
      contentWidth,
      contentWidthValue,
      settingsVisible,
      refresh,
      loading,
      loadingTargets,
      autoLaunch,
      closeAction,
      themeColors,
      isDark,
      isAutoLaunch,
      windowCloseAction,
      currentLayoutMode,
      setLayoutMode,
      setDualMenuShowText,
      toggleSettings,
      toggleAutoLaunch,
      setCloseAction,
      syncDesktopSettings,
      initDesktopSettings,
      toggleTheme,
      toggleThemeWithTransition,
      setTheme,
      initTheme,
      initThemeColors,
      setPresetThemeColor,
      setThemeColors,
      toggleSidebar,
      setSidebarCollapsed,
      setMixedSubmenuCollapsible,
      toggleMixedSubmenuCollapsed,
      setFooterVisible,
      setTagsView,
      setTagsViewStyle,
      setBreadCrumb,
      setFastEnter,
      setRefreshBtn,
      setShowNProgress,
      setWatermarkVisible,
      setFooterHeight,
      setContentWidth,
      setContentWidthValue,
      reloadPage,
      setLoading,
      addLoadingTarget,
      removeLoadingTarget,
      clearLoadingTargets,
      resetAppState
    }
  },
  {
    persist: {
      // left-mixed 布局已并入 dual，旧持久化值迁移为 dual
      afterHydrate(ctx) {
        if (ctx.store.layoutMode === 'left-mixed') {
          ctx.store.layoutMode = 'dual'
        }
      }
    }
  }
)
