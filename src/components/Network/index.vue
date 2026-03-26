<template>
  <div class="loading">
    <svg width="24px" height="14px">
      <polyline
        id="back"
        points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
      ></polyline>
      <polyline
        id="front"
        points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
      ></polyline>
    </svg>
  </div>
</template>

<style scoped>
.loading svg polyline {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.loading svg polyline#back {
  fill: none;
  stroke: #ff4d5033;
}

.loading svg polyline#front {
  fill: none;
  stroke: #ff4d4f;
  stroke-dasharray: 48, 144;
  stroke-dashoffset: 192;
  animation: dash_682 1.4s linear infinite;
}

@keyframes dash_682 {
  72.5% {
    opacity: 0;
  }

  100% {
    stroke-dashoffset: 0;
  }
}
</style>
