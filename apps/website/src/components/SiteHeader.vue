<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { nav, site } from '../config/site.js'

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="site-header" :class="{ scrolled, open: menuOpen }">
    <div class="container header-inner">
      <a class="brand" href="#top" @click="closeMenu">
        <img src="/logo.svg" alt="Lightning logo" class="brand-logo" />
        <span class="brand-name">{{ site.nameUpper }}</span>
      </a>

      <nav class="nav-desktop">
        <a
          v-for="item in nav"
          :key="item.label"
          :href="item.href"
          class="nav-link"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="header-actions">
        <a href="#downloads" class="cta-button">下载</a>
        <button
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="toggleMenu"
        >
          <span class="bar" />
          <span class="bar" />
        </button>
      </div>
    </div>

    <Transition name="drawer">
      <nav v-if="menuOpen" class="nav-mobile">
        <a
          v-for="item in nav"
          :key="item.label"
          :href="item.href"
          class="nav-mobile-link"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>
        <a href="#downloads" class="nav-mobile-link strong" @click="closeMenu">
          全部下载
        </a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  border-bottom: 1px solid transparent;
  transition:
    background 0.25s ease,
    border-color 0.25s ease;
}

.site-header.scrolled,
.site-header.open {
  background: rgb(11 12 15 / 72%);
  backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom-color: var(--border);
}

.header-inner {
  display: flex;
  gap: 32px;
  align-items: center;
  height: var(--header-height);
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.brand-logo {
  width: 28px;
  height: 28px;
}

.brand-name {
  font-size: 17px;
}

.nav-desktop {
  display: flex;
  gap: 28px;
  align-items: center;
}

.nav-link {
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--text);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-left: auto;
}

.cta-button {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #0b0c0f;
  background: #fff;
  border-radius: var(--radius-pill);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.cta-button:hover {
  box-shadow: 0 6px 20px rgb(255 255 255 / 18%);
  transform: translateY(-1px);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.bar {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.open .bar:first-child {
  transform: translateY(4px) rotate(45deg);
}

.open .bar:last-child {
  transform: translateY(-4px) rotate(-45deg);
}

.nav-mobile {
  position: absolute;
  top: var(--header-height);
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 24px 20px;
  background: rgb(11 12 15 / 96%);
  backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}

.nav-mobile-link {
  padding: 12px 4px;
  font-size: 15px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.nav-mobile-link:last-child {
  border-bottom: none;
}

.nav-mobile-link.strong {
  font-weight: 600;
  color: var(--text);
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (width <= 768px) {
  .nav-desktop {
    display: none;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>
