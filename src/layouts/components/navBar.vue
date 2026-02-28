<template>
  <div class="nav-bar">
    <!-- 面包屑导航 -->
    <div class="nav-bar-breadcrumb">
      <template v-for="(crumb, idx) in breadcrumb" :key="crumb.route">
        <!-- 分隔符（第一项之后出现） -->
        <SvgIcon v-if="idx > 0" icon-class="lucide-chevron-right" class="nav-bar-sep" width="16px" height="16px" />
        <!-- 面包屑节点 -->
        <span
          class="nav-bar-crumb"
          :class="{
            'nav-bar-crumb-active': idx === breadcrumb.length - 1,
            'nav-bar-crumb-link': idx < breadcrumb.length - 1
          }"
          @click="idx < breadcrumb.length - 1 ? router.push(crumb.route) : undefined"
        >
          <!-- 仅第一个节点显示图标 -->
          <SvgIcon
            v-if="idx === 0 && crumb.icon"
            :icon-class="crumb.icon"
            class="nav-bar-icon"
            width="16px"
            height="16px"
          />
          {{ crumb.label }}
        </span>
      </template>

      <!-- 无匹配时的降级展示 -->
      <span v-if="!breadcrumb.length" class="nav-bar-crumb nav-bar-crumb-active">
        {{ route.name ?? route.path }}
      </span>
    </div>

    <!-- 右侧插槽，供各页面扩展 -->
    <div class="nav-bar-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { findMenuPath } from '@/config/menu'

const route = useRoute()
const router = useRouter()

// 根据当前路由计算面包屑链路 [一级] 或 [一级, 二级]
const breadcrumb = computed(() => findMenuPath(route.path))
</script>

<style lang="scss" scoped>
.nav-bar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background-color: var(--color-bg-content);
  border-bottom: 1px solid var(--color-border);

  &-breadcrumb {
    display: flex;
    gap: 4px;
    align-items: center;
    min-width: 0;
  }

  &-sep {
    flex-shrink: 0;
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  &-crumb {
    display: flex;
    gap: 6px;
    align-items: center;
    max-width: 200px;
    overflow: hidden;
    font-size: 13px;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;

    &-active {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-link {
      cursor: pointer;
      transition: color 0.15s ease;

      &:hover {
        color: var(--color-text-primary);
      }
    }
  }

  &-icon {
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  &-extra {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
  }
}
</style>
