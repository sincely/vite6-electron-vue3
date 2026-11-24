/**
 * @module 文件上传路由
 * @description 仅需登录，无需菜单权限；分片请求高频且体积大，挂载在操作日志中间件之前，不记录操作日志
 */

import Router from '@koa/router'
import uploadController from './uploadController.js'
import authenticate from '../../middleware/authenticate.js'
import { validateBody, validateQuery } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import { UploadVerifyBodyDto, UploadChunkQueryDto, UploadMergeBodyDto, UploadCancelBodyDto } from './uploadDto.js'

const uploadRouter = new Router()

// 秒传 / 断点续传校验
uploadRouter.post(
  '/upload/verify',
  authenticate,
  validateBody(UploadVerifyBodyDto),
  errorControllerWrapper(uploadController.verify)
)

// 上传分片（请求体为二进制流，元信息走 query）
uploadRouter.post(
  '/upload/chunk',
  authenticate,
  validateQuery(UploadChunkQueryDto),
  errorControllerWrapper(uploadController.uploadChunk)
)

// 合并分片
uploadRouter.post(
  '/upload/merge',
  authenticate,
  validateBody(UploadMergeBodyDto),
  errorControllerWrapper(uploadController.merge)
)

// 取消上传并清理临时分片
uploadRouter.post(
  '/upload/cancel',
  authenticate,
  validateBody(UploadCancelBodyDto),
  errorControllerWrapper(uploadController.cancel)
)

export default uploadRouter
