/**
 * @module 角色管理路由
 * @description 只负责「中间件链 → 控制器」的装配，不含任何业务逻辑
 */

import Router from '@koa/router'
import roleController from './roleController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import {
  RoleCreateBodyDto,
  RoleDeleteBodyDto,
  RoleListQueryDto,
  RoleRouteIdsBodyDto,
  RoleRouteIdsQueryDto,
  RoleUpdateBodyDto
} from './roleDto.js'

const roleRouter = new Router()

const useRoleManagePermission = [authenticate, authorizeRoute('/manage/role')]
const useRoleOptionsPermission = [authenticate, authorizeRoute(['/manage/user', '/manage/menu', '/manage/role'])]

// 获取角色列表
roleRouter.get(
  '/systemManage/getRoleList',
  ...useRoleManagePermission,
  validateQuery(RoleListQueryDto),
  errorControllerWrapper(roleController.listRoles)
)

// 获取全部角色
roleRouter.get(
  '/systemManage/getAllRoles',
  ...useRoleOptionsPermission,
  errorControllerWrapper(roleController.getAllRoles)
)

// 获取角色菜单 ID
roleRouter.get(
  '/systemManage/getRoleRouteIds',
  ...useRoleManagePermission,
  validateQuery(RoleRouteIdsQueryDto),
  errorControllerWrapper(roleController.getRoleRouteIds)
)

// 更新角色菜单 ID
roleRouter.post(
  '/systemManage/updateRoleRouteIds',
  ...useRoleManagePermission,
  validateBody(RoleRouteIdsBodyDto),
  errorControllerWrapper(roleController.updateRoleRouteIds)
)

// 新增角色
roleRouter.post(
  '/systemManage/saveRole',
  ...useRoleManagePermission,
  validateBody(RoleCreateBodyDto),
  errorControllerWrapper(roleController.createRole)
)

// 更新角色
roleRouter.post(
  '/systemManage/updateRole',
  ...useRoleManagePermission,
  validateBody(RoleUpdateBodyDto),
  errorControllerWrapper(roleController.updateRole)
)

// 删除角色
roleRouter.post(
  '/systemManage/deleteRole',
  ...useRoleManagePermission,
  validateBody(RoleDeleteBodyDto),
  errorControllerWrapper(roleController.deleteRole)
)

// ===== 前端兼容路由（/system/roles/* → /systemManage/*）=====
// 获取角色列表（前端别名）
roleRouter.get(
  '/system/roles/list',
  ...useRoleManagePermission,
  validateQuery(RoleListQueryDto),
  errorControllerWrapper(roleController.listRoles)
)
// 获取全部角色（前端别名）
roleRouter.get('/system/roles/all', ...useRoleOptionsPermission, errorControllerWrapper(roleController.getAllRoles))
// 获取角色菜单 ID（前端别名）
roleRouter.get(
  '/system/roles/menuIds',
  ...useRoleManagePermission,
  validateQuery(RoleRouteIdsQueryDto),
  errorControllerWrapper(roleController.getRoleRouteIds)
)
// 更新角色菜单 ID（前端别名）
roleRouter.post(
  '/system/roles/menuIds',
  ...useRoleManagePermission,
  validateBody(RoleRouteIdsBodyDto),
  errorControllerWrapper(roleController.updateRoleRouteIds)
)
// 新增角色（前端别名）
roleRouter.post(
  '/system/roles/create',
  ...useRoleManagePermission,
  validateBody(RoleCreateBodyDto),
  errorControllerWrapper(roleController.createRole)
)
// 更新角色（前端别名，前端用 PUT；同时保留 POST 兼容）
const updateRoleAliasHandlers = [
  ...useRoleManagePermission,
  validateBody(RoleUpdateBodyDto),
  errorControllerWrapper(roleController.updateRole)
]
roleRouter.put('/system/roles/update', ...updateRoleAliasHandlers)
roleRouter.post('/system/roles/update', ...updateRoleAliasHandlers)
// 删除角色（前端别名）
roleRouter.post(
  '/system/roles/delete',
  ...useRoleManagePermission,
  validateBody(RoleDeleteBodyDto),
  errorControllerWrapper(roleController.deleteRole)
)

export default roleRouter
