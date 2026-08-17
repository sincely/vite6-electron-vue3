import { mainRequest } from '../http/index'

export default [
  {
    channel: 'http-request',
    type: 'handle',
    handler: async (_event, config) => {
      return await mainRequest(config)
    }
  }
]
