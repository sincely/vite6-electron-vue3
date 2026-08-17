<template>
  <div class="switch-role-page">
    <PageHeader
      title="切换角色"
      subtitle="一键切换登录账号，体验不同角色下的菜单可见性与按钮权限差异"
      icon="user"
    />

    <!-- 当前账号信息 -->
    <el-card shadow="never" class="role-card">
      <div class="current-user">
        <div class="current-user-info">
          <span class="current-label">当前账号</span>
          <span class="current-name">
            {{ userStore.userInfo?.realName || '未登录' }}
            <span class="current-username">
              （{{ userStore.userInfo?.username || '-' }}）
            </span>
          </span>
        </div>
        <div class="current-user-meta">
          <div class="meta-item">
            <span class="meta-label">角色</span>
            <el-tag
              v-for="role in userStore.roles"
              :key="role"
              size="small"
              type="primary"
              effect="light"
            >
              {{ role }}
            </el-tag>
            <span v-if="!userStore.roles.length" class="meta-empty">无</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">权限码</span>
            <el-tag
              v-for="perm in userStore.permissions"
              :key="perm"
              size="small"
              effect="plain"
            >
              {{ perm }}
            </el-tag>
            <span v-if="!userStore.permissions.length" class="meta-empty">
              无
            </span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 账号卡片 -->
    <div class="account-grid">
      <div
        v-for="account in accounts"
        :key="account.username"
        class="account-card"
        :class="{ 'is-current': account.username === currentUsername }"
        @click="handleSwitch(account)"
      >
        <div class="account-header">
          <div class="account-avatar" :style="{ background: account.color }">
            {{ account.name.slice(0, 1) }}
          </div>
          <div class="account-title">
            <span class="account-name">{{ account.name }}</span>
            <span class="account-username">{{ account.username }}</span>
          </div>
          <el-tag
            v-if="account.username === currentUsername"
            size="small"
            type="success"
            effect="light"
          >
            当前
          </el-tag>
        </div>
        <p class="account-desc">{{ account.desc }}</p>
        <div class="account-roles">
          <el-tag
            v-for="role in account.roles"
            :key="role"
            size="small"
            effect="plain"
          >
            {{ role }}
          </el-tag>
        </div>
        <el-button
          class="account-btn"
          :type="account.username === currentUsername ? 'info' : 'primary'"
          :loading="switching === account.username"
          :disabled="account.username === currentUsername"
          plain
        >
          {{
            account.username === currentUsername
              ? '已登录该账号'
              : '切换到该账号'
          }}
        </el-button>
      </div>
    </div>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="说明"
      description="切换账号会重新登录并刷新页面。不同角色可访问的菜单（如「页面可见性」仅 admin 可见）与按钮权限（见「按钮权限」页）各不相同，全部密码均为 123456。"
    />
  </div>
</template>

<script setup>
defineOptions({ name: 'example-switch-role' })
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const switching = ref('')

const currentUsername = computed(() => userStore.userInfo?.username)

// 与 mock 后端（src/backend/utils/mock-data.mjs）内置账号保持一致
const accounts = [
  {
    username: 'admin',
    password: '123456',
    name: '管理员',
    roles: ['admin'],
    color: 'var(--color-primary)',
    desc: '超级管理员，持有通配权限 *:*:*，可访问所有页面与全部按钮。'
  },
  {
    username: 'editor',
    password: '123456',
    name: '运营编辑',
    roles: ['editor'],
    color: 'var(--color-violet)',
    desc: '内容运营角色，持有新增 / 编辑 / 查看权限，无删除与导出权限。'
  },
  {
    username: 'user',
    password: '123456',
    name: '测试用户',
    roles: ['user'],
    color: 'var(--color-teal)',
    desc: '普通访客角色，仅持有查看权限，受限页面在菜单中不可见。'
  }
]

// 切换角色：重新登录后刷新页面，使菜单与指令权限重新计算
const handleSwitch = async (account) => {
  if (account.username === currentUsername.value || switching.value) return

  switching.value = account.username
  try {
    await userStore.loginAction({
      username: account.username,
      password: account.password
    })
    ElMessage.success(`已切换为「${account.name}」，即将刷新页面`)
    setTimeout(() => window.location.reload(), 500)
  } catch (error) {
    console.error('切换角色失败:', error)
  } finally {
    switching.value = ''
  }
}
</script>

<style lang="scss" scoped>
.switch-role-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.role-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.current-user {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.current-label {
  padding: 2px 8px;
  font-size: 12px;
  color: var(--color-text-active);
  background: var(--color-bg-status);
  border-radius: var(--radius-sm);
}

.current-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.current-username {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.current-user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}

.meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.meta-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.meta-empty {
  font-size: 13px;
  color: var(--color-text-muted);
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (width <= 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (width <= 768px) {
    grid-template-columns: 1fr;
  }
}

.account-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  cursor: pointer;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &.is-current {
    border-color: var(--color-success);
  }
}

.account-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.account-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  border-radius: 50%;
}

.account-title {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.account-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.account-username {
  font-size: 12px;
  color: var(--color-text-muted);
}

.account-desc {
  flex: 1;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.account-roles {
  display: flex;
  gap: 6px;
}

.account-btn {
  width: 100%;
}
</style>
