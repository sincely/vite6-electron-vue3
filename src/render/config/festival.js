/**
 * 节日庆祝配置
 *
 * 配置系统的节日烟花效果和祝福文本。
 * 支持单日节日和跨日期节日，可自定义烟花播放次数。
 *
 * ## 配置说明
 *
 * - name: 节日名称（同时作为本地去重标记）
 * - date: 节日开始日期（格式：YYYY-MM-DD）
 * - endDate: 节日结束日期（可选，用于跨日期节日）
 * - image: 烟花图片（需要预先导入，如 '@/assets/images/ceremony/sd.png'）
 * - scrollText: 滚动显示的祝福文本
 * - count: 烟花播放次数（可选，默认为 3 次）
 *
 * ## 注意事项
 *
 * - 图片需要预先导入并在配置中引用
 * - 跨日期节日会在整个日期范围内生效
 * - 每个节日每天只会自动播放一次烟花效果（localStorage 去重）
 */

// 导入烟花图片（根据需要取消注释）
// import sd from '@/assets/images/ceremony/sd.png'
// import yd from '@/assets/images/ceremony/yd.png'

export const festivalConfigList = [
  // 单日示例：圣诞节
  // {
  //   name: '圣诞节',
  //   date: '2026-12-25',
  //   image: sd,
  //   count: 3, // 可选，不设置则使用默认值 3 次
  //   scrollText: 'Merry Christmas！祝您圣诞快乐，愿节日的欢乐与祝福如雪花般纷至沓来！'
  // },
  // 跨日期示例
  // {
  //   name: '周年庆',
  //   date: '2026-11-03',
  //   endDate: '2026-11-09',
  //   image: '',
  //   count: 3,
  //   scrollText: '🚀 系统周年庆活动正式开启！'
  // }
]
