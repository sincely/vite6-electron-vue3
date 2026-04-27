import { resultError, resultSuccess } from '../utils'

const roleNames = [
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

const permissionOptions = [
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

const createUserSeed = (count = 28) => {
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

let userList = createUserSeed()

let roleList = roleNames.map((name, index) => ({
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

const menuTree = [
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
        // children: [
        //   {
        //     id: 231,
        //     parentId: 23,
        //     menuType: 'BUTTON',
        //     menuName: '新增菜单',
        //     icon: 'plus',
        //     routeName: '',
        //     path: '',
        //     component: '',
        //     permission: 'system:menu:create',
        //     status: '1',
        //     visible: '1',
        //     sort: 1
        //   }
        // ]
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

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function includesText(source, keyword) {
  return normalizeText(source).includes(normalizeText(keyword))
}

function paginate(list, pageNum = 1, pageSize = 10) {
  const current = Number(pageNum) || 1
  const size = Number(pageSize) || 10
  const start = (current - 1) * size
  return {
    rows: list.slice(start, start + size),
    total: list.length
  }
}

function flattenMenus(list, parentId = 0) {
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

function findMenuNode(list, id) {
  for (const item of list) {
    if (item.id === id) return item
    if (item.children?.length) {
      const target = findMenuNode(item.children, id)
      if (target) return target
    }
  }
  return null
}

function updateMenuNode(list, id, updater) {
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

function removeMenuNode(list, ids) {
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

function createNextId(list) {
  return Math.max(...list.map((item) => item.id), 0) + 1
}

export default [
  {
    url: '/mock/system/users/list',
    method: 'get',
    response: ({ query }) => {
      const {
        pageNum = 1,
        pageSize = 10,
        username = '',
        gender = '',
        nickname = '',
        mobile = '',
        email = '',
        status = ''
      } = query

      const filtered = userList.filter((item) => {
        return (
          includesText(item.username, username) &&
          includesText(item.nickname, nickname) &&
          includesText(item.mobile, mobile) &&
          includesText(item.email, email) &&
          (!gender || item.gender === gender) &&
          (!status || item.status === status)
        )
      })

      return resultSuccess(paginate(filtered, pageNum, pageSize))
    }
  },
  {
    url: '/mock/system/users/create',
    method: 'post',
    response: ({ body }) => {
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
      return resultSuccess({ id }, { message: '新增用户成功' })
    }
  },
  {
    url: '/mock/system/users/update',
    method: 'put',
    response: ({ body }) => {
      const target = userList.find((item) => item.id === body.id)
      if (!target) {
        return resultError('用户不存在')
      }
      const roleIds = Array.isArray(body.roleIds) ? body.roleIds : []
      const roleNamesOfUser = roleList
        .filter((role) => roleIds.includes(role.id))
        .map((role) => role.roleName)
      Object.assign(target, body, {
        roleIds,
        roleNames: roleNamesOfUser
      })
      return resultSuccess(true, { message: '更新用户成功' })
    }
  },
  {
    url: '/mock/system/users/delete',
    method: 'post',
    response: ({ body }) => {
      const ids = Array.isArray(body.ids) ? body.ids : []
      userList = userList.filter((item) => !ids.includes(item.id))
      return resultSuccess(true, { message: '删除用户成功' })
    }
  },
  {
    url: '/mock/system/roles/list',
    method: 'get',
    response: ({ query }) => {
      const {
        pageNum = 1,
        pageSize = 10,
        roleName = '',
        roleCode = '',
        status = ''
      } = query

      const filtered = roleList.filter((item) => {
        return (
          includesText(item.roleName, roleName) &&
          includesText(item.roleCode, roleCode) &&
          (!status || item.status === status)
        )
      })

      return resultSuccess(paginate(filtered, pageNum, pageSize))
    }
  },
  {
    url: '/mock/system/roles/create',
    method: 'post',
    response: ({ body }) => {
      const id = createNextId(roleList)
      roleList.unshift({
        id,
        roleName: body.roleName,
        roleCode: body.roleCode,
        sort: body.sort ?? id,
        status: body.status,
        userCount: body.userCount ?? 0,
        permissions: body.permissions || [],
        remark: body.remark || '',
        createTime: '2026-04-16 10:00:00'
      })
      return resultSuccess({ id }, { message: '新增角色成功' })
    }
  },
  {
    url: '/mock/system/roles/update',
    method: 'put',
    response: ({ body }) => {
      const target = roleList.find((item) => item.id === body.id)
      if (!target) {
        return resultError('角色不存在')
      }
      Object.assign(target, body, {
        permissions: body.permissions || []
      })
      return resultSuccess(true, { message: '更新角色成功' })
    }
  },
  {
    url: '/mock/system/roles/delete',
    method: 'post',
    response: ({ body }) => {
      const ids = Array.isArray(body.ids) ? body.ids : []
      roleList = roleList.filter((item) => !ids.includes(item.id))
      userList = userList.map((user) => {
        const nextRoleIds = user.roleIds.filter(
          (roleId) => !ids.includes(roleId)
        )
        return {
          ...user,
          roleIds: nextRoleIds,
          roleNames: roleList
            .filter((role) => nextRoleIds.includes(role.id))
            .map((role) => role.roleName)
        }
      })
      return resultSuccess(true, { message: '删除角色成功' })
    }
  },
  {
    url: '/mock/system/menus/list',
    method: 'get',
    response: ({ query }) => {
      const { menuName = '', status = '', menuType = '' } = query
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
      return resultSuccess({
        rows,
        total: flattenMenus(rows).length
      })
    }
  },
  {
    url: '/mock/system/menus/create',
    method: 'post',
    response: ({ body }) => {
      const flat = flattenMenus(menuTree)
      const id = createNextId(flat)
      const menu = {
        id,
        parentId: Number(body.parentId || 0),
        menuType: body.menuType,
        menuName: body.menuName,
        icon: body.icon || '',
        routeName: body.routeName || '',
        path: body.path || '',
        component: body.component || '',
        permission: body.permission || '',
        status: body.status,
        visible: body.visible,
        sort: Number(body.sort || 1),
        remark: body.remark || ''
      }

      if (!menu.parentId) {
        menuTree.push(menu)
      } else {
        const parent = findMenuNode(menuTree, menu.parentId)
        if (!parent) {
          return resultError('父级菜单不存在')
        }
        if (!parent.children) parent.children = []
        parent.children.push(menu)
      }

      return resultSuccess({ id }, { message: '新增菜单成功' })
    }
  },
  {
    url: '/mock/system/menus/update',
    method: 'put',
    response: ({ body }) => {
      const flat = flattenMenus(menuTree)
      const current = flat.find((item) => item.id === body.id)
      if (!current) {
        return resultError('菜单不存在')
      }

      const nextParentId = Number(body.parentId || 0)
      if (current.parentId !== nextParentId) {
        removeMenuNode(menuTree, [body.id])
        const nextNode = {
          ...current,
          ...body,
          parentId: nextParentId
        }
        if (!nextParentId) {
          menuTree.push(nextNode)
        } else {
          const parent = findMenuNode(menuTree, nextParentId)
          if (!parent) {
            return resultError('父级菜单不存在')
          }
          if (!parent.children) parent.children = []
          parent.children.push(nextNode)
        }
      } else {
        updateMenuNode(menuTree, body.id, (item) => ({
          ...item,
          ...body,
          parentId: nextParentId
        }))
      }

      return resultSuccess(true, { message: '更新菜单成功' })
    }
  },
  {
    url: '/mock/system/menus/delete',
    method: 'post',
    response: ({ body }) => {
      const ids = Array.isArray(body.ids) ? body.ids : []
      removeMenuNode(menuTree, ids)
      return resultSuccess(true, { message: '删除菜单成功' })
    }
  }
]
