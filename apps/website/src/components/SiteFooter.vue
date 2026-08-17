<script setup>
import { footer, site } from '../config/site.js'
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <img src="/logo.svg" alt="" class="footer-logo" />
        <span class="footer-name">{{ site.name }}</span>
      </div>

      <nav class="footer-links">
        <a
          v-for="link in footer.links"
          :key="link.label"
          :href="link.href"
          class="footer-link"
        >
          {{ link.label }}
        </a>
      </nav>

      <p class="copyright">{{ site.copyright }}</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 40px 0;
  border-top: 1px solid var(--border);
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.footer-brand {
  display: flex;
  gap: 10px;
  align-items: center;
}

.footer-logo {
  width: 24px;
  height: 24px;
}

.footer-name {
  font-size: 15px;
  font-weight: 700;
}

.footer-links {
  display: flex;
  gap: 24px;
  margin-left: auto;
}

.footer-link {
  font-size: 13.5px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--text);
}

.copyright {
  width: 100%;
  font-size: 12.5px;
  color: var(--text-tertiary);
}

@media (width <= 640px) {
  .footer-inner {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .footer-links {
    flex-wrap: wrap;
    margin-left: 0;
  }
}
</style>
