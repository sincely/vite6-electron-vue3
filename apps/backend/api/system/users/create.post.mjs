import { defineEventHandler, readBody } from 'h3'
import {
  createNextId,
  roleList,
  userList
} from '../../../utils/system-data.mjs'
import { useResponseSuccess } from '../../../utils/response.mjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = createNextId(userList)
  const roleIds = Array.isArray(body.roleIds) ? body.roleIds : []
  const roleNamesOfUser = roleList
    .filter((role) => roleIds.includes(role.id))
    .map((role) => role.roleName)

  userList.unshift({
    id,
    username: body.username,
    nickname: body.nickname,
    gender: body.gender,
    mobile: body.mobile,
    email: body.email,
    status: body.status,
    roleIds,
    roleNames: roleNamesOfUser,
    remark: body.remark || '',
    createTime: '2026-04-16 10:00:00'
  })

  return useResponseSuccess({ id })
})
