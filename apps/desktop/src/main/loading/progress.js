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
  const className = `loaderBar`
  const styleContent = `
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  z-index: 9999;
}

.loader-text {
  margin-top: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #006DFE;
  letter-spacing: 1px;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.loaderBar {
  width: 226px; /* calc(160px / 0.707) */
  height: 10px;
  background: #F9F9F9;
  border-radius: 10px;
  border: 1px solid #006DFE;
  position: relative;
  overflow: hidden;
}

.loaderBar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 5px;
  background: repeating-linear-gradient(45deg, #0031F2 0 30px, #006DFE 0 40px) right/200% 100%;
  animation: fillProgress 6s cubic-bezier(0.2, 0, 0, 1) forwards, lightEffect 1s infinite linear;
}

.loaderBar.finish::before {
  animation: finishProgress 0.3s ease-out forwards;
}

@keyframes fillProgress {
  0% {
    width: 0;
  }
  100% {
    width: 99.9%;
  }
}

@keyframes finishProgress {
  0% {
    width: 99.9%;
  }
  100% {
    width: 100%;
  }
}

@keyframes lightEffect {
  0%, 20%, 40%, 60%, 80%, 90%, 100% {
    background: repeating-linear-gradient(45deg, #0031F2 0 30px, #006DFE 0 40px) right/200% 100%;
  }

  10%, 30%, 50%, 70%, 80%, 90%, 100% {
    background: repeating-linear-gradient(45deg, #0031F2 0 30px, #006DFE 0 40px, rgba(255, 255, 255, 0.3) 0 40px) right/200% 100%;
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
    <div class="loader-text">正在加载中...</div>
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
