<template>
  <div class="global-search" :class="{ 'is-active': isFocused }">
    <SvgIcon
      icon-class="search"
      class="global-search__icon"
      width="14px"
      height="14px"
    />
    <input
      v-model="keyword"
      class="global-search__input"
      placeholder="搜索菜单..."
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown.esc="keyword = ''"
    />
    <transition name="fade">
      <button v-if="keyword" class="global-search__clear" @click="keyword = ''">
        <SvgIcon icon-class="x" width="12px" height="12px" />
      </button>
    </transition>
  </div>
</template>

<script setup>
const keyword = ref('')
const isFocused = ref(false)
</script>

<style lang="scss" scoped>
.global-search {
  display: flex;
  gap: 7px;
  align-items: center;
  min-width: 130px;
  max-width: 220px;
  height: 30px;
  padding: 0 10px;
  background: color-mix(in srgb, var(--color-bg-input), transparent 30%);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 45%);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &.is-active {
    min-width: 220px;
    border-color: color-mix(in srgb, var(--color-primary), transparent 30%);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-primary), transparent 80%);
  }

  &__icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: color 0.2s;

    .is-active & {
      color: var(--color-primary);
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    outline: none;

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  &__clear {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);
    border: none;
    border-radius: 50%;
    transition: all 0.15s ease;

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
