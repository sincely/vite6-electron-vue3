import ViteRestart from 'vite-plugin-restart'
// 使用 vite-plugin-restart 插件，监听 vite.config.js 或 .env.development 等配置文件修改直接生效，不需要反复重启 Vite
export default function restartPlugin() {
  return ViteRestart({
    restart: ['vite.config.js', '.env']
  })
}
