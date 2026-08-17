<template>
  <card class="recommended-follows">
    <template #header>
      <div class="dash-header">
        <h4>推荐关注</h4>
      </div>
      <el-link
        class="recommended-follows-more"
        type="primary"
        :underline="false"
      >
        查看全部
      </el-link>
    </template>
    <template #content>
      <el-scrollbar height="280px">
        <div
          v-for="item in users"
          :key="item.name"
          class="recommended-follows-item"
        >
          <el-avatar :src="item.avatar" :size="40" />
          <div class="recommended-follows-main">
            <div class="recommended-follows-name">{{ item.name }}</div>
            <div class="recommended-follows-friends">
              {{ item.friends }} 位共同好友
            </div>
          </div>
          <el-button
            :type="item.followed ? 'default' : 'primary'"
            size="small"
            round
            @click="item.followed = !item.followed"
          >
            {{ item.followed ? '已关注' : '关注' }}
          </el-button>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
import { reactive } from 'vue'
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'

/**
 * 推荐关注用户
 */
const users = reactive([
  { name: '陈雨', friends: 3, followed: false, avatar: avatar1 },
  { name: '李响', friends: 1, followed: false, avatar: avatar2 },
  { name: '王珂', friends: 2, followed: false, avatar: avatar3 },
  { name: '周琳', friends: 12, followed: false, avatar: avatar4 },
  { name: '宋佳', friends: 6, followed: false, avatar: avatar5 }
])
</script>

<style lang="scss" scoped>
.recommended-follows {
  &-more {
    margin-left: auto;
    font-size: 13px;
  }

  &-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &-main {
    flex: 1;
  }

  &-name {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-friends {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}
</style>
