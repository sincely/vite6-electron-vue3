/**
 * 菜单树构建
 *
 * 把 sys_menu 的扁平行转换成前端可用的树形结构。
 * 字段口径以 sys_menu 实际列为准：
 *   id / parent_id / menu_type('DIR'|'MENU'|'BUTTON') / menu_name / route_name
 *   path / component / redirect / sort / icon / visible / permission
 */

/**
 * 单行 → 树节点
 * 注意：此函数接收的是 DAO 查询出的数据库原始行（snake_case 字段）
 * @param {object} menu
 * @returns {object} 树节点
 */
const normalizeMenu = (menu) => {
  const menuType = String(menu.menu_type ?? '').toUpperCase()

  // 按钮节点：menu_type='BUTTON'，权限码存放在 sys_menu.permission
  if (menuType === 'BUTTON') {
    const permissionCode = menu.permission || ''

    return {
      id: menu.id,
      parentId: menu.parent_id ?? 0,
      name: permissionCode || menu.menu_name,
      meta: { title: menu.menu_name, isButton: true, permissionCode }
    }
  }

  // 目录 / 菜单节点
  const meta = {
    title: menu.menu_name,
    menuType,
    ...(menu.icon ? { icon: menu.icon } : {}),
    ...(menu.sort !== undefined && menu.sort !== null ? { order: Number(menu.sort) } : {}),
    // visible='1' 表示显示、'0' 表示隐藏；前端 hideInMenu 语义相反
    ...(menu.visible === '0' || menu.visible === 0 ? { hideInMenu: true } : {}),
    ...(menu.permission ? { permission: menu.permission } : {}),
    // 外链 / 内嵌页：link 为 URL；frame='1' 表示应用内 iframe 展示
    ...(menu.link ? { link: menu.link } : {}),
    ...(String(menu.frame) === '1' ? { iframe: true } : {}),
    // is_cache='1' 表示缓存组件（前端 keepAlive）
    ...(String(menu.is_cache) === '1' ? { keepAlive: true } : {})
  }

  return {
    id: menu.id,
    parentId: menu.parent_id ?? 0,
    path: menu.path ?? '',
    name: menu.route_name || menu.path || '',
    component: menu.component ?? '',
    redirect: menu.redirect ?? '',
    meta,
    children: []
  }
}

/**
 * 按 order、id 排序，保证同级顺序稳定
 * @param {Array<object>} nodes
 */
const sortSiblings = (nodes) => {
  nodes.sort((a, b) => {
    const orderA = a.meta?.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.meta?.order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) {
      return orderA - orderB
    }
    return Number(a.id) - Number(b.id)
  })
  return nodes
}

/**
 * 根据扁平菜单列表构建树形菜单。
 * @param {Array<object>} menuList
 * @returns {Array<object>} 根节点数组
 */
export const buildMenuTree = (menuList) => {
  const menuMap = new Map()
  const roots = []

  for (const menu of menuList) {
    menuMap.set(menu.id, normalizeMenu(menu))
  }

  for (const menu of menuMap.values()) {
    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId)
      // 目录可包含目录/菜单/按钮，菜单可包含按钮
      if (Array.isArray(parent.children)) {
        parent.children.push(menu)
        continue
      }
    }
    roots.push(menu)
  }

  sortSiblings(roots)
  for (const menu of menuMap.values()) {
    if (Array.isArray(menu.children) && menu.children.length > 0) {
      sortSiblings(menu.children)
    }
  }

  return roots
}

/**
 * 提取权限编码集合：
 * - routePaths: 允许访问的路径
 * - routeNames: 允许访问的路由名称
 * - buttons: 允许使用的按钮权限编码（sys_menu.permission，如 system:user:add）
 * @param {Array<{path?:string,route_name:string}>} menus
 * @param {Array<{button_code?:string,button_name?:string}>} buttons
 * @returns {{routePaths:string[], routeNames:string[], buttons:string[]}}
 */
export const extractPermissionCodes = (menus, buttons) => {
  return {
    routePaths: menus.map((menu) => menu.path).filter(Boolean),
    routeNames: menus.map((menu) => menu.route_name).filter(Boolean),
    buttons: buttons.map((button) => button.button_code || button.button_name).filter(Boolean)
  }
}
