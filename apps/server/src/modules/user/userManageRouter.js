import Router from '@koa/router'
import UserManageController from './userManageController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validationMiddleware.js'
import { errorControllerWrapper } from '../../utils/errorHandler.js'
import {
  UserCreateBodySchema,
  UserDeleteBodySchema,
  UserListQuerySchema,
  UserUpdateBodySchema,
  UserBatchDeleteBodySchema,
  UserStatusUpdateBodySchema,
  UserPasswordResetBodySchema
} from '../../schemas/user/userSchema.js'

const userManageRouter = new Router()

const useAccountManagePermission = [authenticate, authorizeRoute('/manage/user')]

// 获取用户列表
userManageRouter.get(
  '/systemManage/getUserList',
  ...useAccountManagePermission,
  validateQuery(UserListQuerySchema),
  errorControllerWrapper(UserManageController.listUsers)
)

// 新增用户
userManageRouter.post(
  '/systemManage/saveUser',
  ...useAccountManagePermission,
  validateBody(UserCreateBodySchema),
  errorControllerWrapper(UserManageController.createUser)
)

// 更新用户
userManageRouter.post(
  '/systemManage/updateUser',
  ...useAccountManagePermission,
  validateBody(UserUpdateBodySchema),
  errorControllerWrapper(UserManageController.updateUser)
)

// 删除用户
userManageRouter.post(
  '/systemManage/deleteUser',
  ...useAccountManagePermission,
  validateBody(UserDeleteBodySchema),
  errorControllerWrapper(UserManageController.deleteUser)
)

// 批量删除用户
userManageRouter.post(
  '/systemManage/batchDeleteUser',
  ...useAccountManagePermission,
  validateBody(UserBatchDeleteBodySchema),
  errorControllerWrapper(UserManageController.batchDeleteUsers)
)

// 更新用户状态
userManageRouter.post(
  '/systemManage/updateUserStatus',
  ...useAccountManagePermission,
  validateBody(UserStatusUpdateBodySchema),
  errorControllerWrapper(UserManageController.updateUserStatus)
)

// 重置用户密码
userManageRouter.post(
  '/systemManage/resetUserPassword',
  ...useAccountManagePermission,
  validateBody(UserPasswordResetBodySchema),
  errorControllerWrapper(UserManageController.resetUserPassword)
)

// ===== 前端兼容路由（/system/users/* → /systemManage/*）=====
// 获取用户列表（前端别名）
userManageRouter.get(
  '/system/users/list',
  ...useAccountManagePermission,
  validateQuery(UserListQuerySchema),
  errorControllerWrapper(UserManageController.listUsers)
)
// 新增用户（前端别名）
userManageRouter.post(
  '/system/users/create',
  ...useAccountManagePermission,
  validateBody(UserCreateBodySchema),
  errorControllerWrapper(UserManageController.createUser)
)
// 更新用户（前端别名，前端用 PUT；同时保留 POST 兼容）
const updateUserAliasHandlers = [
  ...useAccountManagePermission,
  validateBody(UserUpdateBodySchema),
  errorControllerWrapper(UserManageController.updateUser)
]
userManageRouter.put('/system/users/update', ...updateUserAliasHandlers)
userManageRouter.post('/system/users/update', ...updateUserAliasHandlers)
// 删除用户（前端别名）
userManageRouter.post(
  '/system/users/delete',
  ...useAccountManagePermission,
  validateBody(UserDeleteBodySchema),
  errorControllerWrapper(UserManageController.deleteUser)
)
// 批量删除用户（前端别名）
userManageRouter.post(
  '/system/users/batchDelete',
  ...useAccountManagePermission,
  validateBody(UserBatchDeleteBodySchema),
  errorControllerWrapper(UserManageController.batchDeleteUsers)
)
// 更新用户状态（前端别名）
userManageRouter.post(
  '/system/users/updateStatus',
  ...useAccountManagePermission,
  validateBody(UserStatusUpdateBodySchema),
  errorControllerWrapper(UserManageController.updateUserStatus)
)
// 重置用户密码（前端别名）
userManageRouter.post(
  '/system/users/resetPassword',
  ...useAccountManagePermission,
  validateBody(UserPasswordResetBodySchema),
  errorControllerWrapper(UserManageController.resetUserPassword)
)

export default userManageRouter
