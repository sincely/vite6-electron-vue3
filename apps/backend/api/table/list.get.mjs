import { eventHandler, getQuery } from 'h3'
import { allUsers, userStats } from '../../utils/table-data.mjs'
import { includesText } from '../../utils/system-data.mjs'
import { useResponseSuccess } from '../../utils/response.mjs'

export default eventHandler((event) => {
  const {
    pageNum = 1,
    pageSize = 10,
    name = '',
    department = '',
    status = ''
  } = getQuery(event)

  let filtered = [...allUsers]

  if (name) {
    filtered = filtered.filter(
      (u) => includesText(u.name, name) || includesText(u.email, name)
    )
  }
  if (department) {
    filtered = filtered.filter((u) => u.department === department)
  }
  if (status) {
    filtered = filtered.filter((u) => u.status === status)
  }

  const total = filtered.length
  const current = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  const start = (current - 1) * size
  const rows = filtered.slice(start, start + size)

  return useResponseSuccess({
    rows,
    total,
    // 统计信息
    stats: userStats()
  })
})
