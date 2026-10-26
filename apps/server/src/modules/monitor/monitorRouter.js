import Router from '@koa/router'
import monitorController from './monitorController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateQuery, validateBody } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import { OnlineUserListQueryDto, ForceLogoutBodyDto } from './monitorDto.js'

const monitorRouter = new Router()

const useOverviewPermission = [authenticate, authorizeRoute('/monitor/overview')]
const useOnlinePermission = [authenticate, authorizeRoute('/monitor/online')]

// 监控总览
monitorRouter.get('/monitor/overview', ...useOverviewPermission, errorControllerWrapper(monitorController.getOverview))

// 在线用户列表
monitorRouter.get(
  '/monitor/online/list',
  ...useOnlinePermission,
  validateQuery(OnlineUserListQueryDto),
  errorControllerWrapper(monitorController.listOnlineUsers)
)

// 强制下线（会话粒度）
monitorRouter.post(
  '/monitor/online/force-logout',
  ...useOnlinePermission,
  validateBody(ForceLogoutBodyDto),
  errorControllerWrapper(monitorController.forceLogout)
)

export default monitorRouter
