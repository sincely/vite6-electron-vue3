// 仓库根目录 ESLint 入口：直接在根目录执行 eslint（含 husky/lint-staged）时生效。
// ESLint 9 的 flat config 不会按目录下钻查找配置，根目录检查 apps/desktop 的文件时
// 只会读取本文件，因而拿不到包内的 auto-import / Element Plus 全局声明；
// 这里复用桌面端配置（其 files 已同时声明 **/ 前缀形式），使根目录与包内检查一致。
// 各 package 自己的 lint 脚本仍以各自的 eslint.config.js 为准。
export { default } from './apps/desktop/eslint.config.js'
