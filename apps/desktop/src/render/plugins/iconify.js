import { addCollection } from '@iconify/vue'
import iconData from './iconify-data.json'
import riIconData from './iconify-data-ri.json'
import svgSpinnersIconData from './iconify-data-svg-spinners.json'
import lineMdIconData from './iconify-data-line-md.json'

// 注册项目所需的 Lucide / Remix Icon 图标子集（离线模式，无需网络请求）
// 图标数据由 scripts/gen-iconify-data.js 从 @iconify/json 提取生成
addCollection(iconData)
addCollection(riIconData)
addCollection(svgSpinnersIconData)
addCollection(lineMdIconData)
