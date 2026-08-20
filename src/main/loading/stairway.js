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
  // 浅色主题变量，暗色主题在下方 prefers-color-scheme 媒体查询中覆盖，
  // Electron 渲染进程的 prefers-color-scheme 默认跟随 nativeTheme.themeSource（system），
  // 系统主题切换时无需 IPC 即可实时更新
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

@media (prefers-color-scheme: dark) {
  .app-loading-wrap {
    /* 与 windowManager.getWindowBackgroundColor 的暗色值保持一致 */
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
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `
    <div class="${className}"><div></div></div>
    <div class="loader"></div>
  `

  return {
    appendLoading() {
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
