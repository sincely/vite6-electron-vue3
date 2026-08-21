<!-- 烟花效果 | 礼花效果 -->
<template>
  <canvas ref="canvasRef" class="fireworks-canvas" />
</template>

<script setup>
import { useEventListener } from '@vueuse/core'
import dayjs from 'dayjs'
import eventBus from '@/utils/eventBus'
import { festivalConfigList } from '@/config/festival'
import bp from '@/assets/images/ceremony/hb.png'
import sd from '@/assets/images/ceremony/sd.png'
import yd from '@/assets/images/ceremony/yd.png'

defineOptions({ name: 'FireworksEffect' })

/**
 * 烟花效果的全局配置
 */
const CONFIG = {
  POOL_SIZE: 600, // 对象池大小，影响同时存在的最大粒子数
  PARTICLES_PER_BURST: 200, // 每次爆炸的粒子数量，影响视觉效果密度

  // 粒子尺寸配置
  SIZES: {
    RECTANGLE: { WIDTH: 24, HEIGHT: 12 },
    SQUARE: { SIZE: 12 },
    CIRCLE: { SIZE: 12 },
    TRIANGLE: { SIZE: 10 },
    OVAL: { WIDTH: 24, HEIGHT: 12 },
    IMAGE: { WIDTH: 30, HEIGHT: 30 }
  },

  // 旋转动画配置
  ROTATION: {
    BASE_SPEED: 2, // 基础旋转速度
    RANDOM_SPEED: 3, // 额外随机旋转速度范围
    DECAY: 0.98 // 旋转速度衰减系数（越小衰减越快）
  },

  // 物理效果配置
  PHYSICS: {
    GRAVITY: 0.525, // 重力加速度，影响粒子下落速度
    VELOCITY_THRESHOLD: 10, // 速度阈值，超过时开始透明度衰减
    OPACITY_DECAY: 0.02 // 透明度衰减速度，影响粒子消失快慢
  },

  // 粒子颜色配置 - RGBA 格式支持透明度
  COLORS: [
    'rgba(255, 68, 68, 1)', // 红色系
    'rgba(255, 68, 68, 0.9)',
    'rgba(255, 68, 68, 0.8)',
    'rgba(255, 116, 188, 1)', // 粉色系
    'rgba(255, 116, 188, 0.9)',
    'rgba(255, 116, 188, 0.8)',
    'rgba(68, 68, 255, 0.8)', // 蓝色系
    'rgba(92, 202, 56, 0.7)', // 绿色系
    'rgba(255, 68, 255, 0.8)', // 紫色系
    'rgba(68, 255, 255, 0.7)', // 青色系
    'rgba(255, 136, 68, 0.7)', // 橙色系
    'rgba(68, 136, 255, 1)', // 蓝色系
    'rgba(250, 198, 122, 0.8)' // 金色系
  ],

  // 粒子形状配置 - 矩形出现概率更高，营造更丰富的视觉效果
  SHAPES: [
    'rectangle',
    'rectangle',
    'rectangle',
    'rectangle',
    'rectangle',
    'rectangle',
    'rectangle',
    'circle',
    'triangle',
    'oval'
  ]
}

const canvasRef = ref()
const ctx = ref(null)

/**
 * 烟花系统核心类
 * 负责管理粒子生命周期、渲染和动画
 */
class FireworkSystem {
  constructor() {
    this.particlePool = [] // 粒子对象池
    this.activeParticles = [] // 当前活动的粒子
    this.poolIndex = 0 // 对象池索引指针
    this.imageCache = {} // 图片资源缓存
    this.animationId = 0 // 动画帧 ID
    this.canvasWidth = 0
    this.canvasHeight = 0
    this.initializePool()
  }

  /** 初始化对象池，预先创建粒子对象避免运行时频繁创建 */
  initializePool() {
    for (let i = 0; i < CONFIG.POOL_SIZE; i++) {
      this.particlePool.push(this.createParticle())
    }
  }

  createParticle() {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: '',
      rotation: 0,
      rotationSpeed: 0,
      scale: 1,
      shape: 'circle',
      opacity: 1,
      active: false
    }
  }

  /**
   * 从对象池获取可用粒子
   * 使用循环索引而非 Array.find()，时间复杂度 O(1)
   */
  getAvailableParticle() {
    for (let i = 0; i < CONFIG.POOL_SIZE; i++) {
      const index = (this.poolIndex + i) % CONFIG.POOL_SIZE
      const particle = this.particlePool[index]

      if (!particle.active) {
        this.poolIndex = (index + 1) % CONFIG.POOL_SIZE
        particle.active = true
        return particle
      }
    }
    return null
  }

  /** 预加载单个图片资源 */
  async preloadImage(url) {
    if (this.imageCache[url]) return this.imageCache[url]

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        this.imageCache[url] = img
        resolve(img)
      }
      img.onerror = reject
      img.src = url
    })
  }

  /** 预加载所有需要的图片资源 */
  async preloadAllImages() {
    const imageUrls = [bp, sd, yd]
    try {
      await Promise.all(imageUrls.map((url) => this.preloadImage(url)))
    } catch (error) {
      console.error('礼花图片预加载失败:', error)
    }
  }

  /**
   * 创建烟花爆炸效果
   * @param {string} imageUrl 可选的图片 URL，提供则使用图片粒子
   */
  createFirework(imageUrl) {
    const startX = Math.random() * this.canvasWidth
    const startY = this.canvasHeight

    // 根据是否有图片确定可用形状
    const availableShapes =
      imageUrl && this.imageCache[imageUrl] ? ['image'] : CONFIG.SHAPES

    const particles = []

    for (let i = 0; i < CONFIG.PARTICLES_PER_BURST; i++) {
      const particle = this.getAvailableParticle()
      if (!particle) continue

      // 计算粒子发射角度和速度
      const angle = (Math.PI * i) / (CONFIG.PARTICLES_PER_BURST / 2) // 扇形分布
      const speed = (12 + Math.random() * 6) * 1.5 // 随机速度
      const spread = Math.random() * Math.PI * 2 // 360 度随机扩散

      particle.x = startX
      particle.y = startY
      // 复杂的速度计算，模拟真实烟花爆炸轨迹
      particle.vx =
        Math.cos(angle) * Math.cos(spread) * speed * (Math.random() * 0.5 + 0.5)
      particle.vy = Math.sin(angle) * speed - 15 // 向上初始速度
      particle.color =
        CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)]
      particle.rotation = Math.random() * 360
      particle.rotationSpeed =
        (Math.random() * CONFIG.ROTATION.RANDOM_SPEED +
          CONFIG.ROTATION.BASE_SPEED) *
        (Math.random() > 0.5 ? 1 : -1) // 随机旋转方向
      particle.scale = 0.8 + Math.random() * 0.4 // 随机缩放
      particle.shape =
        availableShapes[Math.floor(Math.random() * availableShapes.length)]
      particle.opacity = 1
      particle.imageUrl =
        imageUrl && this.imageCache[imageUrl] ? imageUrl : undefined

      particles.push(particle)
    }

    this.activeParticles.push(...particles)
  }

  /** 更新所有粒子的物理状态（位置/速度/旋转/透明度） */
  updateParticles() {
    const { GRAVITY, VELOCITY_THRESHOLD, OPACITY_DECAY } = CONFIG.PHYSICS
    const { DECAY } = CONFIG.ROTATION

    // 倒序遍历，避免删除元素时的索引混乱
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i]

      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += GRAVITY // 重力影响

      particle.rotation += particle.rotationSpeed
      particle.rotationSpeed *= DECAY // 旋转速度衰减

      // 下落速度超过阈值时开始淡出
      if (particle.vy > VELOCITY_THRESHOLD) {
        particle.opacity -= OPACITY_DECAY
        if (particle.opacity <= 0) {
          this.recycleParticle(i)
          continue
        }
      }

      // 移除超出屏幕范围的粒子
      if (this.isOutOfBounds(particle)) {
        this.recycleParticle(i)
      }
    }
  }

  /** 回收粒子到对象池 */
  recycleParticle(index) {
    const particle = this.activeParticles[index]
    particle.active = false
    this.activeParticles.splice(index, 1)
  }

  isOutOfBounds(particle) {
    const margin = 100 // 边界缓冲区
    return (
      particle.x < -margin ||
      particle.x > this.canvasWidth + margin ||
      particle.y < -margin ||
      particle.y > this.canvasHeight + margin
    )
  }

  drawParticle(particle) {
    if (!ctx.value) return

    ctx.value.save()
    ctx.value.globalAlpha = particle.opacity
    ctx.value.translate(particle.x, particle.y)
    ctx.value.rotate((particle.rotation * Math.PI) / 180)
    ctx.value.scale(particle.scale, particle.scale)

    this.renderShape(particle)
    ctx.value.restore()
  }

  renderShape(particle) {
    if (!ctx.value) return

    const { SIZES } = CONFIG
    ctx.value.fillStyle = particle.color

    switch (particle.shape) {
      case 'rectangle':
        ctx.value.fillRect(
          -SIZES.RECTANGLE.WIDTH / 2,
          -SIZES.RECTANGLE.HEIGHT / 2,
          SIZES.RECTANGLE.WIDTH,
          SIZES.RECTANGLE.HEIGHT
        )
        break
      case 'square':
        ctx.value.fillRect(
          -SIZES.SQUARE.SIZE / 2,
          -SIZES.SQUARE.SIZE / 2,
          SIZES.SQUARE.SIZE,
          SIZES.SQUARE.SIZE
        )
        break
      case 'circle':
        ctx.value.beginPath()
        ctx.value.arc(0, 0, SIZES.CIRCLE.SIZE / 2, 0, Math.PI * 2)
        ctx.value.fill()
        break
      case 'triangle':
        ctx.value.beginPath()
        ctx.value.moveTo(0, -SIZES.TRIANGLE.SIZE)
        ctx.value.lineTo(SIZES.TRIANGLE.SIZE, SIZES.TRIANGLE.SIZE)
        ctx.value.lineTo(-SIZES.TRIANGLE.SIZE, SIZES.TRIANGLE.SIZE)
        ctx.value.closePath()
        ctx.value.fill()
        break
      case 'oval':
        ctx.value.beginPath()
        ctx.value.ellipse(
          0,
          0,
          SIZES.OVAL.WIDTH / 2,
          SIZES.OVAL.HEIGHT / 2,
          0,
          0,
          Math.PI * 2
        )
        ctx.value.fill()
        break
      case 'image':
        this.renderImage(particle)
        break
      default:
        // 未知形状回退为圆形
        ctx.value.beginPath()
        ctx.value.arc(0, 0, SIZES.CIRCLE.SIZE / 2, 0, Math.PI * 2)
        ctx.value.fill()
        break
    }
  }

  renderImage(particle) {
    if (!ctx.value || !particle.imageUrl) return

    const img = this.imageCache[particle.imageUrl]
    if (img?.complete) {
      const { WIDTH, HEIGHT } = CONFIG.SIZES.IMAGE
      ctx.value.drawImage(img, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT)
    }
  }

  render() {
    if (!ctx.value || !canvasRef.value) return

    ctx.value.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    // 混合模式"变亮"，增强视觉效果
    ctx.value.globalCompositeOperation = 'lighter'

    for (const particle of this.activeParticles) {
      this.drawParticle(particle)
    }
  }

  /** 动画主循环（箭头函数保持 this 绑定） */
  animate = () => {
    this.updateParticles()
    this.render()
    this.animationId = requestAnimationFrame(this.animate)
  }

  updateCanvasSize(width, height) {
    this.canvasWidth = width
    this.canvasHeight = height
  }

  start() {
    this.animate()
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = 0
    }
  }
}

const fireworkSystem = new FireworkSystem()

/**
 * 监听 Ctrl+Shift+P 或 Cmd+Shift+P 组合键触发烟花
 */
const handleKeyPress = (event) => {
  const isFireworkShortcut =
    (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') ||
    (event.metaKey && event.shiftKey && event.key.toLowerCase() === 'p')

  if (isFireworkShortcut) {
    event.preventDefault()
    fireworkSystem.createFirework()
  }
}

/** 响应窗口大小变化，确保画布始终覆盖整个视口 */
const resizeCanvas = () => {
  if (!canvasRef.value) return

  const { innerWidth, innerHeight } = window
  canvasRef.value.width = innerWidth
  canvasRef.value.height = innerHeight
  fireworkSystem.updateCanvasSize(innerWidth, innerHeight)
}

/** 处理外部触发的烟花事件（可携带图片 URL） */
const handleFireworkTrigger = (imageUrl) => {
  fireworkSystem.createFirework(imageUrl)
}

/**
 * 节日自动触发
 * 命中节日日期范围且当天未触发过时，按 count 次数连放礼花
 */
const checkFestival = () => {
  if (!festivalConfigList?.length) return

  const today = dayjs().format('YYYY-MM-DD')

  festivalConfigList.forEach((festival) => {
    const start = festival.date
    const end = festival.endDate || festival.date
    if (today < start || today > end) return

    // 每个节日每天只自动播放一次
    const storageKey = `festival-fired-${festival.name}-${today}`
    if (localStorage.getItem(storageKey)) return
    localStorage.setItem(storageKey, '1')

    const count = festival.count || 3
    let fired = 0
    const timer = setInterval(() => {
      fireworkSystem.createFirework(festival.image || undefined)
      fired++
      if (fired >= count) clearInterval(timer)
    }, 1000)
  })
}

onMounted(async () => {
  if (!canvasRef.value) return

  ctx.value = canvasRef.value.getContext('2d')
  if (!ctx.value) return

  resizeCanvas()
  await fireworkSystem.preloadAllImages()
  fireworkSystem.start()

  // 注册事件监听器
  useEventListener(window, 'keydown', handleKeyPress) // 键盘快捷键
  useEventListener(window, 'resize', resizeCanvas) // 窗口大小变化
  eventBus.on('triggerFireworks', handleFireworkTrigger) // 外部触发事件

  // 节日自动触发
  checkFestival()
})

onUnmounted(() => {
  fireworkSystem.stop()
  eventBus.off('triggerFireworks', handleFireworkTrigger)
})
</script>

<style lang="scss" scoped>
.fireworks-canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
