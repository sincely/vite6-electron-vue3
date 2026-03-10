import vue from '@vitejs/plugin-vue'
import unplugin from './unplugin' // unplugin自动导入
import legacy from './legacy' // 浏览器兼容
import svgIconPlugin from './svgIcon' // svg图标集成
import mock from './mock' // mock
/**
 * @description  创建vite插件
 * @param viteEnv - 环境变量配置
 * @param isBuild - 是否编译
 */
export default function createVitePlugins(viteEnv, isBuild = false) {
  // Electron uses modern Chromium, so legacy bundles are opt-in only.
  const enableLegacyBuild = viteEnv.VITE_USE_LEGACY === 'true'
  const vitePlugins = [vue(), mock(viteEnv), ...unplugin(), svgIconPlugin()]
  if (isBuild) {
    if (enableLegacyBuild) {
      vitePlugins.push(legacy())
    }
  }
  return vitePlugins
}
