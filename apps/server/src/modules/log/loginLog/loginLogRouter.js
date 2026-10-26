import Router from '@koa/router'
import LoginLogController from './loginLogController.js'
import authenticate from '../../../middleware/authenticate.js'
import authorizeRoute from '../../../middleware/authorize.js'
import { validateQuery, validateBody } from '../../../middleware/validation.js'
import { errorControllerWrapper } from '../../../core/errors.js'
import { LoginLogListQueryDto, LogBatchDeleteBodyDto } from '../sharedDto.js'

const loginLogRouter = new Router()

const usePermission = [authenticate, authorizeRoute('/log')]

// 获取登录日志列表
loginLogRouter.get(
  '/log/getLoginLogList',
  ...usePermission,
  validateQuery(LoginLogListQueryDto),
  errorControllerWrapper(LoginLogController.listLoginLogs)
)

// 获取登录日志详情
loginLogRouter.get(
  '/log/getLoginLogDetail',
  ...usePermission,
  errorControllerWrapper(LoginLogController.getLoginLogDetail)
)

// 批量删除登录日志
loginLogRouter.post(
  '/log/batchDeleteLoginLog',
  ...usePermission,
  validateBody(LogBatchDeleteBodyDto),
  errorControllerWrapper(LoginLogController.batchDeleteLoginLogs)
)

// 清空登录日志
loginLogRouter.post('/log/clearLoginLogs', ...usePermission, errorControllerWrapper(LoginLogController.clearLoginLogs))

export default loginLogRouter
