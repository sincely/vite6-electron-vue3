import { defineEventHandler, readBody } from 'h3'
import {
  roleList,
  setRoleList,
  setUserList,
  userList
} from '../../../utils/system-data.mjs'
import { useResponseSuccess } from '../../../utils/response.mjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = Array.isArray(body.ids) ? body.ids : []

  const nextRoleList = roleList.filter((item) => !ids.includes(item.id))

  // 级联清理用户身上被删除的角色
  const nextUserList = userList.map((user) => {
    const nextRoleIds = user.roleIds.filter((roleId) => !ids.includes(roleId))
    return {
      ...user,
      roleIds: nextRoleIds,
      roleNames: nextRoleList
        .filter((role) => nextRoleIds.includes(role.id))
        .map((role) => role.roleName)
    }
  })

  setRoleList(nextRoleList)
  setUserList(nextUserList)

  return useResponseSuccess(true)
})
