import { defineEventHandler, readBody } from 'h3'
import { roleList } from '../../../utils/system-data.mjs'
import {
  useResponseError,
  useResponseSuccess
} from '../../../utils/response.mjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const target = roleList.find((item) => item.id === body.id)
  if (!target) {
    return useResponseError('角色不存在')
  }

  Object.assign(target, body, {
    permissions: body.permissions || []
  })

  return useResponseSuccess(true)
})
