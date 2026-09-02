<template>
  <div class="nested-demo">
    <div class="nested-demo-hero glass-card">
      <div class="hero-title">
        <Icon icon="lucide:list-tree" width="22px" height="22px" />
        <span>{{ title }}</span>
      </div>
      <p class="hero-desc">{{ description }}</p>

      <!-- 菜单层级链路 -->
      <div class="level-trail">
        <div
          v-for="(level, idx) in levels"
          :key="level"
          class="level-node"
          :class="{ 'is-current': idx === levels.length - 1 }"
        >
          <span class="level-tag">L{{ idx + 1 }}</span>
          <span class="level-name">{{ level }}</span>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">菜单层级</span>
          <span class="meta-value">{{ levels.length }} 级</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">当前路由</span>
          <span class="meta-value meta-code">{{ currentPath }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">路由模式</span>
          <span class="meta-value">无组件透传分组 + redirect</span>
        </div>
      </div>
    </div>

    <div class="nested-demo-tips glass-card">
      <div class="tips-title">多级菜单配置说明</div>
      <ul class="tips-list">
        <li>
          路由通过
          <code>meta.group</code>
          声明所属父级路径，父级可以是任意层级， 菜单树由
          <code>config/menu.js</code>
          递归构建。
        </li>
        <li>
          中间分组路由不配置
          <code>component</code>
          ，vue-router 会跳过该层级，页面直接渲染在布局的 router-view
          中，keep-alive 缓存不受影响。
        </li>
        <li>
          侧边栏、双列菜单、混合模式子菜单列与顶部下拉菜单均已支持多级嵌套展开，
          可在右上角设置中切换布局模式查看效果。
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

defineProps({
  // 当前页面对应的菜单标题，如「菜单 1-1」
  title: {
    type: String,
    required: true
  },
  // 从一级菜单到当前页的层级链路
  levels: {
    type: Array,
    required: true
  },
  description: {
    type: String,
    default:
      '这是一个嵌套菜单演示页面，用于展示三级菜单的路由组织与各布局下的渲染效果。'
  }
})

const route = useRoute()
const currentPath = computed(() => route.path)
</script>

<style lang="scss" scoped>
.nested-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nested-demo-hero {
  padding: 28px;
  border-radius: var(--radius-lg);
}

.hero-title {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);

  :deep(svg) {
    color: var(--color-primary);
  }
}

.hero-desc {
  margin: 10px 0 24px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.level-trail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.level-node {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  // 层级间的连接箭头
  &:not(:last-child)::after {
    position: absolute;
    right: -10px;
    width: 12px;
    color: var(--color-text-muted);
    content: '›';
  }

  &.is-current {
    background: var(--brand-accent-soft);
    border-color: color-mix(in srgb, var(--color-primary), transparent 60%);

    .level-name {
      color: var(--color-primary);
    }
  }
}

.level-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 18px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg-hover);
  border-radius: 4px;
}

.level-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding-top: 20px;
  margin-top: 24px;
  border-top: 1px solid var(--color-border-light);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.meta-code {
  padding: 2px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.nested-demo-tips {
  padding: 24px 28px;
  border-radius: var(--radius-lg);
}

.tips-title {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.tips-list {
  padding-left: 18px;
  margin: 0;
  font-size: 13px;
  line-height: 2;
  color: var(--color-text-secondary);

  code {
    padding: 1px 6px;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    color: var(--color-primary);
    background: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: 4px;
  }
}
</style>
