<template>
  <div class="page-visibility-page">
    <PageHeader
      title="页面可见性"
      subtitle="路由级权限控制：本页面仅 admin 角色可见（meta.roles 声明）"
      icon="open-eye"
    />

    <el-card shadow="never" class="visibility-card">
      <div class="role-banner">
        <span class="role-banner-label">当前角色</span>
        <el-tag
          v-for="role in userStore.roles"
          :key="role"
          type="primary"
          effect="light"
        >
          {{ role }}
        </el-tag>
        <span class="role-banner-tip">
          你能看到本页面，说明当前角色在路由 meta.roles 白名单内
        </span>
      </div>
    </el-card>

    <el-card shadow="never" class="visibility-card">
      <template #header>
        <span class="card-title">实现原理</span>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(step, index) in steps"
          :key="index"
          :timestamp="step.title"
          placement="top"
          type="primary"
        >
          <p class="step-desc">{{ step.desc }}</p>
          <pre v-if="step.code" class="code-block">{{ step.code }}</pre>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-card shadow="never" class="visibility-card">
      <template #header>
        <span class="card-title">验证方式</span>
      </template>
      <ul class="verify-list">
        <li>切换到「功能示例 → 切换角色」页，以 user 或 editor 账号重新登录</li>
        <li>侧边栏「功能示例」分组中将不再显示「页面可见性」菜单项</li>
        <li>全局搜索（Ctrl/Cmd + K）中也搜索不到本页面</li>
        <li>
          直接访问本页面地址会被路由守卫拦截，提示「当前角色无权访问该页面」并跳回工作台
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script setup>
defineOptions({ name: 'example-page-visibility' })
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const steps = [
  {
    title: '1. 路由声明角色白名单',
    desc: '在路由 meta 中通过 roles 字段声明允许访问的角色，未声明则不限制。',
    code: `{
  path: 'page-visibility',
  component: () => import('@/views/examples/permission/page-visibility/index.vue'),
  meta: { title: '页面可见性', roles: ['admin'] }
}`
  },
  {
    title: '2. 菜单按角色过滤',
    desc: 'config/menu.js 的 visibleMenuItems 依据用户角色递归过滤菜单树，分组下子项全部隐藏时整个分组一并隐藏，全局搜索同步排除。'
  },
  {
    title: '3. 路由守卫拦截直达访问',
    desc: 'router.beforeEach 中校验目标路由 meta.roles 与当前用户角色的交集，无交集时提示并重定向到工作台，防止绕过菜单直接输入地址访问。',
    code: `const requiredRoles = to.meta?.roles
if (requiredRoles?.length && !requiredRoles.some((r) => userStore.roles.includes(r))) {
  ElMessage.warning('当前角色无权访问该页面')
  next({ path: '/desktop' })
  return
}`
  }
]
</script>

<style lang="scss" scoped>
.page-visibility-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.visibility-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.role-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.role-banner-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.role-banner-tip {
  font-size: 12px;
  color: var(--color-text-muted);
}

.step-desc {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.code-block {
  padding: 12px;
  margin: 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
}

.verify-list {
  padding-left: 18px;
  margin: 0;
  font-size: 13px;
  line-height: 2;
  color: var(--color-text-secondary);
}
</style>
