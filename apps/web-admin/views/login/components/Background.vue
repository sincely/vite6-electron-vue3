<template>
  <div class="background-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
const canvasRef = ref(null)
let animationFrameId = null

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const stars = []
  const numStars = 200

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      vx: Math.random() * 0.4 - 0.2,
      vy: Math.random() * 0.4 - 0.2
    })
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0c0f1a' // Dark blue background
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = '#ffffff'
    stars.forEach((star) => {
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fill()

      star.x += star.vx
      star.y += star.vy

      if (star.x < 0 || star.x > width) star.vx = -star.vx
      if (star.y < 0 || star.y > height) star.vy = -star.vy
    })

    animationFrameId = requestAnimationFrame(draw)
  }

  draw()

  const handleResize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }

  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style scoped>
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
}
</style>
