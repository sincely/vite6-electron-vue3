<template>
  <card class="about-project">
    <template #content>
      <div class="about-project-body">
        <div class="about-project-info">
          <h2>关于项目</h2>
          <p>Lightning 是一款兼具设计美学与高效开发的桌面后台系统</p>
          <p>使用了 Vue3、Vite、Electron、Element Plus 等前沿技术</p>

          <div class="about-project-links">
            <div
              v-for="link in linkList"
              :key="link.label"
              class="about-project-link"
              @click="goPage(link.url)"
            >
              <span>{{ link.label }}</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        <img class="about-project-draw" :src="drawImg" alt="draw1" />
      </div>
    </template>
  </card>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
import drawImg from '@/assets/images/draw/draw1.png'

const linkList = [
  { label: 'Vue3 文档', url: 'https://cn.vuejs.org/' },
  { label: 'Element Plus', url: 'https://element-plus.org/zh-CN/' },
  { label: 'Vite 文档', url: 'https://cn.vitejs.dev/' },
  { label: 'Electron', url: 'https://www.electronjs.org/' }
]

/**
 * 在新标签页中打开指定 URL
 * @param url 要打开的网页地址
 */
const goPage = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style lang="scss" scoped>
.about-project {
  &-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-info {
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    p {
      margin-top: 6px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  &-links {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    max-width: 600px;
    margin-top: 36px;
    margin-bottom: 8px;
  }

  &-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 240px;
    height: 50px;
    padding: 0 14px;
    font-size: 13px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: var(--color-bg-content);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-3px);
    }

    :deep(.el-icon) {
      font-size: 16px;
      color: var(--color-text-muted);
    }
  }

  &-draw {
    width: 300px;
  }
}

@media (width <= 1280px) {
  .about-project-draw {
    display: none;
  }
}

@media (width <= 640px) {
  .about-project-link {
    width: 100%;
  }
}
</style>
