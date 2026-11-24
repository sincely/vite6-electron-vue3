<template>
  <canvas ref="canvasRef" class="planet-horizon"></canvas>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'PlanetHorizon' })

const props = defineProps({
  animate: { type: Boolean, default: true },
  // 颜色、强度与撒点密度不传则跟随主题（暗色 / 亮色各一套参考配色）
  bg: { type: String, default: undefined },
  glowColor: { type: String, default: undefined },
  highlightColor: { type: String, default: undefined },
  shadowColor: { type: String, default: undefined },
  lightsColor: { type: String, default: undefined },
  intensity: { type: Number, default: undefined },
  density: { type: Number, default: undefined },
  skyStars: { type: Number, default: undefined },
  height: { type: Number, default: 0.38 },
  curvature: { type: Number, default: 1.4 },
  rimWidth: { type: Number, default: 1.6 },
  dotSize: { type: Number, default: 1.2 },
  speed: { type: Number, default: 6 },
  twinkle: { type: Number, default: 0.5 },
  cursor: { type: Boolean, default: true },
  tilt: { type: Number, default: 0 },
  offsetX: { type: Number, default: 0 },
  offsetY: { type: Number, default: 0 },
  // none | corner-tl/tr/bl/br | edge-top/bottom/left/right | band | vignette | edges
  mask: { type: String, default: 'corner-br' },
  maskSize: { type: Number, default: 0.5 },
  maskSoftness: { type: Number, default: 0.5 },
  // blur | erase | color
  maskStyle: { type: String, default: 'blur' },
  maskBlur: { type: Number, default: 32 },
  maskBlurRange: { type: Number, default: 0.35 },
  maskFade: { type: Number, default: 0.4 },
  maskColor: { type: String, default: '#ffffff' },
  flipX: { type: Boolean, default: false },
  flipY: { type: Boolean, default: false },
  // 固定像素比，0 为自动（最高 2）
  pixelRatio: { type: Number, default: 0 },
  // 无缝循环周期（毫秒），导出循环视频用，0 为不循环
  loopDuration: { type: Number, default: 0 },
  // 以下两项仅在挂载时读取
  startTime: { type: Number, default: 0 },
  ignoreReducedMotion: { type: Boolean, default: false }
})

const canvasRef = ref(null)

const TAU = Math.PI * 2
const BLUR_STEPS = 5

// 当前生效参数：props 叠加主题色
const p = {}
const env = { W: 1, H: 1, dpr: 1, time: 0, loop: 0, pointer: { x: -9999, y: -9999, active: false } }

// 场景先画到离屏缓冲，再整体平移贴到画布，位置偏移才能对所有内容生效
const buf = document.createElement('canvas')
const ctx = buf.getContext('2d')
let out = null

const reduce = !props.ignoreReducedMotion && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let raf = 0
let last = 0
let visible = true
let ro = null
let io = null
let themeObserver = null

let dots = []
let stars = []
let sceneKey = ''
let gx = null
let grain = null

const levels = []
const work = []
const bFull = document.createElement('canvas')
const bAcc = document.createElement('canvas')
const flipC = document.createElement('canvas')
let hasFilter = null

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const rgba = (c, a) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${clamp(a, 0, 1)})`

function rgb(hex) {
  let h = String(hex || '#000').replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  const n = parseInt(h.slice(0, 6), 16) || 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// 用 ph 代替"时间 × 速度"算相位：设置循环周期后，速度会微调为周期内正好走完整数圈
function ph(rate, period, whole) {
  const P = period || TAU
  const L = env.loop
  if (!L || !rate) return rate * env.time
  const x = (rate * L) / P
  let n = Math.round(x)
  // 滚动类动画不能往回走，至少走满一圈
  if (!n && whole) n = x > 0 ? 1 : -1
  if (n) return ((n * P) / L) * env.time
  // 慢到一圈都走不完：在周期内以原速往返一次
  return ((rate * L) / TAU) * Math.sin((TAU * env.time) / L)
}

// 对应 props 未传时生效的主题参数
const THEMES = {
  dark: {
    bg: '#0c111d',
    glowColor: '#5b6f9e',
    highlightColor: '#e8efff',
    shadowColor: '#0b1428',
    lightsColor: '#cdd9ff',
    intensity: 0.7,
    density: 0.6,
    skyStars: 0.15
  },
  light: {
    bg: '#eef2fb',
    glowColor: '#9fb3e0',
    highlightColor: '#ffffff',
    shadowColor: '#dfe6f5',
    lightsColor: '#6b7fb3',
    intensity: 0.6,
    density: 1.17,
    skyStars: 0
  }
}

function applyParams() {
  const theme = document.documentElement.dataset.theme === 'dark' ? THEMES.dark : THEMES.light
  const themed = Object.fromEntries(Object.entries(theme).map(([k, v]) => [k, props[k] ?? v]))
  Object.assign(p, props, themed)
  env.loop = props.loopDuration
}

// 星球表面光点与天空星星：尺寸或密度变化时重新撒点
function sync() {
  const { W, H } = env
  const key = [W, H, p.density, p.skyStars].join()
  if (key === sceneKey) return
  sceneKey = key
  const n = Math.max(0, Math.min(1200, Math.round(((W * H) / 10000) * p.density * 8)))
  dots = []
  for (let i = 0; i < n; i++) {
    // u 越小越靠近地平线；幂函数让地平线附近更密（透视压缩）
    dots.push({
      th: Math.random() * 2 - 1,
      u: Math.pow(Math.random(), 1.8),
      s: 0.5 + Math.random(),
      ph: Math.random() * TAU
    })
  }
  const m = Math.round(((W * H) / 10000) * p.skyStars * 3)
  stars = []
  for (let i = 0; i < m; i++) {
    stars.push({ x: Math.random(), y: Math.random(), s: 0.3 + Math.random() * 0.7, ph: Math.random() * TAU })
  }
}

// 抖动噪点：打散深色大面积渐变在 8 位色深下的色带
function getGrain() {
  if (grain) return grain
  grain = document.createElement('canvas')
  grain.width = grain.height = 128
  const gc = grain.getContext('2d')
  const img = gc.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = img.data[i + 1] = img.data[i + 2] = (Math.random() * 255) | 0
    img.data[i + 3] = 255
  }
  gc.putImageData(img, 0, 0)
  return grain
}

function render(dt) {
  const { W, H, pointer } = env
  const ang = ((p.tilt || 0) * Math.PI) / 180
  const tilted = Math.abs(ang) > 0.001
  const Dg = Math.hypot(W, H)
  // 旋转时可见范围放大到对角线，保证四个角不露空
  const span = tilted ? Dg / 2 : W / 2
  const m = tilted ? (Dg - W) / 2 + 20 : 0
  const hy = H * (1 - p.height)
  const R = Math.max(W * 0.6, W * p.curvature)
  const cx = W / 2
  const cy = hy + R
  const glow = rgb(p.glowColor)
  const rim = rgb(p.highlightColor)
  const planet = rgb(p.shadowColor)
  const lights = rgb(p.lightsColor)

  // 光晕中心缓缓跟着光标左右移动
  const tx = p.cursor && pointer.active ? pointer.x : cx
  gx = gx == null ? tx : gx + (tx - gx) * Math.min(1, dt / 900)
  const I = p.intensity * (1 + 0.06 * Math.sin(ph(0.0006)))

  // 天空：底色 + 两层压扁的径向光晕（大气散射）
  ctx.fillStyle = p.bg
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  if (tilted) {
    ctx.translate(W / 2, H / 2)
    ctx.rotate(ang)
    ctx.translate(-W / 2, -H / 2)
  }
  ctx.save()
  ctx.translate(gx, hy)
  ctx.scale(1, 0.55)
  let g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.9)
  g.addColorStop(0, rgba(glow, 0.85 * I))
  g.addColorStop(0.45, rgba(glow, 0.35 * I))
  g.addColorStop(1, rgba(glow, 0))
  ctx.fillStyle = g
  ctx.fillRect(-W * 2, -H * 4, W * 4, H * 8)
  g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.35)
  g.addColorStop(0, rgba(rim, 0.35 * I))
  g.addColorStop(1, rgba(rim, 0))
  ctx.fillStyle = g
  ctx.fillRect(-W * 2, -H * 4, W * 4, H * 8)
  ctx.restore()

  // 天空里的星星
  const starPhase = ph(0.0015)
  for (const st of stars) {
    const sy = st.y * (hy + m) - m
    const a =
      (0.15 + 0.35 * st.s) *
      (1 - p.twinkle * 0.5 + p.twinkle * 0.5 * Math.sin(starPhase + st.ph)) *
      Math.max(0, (sy + m) / (hy + m))
    ctx.fillStyle = rgba(lights, a)
    ctx.beginPath()
    ctx.arc(st.x * (W + 2 * m) - m, sy, st.s * 0.8, 0, TAU)
    ctx.fill()
  }

  // 星球本体：靠近地平线处透出一点大气色，往下渐暗
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, TAU)
  ctx.closePath()
  g = ctx.createLinearGradient(0, hy, 0, H)
  g.addColorStop(0, rgba(mix(planet, glow, 0.35), 1))
  g.addColorStop(0.25, rgba(planet, 1))
  g.addColorStop(
    1,
    rgba(
      planet.map((c) => c * 0.6),
      1
    )
  )
  ctx.fillStyle = g
  ctx.fill()
  ctx.clip()

  // 表面光点：沿星球弧线分布，随自转移动；越靠近地平线越小越暗
  const thMax = Math.asin(Math.min(1, (span + 40) / R)) * 1.05
  const rate = p.speed * 0.000004 * (R > 0 ? 400 / R : 0)
  const dMax = (H - hy + (tilted ? (Math.abs(Math.sin(ang)) * W) / 2 + m : 0)) * 1.15
  const span2 = 2 * thMax
  // 循环导出时把整段弧分成 rep 份，只取 1/rep 的光点在每份里重复排列，转过一份即对齐
  let rep = 1
  if (env.loop && rate) rep = Math.max(1, Math.round(span2 / (Math.abs(rate) * env.loop)))
  const seg = span2 / rep
  const nd = rep > 1 ? Math.ceil(dots.length / rep) : dots.length
  const spin = rep > 1 ? ((env.time * seg) / env.loop) * (rate > 0 ? 1 : -1) : ph(rate, span2, true)
  const dotPhase = ph(0.002)
  for (let i = 0; i < nd * rep; i++) {
    const q = dots[i % nd]
    let th = (rep > 1 ? (q.th * 0.5 + 0.5) * seg + Math.floor(i / nd) * seg - thMax : q.th * thMax) + spin
    // 转出视野就从另一侧回来
    th = ((((th + thMax) % span2) + span2) % span2) - thMax
    const rr = R - q.u * dMax
    const x = cx + rr * Math.sin(th)
    const y = cy - rr * Math.cos(th)
    if (y < hy - 2 || y > H + m + 2 || x < -m - 4 || x > W + m + 4) continue
    const near = Math.min(1, q.u * 3)
    const size = p.dotSize * q.s * (0.35 + 0.9 * q.u)
    const a = (0.15 + 0.85 * near) * (1 - p.twinkle * 0.6 + p.twinkle * 0.6 * Math.sin(dotPhase + q.ph)) * 0.9
    ctx.fillStyle = rgba(lights, a)
    ctx.beginPath()
    ctx.arc(x, y, Math.max(0.3, size), 0, TAU)
    ctx.fill()
  }
  ctx.restore()

  // 地平线亮边的柔光：以星球圆心做环形渐变，不用多层描边叠加（每层都有硬边，会出台阶）
  const gw = p.rimWidth * 14
  const r0 = Math.max(0, R - gw * 0.6)
  const k = Math.min(1, 0.4 + I)
  const ring = ctx.createRadialGradient(cx, cy, r0, cx, cy, R + gw)
  const at = (R - r0) / (R + gw - r0)
  ;[
    [0, 0],
    [at * 0.55, 0.06],
    [at * 0.85, 0.22],
    [at, 0.55],
    [at + (1 - at) * 0.12, 0.3],
    [at + (1 - at) * 0.35, 0.12],
    [at + (1 - at) * 0.65, 0.04],
    [1, 0]
  ].forEach(([stop, a]) => ring.addColorStop(stop, rgba(rim, a * k)))
  ctx.fillStyle = ring
  ctx.fillRect(-m, -m, W + 2 * m, H + 2 * m)

  // 中间那条清晰的亮线：光晕中心最亮，两侧渐淡
  const rg = ctx.createLinearGradient(0, 0, W, 0)
  rg.addColorStop(0, rgba(rim, 0.25))
  rg.addColorStop(clamp(gx / W, 0, 1), rgba(rim, 1))
  rg.addColorStop(1, rgba(rim, 0.25))
  ctx.save()
  ctx.strokeStyle = rg
  ctx.lineCap = 'round'
  ctx.lineWidth = p.rimWidth
  ctx.globalAlpha = k
  ctx.beginPath()
  ctx.arc(cx, cy, R, -Math.PI / 2 - thMax, -Math.PI / 2 + thMax)
  ctx.stroke()
  ctx.restore()
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.02
  ctx.fillStyle = ctx.createPattern(getGrain(), 'repeat')
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}

// 覆盖度渐变：避让区为 1，装饰区为 0
function maskGradient(c2, col, m, size, soft) {
  const { W, H } = env
  const D = Math.hypot(W, H)
  const base = rgb(col)
  const c = (a) => rgba(base, a)
  let g
  if (m.startsWith('corner-')) {
    // 装饰保留在某个角
    const cx = m.charAt(8) === 'r' ? W : 0
    const cy = m.charAt(7) === 'b' ? H : 0
    const r0 = size * D
    g = c2.createRadialGradient(cx, cy, r0, cx, cy, r0 + soft * D * 0.6)
    g.addColorStop(0, c(0))
    g.addColorStop(1, c(1))
  } else if (m.startsWith('edge-')) {
    // 装饰保留在某条边
    const e = m.slice(5)
    const x0 = e === 'right' ? W : 0
    const y0 = e === 'bottom' ? H : 0
    const x1 = e === 'left' ? W : 0
    const y1 = e === 'top' ? H : 0
    g = e === 'top' || e === 'bottom' ? c2.createLinearGradient(0, y0, 0, y1) : c2.createLinearGradient(x0, 0, x1, 0)
    const a = clamp(size, 0, 1)
    const b = clamp(size + soft * 0.6, 0, 1)
    g.addColorStop(0, c(0))
    g.addColorStop(a, c(0))
    g.addColorStop(Math.max(a, b), c(1))
    g.addColorStop(1, c(1))
  } else if (m === 'band') {
    // 中间横带留白
    const half = size / 2
    const sb = soft * 0.5
    const a1 = clamp(0.5 - half - sb, 0, 1)
    const b1 = clamp(0.5 - half, 0, 1)
    const c1 = clamp(0.5 + half, 0, 1)
    const d1 = clamp(0.5 + half + sb, 0, 1)
    g = c2.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, c(0))
    g.addColorStop(a1, c(0))
    g.addColorStop(Math.max(a1, b1), c(1))
    g.addColorStop(Math.max(b1, c1), c(1))
    g.addColorStop(Math.max(c1, d1), c(0))
    g.addColorStop(1, c(0))
  } else {
    // vignette 中心留白 / edges 四周淡出
    const R = D / 2
    const inner = size * R
    const outer = inner + Math.max(1, soft * R)
    const inside = m === 'vignette' ? 1 : 0
    g = c2.createRadialGradient(W / 2, H / 2, inner, W / 2, H / 2, outer)
    g.addColorStop(0, c(inside))
    g.addColorStop(1, c(1 - inside))
  }
  return g
}

// 取一块可复用且已重置状态的离屏画布
function cnv(arr, i, w, h) {
  const c = arr[i] || (arr[i] = document.createElement('canvas'))
  if (c.width !== w || c.height !== h) {
    c.width = w
    c.height = h
  }
  const x = c.getContext('2d')
  x.setTransform(1, 0, 0, 1, 0, 0)
  x.globalCompositeOperation = 'source-over'
  x.filter = 'none'
  x.imageSmoothingEnabled = true
  x.imageSmoothingQuality = 'high'
  x.clearRect(0, 0, w, h)
  return c
}

function filterOK() {
  if (hasFilter === null) {
    const t = document.createElement('canvas').getContext('2d')
    t.filter = 'blur(2px)'
    hasFilter = t.filter === 'blur(2px)'
  }
  return hasFilter
}

// 第 i 档模糊（1..L）对应的遮罩：把整段过渡平均切成 L 段，第 i 档从第 i 段开始出现
function levelMask(m, size, soft, i, L) {
  if (m.startsWith('corner-') || m.startsWith('edge-')) return [size + ((i - 1) / L) * soft * 0.6, soft / L]
  if (m === 'edges') return [size + ((i - 1) / L) * soft, soft / L]
  return [size + soft * (1 - i / L), soft / L]
}

// 避让区的渐进模糊（类似 backdrop-filter）：内容区最模糊，往装饰区方向逐渐变清晰
function blurAvoided(m, size, soft) {
  const px = clamp(p.maskBlur || 0, 0, 80)
  if (px < 0.5) return
  // 模糊从多深入装饰区的地方开始渐入：0 只在淡出过渡带里，1 从装饰中心附近就开始
  const reach = clamp(p.maskBlurRange == null ? 0.35 : p.maskBlurRange, 0, 1)
  if (m.startsWith('corner-') || m.startsWith('edge-')) {
    soft += (size * reach) / 0.6
    size *= 1 - reach
  } else if (m === 'edges') {
    soft += size * reach
    size *= 1 - reach
  } else {
    soft = Math.min(2, soft * (1 + 2 * reach))
  }
  const BW = buf.width
  const BH = buf.height
  const D = env.dpr
  const L = BLUR_STEPS
  const useFilter = filterOK()
  // 各档在半分辨率上合成（模糊后没有细节），最后只放大叠回一次
  const HW = Math.max(1, Math.ceil(BW / 2))
  const HH = Math.max(1, Math.ceil(BH / 2))
  const HD = D / 2
  if (bFull.width !== HW || bFull.height !== HH) {
    bFull.width = HW
    bFull.height = HH
  }
  if (bAcc.width !== HW || bAcc.height !== HH) {
    bAcc.width = HW
    bAcc.height = HH
  }
  const ac = bAcc.getContext('2d')
  ac.setTransform(1, 0, 0, 1, 0, 0)
  ac.globalCompositeOperation = 'source-over'
  ac.clearRect(0, 0, HW, HH)
  ac.imageSmoothingEnabled = true
  ac.imageSmoothingQuality = 'high'

  // mip 链：levels[k] 是 1/2^(k+1) 尺寸，逐级对半缩小可避免细小光点缩小时忽隐忽现
  const maxK = Math.max(1, Math.min(6, Math.floor(Math.log2(Math.max(2, (px * D) / 2)))))
  let w = BW
  let h = BH
  let cur = buf
  for (let k = 0; k < maxK; k++) {
    w = Math.max(1, Math.ceil(w / 2))
    h = Math.max(1, Math.ceil(h / 2))
    const c = cnv(levels, k, w, h)
    c.getContext('2d').drawImage(cur, 0, 0, w, h)
    cur = c
  }

  const fc = bFull.getContext('2d')
  for (let i = 1; i <= L; i++) {
    // 模糊半径按 2 倍递增，人眼对模糊的感知接近对数，过渡才显得均匀
    const r = px * Math.pow(2, i - L) * D
    fc.setTransform(1, 0, 0, 1, 0, 0)
    fc.globalCompositeOperation = 'source-over'
    fc.filter = 'none'
    fc.imageSmoothingEnabled = true
    fc.imageSmoothingQuality = 'high'
    fc.clearRect(0, 0, HW, HH)
    if (useFilter) {
      // 缩小到模糊半径约 2~4 像素的那一级再做高斯模糊，放大回来不会有方块感
      const kk = Math.max(0, Math.min(maxK, Math.floor(Math.log2(Math.max(1, r / 2.5)))))
      const base = kk === 0 ? buf : levels[kk - 1]
      const scale = Math.pow(2, kk)
      const pad = Math.ceil((r / scale) * 2) + 2
      const wc = cnv(work, i, base.width + pad * 2, base.height + pad * 2)
      const wx = wc.getContext('2d')
      wx.filter = `blur(${(r / scale).toFixed(2)}px)`
      wx.drawImage(base, pad, pad)
      wx.filter = 'none'
      fc.drawImage(wc, pad, pad, base.width, base.height, 0, 0, HW, HH)
    } else {
      // 不支持 ctx.filter：退回为 mip 链逐级放大近似模糊
      const steps = Math.max(1, Math.min(maxK, Math.round(Math.log2(Math.max(2, r / 1.6)))))
      let src = levels[steps - 1]
      for (let k = steps - 2; k >= 0; k--) {
        const u = cnv(work, 10 + k, levels[k].width, levels[k].height)
        u.getContext('2d').drawImage(src, 0, 0, u.width, u.height)
        src = u
      }
      fc.drawImage(src, 0, 0, HW, HH)
    }
    const lm = levelMask(m, size, soft, i, L)
    fc.setTransform(HD, 0, 0, HD, 0, 0)
    fc.globalCompositeOperation = 'destination-in'
    fc.fillStyle = maskGradient(fc, '#000000', m, lm[0], Math.max(0.001, lm[1]))
    fc.fillRect(0, 0, env.W, env.H)
    ac.drawImage(bFull, 0, 0)
  }

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bAcc, 0, 0, BW, BH)
  ctx.restore()
}

// 内容避让：只在指定区域保留装饰，其余区域擦成透明（露出容器背景）或填色
function drawMask() {
  const m = p.mask
  if (!m || m === 'none') return
  const style = p.maskStyle || 'blur'
  const size = clamp(p.maskSize, 0, 1)
  const soft = Math.max(0.001, clamp(p.maskSoftness, 0, 1))
  blurAvoided(m, size, soft)
  const fade = style === 'blur' ? clamp(p.maskFade == null ? 0.4 : p.maskFade, 0, 1) : 1
  if (fade <= 0) return
  ctx.save()
  if (style !== 'color') ctx.globalCompositeOperation = 'destination-out'
  ctx.globalAlpha = fade
  ctx.fillStyle = maskGradient(ctx, style === 'color' ? p.maskColor || '#ffffff' : '#000000', m, size, soft)
  ctx.fillRect(0, 0, env.W, env.H)
  ctx.restore()
}

// 图案平移后缓冲边缘会露在画布里，把这些边缘淡出，避免一刀切的硬边
function fadeSeams(ox, oy) {
  const { W, H } = env
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  const band = (x0, y0, x1, y1, rx, ry, rw, rh) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(rx, ry, rw, rh)
  }
  const fx = Math.min(W * 0.45, Math.max(24, Math.abs(ox) * 0.9 + W * 0.08))
  const fy = Math.min(H * 0.45, Math.max(24, Math.abs(oy) * 0.9 + H * 0.08))
  if (ox < 0) band(W, 0, W - fx, 0, W - fx, 0, fx, H)
  if (ox > 0) band(0, 0, fx, 0, 0, 0, fx, H)
  if (oy < 0) band(0, H, 0, H - fy, 0, H - fy, W, fy)
  if (oy > 0) band(0, 0, 0, fy, 0, 0, W, fy)
  ctx.restore()
}

// 画完后整张缓冲镜像一次（在内容避让之前，避让区不受影响）
function flipBuffer() {
  if (flipC.width !== buf.width || flipC.height !== buf.height) {
    flipC.width = buf.width
    flipC.height = buf.height
  }
  const f = flipC.getContext('2d')
  f.setTransform(1, 0, 0, 1, 0, 0)
  f.clearRect(0, 0, flipC.width, flipC.height)
  f.drawImage(buf, 0, 0)
  ctx.save()
  ctx.setTransform(p.flipX ? -1 : 1, 0, 0, p.flipY ? -1 : 1, p.flipX ? buf.width : 0, p.flipY ? buf.height : 0)
  ctx.globalCompositeOperation = 'copy'
  ctx.drawImage(flipC, 0, 0)
  ctx.restore()
}

function frame(dt) {
  env.time += dt
  ctx.save()
  render(dt)
  ctx.restore()
  if (p.flipX || p.flipY) flipBuffer()
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  drawMask()
  const ox = ((p.offsetX || 0) / 100) * env.W
  const oy = ((p.offsetY || 0) / 100) * env.H
  if (ox || oy) fadeSeams(ox, oy)
  out.setTransform(1, 0, 0, 1, 0, 0)
  out.clearRect(0, 0, out.canvas.width, out.canvas.height)
  out.drawImage(buf, Math.round(ox * env.dpr), Math.round(oy * env.dpr))
}

const still = () => reduce || p.animate === false

function loop(now) {
  const dt = Math.min(now - last, 50)
  last = now
  frame(dt)
  raf = visible && !still() ? requestAnimationFrame(loop) : 0
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas || !out) return
  const r = canvas.getBoundingClientRect()
  env.dpr = props.pixelRatio || Math.min(window.devicePixelRatio || 1, 2)
  env.W = Math.max(1, r.width)
  env.H = Math.max(1, r.height)
  canvas.width = buf.width = Math.round(env.W * env.dpr)
  canvas.height = buf.height = Math.round(env.H * env.dpr)
  ctx.setTransform(env.dpr, 0, 0, env.dpr, 0, 0)
  sync()
  // 改尺寸会清空画布，立刻补画一帧避免缩放窗口时闪烁
  frame(0)
}

function onMove(e) {
  const r = canvasRef.value.getBoundingClientRect()
  const px = e.clientX - r.left
  const py = e.clientY - r.top
  const pt = env.pointer
  pt.active = px >= 0 && py >= 0 && px <= r.width && py <= r.height
  // 换算到偏移与翻转之前的坐标，交互才会跟着图案走
  pt.x = px - ((p.offsetX || 0) / 100) * r.width
  pt.y = py - ((p.offsetY || 0) / 100) * r.height
  if (p.flipX) pt.x = r.width - pt.x
  if (p.flipY) pt.y = r.height - pt.y
  if (still()) frame(0)
}

function onLeave() {
  env.pointer.active = false
  env.pointer.x = env.pointer.y = -9999
}

function startLoop() {
  last = performance.now()
  raf = requestAnimationFrame(loop)
}

function update() {
  applyParams()
  sync()
  if (still()) {
    cancelAnimationFrame(raf)
    raf = 0
    frame(0)
  } else if (!raf && visible) {
    startLoop()
  }
}

watch(props, () => {
  if (out) update()
})
watch(
  () => props.pixelRatio,
  () => resize()
)

onMounted(() => {
  const canvas = canvasRef.value
  out = canvas.getContext('2d')
  env.time = props.startTime
  applyParams()

  // 滚出视口时暂停
  if (!reduce) {
    io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf && !still()) startLoop()
    })
    io.observe(canvas)
  }

  window.addEventListener('pointermove', onMove)
  document.addEventListener('pointerleave', onLeave)
  ro = new ResizeObserver(resize)
  ro.observe(canvas)
  // 主题切换时跟着换色
  themeObserver = new MutationObserver(update)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  resize()
  if (!still()) startLoop()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerleave', onLeave)
  ro?.disconnect()
  io?.disconnect()
  themeObserver?.disconnect()
  out = null
})

// 手动推进一帧：导出视频时逐帧离线渲染用
function step(dt) {
  frame(dt)
}

function getTime() {
  return env.time
}

defineExpose({ step, time: getTime })
</script>

<style lang="scss" scoped>
.planet-horizon {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: inherit;
}
</style>
