<script setup>
import { pricing } from '../config/site.js'
</script>

<template>
  <section id="pricing" class="section">
    <div class="container">
      <h2 class="section-title">{{ pricing.title }}</h2>
      <p class="section-subtitle">{{ pricing.subtitle }}</p>

      <div class="plan-grid">
        <div
          v-for="plan in pricing.plans"
          :key="plan.name"
          class="plan-card"
          :class="{ recommended: plan.recommended }"
        >
          <span v-if="plan.recommended" class="recommend-badge">推荐</span>
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-price">
            <span class="price">{{ plan.price }}</span>
            <span class="unit">{{ plan.unit }}</span>
          </div>
          <p class="plan-desc">{{ plan.desc }}</p>
          <ul class="plan-features">
            <li v-for="f in plan.features" :key="f">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                class="check-icon"
                aria-hidden="true"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ f }}
            </li>
          </ul>
          <a
            :href="plan.href"
            class="plan-cta"
            :class="{ primary: plan.recommended }"
          >
            {{ plan.cta }}
          </a>
        </div>
      </div>

      <p class="disclaimer">{{ pricing.disclaimer }}</p>
    </div>
  </section>
</template>

<style scoped>
.plan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 28px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.plan-card:hover {
  background: var(--card-hover);
  border-color: var(--border-strong);
  transform: translateY(-4px);
}

.plan-card.recommended {
  background: linear-gradient(180deg, rgb(37 99 235 / 14%), var(--card) 45%);
  border-color: rgb(89 126 247 / 55%);
}

.recommend-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  padding: 4px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--brand-gradient);
  border-radius: var(--radius-pill);
  transform: translateX(-50%);
}

.plan-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.plan-price {
  display: flex;
  gap: 4px;
  align-items: baseline;
  margin-top: 12px;
}

.price {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.unit {
  font-size: 14px;
  color: var(--text-tertiary);
}

.plan-desc {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--text-tertiary);
}

.plan-features {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0 28px;
  font-size: 14px;
  color: var(--text-secondary);
}

.plan-features li {
  display: flex;
  gap: 10px;
  align-items: center;
}

.check-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: #34d399;
}

.plan-cta {
  display: block;
  padding: 12px 0;
  font-size: 14.5px;
  font-weight: 600;
  text-align: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-pill);
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.plan-cta:hover {
  border-color: var(--text-secondary);
}

.plan-cta.primary {
  color: #0b0c0f;
  background: #fff;
  border-color: #fff;
}

.plan-cta.primary:hover {
  box-shadow: 0 8px 24px rgb(255 255 255 / 15%);
}

.disclaimer {
  margin-top: 28px;
  font-size: 12.5px;
  color: var(--text-tertiary);
  text-align: center;
}

@media (width <= 1023px) {
  .plan-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .plan-card.recommended {
    grid-column: span 2;
  }
}

@media (width <= 640px) {
  .plan-grid {
    grid-template-columns: 1fr;
  }

  .plan-card.recommended {
    grid-column: span 1;
  }
}
</style>
