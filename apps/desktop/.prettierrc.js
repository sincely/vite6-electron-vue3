import baseConfig from '@lightning/prettier-config'

// Prettier配置对象，用于定义代码格式化规则
const config = {
  ...baseConfig,
  tabWidth: 2,
  semi: false,
  printWidth: 120,
  singleQuote: true,
  bracketSpacing: true,
  htmlWhitespaceSensitivity: 'ignore',
  endOfLine: 'lf'
}

export default config
