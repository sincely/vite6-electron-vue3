<template>
  <card class="hot-products-list">
    <template #header>
      <div class="dash-header">
        <h4>热销产品</h4>
        <p>本月销售情况</p>
      </div>
    </template>
    <template #content>
      <el-scrollbar height="340px">
        <el-table :data="tableData">
          <el-table-column label="产品" prop="product" width="220">
            <template #default="{ row }">
              <div class="hot-products-list-product">
                <img
                  class="hot-products-list-product-img"
                  :src="row.image"
                  alt="product"
                />
                <div class="hot-products-list-product-info">
                  <div class="hot-products-list-product-name">
                    {{ row.name }}
                  </div>
                  <div class="hot-products-list-product-category">
                    {{ row.category }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格" prop="price">
            <template #default="{ row }">
              <span class="hot-products-list-price">
                ¥{{ row.price.toLocaleString() }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock">
            <template #default="{ row }">
              <div
                class="hot-products-list-stock"
                :class="getStockClass(row.stock)"
              >
                {{ getStockStatus(row.stock) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="销量" prop="sales" />
          <el-table-column label="销售趋势" width="240">
            <template #default="{ row }">
              <el-progress
                :percentage="row.pro"
                :color="row.color"
                :stroke-width="4"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import product1 from '@/assets/images/products/icon1.webp'
import product2 from '@/assets/images/products/icon2.webp'
import product3 from '@/assets/images/products/icon3.webp'
import product4 from '@/assets/images/products/icon4.webp'
import product5 from '@/assets/images/products/icon5.webp'
import product6 from '@/assets/images/products/icon6.webp'

const ANIMATION_DELAY = 100
const STOCK_THRESHOLD = {
  LOW: 20,
  MEDIUM: 50
}

/**
 * 热销产品表格数据
 * 包含产品信息、库存、销量和销售趋势
 */
const tableData = reactive([
  {
    name: '智能手表 Pro',
    category: '电子设备',
    price: 1299,
    stock: 156,
    sales: 423,
    percentage: 75,
    pro: 0,
    color: 'var(--color-primary)',
    image: product1
  },
  {
    name: '无线蓝牙耳机',
    category: '音频设备',
    price: 499,
    stock: 89,
    sales: 652,
    percentage: 85,
    pro: 0,
    color: 'var(--color-success)',
    image: product2
  },
  {
    name: '机械键盘',
    category: '电脑配件',
    price: 399,
    stock: 12,
    sales: 238,
    percentage: 45,
    pro: 0,
    color: 'var(--color-warning)',
    image: product3
  },
  {
    name: '超薄笔记本电脑',
    category: '电子设备',
    price: 5999,
    stock: 0,
    sales: 126,
    percentage: 30,
    pro: 0,
    color: 'var(--color-danger)',
    image: product4
  },
  {
    name: '智能音箱',
    category: '智能家居',
    price: 799,
    stock: 45,
    sales: 321,
    percentage: 60,
    pro: 0,
    color: 'var(--color-info)',
    image: product5
  },
  {
    name: '游戏手柄',
    category: '游戏配件',
    price: 299,
    stock: 78,
    sales: 489,
    percentage: 70,
    pro: 0,
    color: 'var(--color-violet)',
    image: product6
  }
])

/**
 * 根据库存数量获取状态文本
 * @param stock 库存数量
 * @returns 库存状态文本
 */
function getStockStatus(stock) {
  if (stock === 0) return '缺货'
  if (stock < STOCK_THRESHOLD.LOW) return '低库存'
  if (stock < STOCK_THRESHOLD.MEDIUM) return '适中'
  return '充足'
}

/**
 * 根据库存数量获取状态样式类名
 * @param stock 库存数量
 * @returns CSS 类名
 */
function getStockClass(stock) {
  if (stock === 0) return 'is-danger'
  if (stock < STOCK_THRESHOLD.LOW) return 'is-warning'
  if (stock < STOCK_THRESHOLD.MEDIUM) return 'is-info'
  return 'is-success'
}

/**
 * 添加进度条动画效果
 * 延迟后将进度值从 0 更新到目标百分比，触发动画
 */
onMounted(() => {
  setTimeout(() => {
    tableData.forEach((item) => {
      item.pro = item.percentage
    })
  }, ANIMATION_DELAY)
})
</script>

<style lang="scss" scoped>
.hot-products-list {
  height: 445px;
  overflow: hidden;

  &-product {
    display: flex;
    align-items: center;

    &-img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 8px;
    }

    &-info {
      margin-left: 12px;
    }

    &-name {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-category {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }

  &-price {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-stock {
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

    &.is-info {
      color: var(--color-info);
      background: color-mix(in srgb, var(--color-info), transparent 88%);
    }

    &.is-danger {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }
  }
}
</style>
