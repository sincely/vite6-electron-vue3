import Router from '@koa/router'
import roleManageRouter from '../../modules/role/roleManageRouter.js'
import userManageRouter from '../../modules/user/userManageRouter.js'
import menuManageRouter from '../../modules/menu/menuManageRouter.js'
import dictManageRouter from '../../modules/dict/dictRouter.js'
import notificationManageRouter from '../../modules/notification/notificationRouter.js'

const systemManageRouter = new Router()

// 原始路由（保留 /systemManage/* 旧路径）
systemManageRouter.use(roleManageRouter.routes(), roleManageRouter.allowedMethods())
systemManageRouter.use(userManageRouter.routes(), userManageRouter.allowedMethods())
systemManageRouter.use(menuManageRouter.routes(), menuManageRouter.allowedMethods())
systemManageRouter.use(dictManageRouter.routes(), dictManageRouter.allowedMethods())
systemManageRouter.use(notificationManageRouter.routes(), notificationManageRouter.allowedMethods())

export default systemManageRouter
