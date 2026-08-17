/**
 * 高级表格模块 mock 数据（员工列表）
 */

const departments = [
  '技术部',
  '产品部',
  '设计部',
  '市场部',
  '运营部',
  '财务部',
  '人事部'
]
const roles = ['超级管理员', '部门经理', '普通员工', '实习生', '外包人员']
const statuses = ['active', 'inactive', 'disabled']
const statusLabels = { active: '在职', inactive: '休假中', disabled: '已离职' }

const firstNames = [
  '张伟',
  '李娜',
  '王芳',
  '刘洋',
  '陈明',
  '杨丽',
  '赵强',
  '黄磊',
  '周敏',
  '吴杰',
  '林峰',
  '孙婷',
  '马超',
  '朱红',
  '胡军',
  '郭靖',
  '何雨',
  '罗琳',
  '梁博',
  '宋佳'
]
const avatarColors = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#10b981',
  '#06b6d4',
  '#3b82f6'
]
const pinyin = [
  'zhangwei',
  'lina',
  'wangfang',
  'liuyang',
  'chenming',
  'yangli',
  'zhaoqiang',
  'huanglei',
  'zhoumin',
  'wujie',
  'linfeng',
  'sunting',
  'machao',
  'zhuhong',
  'hujun',
  'guojing',
  'heyu',
  'luolin',
  'liangbo',
  'songjia'
]

function randomDate(start, end) {
  const d = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

function generateUser(index) {
  const name = firstNames[index % firstNames.length]
  const dept = departments[Math.floor(Math.random() * departments.length)]
  const role = roles[Math.floor(Math.random() * roles.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const color = avatarColors[index % avatarColors.length]

  return {
    id: index,
    name,
    avatar: color,
    initial: name.charAt(0),
    email: `${pinyin[index % pinyin.length]}@lightning.app`,
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    department: dept,
    role,
    status,
    statusLabel: statusLabels[status],
    joinDate: randomDate(new Date(2020, 0, 1), new Date(2024, 5, 1)),
    lastLogin: randomDate(new Date(2024, 5, 1), new Date(2024, 6, 15)),
    projects: Math.floor(Math.random() * 20) + 1,
    performance: Math.floor(Math.random() * 40) + 60 // 60-100
  }
}

export const allUsers = []
for (let i = 1; i <= 100; i++) {
  allUsers.push(generateUser(i))
}

export const userStats = () => ({
  totalUsers: allUsers.length,
  activeUsers: allUsers.filter((u) => u.status === 'active').length,
  inactiveUsers: allUsers.filter((u) => u.status === 'inactive').length,
  disabledUsers: allUsers.filter((u) => u.status === 'disabled').length
})
