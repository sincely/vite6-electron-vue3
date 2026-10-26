/**
 * @module 路由管理路由
 * @description 只负责「中间件链 → 控制器」的装配，不含任何业务逻辑
 */

import Router from '@koa/router'
import authenticate from '../../middleware/authenticate.js'
import { validateQuery } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import { RouteExistQueryDto } from './routeDto.js'
import routeController from './routeController.js'

const routeRouter = new Router()

// 获取常量路由
routeRouter.get('/route/getConstantRoutes', errorControllerWrapper(routeController.getConstantRoutes))

// 获取用户路由
routeRouter.get('/route/getUserRoutes', authenticate, errorControllerWrapper(routeController.getUserRoutes))

// 判断路由是否存在
routeRouter.get(
  '/route/isRouteExist',
  authenticate,
  validateQuery(RouteExistQueryDto),
  errorControllerWrapper(routeController.isRouteExist)
)

export default routeRouter
