/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const safeDOM = {
    append(parent, child) {
      if (!parent || !child) return
      if (!Array.from(parent.children).find((node) => node === child)) {
        parent.appendChild(child)
      }
    },
    remove(parent, child) {
      if (!parent || !child) return
      if (Array.from(parent.children).find((node) => node === child)) {
        parent.removeChild(child)
      }
    }
  }
  // 主题模式跟随应用设置（pinia store 的 theme 字段：'light' | 'dark' | 'auto'），
  // 经 pinia-plugin-persistedstate 持久化到 localStorage（key 为 store $id 'app'），
  // 在 appendLoading 时读取并打上对应 class：
  //   theme-light —— 强制浅色（与默认值一致，无需额外规则）
  //   theme-dark  —— 强制暗色（无视系统）
  //   theme-auto  —— 跟随系统（由 prefers-color-scheme 媒体查询决定）
  // 这样加载动画与应用实际主题模式一致。注意：主进程从未设置 nativeTheme.themeSource，
  // 故 prefers-color-scheme 恒跟随系统，无法反映应用强制的浅/深色，必须读 store 的 theme。
  const className = `loaderBar`
  const styleContent = `
.app-loading-wrap {
  --loading-bg: #ffffff;
  --stair-color: #f2f2f2;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--loading-bg);
  z-index: 9999;
  /* 配套 #app-splash：主窗口 splash 显示期间也允许拖拽整个窗口 */
  -webkit-app-region: drag;
}

/* 强制暗色：无视系统主题 */
.app-loading-wrap.theme-dark {
  /* 与 windowManager.getWindowBackgroundColor 的暗色值保持一致 */
  --loading-bg: #0b0c0f;
  --stair-color: #26292f;
}

/* 跟随系统：仅当系统为暗色时覆盖 */
@media (prefers-color-scheme: dark) {
  .app-loading-wrap.theme-auto {
    --loading-bg: #0b0c0f;
    --stair-color: #26292f;
  }
}

.loader {
  position: relative;
  width: 120px;
  height: 90px;
  margin: 0 auto;
}

.loader:before {
  content: "";
  position: absolute;
  bottom: 30px;
  left: 50px;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  background: #2a9d8f;
  animation: loading-bounce 0.5s ease-in-out infinite alternate;
}

.loader:after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  height: 7px;
  width: 45px;
  border-radius: 4px;
  box-shadow: 0 5px 0 var(--stair-color), -35px 50px 0 var(--stair-color), -70px 95px 0 var(--stair-color);
  animation: loading-step 1s ease-in-out infinite;
}

@keyframes loading-bounce {
  0% {
    transform: scale(1, 0.7);
  }

  40% {
    transform: scale(0.8, 1.2);
  }

  60% {
    transform: scale(1, 1);
  }

  100% {
    bottom: 140px;
  }
}

@keyframes loading-step {
  0% {
    box-shadow: 0 10px 0 rgba(0, 0, 0, 0),
            0 10px 0 var(--stair-color),
            -35px 50px 0 var(--stair-color),
            -70px 90px 0 var(--stair-color);
  }

  100% {
    box-shadow: 0 10px 0 var(--stair-color),
            -35px 50px 0 var(--stair-color),
            -70px 90px 0 var(--stair-color),
            -70px 90px 0 rgba(0, 0, 0, 0);
  }
}

    `
  // 读取应用主题模式：pinia store（$id: 'app'）经 pinia-plugin-persistedstate
  // 持久化到 localStorage，结构为 { theme: 'light'|'dark'|'auto', ... }。
  // 首次启动时 key 不存在，兜底 'light'（与 store 默认值一致，无闪烁）；
  // 用户在设置中切换后会写入 localStorage，后续启动（含新开窗口）的加载动画即可跟随。
  function resolveAppTheme() {
    try {
      const raw = localStorage.getItem('app')
      if (raw) {
        const theme = JSON.parse(raw)?.theme
        if (theme === 'light' || theme === 'dark' || theme === 'auto')
          return theme
      }
    } catch {
      // localStorage 不可读或格式异常时使用默认值
    }
    return 'light'
  }

  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = `app-loading-wrap theme-${resolveAppTheme()}`
  oDiv.innerHTML = `
    <div class="${className}"><div></div></div>
    <div class="loader"></div>
  `

  return {
    appendLoading() {
      // 每次展示时读取最新主题模式，会话中切换后新开窗口也能同步
      oDiv.className = `app-loading-wrap theme-${resolveAppTheme()}`
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    }
  }
}

export default useLoading
