import vue from '@vitejs/plugin-vue'
import unplugin from './unplugin' // unplugin自动导入
import svgIconPlugin from './svgIcon' // svg图标集成
import mock from './mock' // mock
/**
 * @description  创建vite插件
 * @param viteEnv - 环境变量配置
 * @param isBuild - 是否编译
 */
export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue(), mock(viteEnv), ...unplugin(), svgIconPlugin()]
  return vitePlugins
}
