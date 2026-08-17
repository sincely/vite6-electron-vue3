// 根目录 Stylelint 配置
// 各 app 需自行加载此共享配置或指定自定义 glob。
import sharedConfig from '@lightning/stylelint-config'

export default {
  ...sharedConfig,
  // 根目录不直接包含源代码样式文件;扫描所有 app 的 src 目录
  overrides: [
    ...(sharedConfig.overrides || []),
    {
      files: ['apps/**/src/**/*.{vue,scss,css}'],
      customSyntax: 'postcss-html'
    }
  ]
}