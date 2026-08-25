<template>
  <div class="morph-page">
    <PageHeader
      title="容器变形"
      subtitle="7 种可复用的容器形态过渡，点击任意示例查看动效"
      icon="layers-3"
    >
      <template #actions>
        <ElButton plain @click="toggleAll">
          <Icon icon="lucide:play" width="15" />
          全部演示
        </ElButton>
      </template>
    </PageHeader>

    <section class="morph-hero">
      <div class="morph-hero__glow morph-hero__glow--one"></div>
      <div class="morph-hero__glow morph-hero__glow--two"></div>
      <div class="morph-hero__content">
        <span class="morph-hero__eyebrow">MOTION SYSTEM / 07</span>
        <h1>让容器自己讲述状态变化</h1>
        <p>
          从一个圆点，到一张信息卡；从紧凑态，到完整工作区。每一个形变都保持内容连续与空间秩序。
        </p>
        <div class="morph-hero__meta">
          <span>
            <i class="meta-dot meta-dot--blue"></i>
            尺寸补间
          </span>
          <span>
            <i class="meta-dot meta-dot--violet"></i>
            内容过渡
          </span>
          <span>
            <i class="meta-dot meta-dot--green"></i>
            可反向播放
          </span>
        </div>
      </div>
      <div class="morph-hero__visual" aria-hidden="true">
        <div class="visual-orbit visual-orbit--one"></div>
        <div class="visual-orbit visual-orbit--two"></div>
        <div class="visual-core">
          <span></span>
          <small>morph</small>
        </div>
      </div>
    </section>

    <div class="morph-toolbar">
      <div>
        <span class="morph-toolbar__title">预设组件</span>
        <span class="morph-toolbar__count">{{ expandedCount }} / 7 已展开</span>
      </div>
      <button type="button" @click="resetAll">重置所有状态</button>
    </div>

    <section class="morph-grid">
      <article
        v-for="demo in demos"
        :key="demo.key"
        class="morph-demo-card"
        :class="`morph-demo-card--${demo.key}`"
      >
        <div class="morph-demo-card__heading">
          <div class="morph-demo-card__number">{{ demo.number }}</div>
          <div class="morph-demo-card__title">
            <h2>{{ demo.title }}</h2>
            <p>{{ demo.description }}</p>
          </div>
          <span
            class="morph-demo-card__status"
            :class="{ 'is-active': states[demo.key] }"
          >
            {{ states[demo.key] ? '展开' : '紧凑' }}
          </span>
        </div>
        <div class="morph-demo-card__stage">
          <MorphContainer
            v-model:expanded="states[demo.key]"
            :variant="demo.variant"
            @click="markLastAction(demo.title, demo.key)"
          />
        </div>
        <div class="morph-demo-card__footer">
          <span>{{ demo.detail }}</span>
          <button type="button" @click="states[demo.key] = !states[demo.key]">
            {{ states[demo.key] ? '收回' : '展开' }}
            <Icon
              :icon="
                states[demo.key]
                  ? 'lucide:arrow-up-right'
                  : 'lucide:arrow-down-right'
              "
              width="14"
            />
          </button>
        </div>
      </article>
    </section>

    <div class="morph-page__note">
      <Icon icon="lucide:info" width="16" aria-hidden="true" />
      <span>
        交互提示：点击容器、卡片底部按钮或按 Enter / Space
        都可以触发状态切换。当前操作：{{ lastAction }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineOptions({ name: 'WidgetsMorphContainer' })

const demos = [
  {
    key: 'dotCapsule',
    number: '01',
    variant: 'dot-capsule',
    title: '圆点变胶囊',
    description: '从单一状态点延展为状态胶囊',
    detail: '状态确认 · 58 → 88 px'
  },
  {
    key: 'capsuleCard',
    number: '02',
    variant: 'capsule-card',
    title: '胶囊变信息卡',
    description: '在不打断上下文的情况下承载更多信息',
    detail: '信息承载 · 58 → 188 px'
  },
  {
    key: 'compactExpand',
    number: '03',
    variant: 'compact-expand',
    title: '紧凑态展开',
    description: '将高频操作从一个入口展开为操作组',
    detail: '操作面板 · 58 → 168 px'
  },
  {
    key: 'roundedTransition',
    number: '04',
    variant: 'rounded-transition',
    title: '圆角形态过渡',
    description: '通过圆角变化表达容器层级的切换',
    detail: '形态过渡 · 33 → 12 px'
  },
  {
    key: 'sizeTransform',
    number: '05',
    variant: 'size-transform',
    title: '尺寸变形',
    description: '宽高与内部比例同时补间变化',
    detail: '进度反馈 · 62 → 152 px'
  },
  {
    key: 'contentReflow',
    number: '06',
    variant: 'content-reflow',
    title: '内容重排',
    description: '横向摘要平滑重排为结构化数据',
    detail: '布局重排 · row → grid'
  },
  {
    key: 'reverseRetract',
    number: '07',
    variant: 'reverse-retract',
    title: '反向收回',
    description: '展开与收回使用同一条可逆运动路径',
    detail: '反向播放 · in ↔ out'
  }
]

const states = reactive({
  dotCapsule: false,
  capsuleCard: false,
  compactExpand: false,
  roundedTransition: false,
  sizeTransform: false,
  contentReflow: false,
  reverseRetract: true
})

const lastAction = ref('等待你的操作')
const expandedCount = computed(
  () => Object.values(states).filter(Boolean).length
)

const toggleAll = () => {
  const shouldExpand = expandedCount.value < demos.length
  demos.forEach((demo) => {
    states[demo.key] = shouldExpand
  })
  lastAction.value = shouldExpand ? '全部展开' : '全部收回'
}

const resetAll = () => {
  demos.forEach((demo) => {
    states[demo.key] = demo.key === 'reverseRetract'
  })
  lastAction.value = '已恢复默认状态'
}

const markLastAction = (title, key) => {
  lastAction.value = `${title} · ${states[key] ? '展开' : '收回'}`
}
</script>

<style lang="scss" scoped>
.morph-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.morph-hero {
  position: relative;
  display: flex;
  min-height: 224px;
  padding: 32px 38px;
  overflow: hidden;
  color: #fff;
  background: #111a35;
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 60%);
  border-radius: 22px;
  box-shadow: 0 16px 40px rgb(37 99 235 / 13%);

  &::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background: radial-gradient(
      circle at 48% 20%,
      rgb(255 255 255 / 8%),
      transparent 35%
    );
  }
}

.morph-hero__content {
  position: relative;
  z-index: 1;
  max-width: 650px;
}

.morph-hero__eyebrow {
  display: block;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 750;
  color: #91b4ff;
  letter-spacing: 0.16em;
}

.morph-hero h1 {
  max-width: 570px;
  margin: 0;
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 780;
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.morph-hero p {
  max-width: 560px;
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.75;
  color: #bcc8e6;
}

.morph-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 22px;
  font-size: 11px;
  color: #d7def2;
}

.morph-hero__meta span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.meta-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;

  &--blue {
    background: #7aa2ff;
  }

  &--violet {
    background: #c3a3ff;
  }

  &--green {
    background: #65e6bf;
  }
}

.morph-hero__visual {
  position: absolute;
  right: 7%;
  bottom: -78px;
  width: 278px;
  height: 278px;
}

.visual-orbit {
  position: absolute;
  inset: 0;
  border: 1px solid rgb(137 165 255 / 22%);
  border-radius: 50%;
  transform: rotate(26deg) scaleY(0.46);

  &::before,
  &::after {
    position: absolute;
    width: 8px;
    height: 8px;
    content: '';
    background: #8bb0ff;
    border-radius: 50%;
    box-shadow: 0 0 16px #8bb0ff;
  }

  &::before {
    top: 20px;
    left: 30px;
  }

  &::after {
    right: 16px;
    bottom: 44px;
    background: #b99aff;
    box-shadow: 0 0 16px #b99aff;
  }
}

.visual-orbit--two {
  inset: 22px -12px;
  transform: rotate(-32deg) scaleY(0.5);
}

.visual-core {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 9px;
  align-items: center;
  transform: translate(-50%, -50%);

  span {
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, #92b7ff, #aa7aff);
    border-radius: 50%;
    box-shadow:
      0 0 0 9px rgb(123 151 255 / 8%),
      0 0 32px rgb(123 151 255 / 70%);
  }

  small {
    font-size: 10px;
    font-weight: 750;
    color: #9db6ef;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }
}

.morph-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  > div {
    display: flex;
    gap: 10px;
    align-items: baseline;
  }
}

.morph-toolbar__title {
  font-size: 17px;
  font-weight: 750;
  color: var(--color-text-primary);
}

.morph-toolbar__count {
  font-size: 11px;
  color: var(--color-text-muted);
}

.morph-toolbar button,
.morph-demo-card__footer button {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 5px 0;
  font: inherit;
  font-size: 11px;
  color: var(--color-text-link);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.morph-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.morph-demo-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 18px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;

  &:hover {
    border-color: color-mix(
      in srgb,
      var(--brand-accent),
      var(--color-border) 62%
    );
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &:last-child {
    grid-column: span 2;
  }
}

.morph-demo-card__heading {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  min-width: 0;
}

.morph-demo-card__number {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 31px;
  height: 31px;
  font-size: 10px;
  font-weight: 800;
  color: var(--brand-accent);
  background: var(--brand-accent-soft);
  border-radius: 10px;
}

.morph-demo-card__title {
  flex: 1;
  min-width: 0;

  h2 {
    margin: 0;
    overflow: hidden;
    font-size: 14px;
    font-weight: 720;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 5px 0 0;
    overflow: hidden;
    font-size: 11px;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.morph-demo-card__status {
  flex-shrink: 0;
  padding: 5px 8px;
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-input);
  border-radius: 99px;

  &.is-active {
    color: var(--color-primary);
    background: var(--brand-accent-soft);
  }
}

.morph-demo-card__stage {
  display: flex;
  align-items: center;
  min-height: 194px;
  padding: 18px;
  overflow: hidden;
  background: var(--color-bg-content);
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
}

.morph-demo-card__stage :deep(.morph-container) {
  margin: auto 0;
}

.morph-demo-card--dotCapsule .morph-demo-card__stage,
.morph-demo-card--roundedTransition .morph-demo-card__stage,
.morph-demo-card--sizeTransform .morph-demo-card__stage {
  min-height: 150px;
}

.morph-demo-card--reverseRetract {
  grid-column: span 2;

  .morph-demo-card__stage {
    min-height: 214px;
  }
}

.morph-demo-card__footer {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  min-height: 18px;
  font-size: 10px;
  color: var(--color-text-muted);
}

.morph-page__note {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 14px;
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--brand-accent-soft);
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 82%);
  border-radius: 11px;
}

@media (width <= 760px) {
  .morph-hero {
    padding: 26px 22px;
  }

  .morph-hero__visual {
    right: -90px;
    opacity: 0.5;
  }

  .morph-grid {
    grid-template-columns: 1fr;
  }

  .morph-demo-card:last-child,
  .morph-demo-card--reverseRetract {
    grid-column: auto;
  }
}

@media (width <= 520px) {
  .morph-hero {
    min-height: 248px;
  }

  .morph-hero__meta {
    gap: 10px 16px;
  }

  .morph-toolbar > div {
    flex-direction: column;
    gap: 2px;
    align-items: flex-start;
  }

  .morph-demo-card {
    padding: 14px;
  }

  .morph-demo-card__stage {
    padding: 10px;
  }
}
</style>
