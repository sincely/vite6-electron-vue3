import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'

import user from './modules/user' // 引入定义的mock模拟接口
import table from './modules/table' // 引入定义的mock模拟接口
import system from './modules/system'

const mockModules = [...table, ...user, ...system] // 将所有的mock接口合并成一个数组
export function setupProdMockServer() {
  // 这个是用来注册mock的，当在生产中使用mock时，很重要
  createProdMockServer(mockModules)
}
