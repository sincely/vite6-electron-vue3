<template>
  <div class="system-page">
    <PageHeader
      title="菜单管理"
      subtitle="维护菜单结构、路由信息和按钮级权限"
      icon="list"
    />

    <DynamicSearchBar
      :items="searchItems"
      :params="searchParams"
      @query="handleQuery"
      @reset="handleReset"
    />

    <TreeTable
      ref="tableRef"
      :columns="columns"
      :func="getMenuList"
      :params="searchParams"
      :config="tableConfig"
      @selection-change="handleSelectionChange"
    >
      <template #toolbar>
        <div class="toolbar-buttons">
          <el-button type="primary" @click="handleCreateRoot">
            <SvgIcon icon-class="plus" width="14px" height="14px" />
            <span>新增菜单</span>
          </el-button>
          <el-button :disabled="!selectedIds.length" @click="handleBatchDelete">
            批量删除
          </el-button>
        </div>
      </template>

      <template #icon="{ row }">
        <div class="icon-cell">
          <div v-if="row.icon" class="icon-box">
            <SvgIcon :icon-class="row.icon" width="16px" height="16px" />
          </div>
          <span v-else class="text-muted">-</span>
        </div>
      </template>

      <template #visible="{ row }">
        <span
          class="status-badge"
          :class="row.visible === '1' ? 'is-active' : 'is-hidden'"
        >
          <span class="status-dot" />
          {{ row.visible === '1' ? '显示' : '隐藏' }}
        </span>
      </template>

      <template #action="{ row }">
        <div class="action-group">
          <el-button
            v-if="row.menuType !== 'BUTTON'"
            link
            type="success"
            size="small"
            @click="handleCreateChild(row)"
          >
            新增子菜单
          </el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </div>
      </template>
    </TreeTable>

    <ModalDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="960px"
      @close="handleDialogClose"
    >
      <AdvanceForm
        ref="formRef"
        v-model="formModel"
        :schemas="formSchemas"
        :is-edit="true"
        :form-props="{ labelWidth: '100px' }"
        :col-props="{ xl: 12, lg: 12, md: 12, sm: 24, xs: 24 }"
      />

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
defineOptions({ name: 'system-menu' })
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdvanceForm from '@/components/AdvanceForm/index.vue'
import DynamicSearchBar from '@/components/DynamicSearchBar/index.vue'
import ModalDialog from '@/components/ModalDialog/index.vue'
import PageHeader from '@/components/PageHeader/index.vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import TreeTable from '@/components/TreeTable/index.vue'
import { createMenu, deleteMenus, getMenuList, updateMenu } from '@/api/system'

const tableRef = ref()
const formRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedIds = ref([])
const menuTreeOptions = ref([])

const menuTypeOptions = [
  { label: '目录', value: 'DIR', color: 'info' },
  { label: '菜单', value: 'MENU', color: 'primary' },
  { label: '按钮', value: 'BUTTON', color: 'warning' }
]

const statusOptions = [
  { label: '启用', value: '1', color: 'success' },
  { label: '禁用', value: '0', color: 'warning' }
]

const searchParams = reactive({
  menuName: '',
  status: '',
  menuType: ''
})

const tableConfig = {
  selection: true,
  useAction: true,
  requestDelay: 200,
  table: {
    rowKey: 'id',
    defaultExpandAll: true
  }
}

const columns = [
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  {
    prop: 'menuType',
    label: '菜单类型',
    width: 100,
    align: 'center',
    dict: menuTypeOptions
  },
  {
    prop: 'menuName',
    label: '菜单名称',
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'icon',
    label: '图标',
    minWidth: 120,
    align: 'center',
    slot: 'icon'
  },
  {
    prop: 'routeName',
    label: '路由名称',
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'path',
    label: '路由路径',
    minWidth: 180,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '菜单状态',
    width: 100,
    align: 'center',
    dict: statusOptions
  },
  {
    prop: 'visible',
    label: '显示状态',
    width: 100,
    align: 'center',
    slot: 'visible'
  },
  {
    prop: 'parentId',
    label: '父级菜单 ID',
    width: 110,
    align: 'center'
  },
  {
    prop: 'sort',
    label: '排序',
    width: 80,
    align: 'center'
  }
]

const searchItems = [
  { prop: 'menuName', label: '菜单名称', type: 'input', permi: 'menu:query' },
  {
    prop: 'menuType',
    label: '菜单类型',
    type: 'select',
    permi: 'menu:query',
    component: {
      options: menuTypeOptions.map((item) => ({
        label: item.label,
        value: item.value
      }))
    }
  },
  {
    prop: 'status',
    label: '菜单状态',
    type: 'select',
    permi: 'menu:query',
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
  parentId: 0,
  menuType: 'MENU',
  menuName: '',
  icon: 'list',
  routeName: '',
  path: '',
  component: '',
  permission: '',
  status: '1',
  visible: '1',
  sort: 1,
  remark: ''
})

const formModel = ref(createDefaultForm())

const buildMenuOptions = (list, excludeId) => {
  return list
    .filter((item) => item.id !== excludeId)
    .map((item) => ({
      label: item.menuName,
      value: item.id,
      disabled: isDescendant(item, excludeId),
      children: item.children?.length
        ? buildMenuOptions(item.children, excludeId)
        : undefined
    }))
}

const isDescendant = (node, targetId) => {
  if (!targetId || !node.children?.length) return false
  return node.children.some((child) => {
    return child.id === targetId || isDescendant(child, targetId)
  })
}

const formSchemas = computed(() => [
  {
    label: '父级菜单',
    prop: 'parentId',
    type: 'tree-select',
    options: [{ label: '顶级菜单', value: 0 }, ...menuTreeOptions.value]
  },
  {
    label: '菜单类型',
    prop: 'menuType',
    type: 'select',
    required: true,
    options: menuTypeOptions.map((item) => ({
      label: item.label,
      value: item.value
    }))
  },
  {
    label: '菜单名称',
    prop: 'menuName',
    type: 'input',
    required: true,
    rules: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
  },
  {
    label: '图标',
    prop: 'icon',
    type: 'input'
  },
  {
    label: '路由名称',
    prop: 'routeName',
    type: 'input'
  },
  {
    label: '路由路径',
    prop: 'path',
    type: 'input'
  },
  {
    label: '组件路径',
    prop: 'component',
    type: 'input',
    hidden: (model) => model.menuType === 'DIR'
  },
  {
    label: '权限标识',
    prop: 'permission',
    type: 'input'
  },
  {
    label: '显示排序',
    prop: 'sort',
    type: 'number',
    componentProps: {
      min: 1,
      max: 999
    }
  },
  {
    label: '菜单状态',
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
    label: '显示状态',
    prop: 'visible',
    type: 'switch',
    componentProps: {
      activeValue: '1',
      inactiveValue: '0',
      activeText: '显示',
      inactiveText: '隐藏'
    }
  },
  {
    label: '备注',
    prop: 'remark',
    type: 'textarea',
    colProps: { span: 12 },
    componentProps: {
      rows: 4,
      maxlength: 200,
      showWordLimit: true
    }
  }
])

const dialogTitle = computed(() => (isEdit.value ? '编辑菜单' : '新增菜单'))

const loadMenuOptions = async (excludeId) => {
  const res = await getMenuList({})
  menuTreeOptions.value = buildMenuOptions(res.rows || [], excludeId)
}

const refreshTable = async () => {
  await loadMenuOptions()
  tableRef.value?.getList()
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

const handleCreateRoot = async () => {
  isEdit.value = false
  formModel.value = createDefaultForm()
  await loadMenuOptions()
  dialogVisible.value = true
}

const handleCreateChild = async (row) => {
  isEdit.value = false
  formModel.value = {
    ...createDefaultForm(),
    parentId: row.id,
    menuType: row.menuType === 'DIR' ? 'MENU' : 'BUTTON'
  }
  await loadMenuOptions()
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  formModel.value = {
    ...createDefaultForm(),
    ...row
  }
  await loadMenuOptions(row.id)
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
    await updateMenu(formModel.value)
    ElMessage.success('菜单信息已更新')
  } else {
    await createMenu(formModel.value)
    ElMessage.success('菜单创建成功')
  }

  dialogVisible.value = false
  refreshTable()
}

const handleDeleteByIds = async (ids) => {
  if (!ids.length) return
  await ElMessageBox.confirm('删除后会同时移除子节点，是否继续？', '提示', {
    type: 'warning',
    customClass: 'modal-message-box',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  await deleteMenus({ ids })
  ElMessage.success('删除成功')
  selectedIds.value = []
  refreshTable()
}

const handleDelete = (row) => {
  handleDeleteByIds([row.id])
}

const handleBatchDelete = () => {
  handleDeleteByIds(selectedIds.value)
}

onMounted(() => {
  loadMenuOptions()
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

.text-muted {
  color: var(--color-text-muted);
}

// 菜单图标单元格
.icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;

  .icon-box {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    color: var(--color-primary);
    background: var(--color-bg-active);
    border-radius: 8px;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.08);
    }
  }
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

  &.is-hidden {
    color: var(--color-text-muted);
    background: var(--color-bg-content);

    .status-dot {
      background: var(--color-text-muted);
    }
  }
}

.action-group {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}
</style>
