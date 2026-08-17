// apps/* 共享 lint-staged 配置
// 由 .husky/pre-commit 通过 `pnpm -F <name> run lint-staged` 触发,
// 工作目录在对应的 app 目录中,使用该 app 自身的 node_modules。
export default {
  '*.{js,vue}': ['prettier --write'],
  '*.{html,css,scss}': ['prettier --write'],
  'package.json': ['prettier --write']
}
