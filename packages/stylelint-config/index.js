// Lightning 共享 Stylelint 配置
// 与原根 stylelint.config.js 内容保持一致;调用方可通过 stylelint 自定义 glob 覆盖。

export default {
  root: true,
  defaultSeverity: 'error',
  plugins: ['stylelint-order', 'stylelint-scss'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-html/html',
    'stylelint-config-html/vue',
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order'
  ],
  rules: {
    'max-nesting-depth': 3,
    'no-descending-specificity': null,
    'no-empty-source': null,
    'font-family-no-missing-generic-family-keyword': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'function',
          'if',
          'each',
          'include',
          'mixin',
          'use',
          'forward'
        ]
      }
    ],
    'function-no-unknown': null,
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    'declaration-property-value-no-unknown': null,
    'selector-no-vendor-prefix': null,
    'keyframes-name-pattern': null,
    'selector-class-pattern': null,
    'value-no-vendor-prefix': null,
    'rule-empty-line-before': [
      'always',
      { ignore: ['after-comment', 'first-nested'] }
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global', 'v-deep', 'deep'] }
    ]
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  overrides: [
    {
      files: ['**/*.(css|html|vue)'],
      customSyntax: 'postcss-html',
      rules: {
        'selector-pseudo-class-no-unknown': [
          true,
          { ignorePseudoClasses: ['deep', 'global'] }
        ],
        'selector-pseudo-element-no-unknown': [
          true,
          { ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'] }
        ]
      }
    },
    {
      files: ['*.scss', '**/*.scss'],
      customSyntax: 'postcss-scss',
      extends: ['stylelint-config-standard-scss'],
      rules: {
        'scss/dollar-variable-pattern': null
      }
    }
  ]
}