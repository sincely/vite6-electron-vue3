<template>
  <div v-if="isUpdating || updateAvailable || updateDownloaded" class="update-progress-overlay">
    <el-card class="update-progress-card">
      <template #header>
        <div class="card-header">
          <span>应用更新</span>
        </div>
      </template>
      <div v-if="isUpdating">
        <p>正在下载更新...</p>
        <el-progress :percentage="downloadProgress" :stroke-width="10" :text-inside="true" />
        <p class="progress-text">{{ downloadProgress.toFixed(1) }}%</p>
      </div>
      <div v-else-if="updateAvailable">
        <p>检测到新版本，正在下载。</p>
      </div>
      <div v-else-if="updateDownloaded">
        <p>更新下载完成，请重启应用以安装。</p>
        <el-button type="primary" @click="installUpdate">立即安装</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUpdateStore } from '@/store/modules/update'
import { ElProgress, ElCard, ElButton } from 'element-plus'

const updateStore = useUpdateStore()

const isUpdating = computed(() => updateStore.isUpdating)
const downloadProgress = computed(() => updateStore.downloadProgress)
const updateAvailable = computed(() => updateStore.updateAvailable)
const updateDownloaded = computed(() => updateStore.updateDownloaded)

const installUpdate = () => {
  // 通知主进程安装更新
  window.ipcRenderer.send('install-update')
}
</script>

<style lang="scss" scoped>
.update-progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: rgb(0 0 0 / 50%);
}

.update-progress-card {
  width: 400px;
  text-align: center;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.progress-text {
  margin-top: 10px;
  font-size: 14px;
}
</style>
