/**
 * 请求演示 API 模块
 *
 * 规范要点：
 *   1. 渲染进程只传「普通对象」，绝不手动构造 URLSearchParams / FormData
 *   2. 表单请求只需标记 isForm: true，URLSearchParams 由主进程请求拦截器统一构造
 *   3. 所有请求收敛到 @/utils/request，Mock / 真实 IPC 两种模式接口完全一致
 */
import request from '@/utils/request'

/** JSON POST：最常见的请求方式（Content-Type: application/json） */
export const loginByJson = (data) =>
  request({
    url: '/auth/login',
    method: 'post',
    data
  })

/** 表单 POST：Content-Type: application/x-www-form-urlencoded */
export const loginByForm = (data) =>
  request({
    url: '/auth/login',
    method: 'post',
    data,
    isForm: true
  })

/** GET 带查询参数：params 会被序列化为 ?pageNum=1&pageSize=10&... */
export const getTableList = (params) =>
  request({
    url: '/table/list',
    method: 'get',
    params
  })

/** GET 携带 Bearer token：简化版 request 不自动注入 token，由调用方显式传入 */
export const getUserInfo = (token) =>
  request({
    url: '/user/info',
    method: 'get',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })
