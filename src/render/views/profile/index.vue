<!-- 个人中心：资料卡 + 基本信息 / 偏好设置 / 账号安全 / 最近动态 -->
<template>
  <div class="profile-page">
    <PageHeader
      title="个人中心"
      subtitle="管理你的个人资料、偏好与账号安全"
      icon="user"
    />

    <!-- 资料卡 -->
    <div class="profile-hero">
      <div class="profile-hero__banner"></div>
      <div class="profile-hero__body">
        <div class="profile-hero__avatar-wrap">
          <img
            v-if="userAvatar && !avatarLoadFailed"
            :src="userAvatar"
            :alt="displayName"
            class="profile-hero__avatar"
            @error="avatarLoadFailed = true"
          />
          <span v-else class="profile-hero__avatar-fallback">
            {{ userInitial }}
          </span>
          <span class="profile-hero__status"></span>
        </div>
        <div class="profile-hero__meta">
          <div class="profile-hero__name-row">
            <h2 class="profile-hero__name">{{ displayName }}</h2>
            <span class="profile-hero__badge">{{ userBadge }}</span>
          </div>
          <p class="profile-hero__bio">
            {{ profileForm.bio || '这个人很懒，什么都没有留下。' }}
          </p>
          <div class="profile-hero__info">
            <span class="profile-hero__info-item">
              <el-icon><Message /></el-icon>
              {{ userEmail }}
            </span>
            <span v-if="userPhone" class="profile-hero__info-item">
              <el-icon><Iphone /></el-icon>
              {{ userPhone }}
            </span>
            <span class="profile-hero__info-item">
              <el-icon><Location /></el-icon>
              {{ profileForm.city || '未设置地区' }}
            </span>
            <span class="profile-hero__info-item">
              <el-icon><Calendar /></el-icon>
              {{ joinDate }} 加入
            </span>
          </div>
        </div>
        <div class="profile-hero__actions">
          <el-button type="primary" :icon="EditPen" @click="scrollToForm">
            编辑资料
          </el-button>
        </div>
      </div>
      <div class="profile-hero__stats">
        <div v-for="stat in stats" :key="stat.label" class="profile-stat">
          <span class="profile-stat__value" :style="{ color: stat.color }">
            {{ stat.value }}
          </span>
          <span class="profile-stat__label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <ElRow :gutter="20">
      <!-- 左侧：关于我 + 账号安全 -->
      <ElCol :xs="24" :md="9" :lg="8" class="page-col">
        <div class="profile-card">
          <h3 class="profile-card__title">
            <el-icon><User /></el-icon>
            关于我
          </h3>
          <p class="profile-card__desc">
            {{ profileForm.bio || '这个人很懒，什么都没有留下。' }}
          </p>
          <div class="profile-card__section">
            <span class="profile-card__section-label">擅长技能</span>
            <div class="profile-tags">
              <el-tag
                v-for="skill in skills"
                :key="skill"
                class="profile-tag"
                round
              >
                {{ skill }}
              </el-tag>
            </div>
          </div>
          <div class="profile-card__section">
            <span class="profile-card__section-label">角色权限</span>
            <div class="profile-tags">
              <el-tag
                v-for="role in userStore.roles"
                :key="role"
                type="success"
                class="profile-tag"
                round
              >
                {{ role }}
              </el-tag>
              <span v-if="!userStore.roles.length" class="profile-card__empty">
                暂无角色
              </span>
            </div>
          </div>
        </div>

        <div class="profile-card">
          <h3 class="profile-card__title">
            <el-icon><Lock /></el-icon>
            账号安全
          </h3>
          <div
            v-for="item in securityItems"
            :key="item.key"
            class="security-item"
          >
            <div class="security-item__icon" :style="{ background: item.bg }">
              <el-icon :color="item.color">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="security-item__meta">
              <span class="security-item__label">{{ item.label }}</span>
              <span class="security-item__desc">{{ item.desc }}</span>
            </div>
            <el-switch
              v-if="item.key !== 'password'"
              v-model="securityState[item.key]"
              @change="handleSecurityChange(item)"
            />
            <el-button
              v-else
              text
              type="primary"
              size="small"
              @click="handleChangePassword"
            >
              修改
            </el-button>
          </div>
        </div>
      </ElCol>

      <!-- 右侧：标签页（基本信息 / 偏好设置 / 最近动态） -->
      <ElCol :xs="24" :md="15" :lg="16" class="page-col">
        <div class="profile-card profile-card--tabs">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <el-tab-pane label="基本信息" name="basic">
              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-width="80px"
                class="profile-form"
              >
                <ElRow :gutter="16">
                  <ElCol :xs="24" :sm="12">
                    <el-form-item label="昵称" prop="nickname">
                      <el-input
                        v-model="profileForm.nickname"
                        placeholder="请输入昵称"
                        maxlength="20"
                      />
                    </el-form-item>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <el-form-item label="账号">
                      <el-input :model-value="username" disabled />
                    </el-form-item>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input
                        v-model="profileForm.email"
                        placeholder="请输入邮箱"
                      />
                    </el-form-item>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <el-form-item label="手机号">
                      <el-input :model-value="userPhone" disabled />
                    </el-form-item>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <el-form-item label="所在地区">
                      <el-input
                        v-model="profileForm.city"
                        placeholder="如：浙江 · 杭州"
                        maxlength="20"
                      />
                    </el-form-item>
                  </ElCol>
                  <ElCol :xs="24" :sm="12">
                    <el-form-item label="职位">
                      <el-input
                        v-model="profileForm.job"
                        placeholder="如：前端工程师"
                        maxlength="20"
                      />
                    </el-form-item>
                  </ElCol>
                  <ElCol :span="24">
                    <el-form-item label="个人简介">
                      <el-input
                        v-model="profileForm.bio"
                        type="textarea"
                        :rows="3"
                        maxlength="100"
                        show-word-limit
                        placeholder="介绍一下自己吧"
                      />
                    </el-form-item>
                  </ElCol>
                </ElRow>
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="saving"
                    :icon="Check"
                    @click="handleSaveProfile"
                  >
                    保存修改
                  </el-button>
                  <el-button :icon="RefreshLeft" @click="handleResetProfile">
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="偏好设置" name="preference">
              <div class="preference-list">
                <div
                  v-for="item in preferenceItems"
                  :key="item.key"
                  class="preference-item"
                >
                  <div class="preference-item__meta">
                    <span class="preference-item__label">{{ item.label }}</span>
                    <span class="preference-item__desc">{{ item.desc }}</span>
                  </div>
                  <el-switch
                    v-model="preferenceState[item.key]"
                    @change="handlePreferenceChange(item)"
                  />
                </div>
                <div class="preference-item">
                  <div class="preference-item__meta">
                    <span class="preference-item__label">界面语言</span>
                    <span class="preference-item__desc">
                      选择应用内显示的语言
                    </span>
                  </div>
                  <el-select
                    v-model="preferenceState.language"
                    class="preference-item__select"
                    @change="handleLanguageChange"
                  >
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="最近动态" name="activity">
              <el-timeline class="profile-timeline">
                <el-timeline-item
                  v-for="activity in activities"
                  :key="activity.id"
                  :type="activity.type"
                  :timestamp="activity.time"
                  :hollow="activity.hollow"
                  placement="top"
                >
                  <div class="activity-item">
                    <span class="activity-item__title">
                      {{ activity.title }}
                    </span>
                    <span class="activity-item__desc">
                      {{ activity.desc }}
                    </span>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>
          </el-tabs>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Check,
  EditPen,
  Iphone,
  Location,
  Message,
  RefreshLeft
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'profile' })

const userStore = useUserStore()

const avatarLoadFailed = ref(false)
const activeTab = ref('basic')
const saving = ref(false)
const profileFormRef = ref(null)

const buildProfileForm = () => ({
  nickname: userStore.userInfo?.nickname || userStore.userInfo?.realName || '',
  email: userStore.userInfo?.email || '',
  city: '浙江 · 杭州',
  job: '前端工程师',
  bio: '专注于桌面应用与前端工程化，喜欢把复杂的交互做简单。'
})

const profileForm = reactive(buildProfileForm())

const displayName = computed(
  () =>
    profileForm.nickname ||
    userStore.userInfo?.nickname ||
    userStore.userInfo?.realName ||
    userStore.userInfo?.name ||
    userStore.userInfo?.username ||
    'Admin'
)
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())
const userAvatar = computed(() => userStore.userInfo?.avatar || '')
const username = computed(() => userStore.userInfo?.username || 'admin')
const userPhone = computed(() => userStore.userInfo?.phone || '')
const userEmail = computed(() => {
  if (profileForm.email) return profileForm.email
  if (userStore.userInfo?.email) return userStore.userInfo.email
  return `${username.value}@lightning.app`
})
const userBadge = computed(() =>
  userStore.roles?.length ? userStore.roles[0].toUpperCase() : 'PRO'
)
const joinDate = '2023-06-18'

const stats = [
  { label: '参与项目', value: 24, color: 'var(--color-primary)' },
  { label: '待办任务', value: 8, color: '#d97706' },
  { label: '我的关注', value: 136, color: '#7c3aed' },
  { label: '粉丝', value: 512, color: '#e11d48' }
]

const skills = ['Vue 3', 'Electron', 'TypeScript', 'Vite', 'Node.js', 'UI 设计']

const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为 2-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const securityState = reactive({
  twoFactor: true,
  loginNotify: true
})

const securityItems = [
  {
    key: 'password',
    label: '登录密码',
    desc: '定期更换密码可以提升账号安全性',
    icon: 'Key',
    color: '#2563eb',
    bg: 'rgb(37 99 235 / 12%)'
  },
  {
    key: 'twoFactor',
    label: '两步验证',
    desc: '登录时额外要求输入动态验证码',
    icon: 'Iphone',
    color: '#059669',
    bg: 'rgb(16 185 129 / 12%)'
  },
  {
    key: 'loginNotify',
    label: '异地登录提醒',
    desc: '检测到异常登录时通过邮件通知',
    icon: 'Bell',
    color: '#d97706',
    bg: 'rgb(217 119 6 / 12%)'
  }
]

const preferenceState = reactive({
  messageNotify: true,
  soundNotify: false,
  autoUpdate: true,
  language: 'zh-CN'
})

const preferenceItems = [
  {
    key: 'messageNotify',
    label: '消息通知',
    desc: '接收系统消息与任务提醒'
  },
  {
    key: 'soundNotify',
    label: '提示音',
    desc: '新消息到达时播放提示音'
  },
  {
    key: 'autoUpdate',
    label: '自动更新',
    desc: '有新版本时在后台自动下载'
  }
]

const activities = [
  {
    id: 1,
    title: '更新了个人资料',
    desc: '修改了个人简介与所在地区',
    time: '今天 10:24',
    type: 'primary',
    hollow: true
  },
  {
    id: 2,
    title: '完成「数据看板」页面重构',
    desc: '提交了 12 个文件变更，通过代码评审',
    time: '昨天 18:02',
    type: 'success',
    hollow: true
  },
  {
    id: 3,
    title: '加入「Lightning 桌面端」项目组',
    desc: '被 管理员 邀请加入项目，角色为前端开发',
    time: '2026-08-10 09:30',
    type: 'warning',
    hollow: true
  },
  {
    id: 4,
    title: '开启两步验证',
    desc: '账号安全等级提升为「高」',
    time: '2026-08-06 14:15',
    type: 'danger',
    hollow: true
  }
]

const scrollToForm = () => {
  activeTab.value = 'basic'
  profileFormRef.value?.$el?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const handleSaveProfile = async () => {
  try {
    await profileFormRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  // 模拟保存：将昵称与邮箱同步到用户存储
  await new Promise((resolve) => setTimeout(resolve, 600))
  userStore.setUserInfo({
    ...userStore.userInfo,
    nickname: profileForm.nickname,
    email: profileForm.email
  })
  saving.value = false
  ElMessage.success('个人资料已保存')
}

const handleResetProfile = () => {
  Object.assign(profileForm, buildProfileForm())
  profileFormRef.value?.clearValidate()
}

const handleSecurityChange = (item) => {
  const enabled = securityState[item.key]
  ElMessage.success(`${item.label}已${enabled ? '开启' : '关闭'}`)
}

const handleChangePassword = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码', '修改密码', {
      inputType: 'password',
      inputPlaceholder: '6-20 位字符',
      confirmButtonText: '确认修改',
      cancelButtonText: '取消',
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: '密码长度需为 6-20 位'
    })
    if (value) {
      ElMessage.success('密码修改成功')
    }
  } catch {
    // 用户取消
  }
}

const handlePreferenceChange = (item) => {
  const enabled = preferenceState[item.key]
  ElMessage.success(`${item.label}已${enabled ? '开启' : '关闭'}`)
}

const handleLanguageChange = () => {
  ElMessage.info('界面语言切换将在下个版本支持')
}
</script>

<style lang="scss" scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ─── 资料卡 ───────────────────────────────
.profile-hero {
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  &__banner {
    height: 120px;
    background:
      radial-gradient(
        ellipse at 80% 20%,
        rgb(255 255 255 / 25%),
        transparent 50%
      ),
      var(--gradient-primary);
  }

  &__body {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    padding: 0 24px;
    margin-top: -40px;
  }

  &__avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  &__avatar,
  &__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88px;
    height: 88px;
    overflow: hidden;
    font-size: 34px;
    font-weight: 700;
    color: #fff;
    background: var(--color-primary);
    border: 4px solid var(--color-bg-card);
    border-radius: 50%;
    box-shadow: var(--shadow-md);
  }

  &__avatar {
    object-fit: cover;
  }

  &__status {
    position: absolute;
    right: 6px;
    bottom: 6px;
    width: 16px;
    height: 16px;
    background: #10b981;
    border: 3px solid var(--color-bg-card);
    border-radius: 50%;
  }

  &__meta {
    flex: 1;
    min-width: 0;
    padding-bottom: 4px;
  }

  &__name-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__name {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: var(--color-primary);
    background: var(--brand-accent-soft);
    border: 1px solid color-mix(in srgb, var(--color-primary), transparent 40%);
    border-radius: 8px;
  }

  &__bio {
    margin: 4px 0 8px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__info {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
  }

  &__info-item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__actions {
    flex-shrink: 0;
    padding-bottom: 4px;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 16px 24px;
    margin-top: 20px;
    border-top: 1px solid var(--color-border);
  }
}

.profile-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;

  & + & {
    border-left: 1px solid var(--color-border-light);
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
  }

  &__label {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

// ─── 通用卡片 ─────────────────────────────
.page-col {
  margin-bottom: 20px;
}

.profile-card {
  padding: 20px;
  margin-bottom: 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  &--tabs {
    height: 100%;
    margin-bottom: 0;
  }

  &__title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 0 0 14px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__desc {
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-secondary);
  }

  &__section {
    padding-top: 14px;
    border-top: 1px solid var(--color-border-light);

    & + & {
      margin-top: 14px;
    }
  }

  &__section-label {
    display: block;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  &__empty {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.profile-tag {
  font-weight: 500;
}

// ─── 账号安全 ─────────────────────────────
.security-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--color-border-light);

  &:first-of-type {
    padding-top: 4px;
    border-top: none;
  }

  &__icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  &__meta {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__desc {
    overflow: hidden;
    font-size: 12px;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ─── 标签页 / 表单 ────────────────────────
.profile-tabs {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}

.profile-form {
  max-width: 720px;
  padding-top: 8px;
}

// ─── 偏好设置 ─────────────────────────────
.preference-list {
  display: flex;
  flex-direction: column;
  max-width: 640px;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__desc {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__select {
    width: 140px;
  }
}

// ─── 最近动态 ─────────────────────────────
.profile-timeline {
  padding-top: 8px;
  padding-left: 4px;
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__desc {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

// ─── 响应式 ───────────────────────────────
@media (width <= 768px) {
  .profile-hero {
    &__body {
      flex-wrap: wrap;
      gap: 12px;
    }

    &__stats {
      grid-template-columns: repeat(2, 1fr);
      row-gap: 14px;
    }
  }

  .profile-stat:nth-child(3) {
    border-left: none;
  }
}
</style>
