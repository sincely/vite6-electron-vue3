import { eventHandler, getQuery } from 'h3'
import {
  includesText,
  paginate,
  roleList
} from '../../../utils/system-data.mjs'
import { useResponseSuccess } from '../../../utils/response.mjs'

export default eventHandler((event) => {
  const {
    pageNum = 1,
    pageSize = 10,
    roleName = '',
    roleCode = '',
    status = ''
  } = getQuery(event)

  const filtered = roleList.filter((item) => {
    return (
      includesText(item.roleName, roleName) &&
      includesText(item.roleCode, roleCode) &&
      (!status || item.status === status)
    )
  })

  return useResponseSuccess(paginate(filtered, pageNum, pageSize))
})
