<template>
  <div class="log-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <el-button type="primary" link>导出日志</el-button>
        </div>
      </template>
      <el-table
        :data="tableData"
        style="width: 100%"
        stripe
        class="log-table"
        highlight-current-row
      >
        <el-table-column prop="date" label="Date" width="180" sortable />
        <el-table-column prop="name" label="Name" width="180" sortable />
        <el-table-column prop="address" label="Address" />
      </el-table>
    </el-card>

    <back-top></back-top>
  </div>
</template>

<script setup>
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },

  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  }
]
</script>

<style lang="scss" scoped>
.log-container {
  height: 100%;
  background-color: var(--color-bg-primary);

  .box-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--color-bg-card);
    border: none;

    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid var(--color-border);
    }

    :deep(.el-card__body) {
      flex: 1;
      padding: 0;
      overflow: hidden;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  :deep(.el-table) {
    height: 100%;

    --el-table-border-color: var(--color-border);
    --el-table-header-bg-color: var(--color-bg-hover);
    --el-table-row-hover-bg-color: var(--color-bg-hover);
    --el-table-tr-bg-color: var(--color-bg-card);
    --el-text-color-regular: var(--color-text-primary);
    --el-table-header-text-color: var(--color-text-primary);

    th.el-table__cell {
      font-weight: 600;
      background-color: var(--color-bg-hover);
    }
  }
}
</style>
