<!-- 模板中心 - 定价：营销风格定价页模板 -->
<template>
  <div class="pricing-page">
    <div class="pricing-page__hero">
      <h1 class="pricing-page__title">超过 53,476 位信赖的开发者</h1>
      <h2 class="pricing-page__subtitle">以及众多科技巨头的选择</h2>
      <div class="pricing-page__note">
        <p>本项目基于 MIT 协议开源免费，当前页面为定价模板，仅作演示用途</p>
        <ElTag type="success" size="large" round>免费商用</ElTag>
      </div>
    </div>

    <div class="pricing-page__plans">
      <ElRow :gutter="20" justify="center">
        <ElCol
          v-for="plan in pricingPlans"
          :key="plan.type"
          :xs="24"
          :sm="12"
          :md="6"
          class="plan-col"
        >
          <div class="plan-card">
            <div class="plan-card__head">
              <h3 class="plan-card__title">{{ plan.title }}</h3>
              <p class="plan-card__desc">{{ plan.description }}</p>
              <div class="plan-card__price">
                <span class="plan-card__price-value">¥{{ plan.price }}</span>
                <span class="plan-card__price-unit">/一次性付款</span>
              </div>
            </div>

            <div class="plan-card__features">
              <div
                v-for="(feature, index) in plan.features"
                :key="index"
                class="plan-card__feature"
              >
                <el-icon
                  class="plan-card__feature-icon"
                  :class="feature.available ? 'is-available' : 'is-unavailable'"
                >
                  <Check v-if="feature.available" />
                  <Close v-else />
                </el-icon>
                <span>{{ feature.text }}</span>
              </div>
            </div>

            <div class="plan-card__action">
              <ElButton
                type="primary"
                class="plan-card__buy"
                @click="handleBuy(plan)"
              >
                立即购买
              </ElButton>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'template-pricing' })

/**
 * 定价套餐配置
 */
const pricingPlans = ref([
  {
    type: 'single',
    title: '单次使用版',
    description: '适用于单个最终产品，最终用户无需付费。',
    price: 349,
    features: [
      { text: '完整源代码', available: true },
      { text: '技术文档', available: true },
      { text: 'SaaS应用授权', available: false },
      { text: '单个项目使用', available: true },
      { text: '一年技术支持', available: true },
      { text: '一年免费更新', available: true }
    ]
  },
  {
    type: 'multiple',
    title: '多次使用版',
    description: '适用于无限个最终产品，最终用户无需付费。',
    price: 629,
    features: [
      { text: '完整源代码', available: true },
      { text: '技术文档', available: true },
      { text: 'SaaS应用授权', available: false },
      { text: '无限项目使用', available: true },
      { text: '一年技术支持', available: true },
      { text: '一年免费更新', available: true }
    ]
  },
  {
    type: 'extended',
    title: '扩展授权版',
    description: '适用于单个最终产品，最终用户需要付费。',
    price: 2099,
    features: [
      { text: '完整源代码', available: true },
      { text: '技术文档', available: true },
      { text: 'SaaS应用授权', available: true },
      { text: '单个项目使用', available: true },
      { text: '一年技术支持', available: true },
      { text: '一年免费更新', available: true }
    ]
  },
  {
    type: 'unlimited',
    title: '无限授权版',
    description: '适用于无限个最终产品，最终用户需要付费。',
    price: 3499,
    features: [
      { text: '完整源代码', available: true },
      { text: '技术文档', available: true },
      { text: 'SaaS应用授权', available: true },
      { text: '无限项目使用', available: true },
      { text: '一年技术支持', available: true },
      { text: '一年免费更新', available: true }
    ]
  }
])

/**
 * 处理购买按钮点击（演示用途）
 * @param {object} plan 套餐数据
 */
const handleBuy = (plan) => {
  ElMessage.info(`已选择「${plan.title}」，仅作演示用途`)
}
</script>

<style lang="scss" scoped>
.pricing-page {
  padding: 40px 20px 20px;

  &__hero {
    margin-bottom: 48px;
    text-align: center;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 36px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__subtitle {
    margin: 0 0 10px;
    font-size: 24px;
    font-weight: 400;
    color: var(--color-text-secondary);
  }

  &__note {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    margin-top: 10px;

    p {
      margin: 0;
      font-size: 14px;
      font-style: italic;
      color: var(--color-text-secondary);
    }
  }

  &__plans {
    max-width: 1400px;
    margin: 0 auto;
  }
}

.plan-col {
  display: flex;
  margin-bottom: 20px;
}

.plan-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 24px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }

  &__head {
    margin-bottom: 20px;
  }

  &__title {
    margin: 0 0 10px;
    font-size: 20px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__desc {
    display: -webkit-box;
    height: 40px;
    padding-bottom: 20px;
    margin: 0 0 20px;
    overflow: hidden;
    font-size: 14px;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__price {
    margin-top: 12px;
  }

  &__price-value {
    font-size: 30px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__price-unit {
    margin-left: 10px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__features {
    flex-grow: 1;
    margin-bottom: 20px;
  }

  &__feature {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--color-text-primary);
  }

  &__feature-icon {
    margin-right: 10px;
    font-size: 16px;

    &.is-available {
      color: var(--color-primary);
    }

    &.is-unavailable {
      color: var(--color-danger);
    }
  }

  &__action {
    margin-top: auto;
    text-align: center;
  }

  &__buy {
    width: 100%;
    height: 40px;
  }
}

@media (width <= 768px) {
  .pricing-page {
    padding: 24px 12px 12px;

    &__title {
      font-size: 28px;
    }

    &__subtitle {
      font-size: 20px;
    }

    &__note {
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
