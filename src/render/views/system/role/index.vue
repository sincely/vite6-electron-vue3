<template>
  <div class="system-page">
    <PageHeader
      title="角色管理"
      subtitle="维护角色编码、权限点和账号授权范围"
      icon="shield-check"
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
      :func="getRoleList"
      :params="searchParams"
      :config="tableConfig"
      @selection-change="handleSelectionChange"
    >
      <template #toolbar-left>
        <div class="toolbar-buttons">
          <el-button type="primary" @click="handleCreate">
            <SvgIcon icon-class="plus" width="14px" height="14px" />
            <span>新增角色</span>
          </el-button>
          <el-button :disabled="!selectedIds.length" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </template>

      <template #roleName="{ row }">
        <div class="role-name-cell">
          <span class="role-icon-box">
            <SvgIcon icon-class="shield-check" width="14px" height="14px" />
          </span>
          <span class="role-name-text">{{ row.roleName }}</span>
        </div>
      </template>

      <template #roleCode="{ row }">
        <code class="code-chip">{{ row.roleCode }}</code>
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
      width="920px"
      @close="handleDialogClose"
    >
      <AdvanceForm
        ref="formRef"
        v-model="formModel"
        :schemas="formSchemas"
        :is-edit="true"
        :form-props="{ labelWidth: '100px' }"
        :col-props="{ xl: 12, lg: 12, md: 12 }"
      />

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
defineOptions({ name: 'system-role' })
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import AdvanceForm from '@/components/AdvanceForm/index.vue'
import AdvanceTable from '@/components/AdvanceTable/index.vue'
import DynamicSearchBar from '@/components/DynamicSearchBar/index.vue'
import ModalDialog from '@/components/ModalDialog/index.vue'
import PageHeader from '@/components/PageHeader/index.vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import { createRole, deleteRoles, getRoleList, updateRole } from '@/api/system'

const tableRef = ref()
const formRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedIds = ref([])

const permissionOptions = [
  { label: '用户查看', value: 'system:user:view' },
  { label: '用户新增', value: 'system:user:create' },
  { label: '用户编辑', value: 'system:user:update' },
  { label: '用户删除', value: 'system:user:delete' },
  { label: '角色查看', value: 'system:role:view' },
  { label: '角色编辑', value: 'system:role:update' },
  { label: '菜单查看', value: 'system:menu:view' },
  { label: '菜单编辑', value: 'system:menu:update' }
]

const searchParams = reactive({
  roleName: '',
  roleCode: '',
  status: ''
})

const tableConfig = {
  selection: true,
  requestDelay: 200,
  table: {
    highlightCurrentRow: true
  }
}

const columns = [
  { type: 'index', label: '序号', width: 70, align: 'center' },
  {
    prop: 'roleName',
    label: '角色名称',
    align: 'left',
    minWidth: 180,
    slot: 'roleName',
    showOverflowTooltip: true
  },
  {
    prop: 'roleCode',
    label: '角色编码',
    minWidth: 160,
    align: 'left',
    slot: 'roleCode'
  },
  {
    prop: 'remark',
    label: '角色描述',
    minWidth: 220,
    showOverflowTooltip: true
  },
  // {
  //   prop: 'permissions',
  //   label: '权限数量',
  //   width: 110,
  //   align: 'center',
  //   slot: 'permissions'
  // },
  // {
  //   prop: 'userCount',
  //   label: '关联用户',
  //   width: 110,
  //   align: 'center'
  // },
  {
    prop: 'status',
    label: '角色状态',
    width: 110,
    align: 'center',
    slot: 'status'
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
  { prop: 'roleName', label: '角色名称', type: 'input', permi: 'role:query' },
  { prop: 'roleCode', label: '角色编码', type: 'input', permi: 'role:query' },
  {
    prop: 'status',
    label: '角色状态',
    type: 'select',
    permi: 'role:query',
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
  roleName: '',
  roleCode: '',
  sort: 1,
  status: '1',
  permissions: ['system:user:view', 'system:role:view', 'system:menu:view'],
  remark: ''
})

const formModel = ref(createDefaultForm())

const formSchemas = computed(() => [
  {
    label: '角色名称',
    prop: 'roleName',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
  },
  {
    label: '角色编码',
    prop: 'roleCode',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
  },
  {
    label: '显示顺序',
    prop: 'sort',
    type: 'number',
    componentProps: {
      min: 1,
      max: 999
    }
  },
  {
    label: '状态',
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
    label: '权限配置',
    prop: 'permissions',
    type: 'checkbox-group',
    // colProps: { span: 24 },
    options: permissionOptions
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'textarea',
    // colProps: { span: 12 },
    componentProps: {
      rows: 4,
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const dialogTitle = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

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
    permissions: [...(row.permissions || [])]
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
    await updateRole(formModel.value)
    ElMessage.success('角色信息已更新')
  } else {
    await createRole(formModel.value)
    ElMessage.success('角色创建成功')
  }

  dialogVisible.value = false
  tableRef.value?.getList()
}

const handleDeleteByIds = async (ids) => {
  if (!ids.length) return
  await ElMessageBox.confirm('删除角色后无法恢复，是否继续？', '提示', {
    type: 'warning'
  })
  await deleteRoles({ ids })
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

// 角色名称单元格：图标 + 文字
.role-name-cell {
  display: flex;
  gap: 8px;
  align-items: center;

  .role-icon-box {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 28px;
    height: 28px;
    color: var(--color-indigo);
    background: var(--color-indigo-soft);
    border-radius: 8px;
  }

  .role-name-text {
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

// 角色编码：等宽代码标签
.code-chip {
  padding: 2px 10px;
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  color: var(--color-violet);
  background: var(--color-violet-soft);
  border-radius: 6px;
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
