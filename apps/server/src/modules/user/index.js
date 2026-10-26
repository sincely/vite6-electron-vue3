/**
 * 用户管理模块
 *
 * 职责：用户 CRUD、批量操作、状态管理、密码重置
 *
 * 本文件是该模块的公开 API（Public API）。
 * 跨模块协作只允许经由此处暴露的领域服务，
 * 禁止直接引用其他模块的 Dao / Controller / Router。
 *
 * 说明：路由由组合根 `core/router.js` 直接装配，不在本文件导出，
 * 以避免「模块 barrel → router → 中间件 → 模块 barrel」的循环依赖。
 */

// 领域服务（对外唯一入口）
export * as userService from './userService.js'
