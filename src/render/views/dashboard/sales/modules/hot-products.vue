<template>
  <card class="hot-products">
    <template #header>
      <div class="dash-header">
        <h4>热销商品</h4>
      </div>
      <el-link class="hot-products-more" type="primary" underline="never">
        查看全部 →
      </el-link>
    </template>
    <template #content>
      <el-scrollbar height="320px">
        <div
          v-for="item in products"
          :key="item.name"
          class="hot-products-item"
        >
          <img class="hot-products-img" :src="item.image" alt="product" />
          <div class="hot-products-main">
            <div class="hot-products-name">{{ item.name }}</div>
            <div class="hot-products-meta">
              <span class="hot-products-price">¥{{ item.price }}</span>
              <span
                class="hot-products-stock"
                :class="item.inStock ? 'is-success' : 'is-danger'"
              >
                • {{ item.inStock ? '库存充足' : '暂时缺货' }}
              </span>
            </div>
          </div>
          <div class="hot-products-sales">
            <div class="hot-products-sales-value">{{ item.sales }}</div>
            <div class="hot-products-sales-label">销量</div>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
import product1 from '@/assets/images/products/icon1.webp'
import product2 from '@/assets/images/products/icon2.webp'
import product3 from '@/assets/images/products/icon3.webp'
import product4 from '@/assets/images/products/icon4.webp'
import product5 from '@/assets/images/products/icon5.webp'

/**
 * 热销商品列表
 */
const products = [
  {
    name: '北极星挂钟',
    price: 699,
    inStock: true,
    sales: '1,020',
    image: product1
  },
  {
    name: '俱乐部抓绒卫衣',
    price: 55,
    inStock: true,
    sales: '3100',
    image: product2
  },
  {
    name: '灵犀 Pro 耳机',
    price: 199,
    inStock: true,
    sales: '1,280',
    image: product3
  },
  {
    name: '暖心保温壶',
    price: 699,
    inStock: false,
    sales: '980',
    image: product4
  },
  {
    name: '轻行女士手袋',
    price: 89,
    inStock: true,
    sales: '2,080',
    image: product5
  }
]
</script>

<style lang="scss" scoped>
.hot-products {
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

  &-img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 10px;
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

  &-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  &-price {
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &-stock {
    &.is-success {
      color: var(--color-success);
    }

    &.is-danger {
      color: var(--color-danger);
    }
  }

  &-sales {
    text-align: right;

    &-value {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
