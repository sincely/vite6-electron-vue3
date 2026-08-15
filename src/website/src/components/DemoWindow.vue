<script setup>
const menus = [
  { icon: 'console', label: '工作台', active: true },
  { icon: 'board', label: '数据看板', active: false },
  { icon: 'analysis', label: '分析页', active: false },
  { icon: 'table', label: '高级表格', active: false },
  { icon: 'system', label: '系统管理', active: false }
]

const stats = [
  { label: '访问量', value: '128,430', trend: '+12.5%', up: true },
  { label: '活跃用户', value: '8,294', trend: '+5.2%', up: true },
  { label: '订单量', value: '2,517', trend: '-1.8%', up: false },
  { label: '转化率', value: '32.8%', trend: '+3.1%', up: true }
]

const bars = [42, 68, 55, 82, 63, 90, 74, 96, 58, 78, 86, 70]
</script>

<template>
  <section class="demo-section">
    <div class="container">
      <div class="demo-window" role="img" aria-label="Lightning 应用界面预览">
        <!-- 窗口标题栏 -->
        <div class="window-bar">
          <span class="dot red" />
          <span class="dot yellow" />
          <span class="dot green" />
          <div class="window-title">Lightning — 工作台</div>
        </div>

        <div class="window-body">
          <!-- 侧边菜单 -->
          <aside class="sider">
            <div class="sider-logo">
              <img src="/logo.svg" alt="" class="sider-logo-img" />
              <span class="sider-logo-text">Lightning</span>
            </div>
            <ul class="menu">
              <li
                v-for="item in menus"
                :key="item.label"
                class="menu-item"
                :class="{ active: item.active }"
              >
                <span class="menu-icon" :data-icon="item.icon" />
                <span class="menu-label">{{ item.label }}</span>
              </li>
            </ul>
          </aside>

          <!-- 主区域 -->
          <div class="main">
            <div class="topbar">
              <div class="tags">
                <span class="tag active">工作台</span>
                <span class="tag">数据看板</span>
                <span class="tag">分析页</span>
              </div>
              <div class="topbar-right">
                <span class="search-box">搜索菜单</span>
                <span class="avatar" />
              </div>
            </div>

            <div class="content">
              <div class="stat-grid">
                <div v-for="s in stats" :key="s.label" class="stat-card">
                  <div class="stat-label">{{ s.label }}</div>
                  <div class="stat-value">{{ s.value }}</div>
                  <div class="stat-trend" :class="{ up: s.up, down: !s.up }">
                    {{ s.trend }}
                  </div>
                </div>
              </div>

              <div class="panel-row">
                <div class="panel chart-panel">
                  <div class="panel-header">
                    <span class="panel-title">访问趋势</span>
                    <span class="panel-extra">近 12 周</span>
                  </div>
                  <svg
                    class="line-chart"
                    viewBox="0 0 480 160"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0"
                          stop-color="#597ef7"
                          stop-opacity="0.35"
                        />
                        <stop
                          offset="1"
                          stop-color="#597ef7"
                          stop-opacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 120 L44 96 L88 108 L132 72 L176 84 L220 52 L264 66 L308 38 L352 56 L396 30 L440 44 L480 22 L480 160 L0 160 Z"
                      fill="url(#areaFill)"
                    />
                    <path
                      d="M0 120 L44 96 L88 108 L132 72 L176 84 L220 52 L264 66 L308 38 L352 56 L396 30 L440 44 L480 22"
                      fill="none"
                      stroke="#597ef7"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>

                <div class="panel bar-panel">
                  <div class="panel-header">
                    <span class="panel-title">周活跃</span>
                    <span class="panel-extra">单位: 千</span>
                  </div>
                  <div class="bars">
                    <span
                      v-for="(h, i) in bars"
                      :key="i"
                      class="bar-item"
                      :style="{ height: h + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo-section {
  padding: clamp(40px, 6vw, 80px) 0 0;
}

.demo-window {
  overflow: hidden;
  background: #101216;
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 2%),
    0 30px 80px rgb(0 0 0 / 55%),
    0 0 120px rgb(89 126 247 / 8%);
}

/* 标题栏 */
.window-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  background: #16181d;
  border-bottom: 1px solid var(--border);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red {
  background: #ff5f57;
}

.dot.yellow {
  background: #febc2e;
}

.dot.green {
  background: #28c840;
}

.window-title {
  margin-left: 12px;
  font-size: 12.5px;
  color: var(--text-tertiary);
}

/* 主体布局 */
.window-body {
  display: flex;
  min-height: 460px;
}

/* 侧边菜单 */
.sider {
  flex-shrink: 0;
  width: 200px;
  padding: 14px 10px;
  background: #0e1013;
  border-right: 1px solid var(--border);
}

.sider-logo {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 10px 16px;
}

.sider-logo-img {
  width: 22px;
  height: 22px;
}

.sider-logo-text {
  font-size: 13.5px;
  font-weight: 700;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 9px 12px;
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: 8px;
}

.menu-item.active {
  color: #cdd9fd;
  background: linear-gradient(
    90deg,
    rgb(37 99 235 / 28%),
    rgb(37 99 235 / 10%)
  );
}

.menu-icon {
  width: 14px;
  height: 14px;
  background: currentcolor;
  border-radius: 4px;
  opacity: 0.65;
}

.menu-item.active .menu-icon {
  background: #8babfb;
  opacity: 1;
}

/* 主区域 */
.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  font-size: 11.5px;
  color: var(--text-tertiary);
  white-space: nowrap;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.tag.active {
  color: #cdd9fd;
  background: rgb(37 99 235 / 22%);
  border-color: rgb(89 126 247 / 50%);
}

.topbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box {
  padding: 5px 14px;
  font-size: 11.5px;
  color: var(--text-tertiary);
  white-space: nowrap;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
}

.avatar {
  width: 26px;
  height: 26px;
  background: var(--brand-gradient);
  border-radius: 50%;
}

/* 内容 */
.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 14px;
  background: #16181d;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.stat-label {
  font-size: 11.5px;
  color: var(--text-tertiary);
}

.stat-value {
  margin-top: 6px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.stat-trend {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
}

.stat-trend.up {
  color: #34d399;
}

.stat-trend.down {
  color: #f87171;
}

.panel-row {
  display: grid;
  flex: 1;
  grid-template-columns: 3fr 2fr;
  gap: 12px;
}

.panel {
  display: flex;
  flex-direction: column;
  padding: 14px;
  background: #16181d;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.panel-title {
  font-size: 12.5px;
  font-weight: 600;
}

.panel-extra {
  font-size: 11px;
  color: var(--text-tertiary);
}

.line-chart {
  flex: 1;
  width: 100%;
  min-height: 120px;
}

.bars {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: flex-end;
  min-height: 120px;
}

.bar-item {
  flex: 1;
  background: linear-gradient(180deg, #8babfb, #2563eb);
  border-radius: 4px 4px 2px 2px;
  opacity: 0.9;
}

@media (width <= 860px) {
  .sider {
    width: 150px;
  }

  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 640px) {
  .window-body {
    min-height: 0;
  }

  .sider {
    display: none;
  }

  .panel-row {
    grid-template-columns: 1fr;
  }

  .bar-panel {
    display: none;
  }

  .tag:nth-child(3) {
    display: none;
  }

  .search-box {
    display: none;
  }
}
</style>
