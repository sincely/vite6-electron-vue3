import Router from '@koa/router'
import userController from './userController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import {
  UserCreateBodyDto,
  UserDeleteBodyDto,
  UserListQueryDto,
  UserUpdateBodyDto,
  UserBatchDeleteBodyDto,
  UserStatusUpdateBodyDto,
  UserPasswordResetBodyDto
} from './userDto.js'

const userRouter = new Router()

const useAccountManagePermission = [authenticate, authorizeRoute('/manage/user')]

// 获取用户列表
userRouter.get(
  '/systemManage/getUserList',
  ...useAccountManagePermission,
  validateQuery(UserListQueryDto),
  errorControllerWrapper(userController.listUsers)
)

// 新增用户
userRouter.post(
  '/systemManage/saveUser',
  ...useAccountManagePermission,
  validateBody(UserCreateBodyDto),
  errorControllerWrapper(userController.createUser)
)

// 更新用户
userRouter.post(
  '/systemManage/updateUser',
  ...useAccountManagePermission,
  validateBody(UserUpdateBodyDto),
  errorControllerWrapper(userController.updateUser)
)

// 删除用户
userRouter.post(
  '/systemManage/deleteUser',
  ...useAccountManagePermission,
  validateBody(UserDeleteBodyDto),
  errorControllerWrapper(userController.deleteUser)
)

// 批量删除用户
userRouter.post(
  '/systemManage/batchDeleteUser',
  ...useAccountManagePermission,
  validateBody(UserBatchDeleteBodyDto),
  errorControllerWrapper(userController.batchDeleteUsers)
)

// 更新用户状态
userRouter.post(
  '/systemManage/updateUserStatus',
  ...useAccountManagePermission,
  validateBody(UserStatusUpdateBodyDto),
  errorControllerWrapper(userController.updateUserStatus)
)

// 重置用户密码
userRouter.post(
  '/systemManage/resetUserPassword',
  ...useAccountManagePermission,
  validateBody(UserPasswordResetBodyDto),
  errorControllerWrapper(userController.resetUserPassword)
)

// ===== 前端兼容路由（/system/users/* → /systemManage/*）=====
// 获取用户列表（前端别名）
userRouter.get(
  '/system/users/list',
  ...useAccountManagePermission,
  validateQuery(UserListQueryDto),
  errorControllerWrapper(userController.listUsers)
)
// 新增用户（前端别名）
userRouter.post(
  '/system/users/create',
  ...useAccountManagePermission,
  validateBody(UserCreateBodyDto),
  errorControllerWrapper(userController.createUser)
)
// 更新用户（前端别名，前端用 PUT；同时保留 POST 兼容）
const updateUserAliasHandlers = [
  ...useAccountManagePermission,
  validateBody(UserUpdateBodyDto),
  errorControllerWrapper(userController.updateUser)
]
userRouter.put('/system/users/update', ...updateUserAliasHandlers)
userRouter.post('/system/users/update', ...updateUserAliasHandlers)
// 删除用户（前端别名）
userRouter.post(
  '/system/users/delete',
  ...useAccountManagePermission,
  validateBody(UserDeleteBodyDto),
  errorControllerWrapper(userController.deleteUser)
)
// 批量删除用户（前端别名）
userRouter.post(
  '/system/users/batchDelete',
  ...useAccountManagePermission,
  validateBody(UserBatchDeleteBodyDto),
  errorControllerWrapper(userController.batchDeleteUsers)
)
// 更新用户状态（前端别名）
userRouter.post(
  '/system/users/updateStatus',
  ...useAccountManagePermission,
  validateBody(UserStatusUpdateBodyDto),
  errorControllerWrapper(userController.updateUserStatus)
)
// 重置用户密码（前端别名）
userRouter.post(
  '/system/users/resetPassword',
  ...useAccountManagePermission,
  validateBody(UserPasswordResetBodyDto),
  errorControllerWrapper(userController.resetUserPassword)
)

export default userRouter
