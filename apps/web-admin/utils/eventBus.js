import mitt from 'mitt'

/**
 * 全局事件总线（基于 mitt）
 *
 * 用于跨层级组件通信，解耦组件间的直接依赖：
 * - triggerFireworks: 触发礼花/烟花效果（可选图片 URL 参数）
 *
 * 用法：
 *   eventBus.on('triggerFireworks', handler)
 *   eventBus.emit('triggerFireworks', imageUrl)
 */
const eventBus = mitt()

export default eventBus
