<template>
  <div class="table-card">
    <el-table
      v-bind="$attrs"
      style="width: 100%"
      height="100%"
      class="custom-table"
      :row-class-name="tableRowClassName"
    >
      <slot></slot>
    </el-table>

    <back-top target=".table-card .el-scrollbar__wrap"></back-top>
  </div>
</template>

<script setup>
const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'stripe-row' : ''
}
</script>

<style lang="scss" scoped>
/* Table Section */
.table-card {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-surface-border);
  border-radius: 16px;
  box-shadow:
    var(--shadow-sm),
    inset 0 0 0 1px rgb(255 255 255 / 5%);
}

.custom-table {
  // 玻璃拟态表格变量
  --el-table-header-bg-color: color-mix(
    in srgb,
    var(--color-bg-card),
    transparent 60%
  );
  --el-table-header-text-color: var(--color-text-secondary);
  --el-table-text-color: var(--color-text-primary);
  --el-table-row-hover-bg-color: color-mix(
    in srgb,
    var(--brand-accent),
    transparent 92%
  );
  --el-table-border-color: color-mix(
    in srgb,
    var(--color-border-light),
    transparent 50%
  );

  background: transparent !important;

  :deep(tr) {
    background: transparent;
    transition: background-color 0.2s ease;
  }

  :deep(th.el-table__cell) {
    height: 52px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background-image: linear-gradient(
      to bottom,
      rgb(255 255 255 / 4%) 0%,
      transparent 100%
    );
    border-bottom: 1px solid var(--color-border-light);
  }

  :deep(td.el-table__cell) {
    height: 64px;
    font-size: 13px;
    border-bottom: 1px solid var(--color-border-light);
  }

  /* 斑马纹 */
  :deep(.stripe-row) {
    background: color-mix(in srgb, var(--color-bg-hover), transparent 70%);
  }
}
</style>
