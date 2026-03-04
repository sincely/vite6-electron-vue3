import AutoImport from 'unplugin-auto-import/vite' // 自动导入插件
import Components from 'unplugin-vue-components/vite' // 自动导入组件,不需要手动导入
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
export default function createVitePlugins() {
  return [
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [
        // 自动引入修改主题色添加这一行，使用预处理样式，不添加将会导致使用ElMessage，ElNotification等组件时默认的主题色会覆盖自定义的主题色
        ElementPlusResolver({ importStyle: 'sass' })
      ],
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
      resolvers: [
        // element-plus主题色配置相关--下面这句importStyle一定要写，不要写个空对象在这儿，否则就会不生效
        ElementPlusResolver({ importStyle: 'sass' })
      ],
      extensions: ['vue'], // 指定扩展名，默认是.vue
      dts: false // 配置文件生成位置,会在根目录生成./components.d.ts，里面可以看到自动导入的api
    })
  ]
}
