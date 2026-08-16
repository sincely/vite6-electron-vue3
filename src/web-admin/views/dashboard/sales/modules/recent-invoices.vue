<template>
  <card class="recent-invoices">
    <template #header>
      <div class="dash-header">
        <h4>最近发票</h4>
      </div>
      <div class="recent-invoices-tools">
        <el-select
          v-model="status"
          class="recent-invoices-select"
          size="default"
        >
          <el-option label="全部状态" value="" />
          <el-option label="已支付" value="已支付" />
          <el-option label="待处理" value="待处理" />
          <el-option label="已逾期" value="已逾期" />
        </el-select>
        <el-input
          v-model="keyword"
          class="recent-invoices-search"
          placeholder="搜索客户或订单"
          :prefix-icon="Search"
          clearable
        />
      </div>
    </template>
    <template #content>
      <el-table :data="filteredList">
        <el-table-column type="selection" width="44" />
        <el-table-column label="编号" prop="code" width="100" />
        <el-table-column label="客户" min-width="180">
          <template #default="{ row }">
            <div class="recent-invoices-user">
              <el-avatar :src="row.avatar" :size="36" />
              <div>
                <div class="recent-invoices-name">{{ row.name }}</div>
                <div class="recent-invoices-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下单日期" width="120">
          <template #default="{ row }">
            <div>{{ row.date }}</div>
            <div class="recent-invoices-sub">{{ row.clock }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品" width="120">
          <template #default="{ row }">
            <div class="recent-invoices-products">
              <img
                v-for="(img, i) in row.products"
                :key="i"
                :src="img"
                alt="商品"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" prop="amount" width="100" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <span class="recent-invoices-status" :class="`is-${row.type}`">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60" fixed="right">
          <template #default>
            <el-button size="small" :icon="MoreFilled" circle />
          </template>
        </el-table-column>
      </el-table>
      <div class="recent-invoices-footer">
        <span class="recent-invoices-total">
          当前显示 {{ filteredList.length }} 条，共 {{ invoices.length }} 条
        </span>
      </div>
    </template>
  </card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Search, MoreFilled } from '@element-plus/icons-vue'
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'
import product1 from '@/assets/images/products/icon1.webp'
import product2 from '@/assets/images/products/icon2.webp'
import product3 from '@/assets/images/products/icon3.webp'

/**
 * 最近发票表格
 */
const keyword = ref('')
const status = ref('')

const invoices = [
  {
    code: '#SPK231',
    name: '简·书曼',
    email: 'jian.shuman@company.com',
    date: '2024-08-27',
    clock: '12:45',
    products: [product1, product2, product3],
    amount: '¥1,249',
    status: '已支付',
    type: 'success',
    avatar: avatar1
  },
  {
    code: '#SPK421',
    name: '杜文',
    email: 'duwen@company.com',
    date: '2024-09-16',
    clock: '11:15',
    products: [product2, product3],
    amount: '¥3,299',
    status: '待处理',
    type: 'warning',
    avatar: avatar2
  },
  {
    code: '#SPK175',
    name: '戴安娜',
    email: 'diana@company.com',
    date: '2024-09-15',
    clock: '16:45',
    products: [product1, product3],
    amount: '¥4,799',
    status: '已逾期',
    type: 'danger',
    avatar: avatar3
  },
  {
    code: '#SPK145',
    name: '李昂',
    email: 'liang@company.com',
    date: '2024-09-21',
    clock: '14:18',
    products: [product1],
    amount: '¥2,499',
    status: '已支付',
    type: 'success',
    avatar: avatar4
  },
  {
    code: '#SPK426',
    name: '萨拉·李',
    email: 'saralee765@gmail.com',
    date: '2024-10-19',
    clock: '15:52',
    products: [product2, product1],
    amount: '¥3,999',
    status: '已支付',
    type: 'success',
    avatar: avatar5
  }
]

const filteredList = computed(() => {
  const key = keyword.value.trim()
  return invoices.filter((item) => {
    const matchKey = !key || item.name.includes(key) || item.code.includes(key)
    const matchStatus = !status.value || item.status === status.value
    return matchKey && matchStatus
  })
})
</script>

<style lang="scss" scoped>
.recent-invoices {
  &-tools {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  &-select {
    width: 120px;
  }

  &-search {
    width: 200px;
  }

  &-user {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-email,
  &-sub {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-products {
    display: flex;
    gap: 6px;

    img {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 8px;
    }
  }

  &-status {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;

    &.is-success {
      color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 88%);
    }

    &.is-warning {
      color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning), transparent 88%);
    }

    &.is-danger {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }
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
