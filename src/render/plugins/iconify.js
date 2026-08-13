import { addCollection } from '@iconify/vue'
import iconData from './iconify-data.json'
import riIconData from './iconify-data-ri.json'

// 注册项目所需的 Lucide / Remix Icon 图标子集（离线模式，无需网络请求）
addCollection(iconData)
addCollection(riIconData)
