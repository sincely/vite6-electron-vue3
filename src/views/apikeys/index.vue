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

    <AdvanceTable :data="tableData">
      <el-table-column prop="date" label="时间" width="180" sortable>
        <template #default="{ row }">
          <span class="date-cell">{{ row.date }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="操作人" width="180" sortable>
        <template #default="{ row }">
          <div class="user-cell">
            <div class="user-avatar">{{ row.name.charAt(0) }}</div>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="120">
        <template #default>
          <span class="status-pill type-pill">系统操作</span>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="详情信息" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="address-text">{{ row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ $index }">
          <div
            class="status-dot"
            :class="$index % 3 === 0 ? 'success' : 'warning'"
          ></div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleDetail(row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </AdvanceTable>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/index.vue'
import { useDialog } from '@/hooks/useDialog'
import { ElButton } from 'element-plus'

const searchKeyword = ref('')

const tableData = [
  {
    date: '2024-03-15 14:23:45',
    name: 'Admin',
    address: '登录系统成功 (IP: 192.168.1.10)'
  },
  {
    date: '2024-03-15 13:12:33',
    name: 'User',
    address: '修改了个人配置文件'
  },
  {
    date: '2024-03-15 12:45:12',
    name: 'System',
    address: '自动备份完成'
  },
  {
    date: '2024-03-15 11:30:00',
    name: 'Admin',
    address: '更新了系统设置参数'
  },
  {
    date: '2024-03-15 10:15:22',
    name: 'User',
    address: '尝试访问未授权资源'
  },
  {
    date: '2024-03-15 09:20:11',
    name: 'System',
    address: '服务启动成功'
  },
  {
    date: '2024-03-14 18:45:33',
    name: 'Admin',
    address: '登出系统'
  },
  {
    date: '2024-03-14 16:30:45',
    name: 'User',
    address: '上传了文件 report_2024.pdf'
  },
  {
    date: '2024-03-14 15:12:10',
    name: 'Admin',
    address: '删除了过期日志'
  },
  {
    date: '2024-03-14 14:05:55',
    name: 'System',
    address: '检测到新版本 v1.2.0'
  },
  {
    date: '2024-03-14 11:22:33',
    name: 'User',
    address: '查询了用户列表'
  },
  {
    date: '2024-03-14 09:10:05',
    name: 'Admin',
    address: '重置了用户 User 的密码'
  },
  {
    date: '2024-03-14 11:22:33',
    name: 'User',
    address: '查询了用户列表'
  },
  {
    date: '2024-03-14 09:10:05',
    name: 'Admin',
    address: '重置了用户 User 的密码'
  },
  {
    date: '2024-03-14 11:22:33',
    name: 'User',
    address: '查询了用户列表'
  },
  {
    date: '2024-03-14 09:10:05',
    name: 'Admin',
    address: '重置了用户 User 的密码'
  },
  {
    date: '2024-03-14 11:22:33',
    name: 'User',
    address: '查询了用户列表'
  },
  {
    date: '2024-03-14 09:10:05',
    name: 'Admin',
    address: '重置了用户 User 的密码'
  },
  {
    date: '2024-03-14 11:22:33',
    name: 'User',
    address: '查询了用户列表'
  },
  {
    date: '2024-03-14 09:10:05',
    name: 'Admin',
    address: '重置了用户 User 的密码'
  }
]

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
