<template>
  <card class="employee-structure">
    <template #header>
      <div class="dash-header">
        <h4>员工结构</h4>
      </div>
    </template>
    <template #content>
      <div class="employee-structure-bar">
        <div
          v-for="item in segments"
          :key="item.label"
          class="employee-structure-bar-segment"
          :style="{
            width: item.percent + '%',
            background: item.color
          }"
        >
          {{ item.percent }}%
        </div>
      </div>
      <div class="employee-structure-legend">
        <div
          v-for="item in segments"
          :key="item.label"
          class="employee-structure-legend-item"
        >
          <span
            class="employee-structure-legend-dot"
            :style="{ background: item.color }"
          ></span>
          <span class="employee-structure-legend-label">{{ item.label }}</span>
          <span class="employee-structure-legend-value">{{ item.value }}</span>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
/**
 * 员工结构：堆叠比例条 + 分类图例
 */
const segments = [
  {
    label: '远程办公',
    value: '3,624',
    percent: 28,
    color: 'var(--color-primary)'
  },
  {
    label: '试用员工',
    value: '2,885',
    percent: 22,
    color: 'var(--color-success)'
  },
  {
    label: '正式员工',
    value: '4,372',
    percent: 34,
    color: 'var(--color-warning)'
  },
  {
    label: '外包/合同',
    value: '1,979',
    percent: 16,
    color: 'var(--color-danger)'
  }
]
</script>

<style lang="scss" scoped>
.employee-structure {
  &-bar {
    display: flex;
    height: 24px;
    margin-bottom: 24px;
    overflow: hidden;
    border-radius: 999px;

    &-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
    }
  }

  &-legend {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 40px;

    &-item {
      display: flex;
      align-items: center;
    }

    &-dot {
      width: 8px;
      height: 8px;
      margin-right: 8px;
      border-radius: 50%;
    }

    &-label {
      flex: 1;
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
}
</style>
