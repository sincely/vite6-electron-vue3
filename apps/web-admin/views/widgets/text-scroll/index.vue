<!-- 组件中心 - 文字滚动 -->
<template>
  <div class="text-scroll-page">
    <PageHeader
      title="文字滚动"
      subtitle="支持四个方向、速度控制、悬停暂停与关闭的公告滚动组件"
      icon="text"
    />

    <div class="scroll-list">
      <!-- 基础用法 -->
      <TextScroll
        text="Lightning 是一款兼具设计美学与高效开发的桌面应用 <a target='_blank' href='https://www.electronjs.org/'>访问 Electron 官网</a> 了解更多"
        showClose
      />

      <!-- 使用不同的类型 -->
      <TextScroll type="success" text="这是一条成功类型的滚动公告" />

      <TextScroll type="warning" text="这是一条警告类型的滚动公告" />

      <TextScroll type="danger" text="这是一条危险类型的滚动公告" />

      <TextScroll type="info" text="这是一条信息类型的滚动公告" />

      <!-- 可关闭 -->
      <TextScroll
        text="这是一条可关闭的滚动公告"
        showClose
        @close="handleClose"
      />

      <!-- 自定义速度和方向 -->
      <TextScroll
        type="warning"
        text="这是一条速度较慢、向右滚动的公告"
        :speed="30"
        direction="right"
      />

      <TextScroll
        text="这是一条文字溢出才会滚动的公告，当文本内容超出容器宽度时才会开始滚动显示，否则保持静止状态"
        :alwaysScroll="false"
        showClose
        @close="handleClose"
      />

      <TextScroll
        type="danger"
        direction="up"
        :speed="30"
        text="这是一条向上滚动的公告"
      />

      <TextScroll
        type="info"
        direction="down"
        :speed="30"
        text="这是一条向下滚动的公告"
      />
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WidgetsTextScroll' })

/**
 * 处理关闭事件
 */
const handleClose = () => {
  ElMessage.info('文本滚动组件已关闭')
}
</script>

<style lang="scss" scoped>
.text-scroll-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.scroll-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
