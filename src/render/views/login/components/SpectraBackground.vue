<template>
  <div
    ref="containerRef"
    class="spectra-background"
    @pointerenter="onPointerEnter"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <canvas ref="canvasRef" class="spectra-canvas" />
    <!-- CSS fallback when WebGL unavailable -->
    <div v-if="!webglSupported" class="spectra-fallback" />
  </div>
</template>

<script setup>
/**
 * SpectraBackground — WebGL 流体动画背景组件
 *
 * 基于 SPECTRA blue 效果的程序化流体着色器，
 * 使用多层域扭曲 (domain warping) + 涡旋场 + 有机色场实现。
 *
 * @example
 *   <SpectraBackground :speed="1.25" :intensity="1.65" palette="ocean" />
 */

const props = defineProps({
  /** 动画速度倍率 */
  speed: { type: Number, default: 1.25 },
  /** 色彩强度 (0.3 ~ 2.4) */
  intensity: { type: Number, default: 1.65 },
  /** 流体缩放 */
  fluidScale: { type: Number, default: 1.28 },
  /** 是否启用鼠标交互 */
  interactive: { type: Boolean, default: true },
  /** 调色板 */
  palette: {
    type: String,
    default: 'ocean',
    validator: (v) =>
      ['ocean', 'original', 'klein', 'violet-lime', 'chrome', 'plus'].includes(
        v
      )
  },
  /** 全屏模式 — 流体分布更均匀，适合做页面背景 */
  fullscreen: { type: Boolean, default: true },
  /** 流体覆盖比例 (从底部向上)，0~1 */
  coverage: { type: Number, default: 0.5 },
  /** 边缘过渡柔和度 (越大过渡越柔和) */
  edgeSoftness: { type: Number, default: 0.3 }
})

/* ───────── refs ───────── */
const containerRef = ref(null)
const canvasRef = ref(null)
const webglSupported = ref(true)

/* ───────── 调色板色表 ───────── */
const PALETTES = {
  ocean: {
    baseWhite: [0.985, 0.995, 1.0],
    paleCyan: [0.7, 0.94, 1.0],
    brightCyan: [0.02, 0.86, 0.96],
    electricBlue: [0.04, 0.36, 1.0],
    ultramarine: [0.18, 0.09, 0.84],
    deepPurple: [0.46, 0.05, 0.78],
    vividViolet: [0.68, 0.16, 0.94],
    highlight: [0.9, 0.985, 1.0]
  },
  original: {
    baseWhite: [1.0, 0.985, 0.99],
    paleCyan: [1.0, 0.82, 0.88],
    brightCyan: [0.96, 0.36, 0.62],
    electricBlue: [1.0, 0.54, 0.47],
    ultramarine: [0.87, 0.15, 0.62],
    deepPurple: [0.78, 0.08, 0.48],
    vividViolet: [0.94, 0.28, 0.56],
    highlight: [1.0, 0.96, 0.98]
  },
  klein: {
    baseWhite: [1.0, 1.0, 1.0],
    paleCyan: [1.0, 0.72, 0.48],
    brightCyan: [1.0, 0.35, 0.12],
    electricBlue: [0.0, 0.18, 0.65],
    ultramarine: [0.02, 0.02, 0.05],
    deepPurple: [0.04, 0.04, 0.12],
    vividViolet: [0.1, 0.1, 0.28],
    highlight: [1.0, 0.95, 0.9]
  },
  'violet-lime': {
    baseWhite: [1.0, 1.0, 1.0],
    paleCyan: [0.84, 0.95, 0.02],
    brightCyan: [0.62, 0.88, 0.12],
    electricBlue: [0.52, 0.55, 0.89],
    ultramarine: [0.38, 0.24, 0.76],
    deepPurple: [0.28, 0.16, 0.58],
    vividViolet: [0.68, 0.52, 0.92],
    highlight: [0.96, 1.0, 0.88]
  },
  chrome: {
    baseWhite: [0.98, 0.985, 1.0],
    paleCyan: [0.82, 0.86, 0.92],
    brightCyan: [0.56, 0.62, 0.72],
    electricBlue: [0.36, 0.4, 0.48],
    ultramarine: [0.08, 0.09, 0.12],
    deepPurple: [0.04, 0.05, 0.08],
    vividViolet: [0.18, 0.2, 0.26],
    highlight: [0.95, 0.96, 0.98]
  },
  plus: {
    baseWhite: [1.0, 0.99, 0.98],
    paleCyan: [1.0, 0.76, 0.08],
    brightCyan: [1.0, 0.42, 0.2],
    electricBlue: [1.0, 0.13, 0.31],
    ultramarine: [0.44, 0.0, 0.13],
    deepPurple: [0.62, 0.02, 0.18],
    vividViolet: [0.88, 0.1, 0.28],
    highlight: [1.0, 0.96, 0.92]
  }
}

/* ───────── 着色器源码 ───────── */
const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uPointer;
  uniform float uHover;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform float uFluidScale;
  uniform float uFullscreen;
  uniform float uCoverage;
  uniform float uEdgeSoftness;

  // 调色板颜色 uniform
  uniform vec3 uBaseWhite;
  uniform vec3 uPaleCyan;
  uniform vec3 uBrightCyan;
  uniform vec3 uElectricBlue;
  uniform vec3 uUltramarine;
  uniform vec3 uDeepPurple;
  uniform vec3 uVividViolet;
  uniform vec3 uHighlight;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.83, -0.56, 0.56, 0.83);
    for (int i = 0; i < 4; i++) {
      value += amplitude * valueNoise(p);
      p = rotation * p * 2.01 + vec2(3.11, 1.73);
      amplitude *= 0.5;
    }
    return value;
  }

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  vec2 applyVortex(vec2 point, vec2 center, float strength, float radius, float phase) {
    vec2 delta = point - center;
    float dist = length(delta);
    float influence = exp(-(dist * dist) / max(radius * radius, 0.0001));
    float angle = strength * influence * phase;
    return center + rotate2d(angle) * delta;
  }

  float organicField(vec2 q, float falloff) {
    return exp(-dot(q, q) * falloff);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = uv - 0.5;
    p.x *= aspect;

    float scale = max(uFluidScale, 0.35);
    float t = uTime * uSpeed;
    // 全屏模式下流体分布更均匀
    float rightActivity = mix(
      smoothstep(0.25, 0.58, uv.x),
      smoothstep(-0.1, 0.15, uv.x),
      uFullscreen
    );

    float surgeA = 0.5 + 0.5 * sin(t * 1.3);
    float surgeB = 0.5 + 0.5 * sin(t * 2.1 + 1.7);
    float surgeC = 0.5 + 0.5 * cos(t * 0.8 - 0.9);
    float surge = surgeA * 0.4 + surgeB * 0.35 + surgeC * 0.25;
    float surgeStrength = mix(0.78, 1.42, surge);

    vec2 domain = p / scale;

    vec2 flowA = vec2(
      fbm(domain * 0.7 + vec2(t * 0.16, -t * 0.1)),
      fbm(domain * 0.82 + vec2(-t * 0.14, t * 0.12) + 5.2)
    ) * 2.0 - 1.0;

    float largeWarp = 0.34 * mix(0.92, surgeStrength, 0.72) * mix(1.0, 1.22, uHover);
    vec2 warpedP = p + flowA * largeWarp * scale * rightActivity;

    vec2 flowB = vec2(
      fbm(warpedP * 1.65 / scale + vec2(-t * 0.33, t * 0.2) + 3.4),
      fbm(warpedP * 1.85 / scale + vec2(t * 0.28, -t * 0.24) - 2.7)
    ) * 2.0 - 1.0;

    float medWarp = 0.2 * mix(0.92, surgeStrength, 0.48) * mix(1.0, 1.2, uHover);
    warpedP += flowB * medWarp * scale * rightActivity;

    vec2 flowC = vec2(
      fbm(warpedP * 3.4 / scale + vec2(t * 0.52, -t * 0.38) + 7.0),
      fbm(warpedP * 3.9 / scale + vec2(-t * 0.44, t * 0.48) - 4.0)
    ) * 2.0 - 1.0;

    float detailWarp = 0.085 * mix(0.94, surgeStrength, 0.3) * mix(1.0, 1.18, uHover);
    warpedP += flowC * detailWarp * scale * rightActivity;

    // 涡旋 (根据 coverage 下移)
    float yShift = -(1.0 - uCoverage) * 0.5;
    vec2 vortexA = vec2((0.74 - 0.5) * aspect, 0.22 + yShift);
    vec2 vortexB = vec2((0.86 - 0.5) * aspect, -0.02 + yShift);
    vec2 vortexC = vec2((0.7  - 0.5) * aspect, -0.24 + yShift);

    float vPulseA = 0.56 + 0.44 * sin(t * 1.07 + 0.3);
    float vPulseB = 0.52 + 0.48 * cos(t * 1.31 + 1.8);
    float vPulseC = 0.58 + 0.42 * sin(t * 0.91 + 3.1);
    float vBoost  = mix(0.8, 1.25, surge) * mix(1.0, 1.18, uHover);

    vec2 vw = applyVortex(warpedP, vortexA,  1.25 * vBoost, 0.34 * scale, vPulseA);
    vw      = applyVortex(vw,      vortexB, -1.1  * vBoost, 0.29 * scale, vPulseB);
    vw      = applyVortex(vw,      vortexC,  0.95 * vBoost, 0.32 * scale, vPulseC);
    warpedP = mix(warpedP, vw, rightActivity);

    // 鼠标交互
    vec2 mouse = (uPointer - 0.5) * vec2(aspect, 1.0);
    vec2 mouseDelta = mouse - warpedP;
    float mouseDist = length(mouseDelta);
    float mouseInf  = exp(-mouseDist * 4.6) * uHover * rightActivity;
    vec2  mouseDir  = mouseDelta / max(mouseDist, 0.001);
    warpedP += mouseDir * mouseInf * 0.085;
    warpedP += vec2(-mouseDelta.y, mouseDelta.x) * mouseInf * 0.035;

    vec2 parallax = (uPointer - 0.5) * vec2(aspect, 1.0) * 0.045 * uHover;

    // 5 个有机色场中心 (根据 coverage 下移)
    vec2 cHotPink = vec2(
      (0.8  + sin(t * 1.05) * 0.14 - 0.5) * aspect,
       0.1  + cos(t * 0.84) * 0.18 + yShift
    ) + parallax;
    vec2 cOrange = vec2(
      (0.73 + cos(t * 0.92 + 1.4) * 0.16 - 0.5) * aspect,
      -0.2  + sin(t * 1.16 + 0.8) * 0.17 + yShift
    ) + parallax * 0.7;
    vec2 cCoral = vec2(
      (0.68 + sin(t * 0.77 + 2.2) * 0.12 - 0.5) * aspect,
       0.02 + cos(t * 1.02) * 0.15 + yShift
    ) - parallax * 0.35;
    vec2 cViolet = vec2(
      (0.88 + cos(t * 1.21 + 2.8) * 0.1 - 0.5) * aspect,
      -0.02 + sin(t * 0.94 + 1.1) * 0.2 + yShift
    ) + parallax * 0.45;
    vec2 cPale = vec2(
      (0.6 + sin(t * 0.66) * 0.1 - 0.5) * aspect,
       cos(t * 0.72) * 0.12 + yShift
    );

    // 色场计算
    vec2 q;
    q = (warpedP - cHotPink) / scale;
    q = rotate2d(sin(t * 0.73) * 0.28) * q;
    q.x *= 0.56 + sin(t * 0.74) * 0.16;
    q.y *= 1.42 + cos(t * 0.61) * 0.22;
    q.y += sin(q.x * 5.6 + t * 1.8) * 0.22;
    q.x += cos(q.y * 4.8 - t * 1.2) * 0.16;
    q += flowB * 0.08;
    float hotPinkF = organicField(q, 3.3);

    q = (warpedP - cOrange) / scale;
    q = rotate2d(-0.34 + cos(t * 0.86) * 0.31) * q;
    q.x *= 0.72 + cos(t * 0.68) * 0.18;
    q.y *= 1.28 + sin(t * 0.93) * 0.24;
    q.x += sin(q.y * 6.2 - t * 1.6) * 0.18;
    q.y += cos(q.x * 4.3 + t * 1.35) * 0.2;
    q -= flowA * 0.09;
    float orangeF = organicField(q, 3.0);

    q = (warpedP - cCoral) / scale;
    q = rotate2d(0.2 + sin(t * 1.11) * 0.36) * q;
    q.x *= 0.88 + sin(t * 0.59) * 0.2;
    q.y *= 1.62 + cos(t * 0.81) * 0.27;
    q.y += sin(q.x * 6.8 - t * 1.05) * 0.16;
    q.x += cos(q.y * 5.2 + t * 1.43) * 0.13;
    q += flowC * 0.12;
    float coralF = organicField(q, 3.65);

    q = (warpedP - cViolet) / scale;
    q = rotate2d(-0.42 + cos(t * 0.7) * 0.45) * q;
    q.x *= 0.48 + sin(t * 0.88) * 0.12;
    q.y *= 2.05 + cos(t * 0.77) * 0.36;
    q.y += cos(q.x * 7.6 + t * 1.7) * 0.19;
    q.x += sin(q.y * 4.5 - t * 1.38) * 0.11;
    float violetF = organicField(q, 4.1);

    q = (warpedP - cPale) / scale;
    q = rotate2d(sin(t * 0.49) * 0.18) * q;
    q.x *= 0.54 + cos(t * 0.57) * 0.1;
    q.y *= 1.35 + sin(t * 0.64) * 0.18;
    q.y += sin(q.x * 4.1 + t * 0.92) * 0.18;
    float paleF = organicField(q, 2.15);

    // 折叠遮罩
    float foldSig = 0.5 + 0.5 * sin(warpedP.x * 4.8 - warpedP.y * 5.4 + t * 1.7 + flowC.x * 2.6);
    float foldMask = smoothstep(0.22, 0.82, foldSig);
    hotPinkF *= 0.7 + foldMask * 0.42;
    orangeF  *= 1.12 - foldMask * 0.3;
    coralF   *= 0.76 + (1.0 - foldMask) * 0.4;

    // 场能量
    float fieldEnergy = clamp(uIntensity, 0.3, 2.4) / 1.65;
    hotPinkF = clamp(hotPinkF * fieldEnergy * mix(0.86, 1.22, surge), 0.0, 1.0);
    orangeF  = clamp(orangeF  * fieldEnergy * mix(1.2, 0.82, surge), 0.0, 1.0);
    coralF   = clamp(coralF   * fieldEnergy * (0.9 + surgeB * 0.22), 0.0, 1.0);

    float vGate = smoothstep(0.28, 0.76, 0.5 + 0.5 * sin(t * 2.3 + flowB.y * 2.0));
    violetF = clamp(violetF * fieldEnergy * vGate * 1.15, 0.0, 1.0);
    paleF   = clamp(paleF   * mix(1.18, 0.76, surge) * fieldEnergy, 0.0, 1.0);

    // 色场主导
    float pinkD   = smoothstep(0.08, 0.78, hotPinkF - orangeF * 0.55 + surge * 0.2 + flowC.x * 0.08);
    float orangeD = smoothstep(0.06, 0.72, orangeF - hotPinkF * 0.45 + (1.0 - surge) * 0.22 - flowC.y * 0.08);
    float coralD  = smoothstep(0.08, 0.7, coralF - max(pinkD, orangeD) * 0.2 + foldMask * 0.14);

    // 流体遮罩 (全屏模式下更均匀，卡片模式下左白右彩)
    float maskN = flowA.x * 0.055 + flowB.y * 0.035;
    float maskStart = mix(0.28, -0.15, uFullscreen) + maskN;
    float maskEnd = mix(0.54, 0.15, uFullscreen) + maskN * 0.5;
    float fluidMask = smoothstep(maskStart, maskEnd, uv.x);

    // 雾场
    float hazeN = fbm(warpedP * 1.2 / scale + vec2(-t * 0.12, t * 0.08));
    float hazeW = 0.5 + 0.5 * sin(warpedP.x * 4.2 - warpedP.y * 2.8 + t * 1.0 + flowB.x);
    float hazeF = smoothstep(0.22, 0.78, hazeN * 0.55 + hazeW * 0.45);
    hazeF *= 1.0 - hotPinkF * 0.28;
    hazeF *= 1.0 - orangeF * 0.22;
    hazeF *= mix(1.15, 0.7, surge);
    float hazeRegion = smoothstep(0.28, 0.48, uv.x) * (1.0 - smoothstep(0.76, 0.98, uv.x));

    // 混色
    vec3 fluidColor = uBaseWhite;
    fluidColor = mix(fluidColor, uPaleCyan,     paleF * 0.58);
    fluidColor = mix(fluidColor, uBrightCyan,    coralD * coralF * 0.72);
    fluidColor = mix(fluidColor, uElectricBlue,  orangeD * 0.88);
    fluidColor = mix(fluidColor, uUltramarine,   pinkD * 0.88);
    fluidColor = mix(fluidColor, uDeepPurple,
      pinkD * hotPinkF * smoothstep(0.58, 1.0, surge) * 0.46);
    fluidColor = mix(fluidColor, uVividViolet,
      violetF * (1.0 - orangeD * 0.42) * 0.62);

    // 饱和度
    float sat = mix(1.0, 1.14, uHover) * mix(0.96, 1.12, surge);
    float lum = dot(fluidColor, vec3(0.2126, 0.7152, 0.0722));
    fluidColor = mix(vec3(lum), fluidColor, sat);

    vec3 color = mix(uBaseWhite, fluidColor, fluidMask);
    color = mix(color, uHighlight, hazeF * hazeRegion * (0.28 + (1.0 - surge) * 0.24));

    // 薄膜高光
    float filmHL = smoothstep(0.6, 0.92,
      0.5 + 0.5 * sin(warpedP.x * 3.6 + warpedP.y * 5.1 - t * 1.36 + flowC.y * 2.2)
    ) * smoothstep(0.48, 0.72, uv.x) * (1.0 - smoothstep(0.92, 1.0, uv.x));
    color = mix(color, uHighlight, filmHL * max(hotPinkF, orangeF) * mix(0.12, 0.24, uHover));

    // 左侧保持白色 (全屏模式下减弱)
    float leftClean = (1.0 - smoothstep(0.26, 0.43, uv.x)) * (1.0 - uFullscreen * 0.85);
    color = mix(color, uBaseWhite, leftClean * 0.985);
    color = clamp(color, 0.0, 1.0);

    // 垂直覆盖遮罩 — 从底部向上渐隐
    float revealMask = 1.0 - smoothstep(
      uCoverage - uEdgeSoftness * 0.5,
      uCoverage + uEdgeSoftness * 0.5,
      uv.y
    );
    color = mix(uBaseWhite, color, revealMask);

    gl_FragColor = vec4(color, 1.0);
  }
`

/* ───────── WebGL 初始化 ───────── */
let gl = null
let program = null
const uniforms = {}
let animId = null
let animTime = 0
let lastTs = 0

// 指针 & 悬停 平滑状态
const targetPointer = { x: 0.5, y: 0.5 }
const smoothedPointer = { x: 0.5, y: 0.5 }
let targetHover = 0
let smoothedHover = 0

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initWebGL() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return false

  gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })

  if (!gl) {
    webglSupported.value = false
    return false
  }

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) return false

  program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    return false
  }

  gl.useProgram(program)

  // 全屏四边形
  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  // 获取 uniform 位置
  const uniformNames = [
    'uTime',
    'uResolution',
    'uPointer',
    'uHover',
    'uSpeed',
    'uIntensity',
    'uFluidScale',
    'uFullscreen',
    'uCoverage',
    'uEdgeSoftness',
    'uBaseWhite',
    'uPaleCyan',
    'uBrightCyan',
    'uElectricBlue',
    'uUltramarine',
    'uDeepPurple',
    'uVividViolet',
    'uHighlight'
  ]
  uniformNames.forEach((name) => {
    uniforms[name] = gl.getUniformLocation(program, name)
  })

  // 初始清屏色
  const pal = PALETTES[props.palette] || PALETTES.ocean
  gl.clearColor(pal.baseWhite[0], pal.baseWhite[1], pal.baseWhite[2], 1)

  return true
}

/* ───────── 尺寸适配 ───────── */
function handleResize() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container || !gl) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = container.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  gl.viewport(0, 0, canvas.width, canvas.height)
}

/* ───────── 指针事件 ───────── */
function onPointerMove(e) {
  if (!props.interactive) return
  const rect = e.currentTarget.getBoundingClientRect()
  targetPointer.x = (e.clientX - rect.left) / rect.width
  targetPointer.y = 1 - (e.clientY - rect.top) / rect.height
}

function onPointerEnter() {
  if (!props.interactive) return
  targetHover = 1
}

function onPointerLeave() {
  targetHover = 0
  targetPointer.x = 0.5
  targetPointer.y = 0.5
}

/* ───────── 渲染循环 ───────── */
function animate(ts) {
  if (!gl || !program) return

  const delta = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
  lastTs = ts

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  animTime += delta * (reducedMotion ? 0.05 : 1)

  // 平滑插值
  smoothedHover += (targetHover - smoothedHover) * 0.07
  smoothedPointer.x += (targetPointer.x - smoothedPointer.x) * 0.06
  smoothedPointer.y += (targetPointer.y - smoothedPointer.y) * 0.06

  // 更新 uniform
  gl.uniform1f(uniforms.uTime, animTime)
  gl.uniform2f(
    uniforms.uResolution,
    canvasRef.value.width,
    canvasRef.value.height
  )
  gl.uniform2f(uniforms.uPointer, smoothedPointer.x, smoothedPointer.y)
  gl.uniform1f(uniforms.uHover, smoothedHover)
  gl.uniform1f(uniforms.uSpeed, props.speed)
  gl.uniform1f(uniforms.uIntensity, props.intensity)
  gl.uniform1f(uniforms.uFluidScale, props.fluidScale)
  gl.uniform1f(uniforms.uFullscreen, props.fullscreen ? 1.0 : 0.0)
  gl.uniform1f(uniforms.uCoverage, props.coverage)
  gl.uniform1f(uniforms.uEdgeSoftness, props.edgeSoftness)

  // 调色板颜色
  const pal = PALETTES[props.palette] || PALETTES.ocean
  gl.uniform3fv(uniforms.uBaseWhite, pal.baseWhite)
  gl.uniform3fv(uniforms.uPaleCyan, pal.paleCyan)
  gl.uniform3fv(uniforms.uBrightCyan, pal.brightCyan)
  gl.uniform3fv(uniforms.uElectricBlue, pal.electricBlue)
  gl.uniform3fv(uniforms.uUltramarine, pal.ultramarine)
  gl.uniform3fv(uniforms.uDeepPurple, pal.deepPurple)
  gl.uniform3fv(uniforms.uVividViolet, pal.vividViolet)
  gl.uniform3fv(uniforms.uHighlight, pal.highlight)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  if (document.visibilityState === 'visible') {
    animId = requestAnimationFrame(animate)
  }
}

/* ───────── 可见性切换 ───────── */
function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    lastTs = 0
    animId = requestAnimationFrame(animate)
  }
}

/* ───────── 生命周期 ───────── */
let resizeObserver = null

onMounted(() => {
  if (initWebGL()) {
    handleResize()

    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.value)

    document.addEventListener('visibilitychange', onVisibilityChange)
    animId = requestAnimationFrame(animate)
  }
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
  if (resizeObserver) resizeObserver.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)

  if (gl) {
    if (program) gl.deleteProgram(program)
    gl = null
  }
})
</script>

<style scoped>
.spectra-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.spectra-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.spectra-fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 82% 24%,
      rgb(151 45 235 / 86%),
      transparent 31%
    ),
    radial-gradient(
      circle at 72% 72%,
      rgb(18 221 242 / 82%),
      transparent 36%
    ),
    radial-gradient(
      circle at 61% 50%,
      rgb(31 90 255 / 72%),
      transparent 45%
    ),
    #fff;
}
</style>
