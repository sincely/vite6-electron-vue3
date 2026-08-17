import { defineEventHandler, readBody } from 'h3'
import { roleList, userList } from '../../../utils/system-data.mjs'
import {
  useResponseError,
  useResponseSuccess
} from '../../../utils/response.mjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const target = userList.find((item) => item.id === body.id)
  if (!target) {
    return useResponseError('用户不存在')
  }

  const roleIds = Array.isArray(body.roleIds) ? body.roleIds : []
  const roleNamesOfUser = roleList
    .filter((role) => roleIds.includes(role.id))
    .map((role) => role.roleName)

  Object.assign(target, body, {
    roleIds,
    roleNames: roleNamesOfUser
  })

  return useResponseSuccess(true)
})
