<template>
  <div class="button-auth-page">
    <PageHeader
      title="按钮权限"
      subtitle="指令式与编程式两种按钮级权限控制，基于登录账号的权限码与角色"
      icon="shield-check"
    />

    <!-- 当前身份 -->
    <el-card shadow="never" class="auth-card">
      <div class="identity">
        <div class="identity-item">
          <span class="identity-label">当前角色</span>
          <el-tag
            v-for="role in userStore.roles"
            :key="role"
            size="small"
            type="primary"
            effect="light"
          >
            {{ role }}
          </el-tag>
          <span v-if="!userStore.roles.length" class="identity-empty">
            未登录
          </span>
        </div>
        <div class="identity-item">
          <span class="identity-label">权限码</span>
          <el-tag
            v-for="perm in userStore.permissions"
            :key="perm"
            size="small"
            effect="plain"
          >
            {{ perm }}
          </el-tag>
          <span v-if="!userStore.permissions.length" class="identity-empty">
            无
          </span>
        </div>
      </div>
    </el-card>

    <!-- 方式一：v-permission 指令（按权限码） -->
    <el-card shadow="never" class="auth-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">方式一：v-permission 指令（权限码）</span>
          <span class="card-desc">
            无权限时按钮直接从 DOM 移除，适合静态按钮
          </span>
        </div>
      </template>
      <div class="demo-rows">
        <div v-for="item in permButtons" :key="item.code" class="demo-row">
          <code class="demo-code">{{ item.code }}</code>
          <el-button v-permission="item.code" size="small" :type="item.type">
            {{ item.label }}
          </el-button>
        </div>
      </div>
      <pre class="code-block">
&lt;el-button v-permission="'example:add'"&gt;新增&lt;/el-button&gt;
&lt;!-- 数组形式：任一匹配即显示 --&gt;
&lt;el-button v-permission="['example:delete', 'example:manage']"&gt;删除&lt;/el-button&gt;</pre
      >
    </el-card>

    <!-- 方式二：v-role 指令（按角色） -->
    <el-card shadow="never" class="auth-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">方式二：v-role 指令（角色）</span>
          <span class="card-desc">按角色控制元素显隐</span>
        </div>
      </template>
      <div class="demo-rows">
        <div v-for="item in roleButtons" :key="item.role" class="demo-row">
          <code class="demo-code">{{ item.role }}</code>
          <el-button v-role="item.role" size="small" :type="item.type">
            {{ item.label }}
          </el-button>
        </div>
      </div>
      <pre class="code-block">
&lt;el-button v-role="'admin'"&gt;管理员操作&lt;/el-button&gt;
&lt;el-button v-role="['admin', 'editor']"&gt;管理或编辑可见&lt;/el-button&gt;</pre
      >
    </el-card>

    <!-- 方式三：编程式判断 -->
    <el-card shadow="never" class="auth-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            方式三：编程式判断（hasPermission / hasRole）
          </span>
          <span class="card-desc">需要在无权限时展示占位或降级 UI 时使用</span>
        </div>
      </template>
      <div class="demo-rows">
        <div
          v-for="item in permButtons"
          :key="`prog-${item.code}`"
          class="demo-row"
        >
          <code class="demo-code">{{ item.code }}</code>
          <el-button
            v-if="userStore.hasPermission(item.code)"
            size="small"
            :type="item.type"
          >
            {{ item.label }}
          </el-button>
          <span v-else class="no-auth-hint">无权限（v-if 条件渲染）</span>
        </div>
      </div>
      <pre class="code-block">
&lt;el-button v-if="userStore.hasPermission('example:add')"&gt;新增&lt;/el-button&gt;
&lt;el-button v-if="userStore.hasRole('admin')"&gt;管理员操作&lt;/el-button&gt;
// 通配权限 *:*:* 自动通过所有 hasPermission 判断（admin 账号）</pre
      >
    </el-card>
  </div>
</template>

<script setup>
defineOptions({ name: 'example-button-auth' })
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// 权限码按钮（与 mock 后端内置权限码对应）
// admin(*:*:*) 全部可见；editor 可见 add/edit/view；user 仅 view
const permButtons = [
  { code: 'example:view', label: '查看', type: 'info' },
  { code: 'example:add', label: '新增', type: 'primary' },
  { code: 'example:edit', label: '编辑', type: 'warning' },
  { code: 'example:delete', label: '删除', type: 'danger' },
  { code: 'example:export', label: '导出', type: 'success' }
]

const roleButtons = [
  { role: 'admin', label: '管理员可见', type: 'danger' },
  { role: 'editor', label: '编辑可见', type: 'warning' },
  { role: 'user', label: '普通用户可见', type: 'info' },
  { role: 'guest', label: '访客可见（无人拥有该角色）', type: 'info' }
]
</script>

<style lang="scss" scoped>
.button-auth-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.auth-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

.identity {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
}

.identity-item {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.identity-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.identity-empty {
  font-size: 13px;
  color: var(--color-text-muted);
}

.demo-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.demo-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.demo-code {
  padding: 2px 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
}

.no-auth-hint {
  font-size: 12px;
  color: var(--color-text-muted);
}

.code-block {
  padding: 12px;
  margin: 12px 0 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
}
</style>
