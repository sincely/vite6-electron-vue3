/**
 * 主题切换过渡动画
 * 参考 art-design-pro：基于 View Transition API 的点击位置圆形扩散切换效果
 *
 * - 切换到亮色：新（亮色）画面从点击处圆形展开，覆盖旧画面
 * - 切换到暗色：旧（亮色）画面从点击处圆形收缩，露出新（暗色）画面
 *   （方向反转由 styles/index.scss 中 html.dark 下的 ::view-transition 样式实现）
 * - 不支持 View Transition 或用户偏好减少动态效果时，直接切换（无动画）
 */

/**
 * 以圆形扩散过渡执行主题切换
 * @param {MouseEvent} [event] 触发切换的点击事件（提供扩散圆心坐标）
 * @param {() => void} applyTheme 主题应用函数（需同步完成 DOM 变更）
 */
export function startThemeTransition(event, applyTheme) {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  // 不支持 View Transition 或偏好减少动态效果时直接切换
  if (typeof document.startViewTransition !== 'function' || reducedMotion) {
    applyTheme()
    return
  }

  // 扩散圆心：优先取点击位置，缺省（如键盘触发）时取视口中心
  const x = event?.clientX ?? window.innerWidth / 2
  const y = event?.clientY ?? window.innerHeight / 2
  // 计算点击位置距离视口最远角的半径，保证扩散的圆能覆盖整个视口
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const root = document.documentElement
  root.style.setProperty('--theme-vt-x', `${x}px`)
  root.style.setProperty('--theme-vt-y', `${y}px`)
  root.style.setProperty('--theme-vt-r', `${endRadius}px`)

  // 禁用全局过渡动画，避免新快照截取到颜色 transition 的中间态，
  // 导致圆形扩散区域内仍是旧主题颜色
  const disableTransitionStyle = document.createElement('style')
  disableTransitionStyle.textContent = '* { transition: none !important; }'
  document.head.appendChild(disableTransitionStyle)

  const transition = document.startViewTransition(() => {
    applyTheme()
  })

  // 新快照截取完成（动画开始）后恢复过渡动画；
  // 此时主题样式已应用完毕，移除禁用样式不会重新触发 transition
  transition.ready
    .then(() => {
      requestAnimationFrame(() => {
        disableTransitionStyle.remove()
      })
    })
    .catch(() => {
      // 过渡被跳过或取消时也要清理
      disableTransitionStyle.remove()
    })
}
