<template>
  <div class="svg-loading">
    <svg class="circular" viewBox="25 25 50 50">
      <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.svg-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translate(-50%, -50%);

  .circular {
    width: 42px;
    height: 42px;
    transform-origin: center center;
    animation: rotate 2s linear infinite;
  }

  .path {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation:
      dash 1.5s ease-in-out infinite,
      color 6s ease-in-out infinite;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }

  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
}

@keyframes color {
  100%,
  0% {
    stroke: var(--color-text-active);
  }

  40% {
    stroke: var(--color-text-link);
  }

  66% {
    stroke: var(--color-success);
  }

  80%,
  90% {
    stroke: var(--color-warning);
  }
}
</style>
