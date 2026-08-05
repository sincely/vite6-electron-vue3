<template>
  <div class="dashboard">
    <!-- 装饰性光斑 -->
    <div
      class="decorative-orb decorative-orb--primary"
      style=" top: -60px; right: 10%;width: 200px; height: 200px"
    />
    <div
      class="decorative-orb decorative-orb--violet"
      style=" bottom: 20%; left: -40px;width: 160px; height: 160px"
    />

    <section class="hero glass-card">
      <div class="hero-content">
        <h2 class="hero-title">仪表板</h2>
        <p class="hero-subtitle">
          欢迎回来，这里展示当前模型服务状态与请求概况。
        </p>
      </div>
      <div class="hero-tags">
        <span class="hero-tag hero-tag--success">
          <span class="tag-dot" style="background: var(--color-success)" />
          在线 8 节点
        </span>
        <span class="hero-tag hero-tag--info">
          <span class="tag-dot" style="background: var(--color-cyan)" />
          延迟 42ms
        </span>
        <span class="hero-tag hero-tag--warning">
          <span class="tag-dot" style="background: var(--color-success)" />
          错误率 0.1%
        </span>
      </div>
    </section>

    <section class="stats-grid">
      <article
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="stat-card glass-card hover-colorful"
        :style="{
          '--stat-color': stat.color,
          animationDelay: `${index * 0.08}s`
        }"
      >
        <div class="stat-card-header">
          <div
            class="stat-card-icon-bg"
            :style="{
              background: `linear-gradient(135deg, ${stat.color}, ${stat.colorEnd || stat.color})`,
              color: '#fff'
            }"
          >
            <i :class="['stat-card-icon', stat.icon]" />
          </div>
          <span class="stat-card-label">{{ stat.label }}</span>
        </div>
        <div class="stat-card-value">{{ stat.value }}</div>
        <div class="stat-card-sub">
          <span :style="{ color: stat.color }">
            {{ stat.sub.split(' ')[0] }}
          </span>
          {{ stat.sub.split(' ').slice(1).join(' ') }}
        </div>
        <div class="stat-card-line">
          <span
            :style="{
              width: stat.line,
              background: `linear-gradient(90deg, ${stat.color}, ${stat.colorEnd || stat.color}88, transparent)`
            }"
          />
        </div>
      </article>
    </section>

    <section class="dashboard-bottom">
      <article class="panel glass-card">
        <div class="panel-header">
          <div class="panel-icon-bg">
            <i class="i-lucide-link panel-icon" />
          </div>
          <span class="panel-title">API 端点</span>
        </div>
        <div class="endpoint">
          <code class="endpoint-url">{{ endpoint }}</code>
          <button class="endpoint-copy" title="复制" @click="copyEndpoint">
            <i class="i-lucide-copy" />
          </button>
        </div>
      </article>

      <article class="panel panel-activity glass-card">
        <div class="panel-header">
          <div class="panel-icon-bg">
            <i class="i-lucide-activity panel-icon" />
          </div>
          <span class="panel-title">最近活动</span>
        </div>
        <ul class="activity-list">
          <li
            v-for="item in activities"
            :key="item.title"
            class="activity-item"
          >
            <span
              class="activity-dot"
              :style="{ backgroundColor: item.color }"
            />
            <div class="activity-text">
              <p class="activity-title">{{ item.title }}</p>
              <p class="activity-time">{{ item.time }}</p>
            </div>
          </li>
        </ul>
      </article>
    </section>

    <card>
      <template v-slot:header>11</template>
      <template v-slot:content>11</template>
    </card>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const endpoint = 'http://127.0.0.1:18317/v1'

const stats = [
  {
    label: '账户',
    icon: 'i-lucide-users',
    value: '2',
    sub: '+0 就绪',
    color: '#f97316',
    colorEnd: '#fb923c',
    line: '84%'
  },
  {
    label: '请求',
    icon: 'i-lucide-arrow-up-down',
    value: '1,024',
    sub: '+12% 较昨日',
    color: '#10b981',
    colorEnd: '#34d399',
    line: '72%'
  },
  {
    label: '令牌',
    icon: 'i-lucide-coins',
    value: '8.5k',
    sub: '已消耗',
    color: '#7c3aed',
    colorEnd: '#a78bfa',
    line: '66%'
  },
  {
    label: '成功率',
    icon: 'i-lucide-check-circle',
    value: '99.9%',
    sub: '0 失败',
    color: '#06b6d4',
    colorEnd: '#22d3ee',
    line: '92%'
  }
]

const activities = [
  {
    title: 'Provider-1 同步完成',
    time: '2 分钟前',
    color: 'var(--color-success)'
  },
  {
    title: '自动更新检查已执行',
    time: '7 分钟前',
    color: 'var(--color-cyan)'
  },
  {
    title: '代理配置变更已发布',
    time: '20 分钟前',
    color: 'var(--color-violet)'
  }
]

const copyEndpoint = async () => {
  await navigator.clipboard.writeText(endpoint)
  ElMessage.success('端点地址已复制')
}
</script>

<style lang="scss" scoped>
.dashboard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100%;
  padding: 2px;
  overflow: hidden;
}

.hero {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-radius: var(--radius-xl);
}

.hero-title {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.hero-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tag {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-bg-input), transparent 18%);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 35%);
  border-radius: 999px;
  transition: all 0.25s ease;

  .tag-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px color-mix(in srgb, currentcolor, transparent 80%);
  }

  &:hover {
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.stat-card {
  padding: 16px;
  border-radius: var(--radius-lg);
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease;
  animation: pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:hover {
    box-shadow: 0 8px 20px -4px
      color-mix(
        in srgb,
        var(--stat-color, var(--color-primary)),
        transparent 60%
      );
    transform: translate3d(0, -4px, 0);
  }

  &-header {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-icon-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 12px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    .stat-card:hover & {
      transform: scale(1.1) rotate(-5deg);
    }
  }

  &-icon {
    font-size: 16px;
  }

  &-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &-value {
    margin-top: 12px;
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &-sub {
    margin-top: 3px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-line {
    height: 4px;
    margin-top: 13px;
    overflow: hidden;
    background: color-mix(in srgb, var(--color-border), transparent 24%);
    border-radius: 99px;

    > span {
      display: block;
      height: 100%;
      border-radius: 99px;
      transition: width 0.35s ease;
    }
  }
}

.dashboard-bottom {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
}

.panel {
  padding: 18px;
  border-radius: var(--radius-lg);

  &-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
  }

  &-icon-bg {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 86%);
    border: 1px solid color-mix(in srgb, var(--color-primary), transparent 65%);
    border-radius: 10px;
  }

  &-icon {
    font-size: 15px;
  }

  &-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-primary);
  }
}

.endpoint {
  display: flex;
  align-items: center;
  padding: 4px;
  background-color: color-mix(in srgb, var(--color-bg-input), transparent 16%);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 28%);
  border-radius: 12px;

  &-url {
    flex: 1;
    padding: 8px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: var(--color-text-primary);
  }

  &-copy {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    margin-right: 2px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      color: var(--color-primary);
      background-color: color-mix(
        in srgb,
        var(--color-bg-hover),
        transparent 15%
      );
    }
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: none;
}

.activity-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 9px 10px;
  background: color-mix(in srgb, var(--color-bg-input), transparent 20%);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 36%);
  border-radius: 12px;
}

.activity-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px color-mix(in srgb, currentcolor, transparent 80%);
  animation: pulse-ring 3s ease-in-out infinite;
}

.activity-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.activity-time {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-muted);
}

@media (width <= 1024px) {
  .dashboard-bottom {
    grid-template-columns: 1fr;
  }
}

@media (width <= 640px) {
  .hero {
    padding: 14px;
  }

  .hero-title {
    font-size: 22px;
  }
}
</style>
