<template>
  <card class="country-ranking">
    <template #header>
      <div class="dash-header">
        <h4>受众国家排行</h4>
      </div>
    </template>
    <template #content>
      <el-table :data="countries">
        <el-table-column label="序号" prop="rank" width="70" />
        <el-table-column label="国家" min-width="120">
          <template #default="{ row }">
            <div class="country-ranking-name">
              <span class="country-ranking-flag">{{ row.flag }}</span>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="互动量" prop="interact" width="100" />
        <el-table-column label="粉丝数" min-width="130">
          <template #default="{ row }">
            <div class="country-ranking-fans">
              <span class="country-ranking-fans-value">{{ row.fans }}</span>
              <span :class="row.up ? 'text-up' : 'text-down'">
                {{ row.up ? '↗' : '↘' }} {{ row.trend }}
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </card>
</template>

<script setup>
/**
 * 受众国家排行
 */
const countries = [
  {
    rank: 1,
    flag: '🇺🇸',
    name: '美国',
    interact: '15,480',
    fans: '35,620',
    trend: '12.8%',
    up: true
  },
  {
    rank: 2,
    flag: '🇮🇳',
    name: '印度',
    interact: '12,260',
    fans: '25,410',
    trend: '6.5%',
    up: false
  },
  {
    rank: 3,
    flag: '🇨🇦',
    name: '加拿大',
    interact: '8,720',
    fans: '20,340',
    trend: '7.8%',
    up: true
  },
  {
    rank: 4,
    flag: '🇩🇪',
    name: '德国',
    interact: '4,950',
    fans: '12,690',
    trend: '10.9%',
    up: true
  },
  {
    rank: 5,
    flag: '🇫🇷',
    name: '法国',
    interact: '4,120',
    fans: '11,240',
    trend: '4.7%',
    up: false
  }
]
</script>

<style lang="scss" scoped>
.country-ranking {
  &-name {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-flag {
    font-size: 16px;
  }

  &-fans {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;

    &-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
}
</style>
