import { getSystemInfo } from '../systemInfo'

export default [
  {
    channel: 'get-system-info',
    type: 'handle',
    handler: () => {
      return getSystemInfo()
    }
  }
]
