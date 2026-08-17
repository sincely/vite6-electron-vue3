// @lightning/build-config 统一入口
// re-export 共享的 vite 插件、代理配置与构建工具
export { default as createVitePlugins } from './plugins/index.js'
export { proxyServer } from './config/proxy.js'
export { getRootPath, getSrcPath } from './utils/index.js'
export { analyzeBuildSize as sizeAnalyzer } from './utils/sizeAnalyzer.js'