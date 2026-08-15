<!-- 组件中心 - 拖拽 | https://vue-draggable-plus.pages.dev/ -->
<template>
  <div class="drag-page">
    <PageHeader
      title="拖拽"
      subtitle="基于 vue-draggable-plus 的列表、过渡动画与表格拖拽排序"
      icon="drag"
    />

    <ElRow :gutter="20">
      <!-- 基础示例 -->
      <ElCol :xs="24" :md="12" class="page-col">
        <ElCard>
          <template #header>
            <span class="card-title">基础示例</span>
          </template>
          <VueDraggable v-model="userList">
            <div v-for="item in userList" :key="item.name" class="drag-item">
              {{ item.name }}
            </div>
          </VueDraggable>
        </ElCard>
      </ElCol>

      <!-- 过渡动画 -->
      <ElCol :xs="24" :md="12" class="page-col">
        <ElCard>
          <template #header>
            <span class="card-title">过渡动画</span>
          </template>
          <VueDraggable v-model="userList" target=".sort-target" :scroll="true">
            <TransitionGroup
              type="transition"
              tag="ul"
              name="fade"
              class="sort-target"
            >
              <li v-for="item in userList" :key="item.name" class="drag-item">
                {{ item.name }}
              </li>
            </TransitionGroup>
          </VueDraggable>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 表格拖拽排序 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">表格拖拽排序</span>
      </template>
      <VueDraggable v-model="userList" target="tbody" :animation="150">
        <ElTable :data="userList">
          <ElTableColumn label="姓名" prop="name" />
          <ElTableColumn label="角色" prop="role" />
        </ElTable>
      </VueDraggable>
    </ElCard>

    <!-- 指定元素拖拽排序 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">指定元素拖拽排序（通过操作列手柄）</span>
      </template>
      <VueDraggable
        v-model="userList"
        target="tbody"
        handle=".handle"
        :animation="150"
      >
        <ElTable :data="userList">
          <ElTableColumn label="姓名" prop="name" />
          <ElTableColumn label="角色" prop="role" />
          <ElTableColumn label="操作" width="100">
            <ElButton size="default" class="handle">移动</ElButton>
          </ElTableColumn>
        </ElTable>
      </VueDraggable>
    </ElCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

defineOptions({ name: 'WidgetsDrag' })

/**
 * 用户列表数据
 * 用于演示拖拽排序功能
 */
const userList = ref([
  { name: '孙悟空', role: '斗战胜佛' },
  { name: '猪八戒', role: '净坛使者' },
  { name: '沙僧', role: '金身罗汉' },
  { name: '唐僧', role: '旃檀功德佛' }
])
</script>

<style lang="scss" scoped>
.drag-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.page-col {
  margin-bottom: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.drag-item {
  padding: 10px;
  margin-bottom: 10px;
  cursor: move;
  background-color: var(--color-bg-active);
  border-radius: var(--radius-sm);
}

.sort-target {
  padding: 0;
  margin: 0;
  list-style: none;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}
</style>
