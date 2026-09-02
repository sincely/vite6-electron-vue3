import { computed, ref } from 'vue'

/**
 * vben 认证页面板布局（对应 authPanelLeft / authPanelCenter / authPanelRight）：
 *   left   —— 表单面板居左、品牌面板居右（默认）
 *   center —— 表单居中卡片展示，隐藏品牌面板
 *   right  —— 品牌面板居左、表单面板居右
 *
 * 切换入口为下拉菜单：标题栏图标按钮 + 单选菜单项（复刻
 * vite-admin-ele/frontend/src/layouts/components/widgets/layout-toggle.vue）。
 */
export const AUTH_PANEL_LAYOUTS = [
  { value: 'left', label: '居左', icon: 'lucide:panel-left-close' },
  { value: 'center', label: '居中', icon: 'lucide:layout-template' },
  { value: 'right', label: '居右', icon: 'lucide:panel-right-close' }
]

const STORAGE_KEY = `AUTH_PANEL_LAYOUT_${location.hostname}`

const initialLayout = AUTH_PANEL_LAYOUTS.some(
  (item) => item.value === localStorage.getItem(STORAGE_KEY)
)
  ? localStorage.getItem(STORAGE_KEY)
  : 'left'

const authPanelLayout = ref(initialLayout)

// 与 vben SUIIconButton 行为一致：触发按钮图标随当前布局联动
const activeLayoutIcon = computed(
  () =>
    AUTH_PANEL_LAYOUTS.find((item) => item.value === authPanelLayout.value)
      ?.icon || AUTH_PANEL_LAYOUTS[0].icon
)

export function useAuthPanelLayout() {
  const setAuthPanelLayout = (layout) => {
    if (AUTH_PANEL_LAYOUTS.some((item) => item.value === layout)) {
      authPanelLayout.value = layout
      localStorage.setItem(STORAGE_KEY, layout)
    }
  }

  return {
    activeLayoutIcon,
    authPanelLayout,
    setAuthPanelLayout
  }
}
