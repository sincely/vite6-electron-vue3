<template>
  <div class="log-container page-enter">
    <PageHeader
      title="系统日志"
      subtitle="查看系统操作记录和运行状态"
      icon="cpu"
    >
      <template #actions>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索日志..."
          class="search-input"
          :prefix-icon="Search"
          clearable
        />
        <el-button type="primary" class="export-btn">
          <SvgIcon icon-class="download" width="16px" height="16px" />
          <span>导出日志</span>
        </el-button>
      </template>
    </PageHeader>
    <!-- 搜索栏 -->
    <DynamicSearchBar
      :items="searchItems"
      :params="searchParams"
      @query="handleQuery"
      @reset="handleReset"
    />
    <!-- 表格 -->
    <AdvanceTable
      ref="tableRef"
      :columns="columns"
      :func="getTableList"
      :config="config"
      :params="searchParams"
    >
      <!-- 定义插槽内容 -->
      <template #nameHeader="{ column }">
        <el-icon><User /></el-icon>
        <span style="margin-left: 4px">{{ column.label }}</span>
      </template>
      <template #date="{ row }">
        <span class="date-cell">{{ row.date }}</span>
      </template>

      <template #name="{ row }">
        <div class="user-cell">
          <div class="user-avatar">{{ row.name.charAt(0) }}</div>
          <span>{{ row.name }}</span>
        </div>
      </template>

      <template #type="{ row }">
        <span class="status-pill type-pill">{{ row.type }}</span>
      </template>

      <template #address="{ row }">
        <span class="address-text">{{ row.address }}</span>
      </template>

      <template #status="{ row }">
        <div
          class="status-dot"
          :class="row.status === 'Success' ? 'success' : 'warning'"
        ></div>
      </template>

      <template #action="{ row }">
        <el-button type="primary" link size="small" @click="handleDetail(row)">
          查看
        </el-button>
      </template>
    </AdvanceTable>

    <!-- 详情弹窗 -->
    <ModalDialog
      v-model="dialogVisible"
      title="日志详情"
      subtitle="查看完整的操作日志信息"
      icon="document"
      width="600px"
    >
      <div v-if="currentRow" class="detail-content">
        <div class="detail-item">
          <span class="label">操作时间</span>
          <span class="value">{{ currentRow.date }}</span>
        </div>
        <div class="detail-item">
          <span class="label">操作人员</span>
          <div class="user-value">
            <div class="user-avatar-sm">{{ currentRow.name.charAt(0) }}</div>
            <span>{{ currentRow.name }}</span>
          </div>
        </div>
        <div class="detail-item">
          <span class="label">日志类型</span>
          <span class="status-pill type-pill">系统操作</span>
        </div>
        <div class="detail-item">
          <span class="label">操作内容</span>
          <span class="value">{{ currentRow.address }}</span>
        </div>
        <div class="detail-item full">
          <span class="label">原始数据</span>
          <pre class="code-block">{{
            JSON.stringify(currentRow, null, 2)
          }}</pre>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          导出记录
        </el-button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/index.vue'
import AdvanceTable from '@/components/AdvanceTable/index.vue'
import { useDialog } from '@/hooks/useDialog'
import { getTableList } from '@/api/table'
import { ElButton } from 'element-plus'

const searchKeyword = ref('')
const dialogVisible = ref(false)
const currentRow = ref(null)

const columns = [
  {
    prop: 'date',
    label: '时间',
    width: 180,
    sortable: true,
    slot: 'date'
  },
  {
    prop: 'name',
    label: '操作人',
    width: 180,
    headerSlot: 'nameHeader', // 指定插槽名称
    sortable: true,
    slot: 'name'
  },
  { prop: 'type', label: '类型', width: 120, slot: 'type' },
  { prop: 'address', label: '详情信息', slot: 'address' },
  { label: '状态', width: 100, slot: 'status', align: 'center' },
  { label: '操作', width: 100, slot: 'action', align: 'center' }
]

const config = {
  selection: true,
  // sort: false,
  notPagination: false
}

const searchItems = [
  {
    prop: 'date',
    label: '时间:',
    type: 'date',
    permi: 'user:query',
    component: {
      name: 'DatePicker',
      props: {
        value: { type: String, default: '' },
        format: { type: String, default: 'yyyy-MM-dd' },
        valueFormat: { type: String, default: 'yyyy-MM-dd' }
      }
    }
  },
  { prop: 'name', label: '操作人:', type: 'input', permi: 'user:query' },
  {
    prop: 'type',
    label: '类型',
    type: 'select',
    permi: 'user:query',
    component: {
      placeholder: '请选择日志类型',
      options: [
        { label: '系统操作', value: 'System' },
        { label: '用户操作', value: 'User' },
        { label: '管理员操作', value: 'Admin' }
      ]
    }
  },
  { prop: 'address', label: '详情信息:', type: 'input', permi: 'user:query' },
  { prop: 'address', label: '详情信息:', type: 'input', permi: 'user:query' },
  { prop: 'address', label: '详情信息:', type: 'input', permi: 'user:query' },
  { prop: 'address', label: '详情信息:', type: 'input', permi: 'user:query' }
]

const searchParams = reactive({
  date: '',
  name: '',
  type: '',
  address: ''
})

const tableRef = ref(null)

const handleQuery = () => {
  tableRef.value?.getList()
}

const handleReset = () => {
  tableRef.value?.resetQuery()
}

const { open } = useDialog()

const handleDetail = (row) => {
  open({
    title: '日志详情',
    subtitle: '查看完整的操作日志信息',
    icon: 'document',
    width: '600px',
    content: () =>
      h('div', { class: 'detail-content' }, [
        h('div', { class: 'detail-item' }, [
          h('span', { class: 'label' }, '操作时间'),
          h('span', { class: 'value' }, row.date)
        ]),
        h('div', { class: 'detail-item' }, [
          h('span', { class: 'label' }, '操作人员'),
          h('div', { class: 'user-value' }, [
            h('div', { class: 'user-avatar-sm' }, row.name.charAt(0)),
            h('span', null, row.name)
          ])
        ]),
        h('div', { class: 'detail-item' }, [
          h('span', { class: 'label' }, '日志类型'),
          h('span', { class: 'status-pill type-pill' }, '系统操作')
        ]),
        h('div', { class: 'detail-item' }, [
          h('span', { class: 'label' }, '操作内容'),
          h('span', { class: 'value' }, row.address)
        ]),
        h('div', { class: 'detail-item full' }, [
          h('span', { class: 'label' }, '原始数据'),
          h('pre', { class: 'code-block' }, JSON.stringify(row, null, 2))
        ])
      ]),
    footer: ({ close }) =>
      h('div', [
        h(ElButton, { onClick: close }, () => '关闭'),
        h(ElButton, { type: 'primary', onClick: close }, () => '导出记录')
      ])
  })
}
</script>

<style lang="scss" scoped>
.log-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.search-input {
  width: 240px;

  :deep(.el-input__wrapper) {
    background-color: var(--color-bg-card);
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--color-border) inset;
    transition: all 0.2s;

    &:hover,
    &.is-focus {
      background-color: var(--color-bg-window);
      box-shadow: 0 0 0 1px var(--color-primary) inset;
    }
  }
}

.export-btn {
  display: flex;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  font-weight: 600;
  border-radius: 8px;

  span {
    margin-left: 4px;
  }
}

.date-cell {
  padding: 4px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.user-cell {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 500;

  .user-avatar {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(
      135deg,
      var(--color-primary),
      var(--brand-accent)
    );
    border-radius: 50%;
  }
}

.type-pill {
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  border-radius: 6px;
}

.address-text {
  color: var(--color-text-primary);
}

.status-dot {
  width: 8px;
  height: 8px;
  margin: 0 auto;
  border-radius: 50%;

  &.success {
    background-color: var(--color-success);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--color-success), transparent 80%);
  }

  &.warning {
    background-color: var(--color-warning);
    box-shadow: 0 0 10px
      color-mix(in srgb, var(--color-warning), transparent 40%);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(2);
  }
}

/* Detail Dialog */
.detail-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full {
    grid-column: span 2;
  }

  .label {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }
}

.user-value {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-avatar-sm {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--brand-accent)
  );
  border-radius: 50%;
}

.code-block {
  padding: 12px;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-bg-card), transparent 50%);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
}
</style>
