import Router from '@koa/router'
import OperationLogController from './operationLogController.js'
import authenticate from '../../../middleware/authenticate.js'
import authorizeRoute from '../../../middleware/authorize.js'
import { validateQuery, validateBody } from '../../../middleware/validation.js'
import { errorControllerWrapper } from '../../../core/errors.js'
import { OperationLogListQueryDto, LogBatchDeleteBodyDto, LogSingleDeleteBodyDto } from '../sharedDto.js'

const operationLogRouter = new Router()

const usePermission = [authenticate, authorizeRoute('/log')]

// 获取操作日志列表
operationLogRouter.get(
  '/log/getOperationLogList',
  ...usePermission,
  validateQuery(OperationLogListQueryDto),
  errorControllerWrapper(OperationLogController.listOperationLogs)
)

// 获取操作日志详情
operationLogRouter.get(
  '/log/getOperationLogDetail',
  ...usePermission,
  errorControllerWrapper(OperationLogController.getOperationLogDetail)
)

// 批量删除操作日志
operationLogRouter.post(
  '/log/batchDeleteOperationLog',
  ...usePermission,
  validateBody(LogBatchDeleteBodyDto),
  errorControllerWrapper(OperationLogController.batchDeleteOperationLogs)
)

// 清空操作日志
operationLogRouter.post(
  '/log/clearOperationLogs',
  ...usePermission,
  errorControllerWrapper(OperationLogController.clearOperationLogs)
)

// 删除单条操作日志
operationLogRouter.post(
  '/log/deleteOperationLog',
  ...usePermission,
  validateBody(LogSingleDeleteBodyDto),
  errorControllerWrapper(OperationLogController.deleteOperationLog)
)

export default operationLogRouter
