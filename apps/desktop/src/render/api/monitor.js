/**
 * 系统监控模块 API（监控总览 / 在线用户）
 * request() 已统一拆业务信封，await 后直接拿到业务本体。
 */
import request from '@/utils/request'

export const getMonitorOverview = () => request({ url: '/monitor/overview', method: 'get' })

export const getOnlineUserList = (params) => request({ url: '/monitor/online/list', method: 'get', params })

export const forceLogoutSession = (data) => request({ url: '/monitor/online/force-logout', method: 'post', data })
