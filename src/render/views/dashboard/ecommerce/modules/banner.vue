<template>
  <div class="ec-banner">
    <!-- 流星动效 -->
    <div class="ec-banner-meteors" aria-hidden="true">
      <i
        v-for="n in 8"
        :key="n"
        class="ec-banner-meteor"
        :style="meteorStyle(n)"
      />
    </div>

    <div class="ec-banner-content">
      <h2 class="ec-banner-title">
        欢迎回来{{ userName ? ` ${userName}` : '' }}
      </h2>
      <div class="ec-banner-stats">
        <div class="ec-banner-stat ec-banner-stat--bordered">
          <p class="ec-banner-stat-value">
            <count-to
              class="ec-banner-stat-num"
              :target="2340"
              :duration="1500"
              prefix="¥"
              separator=","
            />
            <el-icon class="ec-banner-stat-arrow"><TopRight /></el-icon>
          </p>
          <p class="ec-banner-stat-label">今日销售额</p>
        </div>
        <div class="ec-banner-stat">
          <p class="ec-banner-stat-value">
            <count-to
              class="ec-banner-stat-num"
              :target="35"
              :duration="1500"
              suffix="%"
            />
            <el-icon class="ec-banner-stat-arrow"><TopRight /></el-icon>
          </p>
          <p class="ec-banner-stat-label">较昨日</p>
        </div>
      </div>
    </div>

    <img class="ec-banner-cover" :src="bannerCover" alt="banner" />
  </div>
</template>

<script setup>
import { TopRight } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import bannerCover from '@/assets/images/banner/lf_icon2.webp'

const userStore = useUserStore()

// 获取当前用户名（未登录时为空，仅显示欢迎语）
const userName = computed(
  () =>
    userStore.userInfo?.userName ||
    userStore.userInfo?.nickName ||
    userStore.userInfo?.name ||
    ''
)

// 流星位置与动画错峰配置
function meteorStyle(n) {
  return {
    left: `${n * 11 + 4}%`,
    animationDelay: `${(n % 4) * 0.7 + n * 0.15}s`,
    animationDuration: `${2.2 + (n % 3) * 0.6}s`
  }
}
</script>

<style lang="scss" scoped>
.ec-banner {
  position: relative;
  height: 212px;
  padding: 20px 28px;
  overflow: hidden;
  background: color-mix(
    in srgb,
    var(--color-primary) 10%,
    var(--color-bg-card)
  );
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  &-meteors {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &-meteor {
    position: absolute;
    top: -60px;
    width: 1.5px;
    height: 70px;
    background: linear-gradient(
      180deg,
      transparent,
      color-mix(in srgb, var(--color-primary), transparent 55%),
      transparent
    );
    opacity: 0;
    animation: ec-meteor 2.6s linear infinite;
  }

  &-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  &-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-stats {
    display: flex;
    margin-top: 24px;
  }

  &-stat {
    padding-right: 32px;
    margin-right: 32px;

    &--bordered {
      border-right: 1px solid var(--color-border);
    }

    &:last-child {
      border-right: 0;
    }

    &-value {
      display: flex;
      align-items: flex-start;
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-arrow {
      margin: 2px 0 0 4px;
      font-size: 18px;
      color: var(--color-success);
    }

    &-label {
      margin-top: 4px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  &-cover {
    position: absolute;
    right: 40px;
    bottom: -88px;
    z-index: 0;
    width: 260px;
    pointer-events: none;
  }
}

@keyframes ec-meteor {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(35deg);
  }

  10% {
    opacity: 0.8;
  }

  100% {
    opacity: 0;
    transform: translate3d(-180px, 260px, 0) rotate(35deg);
  }
}

@media (width <= 1280px) {
  .ec-banner-cover {
    display: none;
  }
}
</style>
