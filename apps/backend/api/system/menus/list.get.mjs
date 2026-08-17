import { eventHandler, getQuery } from 'h3'
import {
  clone,
  flattenMenus,
  includesText,
  menuTree
} from '../../../utils/system-data.mjs'
import { useResponseSuccess } from '../../../utils/response.mjs'

export default eventHandler((event) => {
  const { menuName = '', status = '', menuType = '' } = getQuery(event)
  const source = clone(menuTree)

  const filterTree = (list) => {
    return list
      .map((item) => {
        const children = item.children ? filterTree(item.children) : []
        const matchedSelf =
          includesText(item.menuName, menuName) &&
          (!status || item.status === status) &&
          (!menuType || item.menuType === menuType)
        if (matchedSelf || children.length) {
          return {
            ...item,
            children
          }
        }
        return null
      })
      .filter(Boolean)
  }

  const rows = filterTree(source)
  return useResponseSuccess({
    rows,
    total: flattenMenus(rows).length
  })
})
