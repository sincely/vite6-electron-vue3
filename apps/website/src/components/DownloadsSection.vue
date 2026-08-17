<script setup>
import { downloads } from '../config/site.js'

const osIcons = {
  apple:
    'M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.98-.2 1.92-.86 3.24-.77 1.58.13 2.76.75 3.54 1.9-3.25 1.95-2.71 6.23.51 7.42-.6 1.58-1.38 3.14-2.37 4.62ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z',
  windows:
    'M3 5.5 10.5 4.4v7.1H3zM11.6 4.2 21 3v8.5h-9.4zM3 12.4h7.5v7.1L3 18.4zM11.6 12.4H21V21l-9.4-1.3z',
  linux:
    'M12 2c-2.2 0-3.6 1.8-3.6 4 0 1.5.5 2.8.5 4.2 0 1.9-1.4 2.6-1.4 4.3 0 2.5 2.4 3 2.4 4.5 0 1.2-1 1.6-1 2.5 0 1.2 1.4 2.5 3.1 2.5s3.1-1.3 3.1-2.5c0-.9-1-1.3-1-2.5 0-1.5 2.4-2 2.4-4.5 0-1.7-1.4-2.4-1.4-4.3 0-1.4.5-2.7.5-4.2 0-2.2-1.4-4-3.6-4Z'
}
</script>

<template>
  <section id="downloads" class="section">
    <div class="container">
      <h2 class="section-title">{{ downloads.title }}</h2>
      <p class="section-subtitle">{{ downloads.subtitle }}</p>

      <div class="download-grid">
        <div
          v-for="group in downloads.groups"
          :key="group.os"
          class="download-card"
        >
          <div class="os-header">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              class="os-icon"
              aria-hidden="true"
            >
              <path :d="osIcons[group.icon]" />
            </svg>
            <span class="os-name">{{ group.os }}</span>
          </div>
          <ul class="download-list">
            <li v-for="item in group.items" :key="item.label">
              <a :href="item.href" class="download-link">
                <span>{{ item.label }}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="dl-icon"
                  aria-hidden="true"
                >
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.download-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}

.download-card {
  padding: 28px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  transition:
    border-color 0.25s ease,
    background 0.25s ease;
}

.download-card:hover {
  background: var(--card-hover);
  border-color: var(--border-strong);
}

.os-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

.os-icon {
  width: 26px;
  height: 26px;
  color: var(--text);
}

.os-name {
  font-size: 17px;
  font-weight: 700;
}

.download-list {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.download-link {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px;
  font-size: 14.5px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  transition: color 0.2s ease;
}

.download-list li:last-child .download-link {
  border-bottom: none;
}

.download-link:hover {
  color: var(--text);
}

.dl-icon {
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  color: var(--text-tertiary);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.download-link:hover .dl-icon {
  color: #8babfb;
  transform: translateY(2px);
}

@media (width <= 1023px) {
  .download-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 640px) {
  .download-grid {
    grid-template-columns: 1fr;
  }
}
</style>
