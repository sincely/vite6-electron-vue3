import Router from '@koa/router'
import dictController from './dictController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import { DictCreateBodyDto, DictDeleteBodyDto, DictListQueryDto, DictUpdateBodyDto } from './dictDto.js'

const dictRouter = new Router()

const useDictManagePermission = [authenticate, authorizeRoute('/manage/dict')]

// 获取字典列表
dictRouter.get(
  '/systemManage/getDictList',
  ...useDictManagePermission,
  validateQuery(DictListQueryDto),
  errorControllerWrapper(dictController.listDicts)
)

// 新增字典
dictRouter.post(
  '/systemManage/saveDict',
  ...useDictManagePermission,
  validateBody(DictCreateBodyDto),
  errorControllerWrapper(dictController.createDict)
)

// 更新字典
dictRouter.post(
  '/systemManage/updateDict',
  ...useDictManagePermission,
  validateBody(DictUpdateBodyDto),
  errorControllerWrapper(dictController.updateDict)
)

// 删除字典
dictRouter.post(
  '/systemManage/deleteDict',
  ...useDictManagePermission,
  validateBody(DictDeleteBodyDto),
  errorControllerWrapper(dictController.deleteDict)
)

export default dictRouter
