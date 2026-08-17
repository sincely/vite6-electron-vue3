<template>
  <div class="sales-assistant">
    <div class="sales-assistant-circle sales-assistant-circle-1"></div>
    <div class="sales-assistant-circle sales-assistant-circle-2"></div>
    <p class="sales-assistant-tag">销售助手</p>
    <h3 class="sales-assistant-title">你好，周子航</h3>
    <p class="sales-assistant-desc">
      这里是今日销售快报，新的订单、
      <br />
      成交客户与回款情况都已更新。
    </p>
    <el-button class="sales-assistant-btn" round>升级专业版</el-button>
  </div>
</template>

<script setup>
/**
 * 销售助手横幅
 */
</script>

<style lang="scss" scoped>
.sales-assistant {
  position: relative;
  height: 100%;
  min-height: 240px;
  padding: 28px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #7c8cf8);
  border-radius: var(--radius-lg);

  &-circle {
    position: absolute;
    background: rgb(255 255 255 / 12%);
    border-radius: 50%;

    &-1 {
      top: 24px;
      right: 40px;
      width: 96px;
      height: 96px;
    }

    &-2 {
      right: 90px;
      bottom: -30px;
      width: 120px;
      height: 120px;
    }
  }

  &-tag {
    margin-bottom: 12px;
    font-size: 13px;
    opacity: 0.85;
  }

  &-title {
    margin-bottom: 12px;
    font-size: 22px;
    font-weight: 700;
  }

  &-desc {
    margin-bottom: 20px;
    font-size: 14px;
    line-height: 1.8;
    opacity: 0.9;
  }

  &-btn {
    color: var(--color-primary);
    background: #fff;
    border: none;
  }
}
</style>
