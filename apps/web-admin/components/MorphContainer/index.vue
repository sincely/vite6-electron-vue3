<template>
  <div
    class="morph-container"
    :class="[`is-${variant}`, { 'is-expanded': expanded }]"
    :style="containerStyle"
    role="button"
    tabindex="0"
    :aria-expanded="expanded"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <Transition name="morph-fade" mode="out-in">
      <div v-if="!expanded" :key="`${variant}-compact`" class="morph-state">
        <!-- 1. 圆点变胶囊 -->
        <template v-if="variant === 'dot-capsule'">
          <span class="dot-capsule__dot" aria-hidden="true"></span>
          <span class="morph-state__label">待处理</span>
          <span class="morph-state__hint">点击展开</span>
        </template>

        <!-- 2. 胶囊变为信息卡 -->
        <template v-else-if="variant === 'capsule-card'">
          <span class="capsule-card__count">3</span>
          <span class="morph-state__label">条新动态</span>
          <Icon icon="lucide:arrow-up-right" width="16" aria-hidden="true" />
        </template>

        <!-- 3. 紧凑态展开 -->
        <template v-else-if="variant === 'compact-expand'">
          <span class="compact-expand__icon">
            <Icon icon="lucide:sparkles" width="17" aria-hidden="true" />
          </span>
          <span class="morph-state__label">快速操作</span>
          <span class="morph-state__hint">⌘ K</span>
        </template>

        <!-- 4. 圆角形态过渡 -->
        <template v-else-if="variant === 'rounded-transition'">
          <span class="rounded-transition__time">12:40</span>
          <span class="morph-state__label">午间专注</span>
        </template>

        <!-- 5. 尺寸变形 -->
        <template v-else-if="variant === 'size-transform'">
          <span class="size-transform__value">38%</span>
          <span class="morph-state__label">本周进度</span>
          <span class="size-transform__mini-bar"><i></i></span>
        </template>

        <!-- 6. 内容重排 -->
        <template v-else-if="variant === 'content-reflow'">
          <span class="content-reflow__avatar">Z</span>
          <span class="morph-state__label">周报摘要</span>
          <span class="morph-state__hint">4 项</span>
        </template>

        <!-- 7. 反向收回 -->
        <template v-else>
          <span class="reverse-retract__chevron">
            <Icon icon="lucide:chevron-up" width="16" aria-hidden="true" />
          </span>
          <span class="morph-state__label">展开预览</span>
          <span class="morph-state__hint">收回动效</span>
        </template>
      </div>

      <div
        v-else
        :key="`${variant}-expanded`"
        class="morph-state morph-state--expanded"
      >
        <!-- 1. 圆点变胶囊 -->
        <template v-if="variant === 'dot-capsule'">
          <span
            class="dot-capsule__dot dot-capsule__dot--active"
            aria-hidden="true"
          ></span>
          <div class="morph-state__copy">
            <strong>同步完成</strong>
            <span>所有内容都已更新</span>
          </div>
          <span class="state-badge state-badge--success">完成</span>
        </template>

        <!-- 2. 胶囊变为信息卡 -->
        <template v-else-if="variant === 'capsule-card'">
          <div class="info-card__header">
            <div>
              <span class="eyebrow">ACTIVITY</span>
              <strong>最近动态</strong>
            </div>
            <Icon icon="lucide:bell-ring" width="18" aria-hidden="true" />
          </div>
          <div class="info-card__list">
            <div
              v-for="item in activityItems"
              :key="item.title"
              class="info-card__item"
            >
              <span
                class="info-card__item-dot"
                :class="`is-${item.tone}`"
              ></span>
              <span>{{ item.title }}</span>
              <time>{{ item.time }}</time>
            </div>
          </div>
        </template>

        <!-- 3. 紧凑态展开 -->
        <template v-else-if="variant === 'compact-expand'">
          <div class="compact-expand__header">
            <span class="compact-expand__icon">
              <Icon icon="lucide:sparkles" width="17" aria-hidden="true" />
            </span>
            <div class="morph-state__copy">
              <strong>快速操作</strong>
              <span>选择一个动作开始</span>
            </div>
            <span class="state-badge">⌘ K</span>
          </div>
          <div class="quick-actions">
            <button
              v-for="action in quickActions"
              :key="action.label"
              type="button"
              @click.stop
            >
              <Icon :icon="action.icon" width="15" aria-hidden="true" />
              {{ action.label }}
            </button>
          </div>
        </template>

        <!-- 4. 圆角形态过渡 -->
        <template v-else-if="variant === 'rounded-transition'">
          <div class="rounded-transition__header">
            <div class="rounded-transition__time">12:40</div>
            <div class="morph-state__copy">
              <strong>午间专注</strong>
              <span>还有 18 分钟结束</span>
            </div>
            <span class="rounded-transition__ring">72%</span>
          </div>
          <div class="rounded-transition__progress"><i></i></div>
        </template>

        <!-- 5. 尺寸变形 -->
        <template v-else-if="variant === 'size-transform'">
          <div class="size-transform__header">
            <div>
              <span class="eyebrow">WEEKLY GOAL</span>
              <strong>本周进度</strong>
            </div>
            <span class="size-transform__value">38%</span>
          </div>
          <div class="size-transform__bar"><i></i></div>
          <div class="size-transform__footer">
            <span>已完成 19 / 50 个任务</span>
            <span>还差 31 个</span>
          </div>
        </template>

        <!-- 6. 内容重排 -->
        <template v-else-if="variant === 'content-reflow'">
          <div class="reflow-header">
            <span class="content-reflow__avatar">Z</span>
            <div class="morph-state__copy">
              <strong>周报摘要</strong>
              <span>内容从横向排列为分组网格</span>
            </div>
            <span class="state-badge">本周</span>
          </div>
          <div class="reflow-grid">
            <div
              v-for="stat in reflowStats"
              :key="stat.label"
              class="reflow-stat"
            >
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </div>
        </template>

        <!-- 7. 反向收回 -->
        <template v-else>
          <div class="retract-header">
            <div class="retract-header__icon">
              <Icon icon="lucide:layers-3" width="18" aria-hidden="true" />
            </div>
            <div class="morph-state__copy">
              <strong>项目预览</strong>
              <span>展开后从底部反向收回</span>
            </div>
            <button
              class="retract-header__button"
              type="button"
              @click.stop="toggle"
            >
              收回
            </button>
          </div>
          <div class="retract-body">
            <div class="retract-body__line">
              <span>设计评审</span>
              <span class="state-badge state-badge--success">已完成</span>
            </div>
            <div class="retract-body__line">
              <span>交互细节</span>
              <span class="state-badge state-badge--warning">进行中</span>
            </div>
            <div class="retract-body__line">
              <span>开发联调</span>
              <span class="state-badge">下一步</span>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineOptions({ name: 'MorphContainer' })

const props = defineProps({
  variant: {
    type: String,
    default: 'dot-capsule',
    validator: (value) =>
      [
        'dot-capsule',
        'capsule-card',
        'compact-expand',
        'rounded-transition',
        'size-transform',
        'content-reflow',
        'reverse-retract'
      ].includes(value)
  },
  duration: {
    type: Number,
    default: 620
  }
})

const expanded = defineModel('expanded', {
  type: Boolean,
  default: false
})

const activityItems = [
  { title: '设计稿已更新', time: '刚刚', tone: 'blue' },
  { title: '收到新的评论', time: '8m', tone: 'violet' },
  { title: '任务已完成', time: '23m', tone: 'green' }
]

const quickActions = [
  { label: '新建任务', icon: 'lucide:plus' },
  { label: '上传文件', icon: 'lucide:upload' },
  { label: '邀请成员', icon: 'lucide:user-plus' }
]

const reflowStats = [
  { value: '12', label: '已完成' },
  { value: '04', label: '进行中' },
  { value: '86%', label: '完成率' }
]

const containerStyle = computed(() => ({
  '--morph-duration': `${props.duration}ms`
}))

const toggle = () => {
  expanded.value = !expanded.value
}
</script>

<style lang="scss" scoped>
.morph-container {
  --morph-height: 76px;
  --morph-radius: 24px;
  --morph-surface: var(--color-bg-card);
  --morph-surface-muted: var(--color-bg-input);
  --morph-border: var(--color-border);
  --morph-accent: var(--brand-accent);

  position: relative;
  box-sizing: border-box;
  display: flex;
  width: 100%;
  min-width: 0;
  height: var(--morph-height);
  padding: 16px 18px;
  overflow: hidden;
  color: var(--color-text-primary);
  cursor: pointer;
  background: var(--morph-surface);
  border: 1px solid var(--morph-border);
  border-radius: var(--morph-radius);
  outline: none;
  box-shadow: var(--shadow-sm);
  transition:
    height var(--morph-duration) cubic-bezier(0.22, 1, 0.36, 1),
    width var(--morph-duration) cubic-bezier(0.22, 1, 0.36, 1),
    border-radius var(--morph-duration) cubic-bezier(0.22, 1, 0.36, 1),
    background-color var(--morph-duration) ease,
    border-color var(--morph-duration) ease,
    box-shadow var(--morph-duration) ease;

  &:hover {
    border-color: color-mix(
      in srgb,
      var(--morph-accent),
      var(--morph-border) 55%
    );
    box-shadow: var(--shadow-md);
  }

  &:focus-visible {
    border-color: var(--morph-accent);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--morph-accent), transparent 78%);
  }
}

.morph-state {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.morph-state--expanded {
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.morph-state__label,
.morph-state__hint,
.morph-state__copy,
.info-card__item,
.size-transform__footer,
.retract-body__line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.morph-state__label {
  font-size: 14px;
  font-weight: 650;
}

.morph-state__hint {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-muted);
}

.morph-state__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  strong {
    overflow: hidden;
    font-size: 14px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    font-size: 12px;
    color: var(--color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.state-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 9px;
  font-size: 11px;
  font-weight: 650;
  color: var(--color-text-secondary);
  background: var(--morph-surface-muted);
  border-radius: 99px;

  &--success {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success), transparent 88%);
  }

  &--warning {
    color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning), transparent 88%);
  }
}

.eyebrow {
  display: block;
  margin-bottom: 3px;
  font-size: 9px;
  font-weight: 750;
  color: var(--color-text-muted);
  letter-spacing: 0.12em;
}

// 1. 圆点变胶囊
.is-dot-capsule {
  --morph-height: 58px;
  --morph-radius: 99px;
  --morph-surface: color-mix(
    in srgb,
    var(--brand-accent),
    var(--color-bg-card) 92%
  );
  --morph-border: color-mix(
    in srgb,
    var(--brand-accent),
    var(--color-border) 70%
  );

  &.is-expanded {
    --morph-height: 88px;
    --morph-radius: 25px;
    --morph-surface: var(--color-bg-card);
  }
}

.dot-capsule__dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  background: var(--brand-accent);
  border-radius: 50%;
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--brand-accent), transparent 86%);

  &--active {
    background: var(--color-success);
    box-shadow: 0 0 0 5px
      color-mix(in srgb, var(--color-success), transparent 86%);
  }
}

// 2. 胶囊变为信息卡
.is-capsule-card {
  --morph-height: 58px;
  --morph-radius: 99px;
  --morph-surface: color-mix(
    in srgb,
    var(--color-violet),
    var(--color-bg-card) 92%
  );
  --morph-border: color-mix(
    in srgb,
    var(--color-violet),
    var(--color-border) 72%
  );

  &.is-expanded {
    --morph-height: 188px;
    --morph-radius: 20px;
    --morph-surface: var(--color-bg-card);
  }

  .morph-state:not(.morph-state--expanded) {
    color: var(--color-violet);
  }
}

.capsule-card__count {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  font-size: 12px;
  font-weight: 750;
  color: #fff;
  background: var(--gradient-violet);
  border-radius: 50%;
}

.info-card__header,
.info-card__item,
.compact-expand__header,
.size-transform__header,
.reflow-header,
.retract-header,
.rounded-transition__header {
  display: flex;
  align-items: center;
  min-width: 0;
}

.info-card__header {
  justify-content: space-between;
  color: var(--color-violet);

  strong {
    display: block;
    font-size: 15px;
    color: var(--color-text-primary);
  }
}

.info-card__list {
  display: grid;
  gap: 8px;
}

.info-card__item {
  gap: 8px;
  padding: 9px 10px;
  background: var(--morph-surface-muted);
  border-radius: 9px;

  span:not(.info-card__item-dot) {
    flex: 1;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  time {
    font-size: 10px;
    color: var(--color-text-muted);
  }
}

.info-card__item-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;

  &.is-blue {
    background: var(--color-primary);
  }

  &.is-violet {
    background: var(--color-violet);
  }

  &.is-green {
    background: var(--color-success);
  }
}

// 3. 紧凑态展开
.is-compact-expand {
  --morph-height: 58px;
  --morph-radius: 16px;
  --morph-accent: var(--color-cyan);
  --morph-surface: color-mix(
    in srgb,
    var(--color-cyan),
    var(--color-bg-card) 92%
  );
  --morph-border: color-mix(
    in srgb,
    var(--color-cyan),
    var(--color-border) 72%
  );

  &.is-expanded {
    --morph-height: 168px;
    --morph-radius: 16px;
    --morph-surface: var(--color-bg-card);
  }
}

.compact-expand__icon,
.retract-header__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 30px;
  height: 30px;
  color: var(--color-cyan);
  background: color-mix(in srgb, var(--color-cyan), transparent 86%);
  border-radius: 9px;
}

.compact-expand__header {
  gap: 10px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  button {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 8px 5px;
    overflow: hidden;
    font: inherit;
    font-size: 11px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: var(--morph-surface-muted);
    border: 1px solid transparent;
    border-radius: 8px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      color: var(--color-cyan);
      border-color: color-mix(in srgb, var(--color-cyan), transparent 60%);
    }
  }
}

// 4. 圆角形态过渡
.is-rounded-transition {
  --morph-height: 66px;
  --morph-radius: 33px;
  --morph-accent: var(--color-amber);
  --morph-surface: color-mix(
    in srgb,
    var(--color-amber),
    var(--color-bg-card) 92%
  );
  --morph-border: color-mix(
    in srgb,
    var(--color-amber),
    var(--color-border) 72%
  );

  &.is-expanded {
    --morph-height: 144px;
    --morph-radius: 12px;
    --morph-surface: var(--color-bg-card);
  }
}

.rounded-transition__time {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 38px;
  height: 38px;
  font-size: 10px;
  font-weight: 750;
  color: var(--color-amber);
  background: color-mix(in srgb, var(--color-amber), transparent 86%);
  border-radius: 50%;
}

.rounded-transition__header {
  gap: 12px;
}

.rounded-transition__ring {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 38px;
  height: 38px;
  font-size: 10px;
  font-weight: 750;
  color: var(--color-amber);
  border: 3px solid color-mix(in srgb, var(--color-amber), transparent 72%);
  border-top-color: var(--color-amber);
  border-radius: 50%;
}

.rounded-transition__progress,
.size-transform__bar {
  height: 7px;
  overflow: hidden;
  background: var(--morph-surface-muted);
  border-radius: 99px;

  i {
    display: block;
    width: 72%;
    height: 100%;
    background: var(--gradient-warm);
    border-radius: inherit;
    transition: width var(--morph-duration) ease;
  }
}

// 5. 尺寸变形
.is-size-transform {
  --morph-height: 62px;
  --morph-radius: 14px;
  --morph-accent: var(--color-success);
  --morph-surface: color-mix(
    in srgb,
    var(--color-success),
    var(--color-bg-card) 94%
  );
  --morph-border: color-mix(
    in srgb,
    var(--color-success),
    var(--color-border) 72%
  );

  &.is-expanded {
    --morph-height: 152px;
    --morph-radius: 20px;
    --morph-surface: var(--color-bg-card);
  }
}

.size-transform__value {
  margin-left: auto;
  font-size: 21px;
  font-weight: 780;
  color: var(--color-success);
  letter-spacing: -0.04em;
}

.size-transform__mini-bar {
  width: 44px;
  height: 5px;
  overflow: hidden;
  background: var(--morph-surface-muted);
  border-radius: 99px;

  i {
    display: block;
    width: 38%;
    height: 100%;
    background: var(--color-success);
    border-radius: inherit;
  }
}

.size-transform__header {
  justify-content: space-between;

  strong {
    display: block;
    font-size: 15px;
  }
}

.size-transform__bar {
  height: 11px;

  i {
    width: 38%;
    background: var(--gradient-success);
  }
}

.size-transform__footer {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
}

// 6. 内容重排
.is-content-reflow {
  --morph-height: 62px;
  --morph-radius: 15px;
  --morph-accent: var(--color-rose);
  --morph-surface: color-mix(
    in srgb,
    var(--color-rose),
    var(--color-bg-card) 94%
  );
  --morph-border: color-mix(
    in srgb,
    var(--color-rose),
    var(--color-border) 72%
  );

  &.is-expanded {
    --morph-height: 170px;
    --morph-radius: 18px;
    --morph-surface: var(--color-bg-card);
  }
}

.content-reflow__avatar {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 30px;
  height: 30px;
  font-size: 12px;
  font-weight: 750;
  color: #fff;
  background: var(--gradient-rose);
  border-radius: 10px;
}

.reflow-header {
  gap: 10px;
}

.reflow-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.reflow-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: var(--morph-surface-muted);
  border-radius: 10px;

  strong {
    font-size: 18px;
    color: var(--color-rose);
    letter-spacing: -0.04em;
  }

  span {
    font-size: 10px;
    color: var(--color-text-muted);
  }
}

// 7. 反向收回
.is-reverse-retract {
  --morph-height: 62px;
  --morph-radius: 15px;
  --morph-accent: var(--color-indigo);
  --morph-surface: color-mix(
    in srgb,
    var(--color-indigo),
    var(--color-bg-card) 94%
  );
  --morph-border: color-mix(
    in srgb,
    var(--color-indigo),
    var(--color-border) 72%
  );

  &.is-expanded {
    --morph-height: 194px;
    --morph-radius: 18px;
    --morph-surface: var(--color-bg-card);
  }
}

.reverse-retract__chevron {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 26px;
  height: 26px;
  color: var(--color-indigo);
  background: color-mix(in srgb, var(--color-indigo), transparent 86%);
  border-radius: 8px;
}

.retract-header {
  gap: 10px;
}

.retract-header__icon {
  color: var(--color-indigo);
  background: color-mix(in srgb, var(--color-indigo), transparent 86%);
}

.retract-header__button {
  flex-shrink: 0;
  padding: 6px 9px;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
  color: var(--color-indigo);
  cursor: pointer;
  background: color-mix(in srgb, var(--color-indigo), transparent 90%);
  border: 0;
  border-radius: 8px;
}

.retract-body {
  display: grid;
  gap: 7px;
  padding-top: 2px;
  border-top: 1px solid var(--color-border-light);
}

.retract-body__line {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.morph-fade-enter-active,
.morph-fade-leave-active {
  transition:
    opacity calc(var(--morph-duration) * 0.45) ease,
    transform calc(var(--morph-duration) * 0.55) cubic-bezier(0.22, 1, 0.36, 1);
}

.morph-fade-enter-from {
  opacity: 0;
  transform: translateY(7px) scale(0.985);
}

.morph-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.99);
}

@media (prefers-reduced-motion: reduce) {
  .morph-container,
  .morph-container * {
    --morph-duration: 1ms !important;

    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
  }
}

@media (width <= 520px) {
  .morph-container {
    padding-right: 14px;
    padding-left: 14px;
  }

  .quick-actions {
    grid-template-columns: 1fr;

    button {
      justify-content: flex-start;
      padding: 7px 9px;
    }
  }

  .is-compact-expand.is-expanded {
    --morph-height: 206px;
  }
}
</style>
