// Lightning 共享 Prettier 配置
// 与项目根 .prettierrc.js 保持一致;由 app 通过 package.json 引用。
export default {
  // 末尾需要有逗号
  trailingComma: 'none',
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 行尾不需要有分号
  semi: false,
  // 一行最多 80 字符
  printWidth: 80,
  // 使用单引号
  singleQuote: true,
  // 大括号内的首尾需要空格
  bracketSpacing: true,
  // 箭头函数,只有一个参数的时候,也需要括号
  arrowParens: 'always',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'ignore',
  // 换行符使用 lf
  endOfLine: 'lf'
}