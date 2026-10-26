/**
 * 后台管理路由组
 *
 * 聚合「系统管理控制台」相关的模块路由：角色 / 用户 / 菜单 / 字典 / 公告。
 * 这些模块共享 `/systemManage/*` 与 `/system/*` 两套路径前缀，
 * 集中成组便于统一挂载与后续按组施加中间件。
 */
import Router from '@koa/router'
import roleRouter from '../../modules/role/roleRouter.js'
import userRouter from '../../modules/user/userRouter.js'
import menuRouter from '../../modules/menu/menuRouter.js'
import dictRouter from '../../modules/dict/dictRouter.js'
import { notificationManageRouter } from '../../modules/notification/notificationRouter.js'

const systemManageRouter = new Router()

systemManageRouter.use(roleRouter.routes(), roleRouter.allowedMethods())
systemManageRouter.use(userRouter.routes(), userRouter.allowedMethods())
systemManageRouter.use(menuRouter.routes(), menuRouter.allowedMethods())
systemManageRouter.use(dictRouter.routes(), dictRouter.allowedMethods())
systemManageRouter.use(notificationManageRouter.routes(), notificationManageRouter.allowedMethods())

export default systemManageRouter
