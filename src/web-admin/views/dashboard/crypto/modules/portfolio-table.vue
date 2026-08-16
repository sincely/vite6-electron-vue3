<template>
  <card class="portfolio-table">
    <template #header>
      <div class="dash-header">
        <h4>投资组合总览</h4>
      </div>
      <div class="portfolio-table-tools">
        <el-input
          v-model="keyword"
          class="portfolio-table-search"
          placeholder="搜索资产"
          :prefix-icon="Search"
          clearable
        />
        <el-button :icon="Filter">筛选</el-button>
      </div>
    </template>
    <template #content>
      <el-table :data="filteredList">
        <el-table-column label="资产类型" min-width="150">
          <template #default="{ row }">
            <div class="portfolio-table-coin">
              <span
                class="portfolio-table-symbol"
                :style="{
                  color: row.color,
                  background: `color-mix(in srgb, ${row.color}, transparent 88%)`
                }"
              >
                {{ row.icon }}
              </span>
              <span class="portfolio-table-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="当前余额（币）"
          prop="balance"
          min-width="120"
        />
        <el-table-column
          label="当前价格（美元）"
          prop="price"
          min-width="130"
        />
        <el-table-column label="总价值（美元）" prop="total" min-width="120" />
        <el-table-column label="24小时涨跌" min-width="110">
          <template #default="{ row }">
            <span :class="row.changeUp ? 'text-up' : 'text-down'">
              {{ row.change }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="总盈亏（美元）" min-width="120">
          <template #default="{ row }">
            <span :class="row.profitUp ? 'text-up' : 'text-down'">
              {{ row.profit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="24小时成交额（美元）"
          prop="volume"
          min-width="150"
        />
        <el-table-column label="市场排名" prop="rank" width="90" />
      </el-table>
      <div class="portfolio-table-footer">
        <span class="portfolio-table-total">
          显示 {{ filteredList.length }} 条记录
        </span>
      </div>
    </template>
  </card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Search, Filter } from '@element-plus/icons-vue'

/**
 * 投资组合总览表格
 */
const keyword = ref('')

const assets = [
  {
    icon: '₿',
    name: '比特币 (BTC)',
    balance: '2.5',
    price: '$30,100.60',
    total: '$75,251.50',
    change: '+1.4%',
    changeUp: true,
    profit: '+$6,120.00',
    profitUp: true,
    volume: '$6.8 Billion',
    rank: '#1',
    color: '#f7931a'
  },
  {
    icon: 'Ξ',
    name: '以太坊 (ETH)',
    balance: '15',
    price: '$1,895.30',
    total: '$28,429.50',
    change: '+1.1%',
    changeUp: true,
    profit: '+$2,220.00',
    profitUp: true,
    volume: '$2.3 Billion',
    rank: '#2',
    color: '#627eea'
  },
  {
    icon: 'Ð',
    name: '狗狗币 (DOGE)',
    balance: '100,000',
    price: '$0.078',
    total: '$7,800.00',
    change: '+4.9%',
    changeUp: true,
    profit: '+$360.00',
    profitUp: true,
    volume: '$1.9 Billion',
    rank: '#9',
    color: '#c2a633'
  },
  {
    icon: '₮',
    name: '泰达币 (USDT)',
    balance: '10,000',
    price: '$1.00',
    total: '$10,000.00',
    change: '0.0%',
    changeUp: true,
    profit: '$0.00',
    profitUp: true,
    volume: '$25.4 Billion',
    rank: '#3',
    color: '#26a17b'
  },
  {
    icon: '✕',
    name: '瑞波币 (XRP)',
    balance: '5,000',
    price: '$0.78',
    total: '$3,900.00',
    change: '+2.7%',
    changeUp: true,
    profit: '+$540.00',
    profitUp: true,
    volume: '$1.6 Billion',
    rank: '#6',
    color: '#0ea5e9'
  },
  {
    icon: 'A',
    name: '艾达币 (ADA)',
    balance: '10,000',
    price: '$0.37',
    total: '$3,700.00',
    change: '-0.6%',
    changeUp: false,
    profit: '-$80.00',
    profitUp: false,
    volume: '$360 Million',
    rank: '#8',
    color: '#6366f1'
  }
]

const filteredList = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  if (!key) return assets
  return assets.filter((item) => item.name.toLowerCase().includes(key))
})
</script>

<style lang="scss" scoped>
.portfolio-table {
  &-tools {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  &-search {
    width: 200px;
  }

  &-coin {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 8px;
  }

  &-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
  }

  &-total {
    font-size: 13px;
    color: var(--color-text-muted);
  }
}
</style>
