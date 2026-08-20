// 兜底：若 Vue 异常导致 splash 残留，6s 后强制移除 #app-splash。
// App.vue 在 onMounted 成功时会 clearTimeout 这个句柄，避免误删已挂载的 DOM。
// 单独作为 ES 模块入口加载：必须早于 /src/render/main.js 执行，确保
// 在 Vue 主入口发生致命错误无法挂载时，兜底仍能按顺序执行。
window.__appSplashFailsafe = setTimeout(function () {
  const s = document.getElementById('app-splash')
  if (s && s.parentNode) s.parentNode.removeChild(s)
}, 6000)
