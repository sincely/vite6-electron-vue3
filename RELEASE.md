# 发布与自动更新指南

## 一、整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│  发布流程（开发者侧）                                                  │
│                                                                       │
│  1. 修改代码 → 2. git commit → 3. npm run build-win:prod             │
│  → 4. 上传构建产物到更新服务器 → 5. npm run release                    │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │  HTTP
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  更新服务器（静态文件服务器）                                          │
│                                                                       │
│  /electron-update/                                                    │
│    ├── latest.yml              ← electron-updater 检查此文件           │
│    ├── Crab-x.x.x-Setup.exe    ← Windows 安装包                       │
│    └── Crab-x.x.x-Setup.exe.blockmap  ← 用于增量更新文件               │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ autoUpdater.checkForUpdates()
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  运行中的应用（用户侧）                                                 │
│                                                                       │
│  主进程 (electron/main/update.js)                                     │
│    autoUpdater ──事件──► IPC ──► 渲染层 (src/hooks/useUpdater.js)    │
│                                       │                               │
│                                       ▼                               │
│                                 Pinia updateStore                     │
│                                  (只持久化 currentVersion)             │
│                                       │                               │
│                                       ▼                               │
│                                 UpdateDialog.vue                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、自动更新完整流程

```
应用启动
  │
  ├─► useUpdater() onMounted    渲染层：resetUpdateState() 清空过渡态
  │                             注册所有 IPC 监听器
  │
  ├─► get-app-version (IPC)     渲染层：setCurrentVersion(version) 注入当前版本
  │
  ├─► did-finish-load           主进程：触发 autoUpdater.checkForUpdates()
  │
  ├─► [服务器返回 latest.yml]
  │     │
  │     ├── 版本相同 ──► update-not-available ──► 渲染层静默处理
  │     │
  │     └── 发现新版本 ──► update-available (携带 info.version / info.releaseNotes)
  │                                │
  │                                ▼ (useUpdater.js 接收)
  │                           updateStore 更新：
  │                             latestVersion = info.version
  │                             releaseNotes  = info.releaseNotes  ← 来自 latest.yml
  │                             dialogVisible = true
  │                                │
  │                                ▼
  │                           UpdateDialog 弹出 "发现新版本"
  │                                │
  │             ┌─────────────────┤
  │             │                 │
  │        [稍后提醒]         [立即更新]
  │             │                 │
  │        关闭弹框          send('start-download')
  │                               │
  │                          主进程：autoUpdater.downloadUpdate()
  │                               │
  │                      download-progress 事件（0~100%）
  │                               │
  │                          updateStore.downloadProgress
  │                          UpdateDialog 进度条实时更新
  │                               │
  │                      update-downloaded 事件
  │                               │
  │                          updateStore.updateDownloaded = true
  │                          UpdateDialog 切换为"安装"视图
  │                                │
  │             ┌─────────────────┤
  │             │                 │
  │        [稍后重启]         [立即重启安装]
  │             │                 │
  │        关闭弹框          setCurrentVersion(latestVersion)  ← 乐观写入并持久化
  │                          send('install-update')
  │                               │
  │                          autoUpdater.quitAndInstall(false, true)
  │                               │
  │                          应用退出 → 安装包执行 → 新版本启动
  │                               │
  └─► 新版本首次启动          currentVersion 从 localStorage 读取（立即正确）
                              get-app-version IPC 二次确认版本
                              checkForUpdates() → update-not-available（无弹框）
```

---

## 三、构建脚本说明

### 开发调试

| 命令 | 说明 |
|------|------|
| `npm run dev:win` | 启动 Vite 开发服务器（含 HMR），仅渲染层热更新 |
| `npm run dev:mac` | macOS 同上 |

### 仅编译（不打包）

| 命令 | 环境 | 说明 |
|------|------|------|
| `npm run build:dev` | development | 编译到 `dist/`，用于调试 |
| `npm run build:test` | test | 编译到 `dist/`，连接测试环境接口 |
| `npm run build:prod` | production | 编译到 `dist/`，连接生产环境接口 |

### 完整打包（推荐）

> 每条命令会自动依次执行：
> 1. `node scripts/inject-release-notes.mjs` — 从 CHANGELOG.md 提取当前版本更新内容写入 `electron-builder.json`
> 2. `vite build --mode <env>` — 编译渲染层
> 3. `electron-builder --win/--mac` — 打包安装包

| 命令 | 平台 | 环境 |
|------|------|------|
| `npm run build-win:dev` | Windows | development |
| `npm run build-win:test` | Windows | test |
| `npm run build-win:prod` | Windows | production |
| `npm run build-mac:dev` | macOS | development |
| `npm run build-mac:test` | macOS | test |
| `npm run build-mac:prod` | macOS | production |

构建完成后在 `release/{version}/` 目录生成：

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
releaseNotes: 🚀 新增深色主题支持; 🐞 修复登录页面偶发崩溃; 🎨 优化侧边栏动画性能
releaseDate: '2026-03-03T08:00:00.000Z'
```

> `releaseNotes` 由 `scripts/inject-release-notes.mjs` 自动从 `CHANGELOG.md` 提取并写入，
> 格式为带章节 emoji 前缀、分号分隔的纯文本，直接显示在应用内更新弹框的列表中。

---

## 四、releaseNotes 自动注入机制

每次打包前，`inject-release-notes.mjs` 会自动：

1. 读取 `package.json` 的 `version` 字段
2. 在 `CHANGELOG.md` 中匹配对应版本标题（支持 `## v0.0.6`、`## [0.0.6](...)`、`## 0.0.6` 等格式）
3. 按子章节（`### 🚀 Enhancements` 等）解析列表项，跳过 `Contributors` 段
4. 去除行内 git commit 链接 `([abc1234](...))`
5. 将章节 emoji 作为每条目前缀，以 `; ` 拼接，写入 `electron-builder.json` 的 `releaseInfo.releaseNotes`

若 CHANGELOG 中找不到当前版本，则写入默认值 `v{version} 版本更新`。

---

## 五、更新服务器配置

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

在 `.env.production` 中配置（推荐）：

```ini
VITE_UPDATE_URL=https://update.your-domain.com/electron-update/
```

或直接在 `electron/main/update.js` 中修改默认回退值：

```javascript
const UPDATE_URL = process.env.VITE_UPDATE_URL || 'http://your-server:8089/electron-update/'
```

---

## 六、发布新版本步骤

### 步骤 1：确保代码已提交

```bash
git add .
git commit -m "feat: 新功能描述"
```

> commit 消息规范影响 CHANGELOG.md 自动生成，请遵循 [Conventional Commits](https://www.conventionalcommits.org/)

### 步骤 2：打 Tag 并生成 CHANGELOG

使用交互式发布工具：

```bash
node scripts/release.js
```

或直接使用 release-it 命令：

```bash
npm run release:patch   # 0.0.5 → 0.0.6（Bug 修复）
npm run release:minor   # 0.0.x → 0.1.0（新功能）
npm run release:major   # 0.x.x → 1.0.0（重大变更）
npm run release:beta    # → 0.0.6-beta.0
npm run release:alpha   # → 0.0.6-alpha.0
```

release-it 将自动完成：
1. 更新 `package.json` 版本号
2. 生成 / 追加 `CHANGELOG.md`
3. `git commit + git tag vx.x.x`
4. `git push --follow-tags`
5. 创建 GitHub Release（如配置了 `GITHUB_TOKEN`）

### 步骤 3：构建安装包

```bash
# Windows 生产包
npm run build-win:prod

# macOS 生产包
npm run build-mac:prod
```

构建完成后检查 `release/{version}/` 目录。

### 步骤 4：上传到更新服务器

将以下文件上传到服务器的 `/electron-update/` 目录，**覆盖旧文件**：

```
Crab-x.x.x-Setup.exe            ← 先上传安装包
Crab-x.x.x-Setup.exe.blockmap   ← 先上传块映射
latest.yml                       ← 最后上传（原子切换，避免竞争条件）
```

> ⚠️ **务必最后上传 `latest.yml`**，否则客户端可能检测到新版本但安装包尚未就绪。

---

## 七、Pinia 更新状态说明

`src/store/modules/update.js` 管理所有更新相关状态：

| 字段 | 类型 | 持久化 | 说明 |
|------|------|--------|------|
| `currentVersion` | `string` | ✅ 是 | 当前版本；安装前乐观写入新版本，重启后立即正确 |
| `latestVersion` | `string` | ❌ 否 | 服务器检测到的最新版本 |
| `releaseNotes` | `string` | ❌ 否 | 更新说明（来自 `latest.yml`） |
| `checkingForUpdate` | `boolean` | ❌ 否 | 正在联网检查 |
| `isUpdating` | `boolean` | ❌ 否 | 正在下载 |
| `downloadProgress` | `number` | ❌ 否 | 下载进度 0-100 |
| `updateDownloaded` | `boolean` | ❌ 否 | 已下载等待安装 |
| `updateAvailable` | `boolean` | ❌ 否 | 是否有可用更新 |
| `dialogVisible` | `boolean` | ❌ 否 | 更新弹框是否可见 |

> 过渡状态不持久化，应用每次启动时 `useUpdater()` 会在 `onMounted` 首先调用 `resetUpdateState()` 将其全部清零，防止崩溃/强退留下脏 UI。

---

## 八、开发环境调试更新功能

### 配置本地调试文件

项目根目录创建 `dev-app-update.yml`（已加入 `.gitignore`）：

```yaml
version: 0.0.6              # 比当前 package.json 版本号高
provider: generic
url: http://10.10.24.52:8089/electron-update/
```

> `autoUpdater.forceDevUpdateConfig = true` 在开发环境已自动开启，会读取此文件。

### 渲染层 Mock 下载（无需真实服务器）

DEV 模式下点击"立即更新"会触发 `startMockDownload()`，模拟完整下载进度流程：

```javascript
// UpdateDialog.vue
const handleConfirm = () => {
  if (import.meta.env.DEV) {
    startMockDownload()  // 本地模拟，不发 IPC
    return
  }
  updateStore.setUpdating(true)
  ipcRenderer.send('start-download')  // 生产：触发真实下载
}
```

### 手动触发检查更新

在渲染层任意位置调用：

```javascript
ipcRenderer.send('check-for-updates')
```

---

## 九、IPC 通信频道速查表

### 渲染层 → 主进程（`ipcRenderer.send`）

| 频道 | 触发时机 | 主进程行为 |
|------|----------|-----------|
| `check-for-updates` | 手动点击"检查更新" | `autoUpdater.checkForUpdates()` |
| `start-download` | 用户点击"立即更新" | `autoUpdater.downloadUpdate()` |
| `install-update` | 用户点击"立即重启安装" | `autoUpdater.quitAndInstall(false, true)` |

### 主进程 → 渲染层（`webContents.send`）

| 频道 | 携带数据 | 渲染层行为 |
|------|----------|-----------|
| `checking-for-update` | — | `store.setCheckingForUpdate(true)` |
| `update-not-available` | `{ version }` | `store.setCheckingForUpdate(false)` |
| `update-available` | `{ version, releaseNotes, releaseDate }` | 写入 store，弹出更新对话框 |
| `download-progress` | `{ percent, transferred, total, bytesPerSecond }` | 更新进度条 |
| `update-downloaded` | `{ version }` | 切换为"重启安装"视图 |
| `update-error` | `string`（错误信息） | 重置下载状态，控制台输出错误 |

---

## 十、常见问题

### Q1：更新后版本号没变化？

- 检查 `package.json` 中的 `version` 是否已更新
- 确认 `latest.yml` 中的 `version` 与安装包文件名一致
- 清除 electron-updater 缓存目录：Windows `%APPDATA%\Crab-updater\`

### Q2：下载速度很慢？

- 检查服务器带宽
- 确认 `.blockmap` 文件已同步上传，可启用差量下载
- 考虑使用 CDN 加速

### Q3：开发环境无法触发 `update-available`？

- 确认 `dev-app-update.yml` 中的版本号**高于** `package.json` 当前版本
- 确认 `autoUpdater.forceDevUpdateConfig = true` 已生效（仅 `NODE_ENV === 'development'`）
- 查看 Electron 主进程控制台日志（含 `[updater]` 前缀）

### Q4：`quitAndInstall` 后应用没有重启？

- `autoUpdater.quitAndInstall(false, true)` 第二个参数 `true` 表示安装后自动运行
- 如需静默安装（不弹安装进度窗口），将第一个参数改为 `true`
- 检查 NSIS 安装脚本权限（`perMachine: false` 无需管理员权限）

### Q5：releaseNotes 在弹框中显示为空？

- 确认 `CHANGELOG.md` 中存在与 `package.json` 版本号匹配的 `##` 标题行
- 检查 `electron-builder.json` 的 `releaseInfo.releaseNotes` 字段是否已被写入
- 手动运行 `node scripts/inject-release-notes.mjs` 验证提取结果
