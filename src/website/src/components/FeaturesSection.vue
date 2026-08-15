<script setup>
import { features } from '../config/site.js'

const icons = {
  update: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6M12 7v5l3.5 2',
  layout: 'M4 4h16v16H4zM4 9h16M9 9v11',
  shield: 'M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6zM9 12l2 2 4-4'
}
</script>

<template>
  <section id="features" class="section">
    <div class="container">
      <h2 class="section-title">{{ features.title }}</h2>
      <p class="section-subtitle">{{ features.subtitle }}</p>

      <div class="feature-grid">
        <div
          v-for="item in features.items"
          :key="item.title"
          class="feature-card"
        >
          <div class="icon-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feature-icon"
              aria-hidden="true"
            >
              <path :d="icons[item.icon]" />
            </svg>
          </div>
          <h3 class="feature-title">{{ item.title }}</h3>
          <p class="feature-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}

.feature-card {
  padding: 32px 28px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.feature-card:hover {
  background: var(--card-hover);
  border-color: rgb(89 126 247 / 45%);
  transform: translateY(-4px);
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgb(37 99 235 / 16%);
  border: 1px solid rgb(89 126 247 / 35%);
  border-radius: 12px;
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: #8babfb;
}

.feature-title {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 700;
}

.feature-desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-secondary);
}

@media (width <= 1023px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 640px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
