import IframeView from './index.vue'

/**
 * 为内嵌页路由生成与路由同名的组件
 *
 * keep-alive 的 include 按组件 name 匹配，而标签页缓存列表存的是路由 name
 * （普通页面靠 defineOptions 让两者一致）。多个内嵌路由共用 IframeView 时，
 * 用本工厂为每个路由生成同名组件，使各标签页独立缓存、随标签关闭释放
 * @param {string} name 路由 name（需与路由记录的 name 保持一致）
 */
export function asIframeComponent(name) {
  return { ...IframeView, name }
}
