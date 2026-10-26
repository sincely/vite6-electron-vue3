/**
 * @module 认证路由
 * @description 只负责「中间件链 → 控制器」的装配，不含任何业务逻辑
 */

import Router from '@koa/router'
import { validateBody } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import { loginBodyDto, RefreshTokenBodyDto } from './authDto.js'
import authenticate from '../../middleware/authenticate.js'
import authController from './authController.js'

const authRouter = new Router()

// 前端兼容接口 - 登录
authRouter.post('/user/auth/login', validateBody(loginBodyDto), errorControllerWrapper(authController.frontendLogin))
// 别名路由 - 对齐前端 axios 调用约定（POST /auth/login，由 core/router.js 的 /api 前缀展开为 /api/auth/login）
authRouter.post('/auth/login', validateBody(loginBodyDto), errorControllerWrapper(authController.frontendLogin))

// 前端兼容接口 - 获取用户信息
authRouter.get('/user/getUserInfo', authenticate, errorControllerWrapper(authController.frontendGetUserInfo))
// 别名路由 - 对齐前端 axios 调用约定（GET /user/info）
authRouter.get('/user/info', authenticate, errorControllerWrapper(authController.frontendGetUserInfo))

// 前端兼容接口 - 刷新 token
authRouter.post(
  '/user/auth/refreshToken',
  validateBody(RefreshTokenBodyDto),
  errorControllerWrapper(authController.frontendRefreshToken)
)

// 登出（清除用户 sessionId 和 currentRefreshToken）
authRouter.post('/user/auth/logout', authenticate, errorControllerWrapper(authController.frontendLogout))
// 别名路由 - 对齐前端 axios 调用约定（POST /auth/logout）
authRouter.post('/auth/logout', authenticate, errorControllerWrapper(authController.frontendLogout))

// 前端兼容接口 - 自定义后端错误（调试用）
authRouter.get('/user/auth/error', errorControllerWrapper(authController.customError))

export default authRouter
