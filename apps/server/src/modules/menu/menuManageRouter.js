import Router from '@koa/router'
import MenuManageController from './menuManageController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validationMiddleware.js'
import { errorControllerWrapper } from '../../utils/errorHandler.js'
import {
  MenuCreateBodySchema,
  MenuDeleteBodySchema,
  MenuListQuerySchema,
  MenuUpdateBodySchema
} from '../../schemas/menu/menuSchema.js'

const menuManageRouter = new Router()

const useMenuManagePermission = [authenticate, authorizeRoute('/manage/menu')]

// 获取菜单列表
menuManageRouter.get(
  '/systemManage/getMenuList',
  ...useMenuManagePermission,
  validateQuery(MenuListQuerySchema),
  errorControllerWrapper(MenuManageController.listMenus)
)

// 获取菜单列表 v2
menuManageRouter.get(
  '/systemManage/getMenuList/v2',
  ...useMenuManagePermission,
  validateQuery(MenuListQuerySchema),
  errorControllerWrapper(MenuManageController.listMenus)
)

// 获取全部页面
menuManageRouter.get(
  '/systemManage/getAllPages',
  ...useMenuManagePermission,
  errorControllerWrapper(MenuManageController.getAllPages)
)

// 获取菜单树
menuManageRouter.get(
  '/systemManage/getMenuTree',
  ...useMenuManagePermission,
  errorControllerWrapper(MenuManageController.getMenuTree)
)

// 新增菜单
menuManageRouter.post(
  '/systemManage/saveMenu',
  ...useMenuManagePermission,
  validateBody(MenuCreateBodySchema),
  errorControllerWrapper(MenuManageController.createMenu)
)

// 更新菜单
menuManageRouter.post(
  '/systemManage/updateMenu',
  ...useMenuManagePermission,
  validateBody(MenuUpdateBodySchema),
  errorControllerWrapper(MenuManageController.updateMenu)
)

// 删除菜单
menuManageRouter.post(
  '/systemManage/deleteMenu',
  ...useMenuManagePermission,
  validateBody(MenuDeleteBodySchema),
  errorControllerWrapper(MenuManageController.deleteMenu)
)

// ===== 前端兼容路由（/system/menus/* → /systemManage/*）=====
// 获取菜单列表（前端别名）
menuManageRouter.get(
  '/system/menus/list',
  ...useMenuManagePermission,
  validateQuery(MenuListQuerySchema),
  errorControllerWrapper(MenuManageController.listMenus)
)
// 获取菜单树（前端别名）
menuManageRouter.get(
  '/system/menus/tree',
  ...useMenuManagePermission,
  errorControllerWrapper(MenuManageController.getMenuTree)
)
// 新增菜单（前端别名）
menuManageRouter.post(
  '/system/menus/create',
  ...useMenuManagePermission,
  validateBody(MenuCreateBodySchema),
  errorControllerWrapper(MenuManageController.createMenu)
)
// 更新菜单（前端别名，前端用 PUT；同时保留 POST 兼容）
const updateMenuAliasHandlers = [
  ...useMenuManagePermission,
  validateBody(MenuUpdateBodySchema),
  errorControllerWrapper(MenuManageController.updateMenu)
]
menuManageRouter.put('/system/menus/update', ...updateMenuAliasHandlers)
menuManageRouter.post('/system/menus/update', ...updateMenuAliasHandlers)
// 删除菜单（前端别名）
menuManageRouter.post(
  '/system/menus/delete',
  ...useMenuManagePermission,
  validateBody(MenuDeleteBodySchema),
  errorControllerWrapper(MenuManageController.deleteMenu)
)

export default menuManageRouter
