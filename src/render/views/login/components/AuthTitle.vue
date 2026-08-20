<template>
  <div class="auth-title">
    <h2 class="title">
      <slot />
    </h2>
    <p class="desc">
      <slot name="desc" />
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: 'AuthTitle' })
</script>

<style lang="scss" scoped>
.auth-title {
  margin-bottom: 24px;

  .title {
    margin-bottom: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
  }

  .desc {
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-muted);
  }
}
</style>
