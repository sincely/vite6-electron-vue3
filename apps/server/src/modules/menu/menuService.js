/**
 * @module 菜单管理 Service
 * @description 封装菜单 CRUD、树结构构建、按钮管理等业务逻辑（适配新 sys_menu schema）
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
  const isButton = normalizeMenuType(body.menuType) === 'BUTTON'
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

// 菜单类型统一为大写字符串：DIR / MENU / BUTTON
const normalizeMenuType = (menuType) => String(menuType ?? '').toUpperCase()

// DB → 前端 camelCase 字段映射（适配新 schema）
const formatMenuRow = (row) => {
  const menuType = normalizeMenuType(row.menu_type)
  const isButton = menuType === 'BUTTON'

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
    menuType,
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

// 前端表格树构建（严格层级）：
// - 目录（DIR）下只能放：菜单（MENU）、目录（DIR）
// - 菜单（MENU）下只能放：按钮（BUTTON）
// - 按钮（BUTTON）为叶子节点
// 不满足层级规则的节点按顶级平铺，避免父子错乱展示
const canNest = (parentType, childType) => {
  if (parentType === 'DIR') {
    return childType === 'DIR' || childType === 'MENU'
  }
  if (parentType === 'MENU') {
    return childType === 'BUTTON'
  }
  return false
}

const buildMenuRecordTree = (rows) => {
  const nodeMap = new Map(
    rows.map((row) => {
      const canHaveChildren = row.menuType === 'DIR' || row.menuType === 'MENU'
      return [row.id, canHaveChildren ? { ...row, children: [] } : { ...row }]
    })
  )
  const roots = []

  for (const row of rows) {
    const currentNode = nodeMap.get(row.id)
    const parentId = Number(row.parentId) || 0
    const parentNode = parentId !== 0 ? nodeMap.get(parentId) : null

    if (parentNode && canNest(parentNode.menuType, row.menuType)) {
      parentNode.children.push(currentNode)
    } else {
      roots.push(currentNode)
    }
  }

  // 清理空的 children 数组
  for (const node of nodeMap.values()) {
    if (Array.isArray(node.children) && node.children.length === 0) {
      delete node.children
    }
  }

  return roots
}

// 列表筛选：menuName（名称/路由名称/路由路径模糊）+ menuType + status；
// 命中节点保留其祖先链，保证筛选结果仍是完整的层级树
const filterMenuRows = (rows, { keyword, menuType, status }) => {
  if (!keyword && !menuType && !status) {
    return rows
  }

  const matched = rows.filter((row) => {
    if (menuType && row.menuType !== menuType) {
      return false
    }
    if (status && row.status !== status) {
      return false
    }
    if (keyword) {
      const kw = String(keyword).toLowerCase()
      return [row.menuName, row.routeName, row.path].some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(kw)
      )
    }
    return true
  })

  const byId = new Map(rows.map((row) => [row.id, row]))
  const keep = new Set()
  for (const row of matched) {
    let cursor = row
    while (cursor && !keep.has(cursor.id)) {
      keep.add(cursor.id)
      cursor = byId.get(Number(cursor.parentId) || 0)
    }
  }
  return rows.filter((row) => keep.has(row.id))
}

/**
 * 获取菜单列表
 * 菜单管理页依赖完整层级树（rows 内含 children），不做行级分页切片；
 * isV2 保留对根节点分页的旧契约（保持子树完整，仅切片顶层节点）。
 */
export const listMenus = async (query, isV2 = false) => {
  const { current, size, page, pageSize, pageNum, keyword, menuName, menuType, status } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize, pageNum })
  // 前端搜索栏用 menuName 作为关键词字段
  const normalizedKeyword = keyword || menuName || ''

  const menus = await adminMenuDao.listMenus()
  const filteredRows = filterMenuRows(
    menus.map((item) => formatMenuRow(item)),
    {
      keyword: normalizedKeyword,
      menuType,
      status
    }
  )
  const tree = buildMenuRecordTree(filteredRows)

  if (!isV2) {
    return {
      records: tree,
      rows: tree,
      current: actualPage,
      size: actualPageSize,
      total: tree.length
    }
  }

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

/**
 * 获取菜单树
 */
export const getMenuTree = async () => {
  const menus = await adminMenuDao.listMenus()
  // 构建包含目录→菜单→按钮 三级层级结构的树
  return { success: true, data: buildMenuTree(menus) }
}

// 校验父子层级（严格）：
// - 顶级不允许按钮
// - 目录（DIR）下只能放目录/菜单
// - 菜单（MENU）下只能放按钮
const validateMenuHierarchy = (parentId, menuType, parentMenu) => {
  const childType = normalizeMenuType(menuType)

  if (!parentId) {
    return childType === 'BUTTON' ? '按钮只能挂在菜单下' : null
  }
  if (!parentMenu) {
    return '父级菜单不存在'
  }

  const parentType = normalizeMenuType(parentMenu.menu_type)
  if (parentType === 'DIR' && childType !== 'DIR' && childType !== 'MENU') {
    return '目录下只能添加目录或菜单'
  }
  if (parentType === 'MENU' && childType !== 'BUTTON') {
    return '菜单下只能添加按钮'
  }
  return null
}

// 目标父级是否在当前菜单的子树下（是则移动后会形成环形引用）
const isParentInSubtree = async (id, targetParentId) => {
  const menus = await adminMenuDao.listMenus()
  const byId = new Map(menus.map((menu) => [menu.id, menu]))
  let cursor = byId.get(Number(targetParentId))
  while (cursor) {
    if (Number(cursor.id) === Number(id)) {
      return true
    }
    cursor = byId.get(Number(cursor.parent_id) || 0)
  }
  return false
}

/**
 * 创建菜单
 */
export const createMenu = async (body) => {
  const { path, routeName, parentId, menuType } = body
  const isButton = normalizeMenuType(menuType) === 'BUTTON'

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

  const parentMenu = parentId ? await adminMenuDao.findMenuById(parentId) : null
  const hierarchyError = validateMenuHierarchy(parentId, menuType, parentMenu)
  if (hierarchyError) {
    return { success: false, code: businessCode.paramError, msg: hierarchyError }
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

  const isButton = normalizeMenuType(menuType) === 'BUTTON' || normalizeMenuType(currentMenu.menu_type) === 'BUTTON'

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

  // 生效的父子关系（未传字段沿用当前值），做严格层级校验
  const effectiveType = menuType ?? currentMenu.menu_type
  const effectiveParentId = parentId !== undefined ? parentId : currentMenu.parent_id

  if (effectiveParentId !== null && Number(effectiveParentId) === Number(id)) {
    return { success: false, code: businessCode.paramError, msg: '父级菜单不能选择自己' }
  }

  if (effectiveParentId) {
    const parentMenu = await adminMenuDao.findMenuById(effectiveParentId)
    const hierarchyError = validateMenuHierarchy(effectiveParentId, effectiveType, parentMenu)
    if (hierarchyError) {
      return { success: false, code: businessCode.paramError, msg: hierarchyError }
    }

    // 移动到自己的子树下会形成环形引用
    if (parentId !== undefined && (await isParentInSubtree(id, parentId))) {
      return { success: false, code: businessCode.paramError, msg: '父级菜单不能选择自己的子节点' }
    }
  }

  // 类型变更时，已有子节点必须仍符合层级规则（目录→目录/菜单，菜单→按钮）
  if (menuType !== undefined && normalizeMenuType(menuType) !== normalizeMenuType(currentMenu.menu_type)) {
    const allMenus = await adminMenuDao.listMenus()
    const hasIncompatibleChild = allMenus.some(
      (menu) =>
        Number(menu.parent_id) === Number(id) &&
        !canNest(normalizeMenuType(menuType), normalizeMenuType(menu.menu_type))
    )
    if (hasIncompatibleChild) {
      return { success: false, code: businessCode.paramError, msg: '子节点不符合新菜单类型的层级规则，请先处理子节点' }
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
