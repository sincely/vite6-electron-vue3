<template>
  <!-- 标题栏面包屑：仅在存在两级及以上层级时显示（参照 art-design-pro） -->
  <nav
    v-if="breadcrumbs.length > 1"
    class="global-breadcrumb"
    aria-label="breadcrumb"
  >
    <ul class="breadcrumb-track">
      <li
        v-for="(crumb, idx) in breadcrumbs"
        :key="`${crumb.path}-${idx}`"
        class="breadcrumb-item"
      >
        <span
          class="breadcrumb-label"
          :class="{ 'is-link': !isLast(idx), 'is-current': isLast(idx) }"
          :aria-current="isLast(idx) ? 'page' : undefined"
          @click="handleClick(crumb, idx)"
        >
          {{ crumb.title }}
        </span>
        <span v-if="!isLast(idx)" class="breadcrumb-sep" aria-hidden="true">
          /
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 基于 route.matched 生成面包屑链路：父级菜单 -> 当前页面
// - 跳过没有 title 的层级
// - 仅合并 path 与 title 均相同的连续层级（如同名分组路由与其默认子路由）；
//   空路径默认子路由与父级 path 相同但 title 不同时正常保留（如 仪表板/工作台）
const breadcrumbs = computed(() => {
  const items = []
  for (const record of route.matched) {
    const title = record.meta?.title
    if (!title) continue
    const prev = items[items.length - 1]
    if (prev && prev.path === record.path && prev.title === title) continue
    items.push({ path: record.path, title })
  }
  return items
})

const isLast = (idx) => idx === breadcrumbs.value.length - 1

// 点击中间层级跳转到对应路由（带 redirect 的分组路由会自动解析到首个子页面）
const handleClick = (crumb, idx) => {
  if (isLast(idx) || crumb.path === route.path) return
  router.push(crumb.path).catch(() => {})
}
</script>

<style lang="scss" scoped>
.global-breadcrumb {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  padding-left: 10px;
  overflow: hidden;
  -webkit-app-region: no-drag;

  .breadcrumb-track {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .breadcrumb-item {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    min-width: 0;
    font-size: 13px;
    white-space: nowrap;

    &:last-child {
      flex-shrink: 1;
      overflow: hidden;
    }
  }

  .breadcrumb-label {
    max-width: 180px;
    padding: 4px 8px;
    overflow: hidden;
    color: var(--color-text-secondary);
    text-overflow: ellipsis;
    border-radius: var(--radius-sm);
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &.is-link {
      cursor: pointer;

      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-hover);
      }

      &:active {
        background: var(--color-bg-active);
      }
    }

    &.is-current {
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  .breadcrumb-sep {
    margin: 0 2px;
    color: var(--color-text-muted);
    user-select: none;
    opacity: 0.6;
  }
}
</style>
