/**
 * 系统管理模块 mock 数据（用户 / 角色 / 菜单）
 * 模块级可变状态，CRUD 操作在进程生命周期内生效
 */

export const roleNames = [
  '超级管理员',
  '系统管理员',
  '运维工程师',
  '审计专员',
  '内容运营',
  '产品经理',
  '财务专员',
  '人事经理',
  '客服主管',
  '访客角色'
]

export const permissionOptions = [
  'system:user:view',
  'system:user:create',
  'system:user:update',
  'system:user:delete',
  'system:role:view',
  'system:role:create',
  'system:role:update',
  'system:role:delete',
  'system:menu:view',
  'system:menu:create',
  'system:menu:update',
  'system:menu:delete'
]

const userStatusOptions = ['1', '0']
const genderOptions = ['男', '女']

function createUserSeed(count = 28) {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1
    const gender = genderOptions[index % genderOptions.length]
    const roleId = (index % roleNames.length) + 1
    return {
      id,
      username: `user_${String(id).padStart(3, '0')}`,
      nickname: ['张晨', '李静', '王涛', '陈雪', '刘洋', '赵敏', '周凯'][
        index % 7
      ],
      gender,
      mobile: `13${String(100000000 + id * 321).slice(0, 9)}`,
      email: `user${id}@example.com`,
      status: userStatusOptions[index % userStatusOptions.length],
      roleIds: [roleId],
      roleNames: [roleNames[roleId - 1]],
      remark: `${roleNames[roleId - 1]}账号`,
      createTime: `2026-03-${String((index % 28) + 1).padStart(2, '0')} 10:${String(index % 60).padStart(2, '0')}:00`
    }
  })
}

export let userList = createUserSeed()

export let roleList = roleNames.map((name, index) => ({
  id: index + 1,
  roleName: name,
  roleCode: `ROLE_${String(index + 1).padStart(2, '0')}`,
  sort: index + 1,
  status: index === 9 ? '0' : '1',
  userCount: Math.max(1, 12 - index),
  permissions: permissionOptions.filter((_, permissionIndex) => {
    return permissionIndex % 3 !== index % 3
  }),
  remark: `${name}的系统权限集合`,
  createTime: `2026-02-${String(index + 1).padStart(2, '0')} 09:30:00`
}))

export const menuTree = [
  {
    id: 1,
    parentId: 0,
    menuType: 'MENU',
    menuName: '首页',
    icon: 'home',
    routeName: 'home',
    path: '/home',
    component: '@/views/home/index.vue',
    permission: 'dashboard:view',
    status: '1',
    visible: '1',
    sort: 1
  },
  {
    id: 2,
    parentId: 0,
    menuType: 'DIR',
    menuName: '系统功能',
    icon: 'settings',
    routeName: 'system',
    path: '/manage',
    component: '',
    permission: '',
    status: '1',
    visible: '1',
    sort: 2,
    children: [
      {
        id: 21,
        parentId: 2,
        menuType: 'MENU',
        menuName: '用户管理',
        icon: 'user',
        routeName: 'system-user',
        path: '/manage/user',
        component: '@/views/system/user/index.vue',
        permission: 'system:user:view',
        status: '1',
        visible: '1',
        sort: 1
      },
      {
        id: 22,
        parentId: 2,
        menuType: 'MENU',
        menuName: '角色管理',
        icon: 'shield-check',
        routeName: 'system-role',
        path: '/manage/role',
        component: '@/views/system/role/index.vue',
        permission: 'system:role:view',
        status: '1',
        visible: '1',
        sort: 2
      },
      {
        id: 23,
        parentId: 2,
        menuType: 'MENU',
        menuName: '菜单管理',
        icon: 'list',
        routeName: 'system-menu',
        path: '/manage/menu',
        component: '@/views/system/menu/index.vue',
        permission: 'system:menu:view',
        status: '1',
        visible: '1',
        sort: 3
      }
    ]
  },
  {
    id: 3,
    parentId: 0,
    menuType: 'MENU',
    menuName: '关于',
    icon: 'info',
    routeName: 'about',
    path: '/about',
    component: '@/views/about/index.vue',
    permission: 'about:view',
    status: '1',
    visible: '0',
    sort: 99
  }
]

// ── 可变状态操作 ──────────────────────────────────────

export function setUserList(next) {
  userList = next
}

export function setRoleList(next) {
  roleList = next
}

// ── 通用辅助函数 ──────────────────────────────────────

export function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

export function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function includesText(source, keyword) {
  return normalizeText(source).includes(normalizeText(keyword))
}

export function paginate(list, pageNum = 1, pageSize = 10) {
  const current = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  const start = (current - 1) * size
  return {
    rows: list.slice(start, start + size),
    total: list.length
  }
}

export function flattenMenus(list, parentId = 0) {
  return list.reduce((result, item) => {
    const current = {
      ...item,
      parentId: item.parentId ?? parentId
    }
    result.push(current)
    if (item.children?.length) {
      result.push(...flattenMenus(item.children, item.id))
    }
    return result
  }, [])
}

export function findMenuNode(list, id) {
  for (const item of list) {
    if (item.id === id) return item
    if (item.children?.length) {
      const target = findMenuNode(item.children, id)
      if (target) return target
    }
  }
  return null
}

export function updateMenuNode(list, id, updater) {
  for (let index = 0; index < list.length; index++) {
    const item = list[index]
    if (item.id === id) {
      list[index] = updater(item)
      return true
    }
    if (item.children?.length && updateMenuNode(item.children, id, updater)) {
      return true
    }
  }
  return false
}

export function removeMenuNode(list, ids) {
  for (let index = list.length - 1; index >= 0; index--) {
    const item = list[index]
    if (ids.includes(item.id)) {
      list.splice(index, 1)
      continue
    }
    if (item.children?.length) {
      removeMenuNode(item.children, ids)
    }
  }
}

export function createNextId(list) {
  return Math.max(...list.map((item) => item.id), 0) + 1
}
