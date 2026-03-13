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

    <EditTable
      v-model:data="tableData"
      :columns="columns"
      :rules="rules"
      @save="handleSave"
      @delete="handleDelete"
      @add="handleAdd"
    />
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/index.vue'
import { useDialog } from '@/hooks/useDialog'
import { ElButton } from 'element-plus'
import EditTable from '@/components/EditTable/index.vue'
import { ref } from 'vue'

const searchKeyword = ref('')
const columns = [
  { prop: 'name', label: '姓名', editType: 'input', required: true },
  {
    prop: 'role',
    label: '角色',
    editType: 'select',
    required: true,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' }
    ]
  },
  {
    prop: 'age',
    label: '年龄',
    editType: 'number',
    rules: [
      { required: true, message: '请输入年龄', trigger: 'blur' },
      { type: 'number', min: 18, message: '年龄必须大于18岁', trigger: 'blur' }
    ]
  },
  // 日期选择
  {
    prop: 'date',
    label: '操作时间',
    editType: 'datetime',
    editWidth: '200px',
    required: true
  },
  // 日期范围
  {
    prop: 'range',
    label: '时间范围',
    editType: 'daterange',
    editWidth: '240px',
    editProps: {
      'start-placeholder': '开始',
      'end-placeholder': '结束',
      'value-format': 'YYYY-MM-DD'
    },
    required: true
  }
]
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  date: [{ required: true, message: '请选择操作时间', trigger: 'change' }],
  range: [
    {
      required: true,
      message: '请选择时间范围',
      trigger: 'change',
      type: 'array'
    }
  ]
}

const tableData = ref([
  {
    id: 1,
    date: '2024-03-15 14:23:45',
    name: 'Admin',
    role: 'admin',
    age: 30,
    address: '登录系统成功 (IP: 192.168.1.10)'
  },
  {
    id: 2,
    date: '2024-03-15 13:12:33',
    name: 'User',
    role: 'user',
    age: 25,
    address: '修改了个人配置文件'
  }
])

const handleSave = (row, index) => {
  console.log('保存', row, index)
  // 模拟保存后更新数据
  // tableData.value[index] = { ...row }
}
const handleDelete = (row, index) => {
  console.log('删除', row, index)
  // EditTable 内部已经处理了 splice，这里只需要处理后端请求
}
const handleAdd = (row) => {
  console.log('添加', row)
  // EditTable 内部已经处理了 push，这里只需要处理后端请求
}

const { open } = useDialog()

const handleDetail = (row) => {
  open({
    title: '日志详情',
    subtitle: '查看完整的操作日志信息',
    icon: 'document',
    width: '600px',
    // content: () =>
    //   h('div', { class: 'detail-content' }, [
    //     h('div', { class: 'detail-item' }, [
    //       h('span', { class: 'label' }, '操作时间'),
    //       h('span', { class: 'value' }, row.date)
    //     ]),
    //     h('div', { class: 'detail-item' }, [
    //       h('span', { class: 'label' }, '操作人员'),
    //       h('div', { class: 'user-value' }, [
    //         h('div', { class: 'user-avatar-sm' }, row.name.charAt(0)),
    //         h('span', null, row.name)
    //       ])
    //     ]),
    //     h('div', { class: 'detail-item' }, [
    //       h('span', { class: 'label' }, '日志类型'),
    //       h('span', { class: 'status-pill type-pill' }, '系统操作')
    //     ]),
    //     h('div', { class: 'detail-item' }, [
    //       h('span', { class: 'label' }, '操作内容'),
    //       h('span', { class: 'value' }, row.address)
    //     ]),
    //     h('div', { class: 'detail-item full' }, [
    //       h('span', { class: 'label' }, '原始数据'),
    //       h('pre', { class: 'code-block' }, JSON.stringify(row, null, 2))
    //     ])
    //   ]),
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
