<script setup>
import { hero, site } from '../config/site.js'
</script>

<template>
  <section class="hero">
    <div class="hero-glow" aria-hidden="true" />
    <div class="container hero-inner">
      <a class="badge" href="#">
        <span>{{ hero.badge }}</span>
      </a>

      <h1 class="hero-title">{{ hero.title }}</h1>
      <p class="hero-subtitle">{{ hero.subtitle }}</p>

      <a class="download-button" :href="hero.primaryCta.href">
        <svg
          class="apple-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.98-.2 1.92-.86 3.24-.77 1.58.13 2.76.75 3.54 1.9-3.25 1.95-2.71 6.23.51 7.42-.6 1.58-1.38 3.14-2.37 4.62ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z"
          />
        </svg>
        <span class="download-text">
          <span class="download-label">{{ hero.primaryCta.label }}</span>
          <span class="download-sub">
            {{ hero.primaryCta.sub }} · {{ site.version }}
          </span>
        </span>
      </a>

      <a class="all-downloads" :href="hero.secondaryCta.href">
        {{ hero.secondaryCta.label }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding-top: calc(var(--header-height) + clamp(72px, 12vw, 140px));
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -320px;
  left: 50%;
  width: 900px;
  height: 640px;
  pointer-events: none;
  background:
    radial-gradient(closest-side, rgb(89 126 247 / 22%), transparent),
    radial-gradient(
      closest-side at 70% 60%,
      rgb(189 52 254 / 12%),
      transparent
    );
  filter: blur(40px);
  transform: translateX(-50%);
}

.hero-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.badge {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 18px;
  font-size: 13.5px;
  color: var(--text-secondary);
  background: rgb(255 255 255 / 5%);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-pill);
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.badge:hover {
  color: var(--text);
  border-color: rgb(89 126 247 / 60%);
}

.hero-title {
  margin-top: 28px;
  font-size: clamp(36px, 7vw, 68px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.hero-subtitle {
  max-width: 640px;
  margin-top: 20px;
  font-size: clamp(14px, 1.8vw, 17px);
  color: var(--text-secondary);
}

.download-button {
  display: inline-flex;
  gap: 14px;
  align-items: center;
  padding: 14px 32px;
  margin-top: 44px;
  color: #0b0c0f;
  background: #fff;
  border-radius: var(--radius-pill);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.download-button:hover {
  box-shadow: 0 12px 32px rgb(255 255 255 / 16%);
  transform: translateY(-2px);
}

.apple-icon {
  width: 30px;
  height: 30px;
}

.download-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;
}

.download-label {
  font-size: 16px;
  font-weight: 700;
}

.download-sub {
  font-size: 12px;
  color: #4b5563;
}

.all-downloads {
  margin-top: 18px;
  font-size: 13.5px;
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.2s ease;
}

.all-downloads:hover {
  color: var(--text);
}

@media (width <= 640px) {
  .download-button {
    gap: 10px;
    padding: 12px 24px;
  }

  .apple-icon {
    width: 26px;
    height: 26px;
  }
}
</style>
