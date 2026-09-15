/**
 * @module 菜单管理 Service
 * @description 封装菜单 CRUD、树结构构建、按钮管理等业务逻辑（适配新 RouteAuth schema）
 */

import adminMenuDao from './menuDao.js'
import { buildMenuTree } from '../../utils/adminPermission.js'
import { businessCode } from '../../config/businessCode.js'
import { normalizePagination } from '../../schemas/common/paginationSchema.js'

const toDbStatus = (status) => {
  if (status === '0' || status === '2' || Number(status) === 0) {
    return '0'
  }
  return '1'
}

const toFrontendStatus = (status) => {
  return String(status) === '1' ? '1' : '0'
}

const truthyVisible = (value) => {
  // 新 schema: visible='1' 表示显示；旧 hideInMenu=true 表示隐藏，逻辑相反
  if (value === '0' || value === 0 || value === false) {
    return false
  }
  return true
}

const visibleFromBody = (body) => {
  // 前端可能传 visible（直接）或 hideInMenu（反向语义），统一映射为 '1'/'0'
  if (body.visible !== undefined) {
    return truthyVisible(body.visible) ? '1' : '0'
  }
  if (body.hideInMenu !== undefined) {
    return body.hideInMenu ? '0' : '1'
  }
  return '1'
}

// 前端 camelCase → DB 字段映射（适配新 schema）
const toMenuPayload = (body) => {
  const isButton = body.menuType === 'BUTTON' || Number(body.menuType) === 3
  if (isButton) {
    // 按钮：permission 字段才是关键标识，path/route_name 用内部合成键避免与菜单冲突
    const parentId = body.parentId ?? 0
    const ts = Date.now()
    return {
      parent_id: body.parentId ?? 0,
      menu_type: 'BUTTON',
      menu_name: body.menuName,
      route_name: `_btn_${parentId}_${body.routeName || body.menuName}_${ts}`,
      path: `_btn_${parentId}_${ts}`,
      component: null,
      redirect: null,
      sort: body.sort ?? body.orderNum ?? 0,
      icon: null,
      permission: body.permission ?? '',
      frame: '0',
      link: null,
      is_cache: '0',
      visible: '1',
      status: toDbStatus(body.status),
      is_system: '0',
      remark: body.remark ?? ''
    }
  }

  return {
    parent_id: body.parentId ?? 0,
    menu_type: body.menuType ?? 'MENU',
    menu_name: body.menuName,
    route_name: body.routeName ?? null,
    path: body.path ?? '',
    component: body.component ?? null,
    redirect: body.redirect ?? null,
    sort: body.sort ?? body.orderNum ?? 0,
    icon: body.icon ?? null,
    permission: body.permission ?? null,
    frame: body.frame === '1' || body.frame === 1 ? '1' : '0',
    link: body.link ?? null,
    is_cache: body.isCache === '1' || body.isCache === 1 || body.keepAlive ? '1' : '0',
    visible: visibleFromBody(body),
    status: toDbStatus(body.status),
    is_system: body.isSystem === '1' || body.isSystem === 1 ? '1' : '0',
    remark: body.remark ?? ''
  }
}

// DB → 前端 camelCase 字段映射（适配新 schema）
const formatMenuRow = (row) => {
  const isButton = row.menu_type === 'BUTTON' || Number(row.menu_type) === 3

  // 按钮类型：route_name 是内部合成键 _btn_{parentId}_{code}_{ts}，提取真实权限标识
  let displayRouteName = row.route_name || ''
  let displayPath = row.path || ''
  if (isButton && displayRouteName.startsWith('_btn_')) {
    const parts = displayRouteName.split('_')
    // _btn_{parentId}_{code}_{ts} → 去掉前3段和后1段，取中间
    if (parts.length >= 5) {
      displayRouteName = parts.slice(3, -1).join('_')
    } else if (parts.length >= 4) {
      displayRouteName = parts[3]
    }
    displayPath = ''
  }

  return {
    id: row.id,
    createBy: row.create_by || '',
    createTime: row.create_time || '',
    updateBy: row.update_by || '',
    updateTime: row.update_time || '',
    status: toFrontendStatus(row.status),
    parentId: row.parent_id ?? 0,
    menuType: String(row.menu_type),
    menuName: row.menu_name,
    routeName: displayRouteName,
    path: displayPath,
    component: row.component || '',
    redirect: row.redirect || '',
    sort: row.sort ?? 0,
    icon: row.icon || '',
    permission: row.permission || '',
    frame: String(row.frame ?? '0'),
    link: row.link || '',
    isCache: String(row.is_cache ?? '0'),
    visible: row.visible === '0' ? '0' : '1',
    isSystem: String(row.is_system ?? '0'),
    remark: row.remark || ''
  }
}

// 前端表格树构建：
// - 目录（DIR）可包含：菜单（MENU）、目录（DIR）
// - 菜单（MENU）可包含：按钮（BUTTON）
// - 按钮（BUTTON）不包含子节点
const buildMenuRecordTree = (rows) => {
  const nodeMap = new Map(
    rows.map((row) => {
      const canHaveChildren =
        row.menuType === 'DIR' || row.menuType === '1' || row.menuType === 'MENU' || row.menuType === '2'
      return [row.id, canHaveChildren ? { ...row, children: [] } : { ...row }]
    })
  )
  const roots = []

  for (const row of rows) {
    const currentNode = nodeMap.get(row.id)
    const parentId = Number(row.parentId) || 0

    if (parentId !== 0 && nodeMap.has(parentId)) {
      const parentNode = nodeMap.get(parentId)
      const parentType = parentNode.menuType
      if (
        parentType === 'DIR' ||
        parentType === '1' ||
        (parentType === 'MENU' && row.menuType === 'BUTTON') ||
        (parentType === '2' && row.menuType === '3')
      ) {
        if (Array.isArray(parentNode.children)) {
          parentNode.children.push(currentNode)
          continue
        }
      }
    }

    roots.push(currentNode)
  }

  // 清理空的 children 数组
  for (const node of nodeMap.values()) {
    if (Array.isArray(node.children) && node.children.length === 0) {
      delete node.children
    }
  }

  return roots
}

/**
 * 获取菜单列表
 */
export const listMenus = async (query, isV2 = false) => {
  const { current, size, page, pageSize, pageNum, keyword, menuName, menuType, status } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize, pageNum })
  // 前端搜索栏用 menuName 作为关键词字段
  const normalizedKeyword = keyword || menuName || ''

  if (isV2) {
    const menus = await adminMenuDao.listMenus()
    const filteredMenus = normalizedKeyword
      ? menus.filter((item) => {
          const matchedKeyword = String(normalizedKeyword).toLowerCase()
          return [item.menu_name, item.path, item.route_name].some((field) =>
            String(field || '')
              .toLowerCase()
              .includes(matchedKeyword)
          )
        })
      : menus

    const formattedRows = filteredMenus.map((item) => formatMenuRow(item))
    const tree = buildMenuRecordTree(formattedRows)

    // 对根节点分页：保持子树完整，仅切片顶层节点
    const start = (actualPage - 1) * actualPageSize
    const pagedTree = tree.slice(start, start + actualPageSize)

    return {
      records: pagedTree,
      rows: pagedTree,
      current: actualPage,
      size: actualPageSize,
      total: tree.length
    }
  }

  const [list, total] = await Promise.all([
    adminMenuDao.listMenusPaginated({ page: actualPage, pageSize: actualPageSize, keyword: normalizedKeyword }),
    adminMenuDao.countMenus({ keyword: normalizedKeyword })
  ])

  const records = list.map((item) => formatMenuRow(item))

  return {
    // records 为新契约；rows 兼容前端 AdvanceTable / 菜单下拉树读取约定
    records,
    rows: records,
    current: actualPage,
    size: actualPageSize,
    total: Number(total)
  }
}

/**
 * 获取菜单树
 */
export const getMenuTree = async () => {
  const menus = await adminMenuDao.listMenus()
  // 构建包含目录→菜单→按钮 三级层级结构的树
  return { success: true, data: buildMenuTree(menus) }
}

/**
 * 创建菜单
 */
export const createMenu = async (body) => {
  const { path, routeName, parentId, menuType } = body
  const isButton = menuType === 'BUTTON' || Number(menuType) === 3

  // 按钮类型不需要路由字段校验
  if (!isButton) {
    if (path) {
      const existedPath = await adminMenuDao.findMenuByPath(path)
      if (existedPath) {
        return { success: false, code: businessCode.menuPathExist }
      }
    }
    if (routeName) {
      const existedName = await adminMenuDao.findMenuByName(routeName)
      if (existedName) {
        return { success: false, code: businessCode.menuNameExist }
      }
    }
  }

  if (parentId) {
    const parentMenu = await adminMenuDao.findMenuById(parentId)
    if (!parentMenu) {
      return { success: false, code: businessCode.paramError, msg: '父级菜单不存在' }
    }
    // 按钮类型只能挂在菜单（MENU）下
    if (isButton && !(parentMenu.menu_type === 'MENU' || Number(parentMenu.menu_type) === 2)) {
      return { success: false, code: businessCode.paramError, msg: '按钮只能挂在菜单下' }
    }
  }

  const result = await adminMenuDao.createMenu(toMenuPayload(body))

  return { success: true, data: { id: result.insertId } }
}

/**
 * 更新菜单
 */
export const updateMenu = async (body) => {
  const { id, path, routeName, parentId, menuType } = body
  const currentMenu = await adminMenuDao.findMenuById(id)

  if (!currentMenu) {
    return { success: false, code: businessCode.error, msg: '菜单不存在' }
  }

  const isButton =
    menuType === 'BUTTON' ||
    Number(menuType) === 3 ||
    currentMenu.menu_type === 'BUTTON' ||
    Number(currentMenu.menu_type) === 3

  if (!isButton && path) {
    const existedPath = await adminMenuDao.findMenuByPath(path)
    if (existedPath && existedPath.id !== id) {
      return { success: false, code: businessCode.menuPathExist }
    }
  }

  if (!isButton && routeName) {
    const existedName = await adminMenuDao.findMenuByName(routeName)
    if (existedName && existedName.id !== id) {
      return { success: false, code: businessCode.menuNameExist }
    }
  }

  if (parentId !== undefined) {
    if (parentId === id) {
      return { success: false, code: businessCode.paramError, msg: '父级菜单不能选择自己' }
    }

    if (parentId !== null) {
      const parentMenu = await adminMenuDao.findMenuById(parentId)
      if (!parentMenu) {
        return { success: false, code: businessCode.paramError, msg: '父级菜单不存在' }
      }
    }
  }

  // 构建动态更新 payload（前端 camelCase → DB 新 schema 字段）
  const payload = {}
  const fieldMap = {
    menuName: 'menu_name',
    routeName: 'route_name',
    path: 'path',
    menuType: 'menu_type',
    component: 'component',
    redirect: 'redirect',
    sort: 'sort',
    icon: 'icon',
    permission: 'permission',
    frame: 'frame',
    link: 'link',
    isCache: 'is_cache',
    visible: 'visible',
    isSystem: 'is_system',
    remark: 'remark',
    status: 'status',
    parentId: 'parent_id'
  }

  // 按钮类型的 route_name/path 是内部合成键（_btn_*），不允许前端覆盖
  const skipKeys = isButton ? new Set(['routeName', 'path']) : new Set()

  for (const [bodyKey, colKey] of Object.entries(fieldMap)) {
    if (skipKeys.has(bodyKey)) {
      continue
    }
    if (body[bodyKey] !== undefined) {
      payload[colKey] = bodyKey === 'status' ? toDbStatus(body[bodyKey]) : (body[bodyKey] ?? null)
    }
  }

  await adminMenuDao.updateMenu(id, payload)

  return { success: true }
}

/**
 * 删除菜单
 */
export const deleteMenu = async (body) => {
  const ids = body.id ? [body.id] : body.ids || []

  for (const rawId of ids) {
    const id = Number(rawId)
    const currentMenu = await adminMenuDao.findMenuById(id)

    if (!currentMenu) {
      return { success: false, code: businessCode.error, msg: '菜单不存在' }
    }

    const childrenCount = await adminMenuDao.countChildren(id)
    if (childrenCount > 0) {
      return { success: false, code: businessCode.menuHasChildren }
    }
  }

  if (ids.length > 1) {
    await adminMenuDao.deleteMenus(ids)
  } else {
    await adminMenuDao.deleteMenu(Number(ids[0]))
  }

  return { success: true }
}

/**
 * 获取全部页面（含 component 的菜单）
 */
export const getAllPages = async () => {
  const menus = await adminMenuDao.listMenus()
  const pages = menus
    .filter((m) => m.component)
    .map((m) => ({
      name: m.route_name,
      path: m.path,
      component: m.component,
      label: m.menu_name
    }))
  return { success: true, data: pages }
}
