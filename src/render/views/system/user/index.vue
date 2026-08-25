<template>
  <div class="system-page">
    <PageHeader
      title="用户管理"
      subtitle="维护后台账号、角色归属和账号状态"
      icon="user"
    />

    <DynamicSearchBar
      :items="searchItems"
      :params="searchParams"
      @query="handleQuery"
      @reset="handleReset"
    />

    <AdvanceTable
      ref="tableRef"
      :columns="columns"
      :func="getUserList"
      :params="searchParams"
      :config="tableConfig"
      @selection-change="handleSelectionChange"
    >
      <template #toolbar-left>
        <div class="toolbar-buttons">
          <el-button type="primary" @click="handleCreate">
            <SvgIcon icon-class="plus" width="14px" height="14px" />
            <span>新增用户</span>
          </el-button>
          <el-button :disabled="!selectedIds.length" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </template>

      <template #gender="{ row }">
        <el-tag
          :type="row.gender === '男' ? 'primary' : 'danger'"
          effect="light"
          round
          size="small"
        >
          {{ row.gender }}
        </el-tag>
      </template>

      <template #roles="{ row }">
        <div class="role-cell">
          <el-tag
            v-for="role in (row.roleNames || []).slice(0, 2)"
            :key="role"
            size="small"
            effect="plain"
            round
          >
            {{ role }}
          </el-tag>
          <el-tooltip
            v-if="(row.roleNames || []).length > 2"
            :content="(row.roleNames || []).slice(2).join('、')"
          >
            <el-tag size="small" type="info" effect="plain" round>
              +{{ (row.roleNames || []).length - 2 }}
            </el-tag>
          </el-tooltip>
          <span v-if="!row.roleNames?.length" class="text-muted">-</span>
        </div>
      </template>

      <template #status="{ row }">
        <span
          class="status-badge"
          :class="row.status === '1' ? 'is-active' : 'is-disabled'"
        >
          <span class="status-dot" />
          {{ row.status === '1' ? '启用' : '禁用' }}
        </span>
      </template>

      <template #action="{ row }">
        <div class="table-action">
          <el-button
            link
            type="primary"
            size="small"
            :icon="Edit"
            title="编辑"
            @click="handleEdit(row)"
          />
          <el-button
            link
            type="danger"
            size="small"
            :icon="Delete"
            title="删除"
            @click="handleDelete(row)"
          />
        </div>
      </template>
    </AdvanceTable>

    <ModalDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="860px"
      @close="handleDialogClose"
    >
      <AdvanceForm
        ref="formRef"
        v-model="formModel"
        :schemas="formSchemas"
        :is-edit="true"
        :form-props="{ labelWidth: '100px' }"
        :col-props="{ span: 12 }"
      />

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
defineOptions({ name: 'system-user' })
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import {
  createUser,
  deleteUsers,
  getRoleList,
  getUserList,
  updateUser
} from '@/api/system'

const tableRef = ref()
const formRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedIds = ref([])
const roleOptions = ref([])

const searchParams = reactive({
  username: '',
  gender: '',
  nickname: '',
  mobile: '',
  email: '',
  status: ''
})

const tableConfig = {
  selection: true,
  requestDelay: 200,
  table: {
    highlightCurrentRow: true
  },
  pagination: {
    pageSizes: [10, 20, 50]
  }
}

const columns = [
  { type: 'index', label: '序号', width: 70, align: 'center' },
  {
    prop: 'username',
    label: '用户名',
    minWidth: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'gender',
    label: '性别',
    width: 90,
    align: 'center',
    slot: 'gender'
  },
  {
    prop: 'nickname',
    label: '昵称',
    minWidth: 120,
    showOverflowTooltip: true
  },
  {
    prop: 'mobile',
    label: '手机号',
    minWidth: 140,
    showOverflowTooltip: true
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 220,
    showOverflowTooltip: true
  },
  {
    prop: 'roleNames',
    label: '角色',
    minWidth: 180,
    slot: 'roles'
  },
  {
    prop: 'status',
    label: '用户状态',
    width: 110,
    align: 'center',
    slot: 'status',
    filterable: true,
    filters: [
      { text: '启用', value: '1' },
      { text: '禁用', value: '0' }
    ]
  },
  {
    prop: 'createTime',
    label: '创建时间',
    minWidth: 180,
    align: 'center',
    showOverflowTooltip: true
  },
  { label: '操作', width: 120, align: 'center', slot: 'action', fixed: 'right' }
]

const searchItems = [
  { prop: 'username', label: '用户名', type: 'input', permi: 'user:query' },
  {
    prop: 'gender',
    label: '性别',
    type: 'select',
    permi: 'user:query',
    component: {
      options: [
        { label: '男', value: '男' },
        { label: '女', value: '女' }
      ]
    }
  },
  { prop: 'nickname', label: '昵称', type: 'input', permi: 'user:query' },
  { prop: 'mobile', label: '手机号', type: 'input', permi: 'user:query' },
  { prop: 'email', label: '邮箱', type: 'input', permi: 'user:query' },
  {
    prop: 'status',
    label: '用户状态',
    type: 'select',
    permi: 'user:query',
    component: {
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' }
      ]
    }
  }
]

const createDefaultForm = () => ({
  id: undefined,
  username: '',
  nickname: '',
  gender: '男',
  mobile: '',
  email: '',
  roleIds: [],
  status: '1',
  remark: ''
})

const formModel = ref(createDefaultForm())

const formSchemas = computed(() => [
  {
    label: '用户名',
    prop: 'username',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  },
  {
    label: '昵称',
    prop: 'nickname',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
  },
  {
    label: '性别',
    prop: 'gender',
    type: 'select',
    options: [
      { label: '男', value: '男' },
      { label: '女', value: '女' }
    ],
    required: true
  },
  {
    label: '手机号',
    prop: 'mobile',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
  },
  {
    label: '邮箱',
    prop: 'email',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
  },
  {
    label: '角色分配',
    prop: 'roleIds',
    type: 'select',
    required: true,
    options: roleOptions.value,
    componentProps: {
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      maxCollapseTags: 2
    },
    rules: [{ required: true, message: '请选择角色', trigger: 'change' }]
  },
  {
    label: '账号状态',
    prop: 'status',
    type: 'switch',
    componentProps: {
      activeValue: '1',
      inactiveValue: '0',
      activeText: '启用',
      inactiveText: '禁用'
    }
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'textarea',
    colProps: { span: 24 },
    componentProps: {
      rows: 4,
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '新增用户'))

const loadRoleOptions = async () => {
  const res = await getRoleList({
    pageNum: 1,
    pageSize: 100,
    status: '1'
  })
  roleOptions.value = (res.rows || []).map((item) => ({
    label: item.roleName,
    value: item.id
  }))
}

const handleQuery = () => {
  tableRef.value?.getList()
}

const handleReset = () => {
  tableRef.value?.resetQuery()
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id)
}

const handleCreate = () => {
  isEdit.value = false
  formModel.value = createDefaultForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formModel.value = {
    ...createDefaultForm(),
    ...row,
    roleIds: [...(row.roleIds || [])]
  }
  dialogVisible.value = true
}

const handleDialogClose = () => {
  dialogVisible.value = false
  formModel.value = createDefaultForm()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (isEdit.value) {
    await updateUser(formModel.value)
    ElMessage.success('用户信息已更新')
  } else {
    await createUser(formModel.value)
    ElMessage.success('用户创建成功')
  }

  dialogVisible.value = false
  tableRef.value?.getList()
}

const handleDeleteByIds = async (ids) => {
  if (!ids.length) return
  try {
    await ElMessageBox.confirm('删除后不可恢复，是否继续？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  await deleteUsers({ ids })
  ElMessage.success('删除成功')
  selectedIds.value = []
  tableRef.value?.getList()
}

const handleDelete = (row) => {
  handleDeleteByIds([row.id])
}

const handleBatchDelete = () => {
  handleDeleteByIds(selectedIds.value)
}

onMounted(() => {
  loadRoleOptions()
})
</script>

<style scoped lang="scss">
.system-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.toolbar-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.role-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.text-muted {
  color: var(--color-text-muted);
}

// 状态徽标：圆点 + 文字
.status-badge {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.is-active {
    color: var(--color-success);
    background: var(--color-teal-soft);

    .status-dot {
      background: var(--color-success);
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--color-success), transparent 75%);
    }
  }

  &.is-disabled {
    color: var(--color-amber);
    background: var(--color-amber-soft);

    .status-dot {
      background: var(--color-amber);
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--color-amber), transparent 75%);
    }
  }
}
</style>
