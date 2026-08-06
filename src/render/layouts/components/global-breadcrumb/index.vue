<template>
  <Card class="nav-bar">
    <template #content>
      <div class="nav-bar-content">
        <!-- 面包屑导航 -->
        <div class="nav-bar-breadcrumb">
          <div class="nav-bar-breadcrumb-track">
            <template v-for="(crumb, idx) in breadcrumb" :key="crumb.route">
              <SvgIcon
                v-if="idx > 0"
                icon-class="chevron-right"
                class="nav-bar-sep"
                width="14px"
                height="14px"
              />
              <span
                class="nav-bar-crumb"
                :class="{
                  'nav-bar-crumb-active': idx === breadcrumb.length - 1,
                  'nav-bar-crumb-link': idx < breadcrumb.length - 1
                }"
                @click="
                  idx < breadcrumb.length - 1
                    ? router.push(crumb.route)
                    : undefined
                "
              >
                <SvgIcon
                  v-if="idx === 0 && crumb.icon"
                  :icon-class="crumb.icon"
                  class="nav-bar-icon"
                  width="14px"
                  height="14px"
                />
                <span class="nav-bar-crumb-label">{{ crumb.label }}</span>
              </span>
            </template>

            <span
              v-if="!breadcrumb.length"
              class="nav-bar-crumb nav-bar-crumb-active"
            >
              <span class="nav-bar-crumb-label">
                {{ route.name ?? route.path }}
              </span>
            </span>
          </div>
        </div>

        <!-- 右侧插槽，供各页面扩展 -->
        <div class="nav-bar-extra">
          <slot name="extra" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { findMenuPath } from '@/config/menu'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 根据当前路由计算面包屑链路 [一级] 或 [一级, 二级]
const breadcrumb = computed(() => findMenuPath(route.path))
</script>

<style lang="scss" scoped>
.nav-bar {
  margin: 12px 26px 0;

  :deep(.card-container) {
    padding: 12px 16px;
    border-radius: var(--radius-lg);
  }

  &-content {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    min-height: 32px;
  }

  &-breadcrumb {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
  }

  &-breadcrumb-track {
    display: flex;
    gap: 4px;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    padding: 4px;
    overflow: hidden;
    background: var(--color-bg-hover);
    border: 1px solid var(--color-border-light);
    border-radius: 999px;
  }

  &-sep {
    flex-shrink: 0;
    color: var(--color-text-muted);
    opacity: 0.65;
  }

  &-crumb {
    display: flex;
    gap: 6px;
    align-items: center;
    max-width: 240px;
    min-height: 32px;
    padding: 0 10px;
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid transparent;
    border-radius: 999px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &-active {
      font-weight: 600;
      color: var(--color-primary);
      background: var(--brand-accent-soft);
      border-color: color-mix(in srgb, var(--color-primary), transparent 40%);
    }

    &-link {
      cursor: pointer;

      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-hover);
        border-color: var(--color-border-light);
      }
    }
  }

  &-crumb-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-icon {
    flex-shrink: 0;
    color: var(--color-text-primary);
  }

  &-extra {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }
}

@media (width <=960px) {
  .nav-bar {
    margin-inline: 10px;

    &-breadcrumb-track {
      max-width: 100%;
    }

    &-crumb {
      max-width: 150px;
      padding-inline: 8px;
    }
  }
}
</style>
