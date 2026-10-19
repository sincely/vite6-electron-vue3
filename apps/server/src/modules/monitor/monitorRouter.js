import Router from '@koa/router'
import MonitorController from './monitorController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateQuery, validateBody } from '../../middleware/validationMiddleware.js'
import { errorControllerWrapper } from '../../utils/errorHandler.js'
import { OnlineUserListQuerySchema, ForceLogoutBodySchema } from '../../schemas/monitor/monitorSchema.js'

const monitorRouter = new Router()

const useOverviewPermission = [authenticate, authorizeRoute('/monitor/overview')]
const useOnlinePermission = [authenticate, authorizeRoute('/monitor/online')]

// 监控总览
monitorRouter.get('/monitor/overview', ...useOverviewPermission, errorControllerWrapper(MonitorController.getOverview))

// 在线用户列表
monitorRouter.get(
  '/monitor/online/list',
  ...useOnlinePermission,
  validateQuery(OnlineUserListQuerySchema),
  errorControllerWrapper(MonitorController.listOnlineUsers)
)

// 强制下线（会话粒度）
monitorRouter.post(
  '/monitor/online/force-logout',
  ...useOnlinePermission,
  validateBody(ForceLogoutBodySchema),
  errorControllerWrapper(MonitorController.forceLogout)
)

export default monitorRouter
