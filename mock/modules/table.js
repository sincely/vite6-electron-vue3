import { resultSuccess } from '../utils'

export default [
  {
    url: '/mock/table/list',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10, keyword } = query
      const total = 100
      const list = []

      for (let i = 0; i < pageSize; i++) {
        const index = (page - 1) * pageSize + i + 1
        if (index > total) break

        list.push({
          id: index,
          date: `2024-03-${Math.floor(Math.random() * 30) + 1} 12:00:00`,
          name: keyword ? `User ${keyword} ${index}` : `User ${index}`,
          address: `No. ${index}, Grove St, Los Angeles`,
          status: Math.random() > 0.5 ? 'Success' : 'Pending',
          type: ['System', 'User', 'Admin'][Math.floor(Math.random() * 3)],
          age: Math.floor(Math.random() * 50) + 18,
          range: [
            `2024-03-${Math.floor(Math.random() * 10) + 1} 12:00:00`,
            `2024-03-${Math.floor(Math.random() * 10) + 15} 12:00:00`
          ]
        })
      }

      return resultSuccess({
        rows: list,
        total
      })
    }
  }
]
