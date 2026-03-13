import request from '@/utils/request'

export function getTableList(params) {
  return request({
    url: '/mock/table/list',
    method: 'get',
    params
  })
}
