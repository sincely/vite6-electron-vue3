import AutoImport from 'unplugin-auto-import/vite' // 自动导入插件
import Components from 'unplugin-vue-components/vite' // 自动导入组件,不需要手动导入

export default function createVitePlugins() {
  return [
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
      include: [/\.[tj]sx?$/, /\.vue$/], // 匹配的文件，也就是哪些后缀的文件需要自动引入
      // 可以选择auto-import.d.ts生成的位置，使用ts建议设置为'src/auto-import.d.ts'
      dts: false, // 会在根目录生成auto-imports.d.ts，里面可以看到自动导入的api
      // 根据项目情况配置eslintrc，默认是不开启的
      // 下面两个是其他配置，默认即可
      // 输出一份json文件，默认输出路径为./.eslintrc-auto-import.json
      eslintrc: {
        enabled: false,
        filepath: './.eslintrc-auto-import.json', // @default './.eslintrc-auto-import.json'
        globalsPropValue: true, // @default true 可设置 boolean | 'readonly' | 'readable' | 'writable' | 'writeable'
        dts: false // 配置文件生成位置,会在根目录生成./components.d.ts，里面可以看到自动导入的api
      }
    }),
    Components({
      dirs: ['src/components'], // 指定组件位置，默认是src/components
      resolvers: [],
      extensions: ['vue'], // 指定扩展名，默认是.vue
      dts: false // 配置文件生成位置,会在根目录生成./components.d.ts，里面可以看到自动导入的api
    })
    // // 当你使用unplugin-vue-components引入ui库的时候 message, notification 等引入样式不生效 安装vite-plugin-style-import即可
    // createStyleImportPlugin({
    //   resolves: [ElementPlusResolve()],
    //   // 自定义规则
    //   libs: [
    //     {
    //       libraryName: 'element-plus',
    //       esModule: true,
    //       resolveStyle: (name) => `element-plus/theme-chalk/${name}.css`
    //     }
    //   ]
    // })
  ]
}
