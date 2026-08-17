import { resolve } from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import svgLoader from 'vite-svg-loader'

/**
 * SVG 图标插件
 * @param {Object} [options]
 * @param {string[]} [options.iconDirs] - SVG 图标目录,默认 process.cwd() + 'src/renderer/icons/svg'
 */
export default function svgIconPlugin(options = {}) {
  const iconDirs =
    options.iconDirs || [resolve(process.cwd(), 'src/renderer/icons/svg')]
  return [
    createSvgIconsPlugin({
      iconDirs,
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last'
    }),
    svgLoader({ defaultImport: 'url' })
  ]
}