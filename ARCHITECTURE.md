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

- [index.mjs](file:///d:/project/vite6-electron-vue3/electron/preload/index.mjs)

### 2.3 渲染进程

渲染进程位于 `src/`，采用 Vue 3 + Pinia + Vue Router 组织页面与业务逻辑，负责：

- 登录页、桌面页、设置页、更新弹窗等 UI 渲染
- 状态存储与主题切换
- 与主进程进行窗口控制、自动更新、通知、应用信息读取等通信

入口文件：

- [main.js](file:///d:/project/vite6-electron-vue3/src/main.js)

## 3. 目录结构

```text
├── build/                         # Vite 构建插件、代理与工具方法
├── electron/
│   ├── config/                    # Electron 运行配置
│   ├── ipc/                       # IPC 频道定义与注册
│   ├── main/                      # 主进程核心逻辑
│   └── preload/                   # 预加载脚本
├── mock/                          # 开发/构建阶段模拟数据
├── public/                        # 公开静态资源
├── resources/                     # 应用图标与打包资源
├── src/
│   ├── api/                       # 请求封装入口
│   ├── assets/                    # 图片与静态素材
│   ├── components/                # 通用业务组件
│   ├── config/                    # 前端运行时配置
│   ├── core/                      # 跨页面核心能力，例如更新桥接
│   ├── hooks/                     # 组合式函数
│   ├── icons/                     # SVG 图标资源
│   ├── layouts/                   # 桌面主布局
│   ├── plugins/                   # 前端插件注册，例如图标与 ECharts
│   ├── router/                    # 路由配置
│   ├── settings/                  # 主题与设计配置
│   ├── store/                     # Pinia 状态管理
│   ├── styles/                    # 全局样式与主题样式
│   ├── utils/                     # 通用工具
│   └── views/                     # 页面级视图
├── .github/workflows/             # GitHub Actions 发布工作流
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

### 5.3 发布流程

当前推荐发布工作流为：

- [public.yml](file:///d:/project/vite6-electron-vue3/.github/workflows/public.yml)

该流程采用三阶段发布：

1. `prepare-release`：先通过 `release-it` 提升版本并打 tag
2. `build`：在多平台矩阵中按新 tag 构建产物
3. `release`：汇总产物并创建 GitHub Release

这样可以保证：

- `package.json` 版本
- Git tag 版本
- `release/${version}` 目录
- 安装包文件名中的版本号

完全一致。

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

## 10. 文档信息

- 文档版本：0.0.15
- 最后更新：2026-03-30
