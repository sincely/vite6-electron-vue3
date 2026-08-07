# 发布与自动更新指南

本文档基于当前仓库的真实实现编写，重点说明四件事：

- 如何发布新版本
- GitHub Release 当前是如何生成的
- 自动更新依赖哪些文件与服务
- 当前版本的更新弹窗、IPC 与调试方式到底怎么工作

## 一、当前发布架构

当前项目的“发布”和“自动更新资源同步”是两条相关但独立的链路：

```text
开发者提交代码
  │
  ├─► GitHub Actions 手动触发 Public 工作流
  │     ├─ prepare-release：release-it 提升版本并打 tag
  │     ├─ build：按新 tag 构建 Win / macOS / Linux 包
  │     └─ release：创建 GitHub Release 并上传安装包
  │
  └─► 额外同步 auto-update 服务器
        ├─ 上传 latest*.yml / 安装包 / blockmap
        └─ 供 electron-updater 在线检查更新
```

这意味着：

- GitHub Release 负责“发版记录”和“附件下载”
- 更新服务器负责“客户端自动更新”
- 当前 `public.yml` 不会自动把更新元数据同步到 `VITE_UPDATE_URL`

## 二、当前涉及的关键文件

- [public.yml](file:///d:/project/vite6-electron-vue3/.github/workflows/public.yml)：当前主发布工作流
- [release.yml](file:///d:/project/vite6-electron-vue3/.github/workflows/release.yml)：旧工作流，仍在仓库中，但不建议继续作为主流程使用
- [.release-it.json](file:///d:/project/vite6-electron-vue3/.release-it.json)：版本提升、tag、changelog、GitHub Release 规则
- [electron-builder.json5](file:///d:/project/vite6-electron-vue3/electron-builder.json5)：安装包输出、产物命名、publish 配置
- [update.js](file:///d:/project/vite6-electron-vue3/electron/main/update.js)：主进程自动更新逻辑
- [version.js](file:///d:/project/vite6-electron-vue3/src/store/modules/version.js)：版本状态存储
- [UpdateDialog](file:///d:/project/vite6-electron-vue3/src/components/UpdateDialog/index.vue)：更新弹窗 UI 和交互
- [update.js](file:///d:/project/vite6-electron-vue3/src/core/update.js)：渲染层更新事件桥接

## 三、当前发布流程

### 1. GitHub Actions 正式发布

当前推荐使用 GitHub Actions 页面手动触发 `Public` 工作流。

触发参数：

- `patch`
- `minor`
- `major`
- `alpha`
- `beta`

### 2. 工作流执行顺序

#### prepare-release

作用：

- `npm ci`
- 配置 Git 用户
- 执行 `release-it`
- 自动更新 `package.json` 版本号
- 创建 commit 与 tag
- 输出本次 `version` 和 `tag`

实际命令：

```bash
npx release-it <version-type> --ci --no-github.release
```

这里的重点是：

- 先升版本
- 再打 tag
- 暂时不创建 GitHub Release

这样可以避免旧流程里“构建产物还是旧版本号”的问题。

#### build

作用：

- checkout 到上一步新生成的 tag
- 执行多平台打包
- 上传每个平台的 `release/` 目录作为构建产物

当前矩阵：

- macOS：`npm run build-mac:prod`
- Windows：`npm run build-win:prod`
- Linux：`npm run build-linux:prod`

#### release

作用：

- 下载三端构建产物
- 合并到统一 `release/` 目录
- 创建 GitHub Release
- 上传安装包附件

当前上传到 GitHub Release 的文件类型：

- `release/**/*.dmg`
- `release/**/*.zip`
- `release/**/*.exe`
- `release/**/*.AppImage`

注意：

- 当前工作流没有把 `latest.yml`、`latest-mac.yml`、`*.blockmap` 自动传到 GitHub Release
- 也没有自动推送到 `VITE_UPDATE_URL` 指向的更新服务器

## 四、本地构建与打包命令

### 仅构建前端

```bash
npm run build:dev
npm run build:test
npm run build:prod
```

### 构建桌面安装包

```bash
npm run build-win:dev
npm run build-win:test
npm run build-win:prod

npm run build-mac:dev
npm run build-mac:test
npm run build-mac:prod

npm run build-linux:dev
npm run build-linux:test
npm run build-linux:prod
```

当前这些脚本的执行顺序是：

1. `npm run clean`
2. `vite build --mode <env>`
3. `electron-builder --win / --mac / --linux`

注意：

- 当前正式构建链路没有接入自动注入更新说明
- 如果后续需要在客户端展示更新说明，需要单独补充生成与渲染逻辑

## 五、产物输出规则

Electron Builder 当前配置：

- 输出目录：`release/${version}`
- Windows 目标：NSIS
- macOS 目标：`dmg`、`zip`
- Linux 目标：`AppImage`

当前典型产物包括：

- Windows：`lightning-win-<version>-Setup.exe`
- Windows：对应 `*.blockmap`
- Windows：`latest.yml`
- macOS：`*.dmg`
- macOS：`*.zip`
- macOS：平台对应的更新元数据文件
- Linux：`*.AppImage`

实际文件名以 `electron-builder.json5` 和 electron-builder 当前版本输出为准。

## 六、自动更新服务配置

主进程自动更新入口：

- [update.js](file:///d:/project/vite6-electron-vue3/electron/main/update.js)

当前逻辑：

- 使用 `electron-updater`
- provider 为 `generic`
- 更新地址来自 `process.env.VITE_UPDATE_URL`
- 渲染层加载完成后自动执行一次 `checkForUpdates()`
- 默认 `autoDownload = false`，必须由用户手动确认后才下载

当前生产环境地址来自：

- [.env.production](file:///d:/project/vite6-electron-vue3/.env.production)

当前值：

```ini
VITE_UPDATE_URL='http://10.10.24.52:8089/electron-update'
```

## 七、自动更新完整链路

```text
应用启动
  │
  ├─► App.vue 调用 useUpdater()
  │     └─ 注册 update-available / update-not-available / progress / error 监听
  │
  ├─► src/main.js 调用 get-app-version
  │     └─ currentVersion 写入 Pinia
  │
  ├─► 主窗口 did-finish-load
  │     └─ autoUpdater.checkForUpdates()
  │
  ├─► 主进程收到 electron-updater 事件
  │     └─ webContents.send(...) 转发到渲染层
  │
  ├─► src/core/update.js 接收 update-available 等事件
  │     └─ 更新 version store，并转发为 window CustomEvent
  │
  ├─► UpdateDialog 监听 update:available
  │     └─ 弹出“发现新版本”
  │
  ├─► 用户点击“立即更新”
  │     └─ ipcRenderer.send('start-download')
  │
  ├─► 主进程 downloadUpdate()
  │     └─ 持续发送 download-progress
  │
  ├─► 下载完成
  │     └─ 发送 update-downloaded
  │
  └─► 用户点击“立即重启安装”
        └─ ipcRenderer.send('install-update')
            └─ autoUpdater.quitAndInstall(false, true)
```

## 八、当前前端更新状态实现

当前版本状态存储很精简，位于：

- [version.js](file:///d:/project/vite6-electron-vue3/src/store/modules/version.js)

只有两个字段：

| 字段 | 持久化 | 说明 |
| --- | --- | --- |
| `currentVersion` | 是 | 当前应用版本 |
| `latestVersion` | 是 | 最近一次检测到的最新版本 |

这意味着当前实现里：

- 没有单独持久化 `releaseNotes`
- 没有单独的 `checkingForUpdate`、`isUpdating`、`dialogVisible` store 字段
- 下载进度、是否已下载、弹窗显示状态都保存在 `UpdateDialog` 组件内部

因此旧文档里关于“复杂 updateStore 状态机”的描述，已经不再适用于当前项目。

## 九、当前更新弹窗行为

更新弹窗文件：

- [UpdateDialog](file:///d:/project/vite6-electron-vue3/src/components/UpdateDialog/index.vue)

当前行为如下：

- 展示当前版本和最新版本
- 生产环境下点击“立即更新”会发送 `start-download`
- 开发环境下点击“立即更新”不会真实下载，而是走本地 mock 进度
- 下载完成后切换为“立即重启安装”界面
- 点击“立即重启安装”时，会先把 `latestVersion` 乐观写入 `currentVersion`，再发送 `install-update`

当前弹窗没有展示：

- release notes
- release date
- 更新日志列表

所以如果更新元数据里带了 `releaseNotes`，目前 UI 也不会直接渲染它。

## 十、当前 IPC 频道

### 渲染层 -> 主进程

| 频道 | 触发位置 | 作用 |
| --- | --- | --- |
| `check-for-updates` | `UpdateDialog` | 手动检查更新 |
| `start-download` | `UpdateDialog` | 开始下载更新 |
| `install-update` | `UpdateDialog`、`UpdateProgress` | 下载完成后安装更新 |

### 主进程 -> 渲染层

| 频道 | 发送位置 | 作用 |
| --- | --- | --- |
| `checking-for-update` | `electron/main/update.js` | 正在检查更新 |
| `update-not-available` | `electron/main/update.js` | 当前已是最新版本 |
| `update-available` | `electron/main/update.js` | 发现新版本 |
| `download-progress` | `electron/main/update.js` | 下载进度更新 |
| `update-downloaded` | `electron/main/update.js` | 下载完成 |
| `quit-and-install` | `electron/main/update.js` | 即将退出安装 |
| `update-error` | `electron/main/update.js` | 更新失败 |

### 渲染层二次转发

`src/core/update.js` 会把 Electron IPC 二次转发为浏览器事件：

- `update:available`
- `update:download-progress`
- `update:downloaded`
- `update:error`

当前 `UpdateDialog` 主要消费：

- `update:available`
- 部分原始 IPC 事件，如 `download-progress`、`update-downloaded`、`update-error`、`update-not-available`

## 十一、更新服务器部署建议

如果需要让客户端自动更新正常工作，除了 GitHub Release 之外，还需要把 electron-builder 生成的更新文件同步到静态服务器。

推荐目录结构：

```text
/electron-update/
  ├── latest.yml
  ├── latest-mac.yml
  ├── *.exe
  ├── *.blockmap
  ├── *.dmg
  ├── *.zip
  └── *.AppImage
```

推荐上传顺序：

1. 先上传安装包
2. 再上传 `*.blockmap`
3. 最后上传 `latest*.yml`

原因是：

- 客户端是先读 `latest*.yml`
- 如果元数据先更新，但安装包还没同步完成，客户端可能会发现新版本但下载失败

### Nginx 示例

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

## 十二、开发环境调试更新

主进程已启用：

```js
autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development'
```

这表示在开发环境下，可以通过项目根目录的 `dev-app-update.yml` 调试更新。

示例：

```yaml
provider: generic
url: http://10.10.24.52:8089/electron-update
```

另外，当前开发模式还有两层本地模拟：

- `src/main.js` 会主动派发模拟 `update:available`
- `UpdateDialog` 在 DEV 模式下点击“立即更新”会执行 `startMockDownload()`

因此开发环境下即便没有真实更新服务器，也能演示更新弹窗和下载进度 UI。

## 十三、release-it 当前职责

当前 release-it 相关配置位于：

- [.release-it.json](file:///d:/project/vite6-electron-vue3/.release-it.json)

它现在主要负责：

1. 版本号提升
2. 生成或更新 `CHANGELOG.md`
3. 创建 git commit
4. 创建 git tag
5. push 提交与 tag
6. 在完整发布流程中创建 GitHub Release

当前还配置了发布前校验：

```text
before:init -> npm run lint:check
```

也就是说，只要走 release-it，代码规范检查会先执行。

## 十四、更新说明现状

当前项目没有接入“自动提取 CHANGELOG 并注入 releaseNotes”的正式流程。

也就是说：

- 构建阶段不会自动生成 release notes 元数据
- 前端更新弹窗也不会展示更新说明文本

如果后续要恢复该能力，需要同时补两部分：

1. 发布阶段生成更新说明元数据
2. 渲染层增加 `releaseNotes` 的存储与展示

## 十五、推荐发布步骤

### 方案 A：推荐，走 GitHub Actions

1. 确保代码已合并并提交
2. 本地先执行：

```bash
npm install
npm run lint:check
npm run build:prod
```

3. 打开 GitHub Actions
4. 手动触发 `Public`
5. 选择 `patch / minor / major / alpha / beta`
6. 等待 GitHub Release 构建完成
7. 手动把 `release/<version>/` 中的 auto-update 文件同步到更新服务器

### 方案 B：本地手动发版

```bash
npm run release:patch
npm run build-win:prod
```

然后手动：

- 上传安装包到发布渠道
- 上传 `latest*.yml` 与安装包到更新服务器

## 十六、常见问题

### 1. 为什么 GitHub Release 有新版本，但客户端没有检测到更新？

因为 GitHub Release 和 auto-update 服务器不是同一件事。
客户端只认 `VITE_UPDATE_URL` 指向的更新服务器元数据，不会直接读取 GitHub Release。

### 2. 为什么客户端发现新版本后下载失败？

常见原因：

- `latest*.yml` 已更新，但安装包未上传完成
- 更新服务器路径和 `VITE_UPDATE_URL` 不一致
- 缺少对应平台所需的元数据文件或 `blockmap`

### 3. 为什么发布版本号和安装包版本号会不一致？

旧问题根因是先构建、后 bump version。
当前 `public.yml` 已调整为：

1. 先执行 `release-it`
2. 再按新 tag 构建
3. 最后创建 GitHub Release

现在版本号应与 tag、目录和安装包文件名一致。

### 4. 为什么开发环境会直接看到更新弹窗？

因为当前 DEV 模式里有模拟逻辑：

- `src/main.js` 主动派发模拟可更新事件
- `UpdateDialog` 自带 mock 下载流程

这属于开发体验增强，不代表真实在线更新一定可用。

### 5. 为什么 `releaseNotes` 没显示？

当前原因通常不是服务端没给，而是前端没展示：

- store 没有单独保存 `releaseNotes`
- `UpdateDialog` 没有渲染更新说明区块
- 当前发布链路没有生成可供弹窗直接渲染的更新说明字段

## 七、远端更新配置（update-config.json）

客户端启动时会从更新服务器拉取 `update-config.json`（位于 `VITE_UPDATE_URL` 根目录，与 `latest.yml` 同级），用于远程控制更新策略。**发布新版本时必须保证该文件存在且字段合法**，否则客户端使用内置兜底配置（不影响现有更新流程）。

### 配置文件示例

```json
{
  "schemaVersion": 1,
  "eligible": true,
  "disabledClientVersions": [],
  "autoDownload": true,
  "checkOnFocus": true,
  "minCheckIntervalMinutes": 30
}
```

### 字段说明

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `schemaVersion` | number | 1 | 配置结构版本，便于后续兼容 |
| `eligible` | boolean | true | 更新资格总开关。`false` 时客户端**完全跳过更新检查**，可随时远程暂停发布 |
| `disabledClientVersions` | string[] | `[]` | 禁用版本列表。命中则推送强制升级弹窗（不可跳过/关闭），支持精确（`"1.0.1"`）与前缀（`"1.0"` 命中 1.0.x 系列） |
| `autoDownload` | boolean | false | 是否自动下载。`true` 时发现新版本自动开始下载（对齐 QoderWork），`false` 时用户点击"立即更新"后才下载 |
| `checkOnFocus` | boolean | true | 窗口聚焦时是否自动检查更新 |
| `minCheckIntervalMinutes` | number | 30 | 聚焦触发的最小检查间隔（分钟），防止频繁请求 |

### 更新时机

- 客户端启动时拉取一次，之后每 10 分钟轮询一次
- 配置变化会实时推送到渲染层（设置页"关于软件"的更新卡片会同步显示"更新已暂停"等状态）

### 灰度分批（stagingPercentage）

客户端无需任何配置。发布方在 `latest.yml` 中写入 `stagingPercentage` 字段（如 `stagingPercentage: 20` 表示 20% 灰度），electron-updater 会按客户端缓存 ID 自动计算命中，未命中的客户端收不到 `update-available`。命中后弹窗会显示"灰度发布 x%"徽标。
