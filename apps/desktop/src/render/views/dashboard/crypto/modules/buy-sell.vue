<template>
  <card class="buy-sell">
    <template #header>
      <div class="dash-header">
        <h4>买卖加密货币</h4>
      </div>
    </template>
    <template #content>
      <el-radio-group v-model="side" class="buy-sell-side">
        <el-radio-button value="buy">买入</el-radio-button>
        <el-radio-button value="sell">卖出</el-radio-button>
      </el-radio-group>

      <div class="buy-sell-row">
        <el-input v-model="amount" placeholder="输入金额" />
        <el-select v-model="payCoin" class="buy-sell-select">
          <el-option label="BTC" value="BTC" />
          <el-option label="ETH" value="ETH" />
          <el-option label="USDT" value="USDT" />
        </el-select>
      </div>
      <div class="buy-sell-row">
        <el-input v-model="receive" placeholder="获得数量" />
        <el-select v-model="receiveCoin" class="buy-sell-select">
          <el-option label="USD" value="USD" />
          <el-option label="CNY" value="CNY" />
        </el-select>
      </div>

      <div class="buy-sell-summary">
        <div class="buy-sell-summary-item">
          <span>价格：</span>
          <span>6.103435 BTC</span>
        </div>
        <div class="buy-sell-summary-item">
          <span>数量：</span>
          <span>2,344,543.00 LTC</span>
        </div>
        <div class="buy-sell-summary-item">
          <span>总计：</span>
          <span>22.50 BTC</span>
        </div>
      </div>
      <p class="buy-sell-fee">附加费用：0.30%（0.0001131 BTC）</p>

      <p class="buy-sell-pay-label">选择支付方式：</p>
      <el-radio-group v-model="payMethod" class="buy-sell-pay">
        <el-radio value="card">信用卡 / 借记卡</el-radio>
        <el-radio value="paypal">PayPal</el-radio>
        <el-radio value="wallet">钱包</el-radio>
      </el-radio-group>

      <el-button type="primary" class="buy-sell-submit">购买加密货币</el-button>
    </template>
  </card>
</template>

<script setup>
/**
 * 买卖加密货币表单
 */
const side = ref('buy')
const amount = ref('')
const receive = ref('')
const payCoin = ref('BTC')
const receiveCoin = ref('USD')
const payMethod = ref('card')
</script>

<style lang="scss" scoped>
.buy-sell {
  &-side {
    margin-bottom: 16px;
  }

  &-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  &-select {
    width: 110px;
  }

  &-summary {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    margin-bottom: 8px;
    background: color-mix(in srgb, var(--color-text-primary), transparent 96%);
    border-radius: 10px;

    &-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  &-fee {
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-pay-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &-pay {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  &-submit {
    width: 100%;
  }
}
</style>
