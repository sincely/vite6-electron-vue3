# lightning 项目技术架构文档

本文档基于当前仓库代码整理，覆盖渲染层、主进程、预加载脚本、构建发布体系以及完整的进程间通信方式，供开发、排障与后续扩展时参考。

## 1. 技术栈概览

项目当前核心技术栈如下：

- 核心框架：Electron 28.3.3
- 前端框架：Vue 3.5.30
- 构建工具：Vite 6.4.1
- 路由管理：Vue Router 4.5.1
- 状态管理：Pinia 2.3.1
- UI 组件库：Element Plus 2.11.9
- 图表能力：ECharts 5.4.3
- 动画能力：GSAP 3.14.2
- 网络请求：Axios 1.7.3
- 自动更新：electron-updater 6.3.9
- 代码规范：ESLint、Prettier、Stylelint、Husky、lint-staged
- 发布管理：release-it、GitHub Actions、electron-builder

## 2. 整体架构

项目采用 Electron 的三层结构：

### 2.1 主进程

主进程位于 `electron/main`，负责：

- 应用生命周期管理
- 窗口创建、切换、恢复与关闭行为控制
- 系统托盘创建
- 自动更新接入
- 原生能力封装
- IPC 统一注册与转发

主进程入口为：

- [index.js](file:///d:/project/vite6-electron-vue3/electron/main/index.js)

核心窗口管理位于：

- [windowManager.js](file:///d:/project/vite6-electron-vue3/electron/main/windowManager.js)

### 2.2 预加载脚本

预加载脚本位于 `electron/preload/index.mjs`，负责：

- 在开启 `contextIsolation: true` 的前提下，通过 `contextBridge` 向渲染进程暴露安全 API
- 提供 `window.ipcRenderer` 的 `on/off/send/invoke` 代理
- 暴露只读运行时信息，例如 `window.versions`、`window.process.platform`
- 处理主窗口首次渲染的 loading 覆盖层

文件位置：

- [index.mjs](../electron/preload/index.mjs)

### 2.3 渲染进程

渲染进程位于 `src/`，采用 Vue 3 + Pinia + Vue Router 组织页面与业务逻辑，负责：

- 登录页、桌面页、设置页、更新弹窗等 UI 渲染
- 状态存储与主题切换
- 与主进程进行窗口控制、自动更新、通知、应用信息读取等通信

入口文件：

- [main.js](../src/render/index.js)

## 3. 目录结构

```text
├── .agent/                        # AI 代理技能配置
├── .github/                       # GitHub 配置
│   ├── ISSUE_TEMPLATE/            # Issue 模板
│   ├── prompts/                   # AI 提示词
│   └── workflows/                 # GitHub Actions 发布工作流
├── .husky/                        # Git 钩子（commit-msg、pre-commit）
├── .qoder/                        # Qoder 技能配置
├── .trae/                         # Trae 技能配置
├── .vscode/                       # VS Code 工作区配置
├── build/                         # Vite 构建插件、代理与工具方法
│   ├── config/                    # 构建配置
│   ├── plugins/                   # 自定义 Vite 插件
│   └── utils/                     # 构建工具方法（含体积分析）
├── docs/                          # 技术文档（ARCHITECTURE.md 等）
├── electron/                      # Electron 源码（开发目录，与 src 同步）
│   ├── config/                    # Electron 运行配置
│   ├── ipc/                       # IPC 频道定义与注册
│   ├── loading/                   # 窗口加载动画
│   ├── main/                      # 主进程核心逻辑
│   └── preload/                   # 预加载脚本
├── licenses/                      # 许可证文件
├── mock/                          # 开发/构建阶段模拟数据
│   └── modules/                   # 模拟数据模块
├── public/                        # 公开静态资源
├── resources/                     # 应用图标与打包资源
│   └── icons/                     # 平台图标（linux/ mac/ win）
├── scripts/                       # 工程脚本（图标生成、体积分析、发布等）
├── src/                           # 源码根目录
│   ├── main/                      # 主进程源码（对应 electron/main）
│   │   ├── config/                # 主进程配置
│   │   ├── ipc/                   # IPC 处理
│   │   ├── loading/               # 加载动画逻辑
│   │   ├── index.js               # 主进程入口
│   │   ├── log.js                 # 日志管理
│   │   ├── menu.js                # 应用菜单
│   │   ├── notification.js        # 通知管理
│   │   ├── tray.js                # 系统托盘
│   │   ├── update.js              # 自动更新
│   │   └── windowManager.js       # 窗口管理
│   ├── preload/                   # 预加载脚本（对应 electron/preload）
│   │   └── index.mjs              # Preload 入口
│   ├── render/                    # 渲染进程（Vue 前端）
│   │   ├── api/                   # 请求封装入口
│   │   ├── assets/                # 图片与静态素材
│   │   ├── components/            # 通用业务组件
│   │   ├── config/                # 前端运行时配置
│   │   ├── core/                  # 跨页面核心能力，例如更新桥接
│   │   ├── directives/            # 自定义指令
│   │   ├── enums/                 # 枚举定义
│   │   ├── hooks/                 # 组合式函数
│   │   ├── icons/                 # SVG 图标资源
│   │   ├── layouts/               # 桌面主布局
│   │   ├── plugins/               # 前端插件注册，例如图标与 ECharts
│   │   ├── router/                # 路由配置
│   │   ├── settings/              # 主题与设计配置
│   │   ├── store/                 # Pinia 状态管理
│   │   ├── styles/                # 全局样式与主题样式
│   │   ├── utils/                 # 通用工具
│   │   ├── views/                 # 页面级视图
│   │   ├── App.vue                # 根组件
│   │   ├── index.js               # 渲染进程入口
│   │   └── permission.js          # 路由权限
│   └── shared/                    # 主进程与渲染进程共享代码
├── electron-builder.json5         # Electron 打包配置
├── vite.config.js                 # Vite 配置
└── package.json                   # 脚本、依赖、版本信息
```

## 4. 运行时架构

### 4.1 窗口模型

当前项目主要包含三类窗口：

- 登录窗口：固定尺寸、无边框、不可最大化，用于登录入口
- 主窗口：桌面主界面，支持窗口控制、更新通知、托盘最小化
- 普通子窗口：由 `createWindow` 按 hash 路由动态创建

窗口统一由 `windowManager.js` 管理，并通过 `Map` 保存窗口实例。

### 4.2 路由与界面分层

渲染层大致分为：

- `views/login`：登录页及自定义标题栏
- `views/desktop`：桌面首页
- `layouts`：主框架壳层
- `components`：通用组件，如更新弹窗、通知面板、图表组件、SVG 图标等
- `store/modules`：应用状态、用户状态、通知状态、版本状态

### 4.3 状态与主题体系

以 Pinia 为核心，当前主要包含：

- `app`：主题、侧边栏、设置弹窗、loading、开机自启、关闭行为
- `user`：用户信息与登录态
- `notification`：通知中心
- `version`：当前版本、最新版本、更新下载状态

主题初始化在应用挂载前执行，确保首次渲染即拿到正确主题数据。

## 5. 构建与发布架构

### 5.1 Vite 构建层

`vite.config.js` 负责：

- 加载 `.env.*` 环境变量
- 注入代理配置
- 注册 Vue、自动导入、SVG 图标、mock、Electron 插件
- 区分渲染进程、主进程、预加载脚本构建
- 通过 Rollup `manualChunks` 做依赖拆包

当前前端插件主要来自：

- `build/plugins/unplugin.js`
- `build/plugins/svgIcon.js`
- `vite-plugin-electron/simple`

### 5.2 Electron 打包层

`electron-builder.json5` 负责：

- 定义应用名称、图标、语言、压缩策略
- 指定打包内容与裁剪规则
- 定义 Windows、macOS、Linux 的输出目标
- 定义自动更新的 generic 发布源

当前输出目录规则为：

```text
release/${version}
```

### 5.3 构建体积优化

项目通过多维度优化策略，实现 **15-35%** 的打包体积缩减。

#### 5.3.1 优化手段

| 优化项 | 配置位置 | 说明 |
|--------|---------|------|
| 文件排除 | `electron-builder.json5` | 排除 `.git/**`、`.gitignore`、`.npmignore`、`.tif/.tiff`、sourcemap、文档、类型定义文件等 |
| Terser 压缩 | `vite.config.js` | `passes: 3`、`reduce_funcs: true`、`mangle.toplevel: true`、移除注释 |
| Tree-shaking | `vite.config.js` | `moduleSideEffects: false` 启用激进死代码移除 |
| 代码分割 | `vite.config.js` | 按库拆包：`vue-vendor`、`element-plus`、`echarts`、`qrcode`、`gsap`、`utils-vendor` 等 |
| 资源优化 | `vite.config.js` | `cssCodeSplit: true`、4KB 以下内联、`compact: true`、按类型分类输出到 `images/`、`fonts/`、`css/` |
| ASAR 解包 | `electron-builder.json5` | 仅解包 `sharp` 和 `@img` 等必要库 |

#### 5.3.2 体积分析工具

新增 `scripts/analyze-build-size.js` 与 `build/utils/sizeAnalyzer.js`，构建后自动输出：

- Web 应用包体积及最大的 10 个文件
- Electron 进程包体积及最大的 5 个文件
- 总体积统计

使用方式：

```bash
npm run build-mac:prod   # 构建后自动分析
npm run analyze:size     # 单独分析当前构建
```

#### 5.3.3 进一步优化建议

- **短期**：按需加载 Element Plus 组件、动态导入 ECharts、检查未使用依赖
- **中期**：替换重型依赖（如 `lodash-es` → 原生 JS）、图片压缩/转 WebP、字体子集化
- **长期**：更细粒度的路由级代码分割、Service Worker 缓存、CDN 加载第三方库

### 5.4 发布流程

当前项目的「发布」和「自动更新资源同步」是两条相关但独立的链路：

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

- GitHub Release 负责「发版记录」和「附件下载」
- 更新服务器负责「客户端自动更新」
- 当前 `public.yml` 不会自动把更新元数据同步到 `VITE_UPDATE_URL`

#### 5.4.1 关键文件

| 文件 | 说明 |
|------|------|
| `.github/workflows/public.yml` | 当前主发布工作流 |
| `.github/workflows/release.yml` | 旧工作流，仍保留但不建议作为主流程 |
| `.release-it.json` | 版本提升、tag、changelog、GitHub Release 规则 |
| `electron-builder.json5` | 安装包输出、产物命名、publish 配置 |
| `electron/main/update.js` | 主进程自动更新逻辑 |
| `src/store/modules/version.js` | 版本状态存储 |
| `src/components/UpdateDialog/index.vue` | 更新弹窗 UI 和交互 |
| `src/core/update.js` | 渲染层更新事件桥接 |

#### 5.4.2 工作流三阶段

1. **prepare-release**：`npm ci` → 配置 Git 用户 → 执行 `release-it` → 自动更新 `package.json` 版本号 → 创建 commit 与 tag
2. **build**：checkout 到新 tag → 多平台打包（macOS / Windows / Linux）→ 上传构建产物
3. **release**：下载三端构建产物 → 合并到统一 `release/` 目录 → 创建 GitHub Release → 上传安装包附件

GitHub Release 上传的文件类型：`*.dmg`、`*.zip`、`*.exe`、`*.AppImage`。

注意：当前工作流不会自动把 `latest.yml`、`*.blockmap` 传到 GitHub Release，也不会自动推送到 `VITE_UPDATE_URL` 更新服务器。

#### 5.4.3 本地构建命令

```bash
# 仅构建前端
npm run build:dev / build:test / build:prod

# 构建桌面安装包（三平台 × 三环境）
npm run build-win:prod / build-mac:prod / build-linux:prod
```

执行顺序：`npm run clean` → `vite build --mode <env>` → `electron-builder --win/--mac/--linux`

#### 5.4.4 产物输出规则

- 输出目录：`release/${version}`
- Windows 目标：NSIS（`*-Setup.exe` + `*.blockmap` + `latest.yml`）
- macOS 目标：`dmg`、`zip`（含平台更新元数据）
- Linux 目标：`AppImage`

#### 5.4.5 release-it 职责

当前 `.release-it.json` 负责：版本号提升 → 生成/更新 `CHANGELOG.md` → 创建 git commit → 创建 git tag → push 提交与 tag → 创建 GitHub Release。发布前会自动执行 `npm run lint:check` 校验代码规范。

#### 5.4.6 推荐发布步骤

**方案 A（推荐，走 GitHub Actions）**：

1. 确保代码已合并并提交
2. 本地先执行 `npm install && npm run lint:check && npm run build:prod`
3. 打开 GitHub Actions，手动触发 `Public`，选择 `patch / minor / major / alpha / beta`
4. 等待 GitHub Release 构建完成
5. 手动把 `release/<version>/` 中的 auto-update 文件同步到更新服务器

**方案 B（本地手动发版）**：

```bash
npm run release:patch
npm run build-win:prod
```
然后手动上传安装包和 `latest*.yml` + `*.blockmap` 到更新服务器。

### 5.5 自动更新服务

#### 5.5.1 配置

- 主进程入口：`electron/main/update.js`
- provider 为 `generic`，更新地址来自 `process.env.VITE_UPDATE_URL`
- 生产环境地址定义在 `.env.production`：`VITE_UPDATE_URL='http://10.10.24.52:8089/electron-update'`
- 渲染层加载完成后自动执行 `checkForUpdates()`
- 默认 `autoDownload = false`，必须用户手动确认后才下载

#### 5.5.2 更新服务器部署

推荐目录结构：

```text
/electron-update/
  ├── latest.yml          # Windows 版本清单
  ├── latest-mac.yml      # macOS 版本清单
  ├── *.exe               # Windows 安装包
  ├── *.blockmap          # 增量更新文件
  ├── *.dmg               # macOS 安装包
  ├── *.zip               # macOS 压缩包
  └── *.AppImage          # Linux 安装包
```

推荐上传顺序：先上传安装包 → 再上传 `*.blockmap` → 最后上传 `latest*.yml`（避免元数据先更新但安装包未同步导致下载失败）。

Nginx 示例：

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

#### 5.5.3 开发环境调试

主进程已启用 `autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development'`，开发环境可通过 `dev-app-update.yml` 调试更新。开发模式还有两层本地模拟：`src/main.js` 主动派发模拟 `update:available`，`UpdateDialog` 在 DEV 模式下执行 `startMockDownload()`。

#### 5.5.4 版本状态与更新弹窗

版本状态存储于 `src/store/modules/version.js`，仅包含两个字段：

| 字段 | 持久化 | 说明 |
|------|--------|------|
| `currentVersion` | 是 | 当前应用版本 |
| `latestVersion` | 是 | 最近一次检测到的最新版本 |

下载进度、是否已下载、弹窗显示状态保存在 `UpdateDialog` 组件内部。当前不展示 `releaseNotes`、更新日志列表。

#### 5.5.5 常见问题

- **GitHub Release 有新版本但客户端没检测到**：客户端只认 `VITE_UPDATE_URL` 指向的更新服务器元数据，不直接读取 GitHub Release
- **发现新版本后下载失败**：`latest*.yml` 已更新但安装包未上传完成，或更新服务器路径不一致，或缺少 `blockmap`
- **版本号不一致**：当前 `public.yml` 已调整为先 `release-it` 再构建，版本号应与 tag、目录、文件名一致
- **开发环境直接看到更新弹窗**：DEV 模式有模拟逻辑，不代表真实更新可用

## 6. 进程间通信总览

项目当前通信不只包含标准 IPC，还包含预加载桥接与渲染层内事件转发。实际存在以下四类通信方式：

### 6.1 ContextBridge 桥接

由预加载脚本通过 `contextBridge.exposeInMainWorld` 暴露到渲染层：

| 暴露对象 | 方法/字段 | 说明 |
| --- | --- | --- |
| `window.ipcRenderer` | `on/off/send/invoke` | 渲染层访问 Electron IPC 的统一入口 |
| `window.versions` | `node`、`chrome` | 暴露运行时版本信息 |
| `window.process` | `platform` | 暴露平台信息 |
| `window.electron` | `setTitle(title)` | 预留标题设置 API，当前仅在 preload 中定义，主进程未注册对应 `set-title` 频道 |

### 6.2 渲染进程 -> 主进程

这部分通过 `ipcRenderer.send` 或 `ipcRenderer.invoke` 进入主进程，由 `electron/ipc/index.js` 统一注册到 `ipcMain`。

#### A. 事件型通信 `ipcRenderer.send` / `ipcMain.on`

| 频道 | 方向 | 主进程处理位置 | 作用 | 当前调用位置 |
| --- | --- | --- | --- | --- |
| `toMain` | Renderer -> Main | `electron/ipc/app.js` | 登录成功后关闭登录窗口并创建主窗口 | `src/views/login/components/AccountLogin.vue` |
| `set-auto-launch` | Renderer -> Main | `electron/ipc/app.js` | 设置开机自启 | `src/store/modules/app.js` |
| `set-close-action` | Renderer -> Main | `electron/ipc/app.js` | 设置关闭按钮行为：最小化到托盘或退出 | `src/store/modules/app.js` |
| `check-for-updates` | Renderer -> Main | `electron/ipc/update.js` | 手动检查更新 | `src/components/UpdateDialog/index.vue` |
| `start-download` | Renderer -> Main | `electron/ipc/update.js` | 开始下载更新包 | `src/components/UpdateDialog/index.vue` |
| `install-update` | Renderer -> Main | `electron/ipc/update.js` | 下载完成后退出并安装 | `src/components/UpdateDialog/index.vue`、`src/components/UpdateProgress/index.vue` |
| `minimize-window` | Renderer -> Main | `electron/ipc/win-control.js` | 最小化当前窗口 | `src/views/login/components/CustomTitleBar.vue`、`src/layouts/components/global-header/index.vue` |
| `maximize-window` | Renderer -> Main | `electron/ipc/win-control.js` | 最大化/还原当前窗口 | `src/layouts/components/global-header/index.vue` |
| `close-window` | Renderer -> Main | `electron/ipc/win-control.js` | 关闭当前窗口 | `src/views/login/components/CustomTitleBar.vue`、`src/layouts/components/global-header/index.vue` |
| `send-notification` | Renderer -> Main | `electron/ipc/notification.js` | 请求主进程把通知转发到主窗口渲染层 | 当前代码中已注册，暂未发现直接调用 |
| `set-title` | Renderer -> Main | 无处理器 | 由 `window.electron.setTitle` 预留，但当前主进程未注册对应频道 | 当前未实际使用 |

#### B. 请求响应型通信 `ipcRenderer.invoke` / `ipcMain.handle`

| 频道 | 方向 | 主进程处理位置 | 作用 | 当前调用位置 |
| --- | --- | --- | --- | --- |
| `open-win` | Renderer -> Main | `electron/ipc/app.js` | 打开一个新的子窗口 | 当前已注册，暂未发现渲染层调用 |
| `get-auto-launch` | Renderer -> Main | `electron/ipc/app.js` | 获取当前开机自启状态 | `src/store/modules/app.js` |
| `get-app-version` | Renderer -> Main | `electron/ipc/app.js` | 获取应用版本号 | `src/main.js` |

### 6.3 主进程 -> 渲染进程

这部分通过 `BrowserWindow.webContents.send` 下发消息。

| 频道 | 方向 | 发送位置 | 作用 | 当前接收位置 |
| --- | --- | --- | --- | --- |
| `show-main-loading` | Main -> Preload/Renderer | `electron/main/windowManager.js` | 主窗口 ready-to-show 时触发预加载 loading 覆盖层 | `electron/preload/index.mjs` |
| `main-process-message` | Main -> Renderer | `electron/main/windowManager.js` | 主窗口首次加载完成后发送时间戳消息 | 当前未发现渲染层监听 |
| `system-theme-updated` | Main -> Renderer | `electron/main/index.js` | 系统主题变化时广播 dark/light | 当前未发现渲染层监听 |
| `show-notification` | Main -> Renderer | `electron/ipc/notification.js`、`electron/main/windowManager.js` 间接触发 | 向渲染层展示通知 | `src/main.js` |
| `checking-for-update` | Main -> Renderer | `electron/main/update.js` | 正在检查更新 | 当前未发现渲染层监听 |
| `update-not-available` | Main -> Renderer | `electron/main/update.js` | 没有可用更新 | `src/core/update.js`、`src/components/UpdateDialog/index.vue` |
| `update-available` | Main -> Renderer | `electron/main/update.js` | 检测到可用更新 | `src/core/update.js` |
| `download-progress` | Main -> Renderer | `electron/main/update.js` | 更新下载进度 | `src/core/update.js`、`src/components/UpdateDialog/index.vue` |
| `update-downloaded` | Main -> Renderer | `electron/main/update.js` | 更新下载完成 | `src/core/update.js`、`src/components/UpdateDialog/index.vue` |
| `quit-and-install` | Main -> Renderer | `electron/main/update.js` | 即将退出并安装更新 | 当前未发现渲染层监听 |
| `update-error` | Main -> Renderer | `electron/main/update.js` | 更新流程发生错误 | `src/core/update.js`、`src/components/UpdateDialog/index.vue` |

### 6.4 渲染层内部事件转发

项目中为了避免多个组件重复直接监听 Electron IPC，还使用了浏览器事件做二次转发。这不属于跨进程通信，但属于当前应用通信架构的一部分。

#### A. `window.dispatchEvent(new CustomEvent(...))`

主要由 `src/core/update.js` 负责把 Electron 更新消息转成前端自定义事件：

| 自定义事件 | 来源 | 用途 | 监听位置 |
| --- | --- | --- | --- |
| `update:available` | `update-available` IPC | 广播发现新版本 | `src/components/UpdateDialog/index.vue` |
| `update:download-progress` | `download-progress` IPC | 广播下载进度 | 当前未发现组件直接监听 |
| `update:downloaded` | `update-downloaded` IPC | 广播下载完成 | 当前未发现组件直接监听 |
| `update:error` | `update-error` IPC | 广播下载失败 | 当前未发现组件直接监听 |
| `update:open-dialog` | 页面按钮主动派发 | 打开更新弹窗 | `src/components/UpdateDialog/index.vue` |

另外，开发模式下 `src/main.js` 会主动派发模拟更新事件，用于本地演示更新流程。

#### B. `window.onmessage`

预加载脚本中还监听了：

| 消息载荷 | 处理位置 | 作用 |
| --- | --- | --- |
| `payload === 'removeLoading'` | `electron/preload/index.mjs` | 手动移除主窗口启动 loading 层 |

当前仓库中暂未发现显式 `postMessage` 调用方，因此该能力更像预留兜底通道。

## 7. 关键模块设计

### 7.1 窗口管理

窗口管理集中在 `windowManager.js`，特点如下：

- 登录窗口与主窗口由独立工厂函数创建
- 主窗口关闭时默认隐藏到托盘，而不是直接退出
- 通过 `closeAction` 控制“关闭即退出”或“关闭即最小化”
- 所有窗口统一注入同一个 preload 脚本
- 所有窗口均启用 `contextIsolation: true`

当前安全模型有一个值得注意的点：

- 同时开启了 `contextIsolation: true`
- 但也开启了 `nodeIntegration: true`

这意味着项目虽然使用了 preload 桥接，但整体仍是偏“宽松”的桌面安全策略，后续若继续强化安全边界，可以考虑逐步收紧 `nodeIntegration`。

### 7.2 自动更新

自动更新由主进程与渲染层协同完成：

- 主进程：`electron/main/update.js`
- 渲染桥接：`src/core/update.js`
- UI 展示：`src/components/UpdateDialog/index.vue`

整体链路为：

1. 主窗口加载完成后自动触发检查更新
2. `electron-updater` 监听状态变化
3. 主进程通过 `webContents.send` 下发更新消息
4. 渲染层通过 `useUpdater` 转发为自定义事件
5. 更新弹窗根据状态展示“可更新 / 下载中 / 已下载”

### 7.3 通知体系

通知支持两条路径：

- 主进程主动创建系统/应用内通知，再通过 `show-notification` 推给渲染层
- 渲染层可通过 `send-notification` 请求主进程转发通知

通知中心状态由 Pinia 中的 `notification` store 负责维护。

### 7.4 桌面设置

桌面设置主要聚焦：

- 开机自启
- 关闭按钮行为
- 主题切换

其中：

- 开机自启依赖 Electron `app.setLoginItemSettings`
- 关闭按钮行为依赖主进程窗口关闭逻辑
- 主题切换主要发生在渲染层，但系统主题变化广播已经由主进程预留

## 8. 开发与调试建议

### 8.1 本地开发

```bash
npm install
npm run dev
```

### 8.2 发布前校验

```bash
npm run lint:check
npm run build:prod
```

如需本地验证桌面安装包：

```bash
npm run build-win:prod
npm run build-mac:prod
npm run build-linux:prod
```

### 8.3 IPC 排查建议

如果遇到“按钮点击无反应”“更新弹窗不出现”“通知不显示”等问题，建议按顺序检查：

1. `electron/ipc/*.js` 是否注册了对应频道
2. `electron/ipc/index.js` 是否已纳入统一注册
3. preload 是否暴露了所需桥接方法
4. 渲染层是否使用正确的频道名
5. 主进程是否真的调用了 `webContents.send`
6. 渲染层是否在组件销毁时错误移除了监听器

## 9. 当前架构中的已知特点

- `main-process-message`、`system-theme-updated`、`checking-for-update`、`quit-and-install` 已具备发送逻辑，但当前渲染层未实际消费
- `window.electron.setTitle` 已暴露，但缺少主进程 `set-title` 处理器
- `open-win` 与 `send-notification` 已具备注册能力，但当前业务中未见明确调用
- 预加载中的 `window.onmessage -> removeLoading` 是预留兜底能力，当前仓库内未发现调用方

这些能力不一定是问题，但在继续演进时应明确哪些是“预留接口”，哪些是“正式通道”，避免后续维护者误判。

## 10. 外部实战补充（详细内容整理）

### 10.1 Electron 最真实痛点（写实吐槽，懂的都懂）

先吐槽两句，不是否定 Electron，而是客观说说它的反人类体验。技术本身没问题，生态也成熟，但对个人开发者、小型项目、内网系统来说，简直是“坐牢式开发”。

1. 环境严重割裂，强行制造问题
开发环境、绿色免安装版、Windows 安装版，三套环境规则完全不一样：
   - 开发环境：`npm run dev` 跑得飞起，接口、界面全正常
   - 绿色版（`win-unpacked`）：解压就能用，无任何异常
   - 安装版（`NSIS`）：一打包就黑屏、接口失效，毫无过渡，排查无方向
2. 安全策略脱离实际，刻意折磨开发者
底层套壳 Chromium，默认开启强沙箱、强 GPU 隔离、强跨域拦截，甚至禁用内网 HTTP 请求。官方明明知道 Windows 安装目录权限限制、内网业务场景极其普遍，却坚决不做默认兼容，所有问题都要开发者手动复制一堆“修复代码”才能解决，毫无开箱即用体验。
3. 安装版专属坑点扎堆，排查难度拉满
只要把软件装在系统保护目录（比如 `C:\Program Files`），各种奇葩问题就会找上门：
   - GPU 权限不足，直接黑屏/白屏
   - 浏览器安全策略收紧，内网接口跨域、`localhost` 请求被直接拦截
   - 所有故障都静默失败，无任何报错提示，全靠瞎试、堆配置
4. 架构天生冲突，底层矛盾难根治
Chromium 浏览器安全模型 + Node.js 本地权限 + Windows 系统权限管控，三者互相打架，不是简单改几行代码就能根治的，很多问题都是“治标不治本”。
5. 对比同类框架，全面落后
Tauri、Flutter、Qt 都是一键打包、安装即用，零额外适配；而 Electron，写代码 1 小时，打包排坑大半天，小型项目、内网工具的使用成本直接拉满。

一句话总结：Electron 技术没问题，但打包体验、Windows 适配、开箱易用性，完全是反人类垃圾设计。

### 10.2 核心致命问题：绿色版正常，安装版黑屏

这是 Electron 项目最常见、最致命的问题，没有之一，也是实践中最容易踩到的大坑。先搞懂两种包体的区别，才能找到问题根源。

1. 两种打包包体核心区别
   1. 绿色版（`win-unpacked`）
      - 文件完全解压，`dist` 文件夹可见、可直接访问
      - 普通路径、自定义协议都能正常读取资源，所以不会黑屏
      - 适合内部测试，不适合给用户分发（体积大、无安装流程）
   2. NSIS 安装版
      - 默认将所有资源打包进 `app.asar` 压缩包（减小体积）
      - 原生 `fs` 模块、普通路径，无法直接访问 `asar` 内部文件
      - 之前手写的 `app://` 协议 + 本地 FS 读取逻辑，在纯 `asar` 压缩包下直接失效，导致黑屏/白屏/资源 404
2. 最终结论（划重点，必记）
   - 不能删除自定义 `app://` 协议（否则无法适配多环境）
   - 不能只用 `loadFile` 加载页面（无法兼容 `asar` 压缩）
   - 要保留 `asar` 压缩（减小安装包体积），必须使用“自定义 `app` 协议 + `asarUnpack` 配置”，二者缺一不可

### 10.3 保留 Asar 压缩 + 不黑屏 必写配置

这部分是核心，直接复制配置和代码，就能解决安装版黑屏问题，无需额外修改。

1. `electron-builder.yml` 核心配置
重点是 `asar: true` 和 `asarUnpack: dist/**`，其余配置可根据项目调整。

```yaml
asar: true  # 开启 asar 压缩，减小安装包体积
asarUnpack:
  - dist/**  # 解压 dist 前端资源，让自定义协议能正常读取
# 以下是常规配置，可根据项目调整
appId: com.site-manager.app
productName: Site Manager
copyright: Copyright © 2024
compression: normal
electronDownload:
  mirror: https://npmmirror.com/mirrors/electron/  # 国内镜像，加速下载
directories:
  output: release  # 打包产物输出目录
  buildResources: build
files:
  - dist/**/*
  - dist-electron/**/*
  - package.json
win:
  target:
    - target: nsis  # 安装版
      arch: [x64]
    - target: portable  # 绿色便携版
      arch: [x64]
  icon: public/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
```

核心作用：`dist` 前端资源会被自动解压到 `asar` 包外部，自定义协议能正常读取；同时其他资源依然保持压缩，兼顾体积和兼容性。

2. 代码加载固定规则（主进程 `createWindow` 函数）
严格按照以下规则写，禁止乱改，否则会再次黑屏。

```js
// 开发环境：加载本地 Vite 服务
if (isDev) {
  await mainWindow.loadURL('http://localhost:5175')
} else {
  // 生产环境：只允许使用 app://./ 加载，禁止使用 loadFile
  await mainWindow.loadURL('app://./')
}
// 必须保留 setupAppProtocol 自定义协议，不要删除
setupAppProtocol()
```

警告：生产环境禁止直接使用 `loadFile` 加载页面，否则会导致 `asar` 压缩下资源无法读取，再次出现黑屏。

### 10.4 打包产物说明与发布规范

打包完成后，`release` 目录会生成多种产物，需要明确每种产物用途和发布规范，避免混乱。

1. 本地打包产物（`release` 目录）
   - `win-unpacked/`：绿色免安装版，解压即用，适合内部测试与开发调试，不适合用户分发
   - `xxx Setup 版本号.exe`：正式 NSIS 安装包，给用户下载安装，带安装流程和桌面快捷方式
   - `latest.yml` / `.blockmap`：自动更新必需文件，缺一不可，不能删除
2. 服务器必须上传的更新文件（自动更新必备）
   - `latest.yml`：版本清单，记录当前最新版本、安装包路径、校验信息
   - `Setup xxx.exe`：完整安装包（和本地打包一致）
   - `xxx.blockmap`：增量更新文件，减小用户更新时下载体积
3. 官网下载区规范
   - 对用户只提供 `Setup` 安装包 `.exe` 下载链接
   - 无需放绿色版、`yml` 文件、`blockmap` 文件，避免用户混淆

### 10.5 electron-updater 自动更新完整规则

使用 `electron-updater` 实现自动更新，看似简单，但有很多强制规则，踩错一个就会导致更新失效。

1. 强制规则：每次发新版，必须改版本号
修改 `package.json` 的 `version` 字段，必须是三段式数字格式（比如 `1.0.0`、`1.0.1`），不能是 `1.0`、`1.0.0-beta` 等非标准格式。
核心逻辑：`electron-updater` 只会对比版本号大小，版本号不升高，永远检测不到新版本，哪怕你修改了代码、重新打包也没用。
2. 更新触发方式（双模式，推荐都实现）
   - 自动触发：软件启动后，后台静默检查更新，无需用户操作
   - 手动触发：前端页面添加“检查更新”按钮，通过 IPC 调用主进程更新方法，满足用户主动更新需求
3. 标准更新流程（用户无感知，体验最优）
   1. 软件启动，后台检测新版本
   2. 检测到新版本，弹窗询问用户“是否下载更新”
   3. 用户确认后，后台静默下载（不影响用户使用）
   4. 下载完成后，提示用户“关闭软件以完成更新”
   5. 用户关闭软件后，自动静默安装，安装完成后自动重启软件
4. 现有代码状态（划重点）
当前项目中，自动更新逻辑（更新事件、弹窗、下载、重启安装）都完好可用，无需重写。只要遵循“每次发版改版本号”“服务器上传 3 个文件”这两个规则，即可正常实现自动更新。

### 10.6 日常打包与测试必守规则

很多问题都来自打包、测试不规范。遵循以下规则，可显著减少异常：

- 重新打包前，手动删除 `release` 文件夹，避免旧文件占用、缓存冲突导致打包报错
- 安装版测试前，必须卸载旧版本，防止旧版本缓存、注册表残留导致异常
- 关闭窗口逻辑已完善：关闭 -> 前端登出 -> 清空缓存 -> 完全退出，不会残留进程、不会占用文件
- 使用 `asar` 压缩时，禁止乱改 `loadFile` 路径，固定使用 `app://./` 加载页面
- 打包后先测试安装版（`Setup.exe`），再测试绿色版，避免上线后出现安装异常

### 10.7 极简速记（面试/复盘专用）

不想记复杂流程时，可记住以下 4 句话：

1. 安装版黑屏 = `asar` 压缩 + 资源读取限制，用“自定义协议 + `asarUnpack` 配置”解决
2. 要压缩，不要关 `asar`，改配置不改核心加载逻辑
3. 发更新必改版本号，服务器放 3 个文件（`yml + exe + blockmap`）
4. 更新靠“前端按钮手动检查 + 开机自动检查”双模式，体验最优

### 10.8 最终总结与适用场景

本方案基于大量踩坑实践，整理出一套「最稳定、最通用、最少坑」的 Electron Windows 客户端标准流程，核心优势如下：

- ✅ 彻底解决安装版黑屏、白屏、资源 404 问题
- ✅ 保留 asar 压缩，安装包体积最小化
- ✅ 自动更新完整可用，无需额外开发
- ✅ 开发 / 绿色版 / 安装版三环境统一，杜绝「开发正常、上线异常」
- ✅ 配置与代码均可直接复制复用，零重复踩坑

**适用场景**
所有基于 Vite + Electron 开发的 Windows 客户端，尤其适用于：

- 内网工具
- 小型桌面应用
- 个人开发者项目

无需复杂配置，直接套用即可。

> 最后吐槽一句：Electron 坑虽多，摸透规则后依旧能稳定落地。愿这份总结助你少走弯路，早日脱离打包排坑的苦海。


### 10.9 Electron 接口请求全解析：从疑问到落地（推荐方案）

#### 10.9.1 核心疑问：Electron 接口请求到底该怎么写

刚开始接触 Electron 开发，最容易困惑的是：Electron 基于 Chromium 内核，为什么还要用 Node.js 处理请求？接口请求到底该写在渲染进程还是主进程？

1. 疑问 1：Electron 不是 Chromium 开源内核运行的吗，怎么是 Node.js
Electron 不是单一环境，而是「Chromium 渲染进程 + Node.js 主进程」双内核架构，两者并行共存、完全隔离，各自承担不同职责：
   - 渲染进程（Renderer）：基于 Chromium，负责页面运行（HTML/CSS/JS、React/Vue 等），受浏览器安全限制（例如 CORS）
   - 主进程（Main）：基于 Node.js，负责窗口、本地文件、系统 API、网络请求等，不受浏览器跨域限制

通俗理解：渲染进程是“内嵌浏览器”，主进程是“后台 Node 服务”，通过 IPC 打通数据交互。

2. 疑问 2：接口请求必须写在主进程吗
分场景，但 90% 生产场景建议写在主进程，常见两种方案：
   - 方案 A（推荐，商用规范）
渲染进程只传参数，不发真实请求；主进程统一发 HTTP/HTTPS，再通过 IPC 回传。
优势：规避跨域，便于统一 token、加密、日志和错误处理，符合安全规范。
   - 方案 B（快速开发）
渲染进程直接用 `axios/fetch`，并关闭 `webSecurity`。
优势：开发快，写法接近普通前端项目。
缺点：安全性低，不适合商用和上架场景。

3. 疑问 3：`webSecurity: false` 能解决跨域吗
能。它是直接关闭 Chromium 同源策略校验。
但仅适合开发环境或内部工具，生产环境应关闭该做法并改为主进程请求方案。

4. 疑问 4：开发环境可以不走主进程吗
可以。标准做法是开发/生产分层：
   - 开发环境：渲染进程直连请求，关闭 `webSecurity`，提升联调效率
   - 生产环境：主进程请求，开启 `webSecurity`，结合 `app://` 自定义协议

5. 疑问 5：开发环境遇到 `Connection refused` 怎么办
该问题通常是网络链路问题，不是 Electron 或跨域问题。排查顺序：
   - 确认后端已启动，监听地址是否为 `0.0.0.0:18020`（非 `127.0.0.1`）
   - 检查防火墙或端口放行
   - 浏览器直接访问 `http://192.168.50.164:18020` 验证可达
   - 若浏览器也失败，优先修复后端或网络

6. 疑问 6：生产环境有必要用 `app://` 自定义协议吗
非常有必要。直接用 `file://` 常见问题：
   - 跨平台路径混乱
   - 资源被 Chromium 策略拦截（字体/图片/CSS 404）
   - 权限面过宽
   - 上架审核风险增大

`app://` 可以统一路径、保证资源加载和权限边界，是生产环境标准配置。

7. 疑问 7：表单请求（`URLSearchParams`）怎么传到主进程
渲染进程不要直接传 `URLSearchParams` 实例（IPC 可能序列化异常）。
正确做法：渲染进程传普通对象，主进程再转换为表单格式。

#### 10.9.2 全流程落地代码（可直接复制）

结合以上疑问，下面给出一套完整实现，覆盖开发/生产环境适配、表单请求处理和自定义协议配置。

1. 主进程（`main.js`）：请求处理 + 环境适配

```js
const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const axios = require('axios')
const path = require('path')
const { URL } = require('url')

// 1. 注册 app:// 自定义协议（生产环境用）
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

// 2. 主进程统一请求处理（支持表单请求和 JSON 请求）
ipcMain.handle('api:request', async (_, options) => {
  const { method, url, data, isForm = false } = options
  const baseURL = 'http://floor.primerobotics.nepa'

  try {
    // 处理 URL：去掉 /api 前缀（根据业务需求调整）
    const finalURL = `${baseURL}${url.replace('/api/', '/')}`

    // 构建请求配置
    const requestConfig = {
      method: method.toLowerCase(),
      url: finalURL,
      headers: {}
    }

    // 表单请求：主进程构建 URLSearchParams
    if (isForm) {
      const formData = new URLSearchParams(data)
      requestConfig.data = formData
      requestConfig.headers['Content-Type'] =
        'application/x-www-form-urlencoded'
    } else {
      // JSON 请求
      requestConfig.data = data
      requestConfig.headers['Content-Type'] = 'application/json'
    }

    // 发起请求（Node 环境无跨域限制）
    const response = await axios(requestConfig)
    return {
      code: response.status,
      data: response.data,
      message: '请求成功'
    }
  } catch (error) {
    console.error('主进程请求失败：', error)
    return {
      code: error.response?.status || 500,
      data: null,
      message: error.message || '网络异常'
    }
  }
})

// 3. 创建窗口（适配开发/生产环境）
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // 安全隔离（必须开启）
      nodeIntegration: false, // 禁止渲染进程使用 Node.js（必须关闭）
      webSecurity: !!app.isPackaged // 开发环境关闭跨域，生产环境开启
    }
  })

  // 加载页面
  if (app.isPackaged) {
    // 生产环境：加载自定义协议页面
    protocol.registerFileProtocol('app', (request, callback) => {
      const url = new URL(request.url)
      const pathname = decodeURIComponent(url.pathname)
      const filePath = path.join(__dirname, 'dist', pathname)
      callback({ path: filePath })
    })
    win.loadURL('app://./index.html')
  } else {
    // 开发环境：加载本地 dev 服务（如 Vite 5173 端口）
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools() // 打开开发者工具
  }
}

// 启动应用
app.whenReady().then(createWindow)

// 跨平台窗口关闭逻辑
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
```

2. 预加载脚本（`preload.js`）：安全暴露 IPC 接口

```js
const { contextBridge, ipcRenderer } = require('electron')

// 安全暴露 IPC 接口给渲染进程，避免直接暴露 Node.js 能力
contextBridge.exposeInMainWorld('electronAPI', {
  request: (options) => ipcRenderer.invoke('api:request', options)
})
```

3. 渲染进程 API 封装（`userApi.js`）

```js
// 渲染进程 API 封装，统一调用主进程 IPC
export const userApi = {
  // 登录接口（表单请求，标记 isForm: true）
  login: (data) => {
    return window.electronAPI.request({
      method: 'POST',
      url: '/api/login',
      data: data, // 普通对象：{ username, password }
      isForm: true
    })
  },

  // 示例：普通 JSON 请求
  getUserInfo: (token) => {
    return window.electronAPI.request({
      method: 'GET',
      url: '/api/user/info',
      data: { token },
      isForm: false
    })
  }
}
```

4. 渲染进程页面调用（登录示例）

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/userApi'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()
const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    // 直接传递普通对象，无需创建 URLSearchParams
    const res = await userApi.login(loginForm.value)

    if (res.code === 200) {
      ElMessage.success('登录成功')
      userStore.setToken(res.data.token)
      userStore.setUsername(loginForm.value.username)
      router.push('/')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请稍后重试')
  }
}
</script>
```

5. URL 拼接工具（`buildFullUrl.js`）

```js
// URL 拼接工具，自动处理 /api 前缀和完整地址
function buildFullUrl(url) {
  // 已是完整 HTTP/HTTPS 地址，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 处理 /api/xxx 路径：去掉 /api 前缀
  if (url.startsWith('/api/')) {
    return `http://floor.primerobotics.nepa${url.replace('/api/', '/')}`
  }

  // 处理 /robot/xxx 路径：正常拼接
  if (url.startsWith('/robot/')) {
    return `http://floor.primerobotics.nepa${url}`
  }

  // 其他路径默认拼接基地址
  return `http://floor.primerobotics.nepa${url}`
}
```

#### 10.9.3 关键避坑要点（必看）

- 跨域问题：跨域是浏览器（渲染进程）限制，Node.js（主进程）无跨域限制；生产环境优先主进程代理请求，避免依赖 `webSecurity: false`
- `URLSearchParams` 传递：渲染进程不要直接传实例，传普通对象，由主进程转换，避免 IPC 序列化异常
- 开发/生产区分：开发环境可关闭 `webSecurity` 简化联调；生产环境必须开启并使用 `app://`，避免 `file://` 路径坑
- `Connection refused`：优先检查后端启动、监听地址和防火墙，通常与 Electron 代码无关
- 安全规范：开启 `contextIsolation: true`、关闭 `nodeIntegration`，通过 `preload.js` 最小化暴露 IPC 能力
- URL 拼接：若后端不需要 `/api` 前缀，应在主进程或工具函数统一处理，避免错误路径

#### 10.9.4 行业现状与总结

结合实际开发，接口请求的选型建议如下：

1. 商用/长期项目/需上架：采用“主进程请求 + `app://` 协议 + 安全规范配置”，规避跨域与安全风险
2. 个人/内部工具/快速开发：采用“渲染进程直接请求 + `webSecurity: false`”，换取开发效率
3. 核心原则：渲染进程负责交互与参数传递，主进程负责真实请求与系统能力，这是 Electron 的主流工程化模式



## 11. 文档信息

- 文档版本：0.0.19
- 最后更新：2026-07-13
- 变更内容：
  - 新增 5.3 构建体积优化章节（整合 OPTIMIZATION.md / OPTIMIZATION_SUMMARY.md / CHANGES.md / BUILD_SIZE_QUICK_GUIDE.md）
  - 扩充 5.4 发布流程，整合 RELEASE.md（发布架构、工作流三阶段、本地构建命令、产物输出、release-it 职责、推荐发布步骤）
  - 新增 5.5 自动更新服务章节（服务器部署、开发调试、版本状态、常见问题）
  - 新增 11. 架构图生成规范章节（整合 rules.md，含分层架构图、模块依赖拓扑图、功能链路图等 10 类图表规范）
  - 重构 3. 目录结构，与实际项目严格对齐
