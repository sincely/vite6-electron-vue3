import Router from '@koa/router'
import menuController from './menuController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import { MenuCreateBodyDto, MenuDeleteBodyDto, MenuListQueryDto, MenuUpdateBodyDto } from './menuDto.js'

const menuRouter = new Router()

const useMenuManagePermission = [authenticate, authorizeRoute('/manage/menu')]

// 获取菜单列表
menuRouter.get(
  '/systemManage/getMenuList',
  ...useMenuManagePermission,
  validateQuery(MenuListQueryDto),
  errorControllerWrapper(menuController.listMenus)
)

// 获取菜单列表 v2
menuRouter.get(
  '/systemManage/getMenuList/v2',
  ...useMenuManagePermission,
  validateQuery(MenuListQueryDto),
  errorControllerWrapper(menuController.listMenus)
)

// 获取全部页面
menuRouter.get(
  '/systemManage/getAllPages',
  ...useMenuManagePermission,
  errorControllerWrapper(menuController.getAllPages)
)

// 获取菜单树
menuRouter.get(
  '/systemManage/getMenuTree',
  ...useMenuManagePermission,
  errorControllerWrapper(menuController.getMenuTree)
)

// 新增菜单
menuRouter.post(
  '/systemManage/saveMenu',
  ...useMenuManagePermission,
  validateBody(MenuCreateBodyDto),
  errorControllerWrapper(menuController.createMenu)
)

// 更新菜单
menuRouter.post(
  '/systemManage/updateMenu',
  ...useMenuManagePermission,
  validateBody(MenuUpdateBodyDto),
  errorControllerWrapper(menuController.updateMenu)
)

// 删除菜单
menuRouter.post(
  '/systemManage/deleteMenu',
  ...useMenuManagePermission,
  validateBody(MenuDeleteBodyDto),
  errorControllerWrapper(menuController.deleteMenu)
)

// ===== 前端兼容路由（/system/menus/* → /systemManage/*）=====
// 获取菜单列表（前端别名）
menuRouter.get(
  '/system/menus/list',
  ...useMenuManagePermission,
  validateQuery(MenuListQueryDto),
  errorControllerWrapper(menuController.listMenus)
)
// 获取菜单树（前端别名）
menuRouter.get('/system/menus/tree', ...useMenuManagePermission, errorControllerWrapper(menuController.getMenuTree))
// 新增菜单（前端别名）
menuRouter.post(
  '/system/menus/create',
  ...useMenuManagePermission,
  validateBody(MenuCreateBodyDto),
  errorControllerWrapper(menuController.createMenu)
)
// 更新菜单（前端别名，前端用 PUT；同时保留 POST 兼容）
const updateMenuAliasHandlers = [
  ...useMenuManagePermission,
  validateBody(MenuUpdateBodyDto),
  errorControllerWrapper(menuController.updateMenu)
]
menuRouter.put('/system/menus/update', ...updateMenuAliasHandlers)
menuRouter.post('/system/menus/update', ...updateMenuAliasHandlers)
// 删除菜单（前端别名）
menuRouter.post(
  '/system/menus/delete',
  ...useMenuManagePermission,
  validateBody(MenuDeleteBodyDto),
  errorControllerWrapper(menuController.deleteMenu)
)

export default menuRouter
