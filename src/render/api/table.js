import request from '@/utils/request'

export function getTableList(params) {
  return request({
    url: '/table/list',
    method: 'get',
    params
  })
}
