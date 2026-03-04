# 发布与自动更新指南

## 一、整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│  发布流程（开发者侧）                                              │
│                                                                   │
│  1. 修改代码 → 2. git commit → 3. npm run build-win              │
│  → 4. 上传构建产物到更新服务器 → 5. npm run release                │
└───────────────────────────────┬─────────────────────────────────┘
                                │  HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  更新服务器（静态文件服务器）                                        │
│                                                                   │
│  /electron-update/                                                │
│    ├── latest.yml             ← electron-updater 检查此文件        │
│    ├── Crab-x.x.x-Setup.exe  ← Windows 安装包                    │
│    └── Crab-x.x.x-Setup.exe.blockmap                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │ autoUpdater.checkForUpdates()
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  运行中的应用（用户侧）                                            │
│                                                                  │
│  主进程 (electron/main/update.js)                                 │
│    autoUpdater ──事件──► IPC ──► 渲染层 (src/hooks/useUpdater.js) │
│                                     │                            │
│                                     ▼                            │
│                               Pinia updateStore                  │
│                                     │                            │
│                                     ▼                            │
│                               UpdateDialog.vue                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、自动更新完整流程

```
应用启动
  │
  ├─► initUpdater(win)        主进程：初始化 autoUpdater，checkForUpdates()
  │
  ├─► [服务器返回 latest.yml]
  │     │
  │     ├── 版本相同 ──► update-not-available ──► 渲染层静默处理
  │     │
  │     └── 发现新版本 ──► update-available (携带 info.version / info.releaseNotes)
  │                              │
  │                              ▼ (useUpdater.js 接收)
  │                         updateStore 更新：
  │                           latestVersion = info.version
  │                           releaseNotes  = info.releaseNotes
  │                           dialogVisible = true
  │                              │
  │                              ▼
  │                         UpdateDialog 弹出 "发现新版本"
  │                              │
  │           ┌─────────────────┤
  │           │                 │
  │      [稍后提醒]         [立即更新]
  │           │                 │
  │      关闭弹框          send('start-download')
  │                             │
  │                        主进程：autoUpdater.downloadUpdate()
  │                             │
  │                    download-progress 事件（0~100%）
  │                             │  (每次进度更新)
  │                        updateStore.downloadProgress
  │                        UpdateDialog 进度条实时更新
  │                             │
  │                    update-downloaded 事件
  │                             │
  │                        updateStore.updateDownloaded = true
  │                        UpdateDialog 切换为"安装"视图
  │                              │
  │           ┌─────────────────┤
  │           │                 │
  │      [稍后重启]         [立即重启安装]
  │           │                 │
  │      关闭弹框          send('install-update')
  │                             │
  │                        autoUpdater.quitAndInstall(false, true)
  │                             │
  │                        应用退出 → 安装包执行 → 新版本启动
```

---

## 三、构建产物说明

执行 `npm run build-win` 后，在 `release/{version}/` 目录生成：

| 文件 | 说明 |
|------|------|
| `Crab-x.x.x-Setup.exe` | Windows NSIS 安装包 |
| `Crab-x.x.x-Setup.exe.blockmap` | 差量更新块映射，减少下载量 |
| `latest.yml` | **更新元数据**，electron-updater 检查此文件 |
| `builder-debug.yml` | 构建调试信息（无需上传） |

### latest.yml 结构

```yaml
version: 1.0.0
files:
  - url: Crab-1.0.0-Setup.exe
    sha512: <hash>
    size: 72000000
path: Crab-1.0.0-Setup.exe
sha512: <hash>
releaseNotes: |
  - 修复登录页面偶发崩溃问题
  - 优化侧边栏动画性能
  - 新增深色主题支持
releaseDate: '2026-03-03T08:00:00.000Z'
```

> **注意**：`releaseNotes` 内容会直接显示在应用内的更新弹框中，建议每行用 `- ` 开头。

---

## 四、更新服务器配置

### 方式 A：Nginx 静态文件服务（推荐）

```nginx
server {
    listen 8089;
    server_name your-server-ip;

    location /electron-update/ {
        root /var/www/;
        autoindex off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Access-Control-Allow-Origin *;
    }
}
```

部署目录结构：
```
/var/www/electron-update/
  ├── latest.yml
  ├── Crab-x.x.x-Setup.exe
  └── Crab-x.x.x-Setup.exe.blockmap
```

### 方式 B：修改更新服务器地址

在 `electron/main/update.js` 中修改，或通过环境变量注入：

```javascript
// electron/main/update.js
const UPDATE_URL = process.env.VITE_UPDATE_URL || 'http://your-server:8089/electron-update/'
```

或在 `.env.production` 中配置：

```ini
VITE_UPDATE_URL=https://update.your-domain.com/electron-update/
```

---

## 五、发布新版本步骤

### 步骤 1：确保代码已提交

```bash
git add .
git commit -m "feat: 新功能描述"
```

> commit 消息规范影响 CHANGELOG.md 自动生成，请遵循 [Conventional Commits](https://www.conventionalcommits.org/)

### 步骤 2：构建安装包

```bash
# Windows
npm run build-win

# macOS
npm run build-mac
```

构建完成后检查 `release/{version}/` 目录。

### 步骤 3：上传到更新服务器

将以下文件上传到服务器的 `/electron-update/` 目录，**覆盖旧文件**：

```
latest.yml                       ← 必须上传，最后上传（原子切换）
Crab-x.x.x-Setup.exe            ← 安装包
Crab-x.x.x-Setup.exe.blockmap   ← 块映射（差量下载使用）
```

> ⚠️ **先上传安装包和 blockmap，最后上传 latest.yml**。这样可以避免客户端检测到新版本但安装包尚未上传完毕的竞争条件。

### 步骤 4：打 Git Tag 并生成 CHANGELOG

使用交互式发布工具：

```bash
node scripts/release.js
```

或直接使用 release-it 命令：

```bash
# 补丁版本 0.0.4 → 0.0.5（Bug 修复）
npm run release:patch

# 次要版本 0.0.x → 0.1.0（新功能）
npm run release:minor

# 主版本 0.x.x → 1.0.0（重大变更/不兼容）
npm run release:major

# 预发布版本
npm run release:beta    # → 0.0.5-beta.0
npm run release:alpha   # → 0.0.5-alpha.0
```

release-it 将自动完成：
1. 更新 `package.json` 版本号
2. 生成 / 追加 `CHANGELOG.md`
3. `git commit + git tag vx.x.x`
4. `git push --follow-tags`
5. 创建 GitHub Release（如配置了 `GITHUB_TOKEN`）

---

## 六、开发环境调试更新功能

### 配置本地调试文件

项目根目录创建 `dev-app-update.yml`：

```yaml
version: 0.0.5              # 比当前版本号高
provider: generic
url: http://10.10.24.52:8089/electron-update/
```

> `autoUpdater.forceDevUpdateConfig = true` 在开发环境已自动开启，会读取此文件。

### 渲染层 Mock 下载（无需真实服务器）

在 `UpdateDialog.vue` 中，DEV 模式下点击"立即更新"会触发 `startMockDownload()`，模拟完整下载进度，无需后端支持。

```javascript
// UpdateDialog.vue
const handleConfirm = () => {
  if (import.meta.env.DEV) {
    startMockDownload()  // 本地模拟，不发 IPC
    return
  }
  updateStore.setUpdating(true)
  window.ipcRenderer.send('start-download')  // 生产：触发真实下载
}
```

### 手动触发检查更新（测试用）

在浏览器控制台或任意 Vue 组件中：

```javascript
window.ipcRenderer.send('check-for-updates')
```

---

## 七、IPC 通信频道速查表

### 渲染层 → 主进程（`ipcRenderer.send`）

| 频道 | 触发时机 | 说明 |
|------|----------|------|
| `check-for-updates` | 手动点击"检查更新" | 触发 `autoUpdater.checkForUpdates()` |
| `start-download` | 用户点击"立即更新" | 触发 `autoUpdater.downloadUpdate()` |
| `install-update` | 用户点击"立即重启安装" | 触发 `autoUpdater.quitAndInstall(false, true)` |

### 主进程 → 渲染层（`webContents.send`）

| 频道 | 携带数据 | 含义 |
|------|----------|------|
| `checking-for-update` | — | 正在联网检查 |
| `update-not-available` | `{ version }` | 已是最新版本 |
| `update-available` | `{ version, releaseNotes, releaseDate }` | 发现新版本 |
| `download-progress` | `{ percent, transferred, total, bytesPerSecond }` | 下载进度 |
| `update-downloaded` | `{ version }` | 下载完成 |
| `update-error` | `string`（错误信息） | 更新出错 |

---

## 八、常见问题

### Q1：更新后版本号没变化？

- 检查 `package.json` 中的 `version` 是否已更新
- 确认 `latest.yml` 中的 `version` 与安装包文件名一致
- 清除 electron-updater 缓存目录：
  - Windows: `%APPDATA%\Crab-updater\`

### Q2：下载速度很慢？

- 检查服务器带宽
- 确认 `.blockmap` 文件已同步上传，可启用差量下载
- 考虑使用 CDN 加速

### Q3：开发环境无法触发 `update-available`？

- 确认 `dev-app-update.yml` 中的版本号高于 `package.json` 当前版本
- 确认 `autoUpdater.forceDevUpdateConfig = true` 已生效（仅在 `NODE_ENV === 'development'` 时）
- 查看 Electron 主进程控制台日志 `[updater]` 前缀行

### Q4：`quitAndInstall` 后应用没有重启？

- Windows 下 NSIS 安装包默认在安装完成后自动启动
- `autoUpdater.quitAndInstall(false, true)` 第二个参数 `true` 表示安装后自动运行
- 如需静默安装（不显示安装进度窗口），将第一个参数改为 `true`
