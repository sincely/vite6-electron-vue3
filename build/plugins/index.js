import vue from '@vitejs/plugin-vue'
import unplugin from './unplugin' // unplugin自动导入
import svgIconPlugin from './svgIcon' // svg图标集成
/**
 * @description  创建vite插件
 */
export default function createVitePlugins() {
  const vitePlugins = [vue(), ...unplugin(), svgIconPlugin()]
  return vitePlugins
}
