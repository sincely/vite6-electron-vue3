<template>
  <div
    class="global-search"
    :class="{ 'is-active': isFocused || showDropdown }"
  >
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
      @blur="handleBlur"
      @keydown.esc="handleEsc"
      @keydown.enter.prevent="goFirst"
    />
    <transition name="fade">
      <button
        v-if="keyword"
        type="button"
        class="global-search__clear"
        @click="clearKeyword"
      >
        <SvgIcon icon-class="close" width="12px" height="12px" />
      </button>
    </transition>

    <transition name="fade">
      <div v-if="showDropdown" class="global-search__panel">
        <button
          v-for="item in filteredMenus"
          :key="item.path"
          type="button"
          class="global-search__item"
          @mousedown.prevent="goTo(item)"
        >
          <span class="global-search__item-title">{{ item.title }}</span>
          <span class="global-search__item-path">{{ item.path }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { asyncRoutes } from '@/router'

const keyword = ref('')
const isFocused = ref(false)
const router = useRouter()

const menuList = computed(() => {
  const map = new Map()

  asyncRoutes.forEach((route) => {
    const title = route.meta?.title
    const path = route.path

    if (!title || !path) return
    if (route.meta?.noLayout) return
    if (!route.name) return

    if (!map.has(path)) {
      map.set(path, { title, path })
    }
  })

  return Array.from(map.values())
})

const filteredMenus = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return []

  return menuList.value
    .filter((item) => {
      return (
        item.title.toLowerCase().includes(kw) ||
        item.path.toLowerCase().includes(kw)
      )
    })
    .slice(0, 8)
})

const showDropdown = computed(() => {
  return isFocused.value && filteredMenus.value.length > 0
})

const clearKeyword = () => {
  keyword.value = ''
}

const handleEsc = () => {
  keyword.value = ''
  isFocused.value = false
}

const handleBlur = () => {
  isFocused.value = false
}

const goTo = (item) => {
  router.push(item.path)
  keyword.value = ''
  isFocused.value = false
}

const goFirst = () => {
  if (!filteredMenus.value.length) return
  goTo(filteredMenus.value[0])
}
</script>

<style lang="scss" scoped>
.global-search {
  position: relative;
  display: flex;
  gap: 7px;
  align-items: center;
  min-width: 140px;
  max-width: 240px;
  height: 30px;
  padding: 0 10px;
  background: color-mix(in srgb, var(--color-bg-input), transparent 30%);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 35%);
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
    color: var(--color-text-secondary);
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
    color: var(--color-text-secondary);
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

  &__panel {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    left: auto;
    z-index: 20;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 260px;
    padding: 6px;
    overflow-y: auto;
    background: var(--color-bg-card);
    border: 1px solid color-mix(in srgb, var(--color-border), transparent 35%);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }

  &__item {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 7px 8px;
    color: var(--color-text-primary);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--color-bg-hover);
    }
  }

  &__item-title {
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-path {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--color-text-muted);
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
