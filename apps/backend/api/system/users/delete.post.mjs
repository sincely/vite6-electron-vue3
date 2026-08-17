import { defineEventHandler, readBody } from 'h3'
import { setUserList, userList } from '../../../utils/system-data.mjs'
import { useResponseSuccess } from '../../../utils/response.mjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = Array.isArray(body.ids) ? body.ids : []

  setUserList(userList.filter((item) => !ids.includes(item.id)))

  return useResponseSuccess(true)
})
