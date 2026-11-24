import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import svgLoader from 'vite-svg-loader'

const SVG_ICONS_REGISTER = 'virtual:svg-icons-register'
const SVG_ICONS_CLIENT = 'virtual:svg-icons-names'

/**
 * 包装 vite-plugin-svg-icons，修正其 load 钩子的性能缺陷。
 *
 * 原插件 load(id) 未先判断 id 是否命中虚拟模块，而是无条件调用
 * createModuleCode() 全量扫描并编译所有图标，之后才判断 id 是否匹配。
 * 构建时 load 会对每个模块各调用一次，导致 3000+ 次无效的全量图标编译
 * （实测 3270 次调用，其中仅 1 次真正命中虚拟模块）。
 *
 * 这里仅在 id 命中两个虚拟模块时放行到原实现，其余模块直接返回 null，
 * 使全量编译只在真正需要时发生一次。
 * 实测总构建时间由 15.7~15.9s 降至 12.8~13.0s，产物与原插件逐字节一致。
 */
function createSvgIconsPluginPatched(options) {
  const plugin = createSvgIconsPlugin(options)
  const originalLoad = plugin.load

  plugin.load = function (id, ssr) {
    if (!id.endsWith(SVG_ICONS_REGISTER) && !id.endsWith(SVG_ICONS_CLIENT)) {
      return null
    }
    return originalLoad.call(this, id, ssr)
  }

  return plugin
}

export default function svgIconPlugin() {
  return [
    createSvgIconsPluginPatched({
      // 配置路径在你的src里的svg存放文件
      iconDirs: [resolve(process.cwd(), 'src/render/icons/svg')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]',
      /**
       * 自定义插入位置
       * @default: body-last
       */
      inject: 'body-last'
    }),
    /** 将 SVG 静态图转化为 Vue 组件 */
    svgLoader({ defaultImport: 'url' })
  ]
}
