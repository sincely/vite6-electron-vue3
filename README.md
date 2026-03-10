# lightning — Vite 6 + Electron 28 + Vue 3 桌面应用

基于 **Vite 6 / Electron 28 / Vue 3** 构建的跨平台桌面客户端，集成 Element Plus UI、Pinia 状态管理、GSAP 动画及 electron-updater 自动更新。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 桌面框架 | Electron 28.3.3 |
| 前端框架 | Vue 3.5.29 (Composition API) |
| 构建工具 | Vite 6.4.1 |
| UI 组件库 | Element Plus 2.9.11 |
| 状态管理 | Pinia 2.3.1 + pinia-plugin-persistedstate |
| 路由 | Vue Router 4.5.1 |
| 动画 | GSAP 3.14.2 |
| SVG 图标 | vite-plugin-svg-icons |
| 自动更新 | electron-updater 6.3.9 |
| 代码规范 | ESLint + Prettier + Stylelint + Husky + lint-staged |

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式（Vite HMR + Electron）

```bash
# Windows
npm run dev:win

# macOS / Linux
npm run dev:mac
```

### 仅启动 Electron（使用已构建的产物）

> 需先执行构建命令生成 `dist/` 和 `dist-electron/`

```bash
npm run electron:win
```

---

## 脚本说明

### 仅构建渲染进程

```bash
npm run build:dev    # 开发环境 (.env.development)
npm run build:test   # 测试环境 (.env.test)
npm run build:prod   # 生产环境 (.env.production)
```

### 完整打包（渲染进程 + 主进程 + 安装包）

```bash
# Windows
npm run build-win          # 生产环境
npm run build-win:test     # 测试环境
npm run build-win:dev      # 开发环境

# macOS
npm run build-mac          # 生产环境
npm run build-mac:test     # 测试环境
npm run build-mac:dev      # 开发环境
```

> 打包产物输出至 `release/{version}/`

### 其他工具脚本

```bash
npm run clean              # 清空 dist / dist-electron / release
npm run lint               # ESLint + Prettier + Stylelint 一键修复
npm run build:icons        # 生成应用图标资源
npm run dir-tree           # 输出项目目录树
```

---

## 环境变量

项目支持三套环境配置，通过 Vite `--mode` 切换：

| 文件 | 环境 | 说明 |
|------|------|------|
| `.env.development` | `development` | 本地开发，可开启 Mock |
| `.env.test` | `test` | 测试环境 |
| `.env.production` | `production` | 正式生产环境 |

各文件可配置的变量示例：

```dotenv
VITE_ENV = 'test'
VITE_BASE_URL = './'
VITE_USE_PROXY = true
VITE_USE_LEGACY = true
VITE_API_BASE_URL = 'http://10.10.24.52:8089'
VITE_APP_NAME = 'lightning'
VITE_UPDATE_URL= 'http://10.10.24.52:8089/electron-update'

```

---

## 项目结构

```text
├── .github/
│   └── workflows/
│       └── release.yml          # GitHub Actions 自动发布流程
├── .husky/                      # Git hooks（commit-msg、pre-commit）
├── build/                       # Vite 构建辅助配置
│   ├── config/
│   │   ├── index.js             # 公共环境常量
│   │   └── proxy.js             # 开发服务器代理规则
│   ├── plugins/
│   │   ├── index.js             # 插件集合入口
│   │   ├── html.js              # vite-plugin-html（注入 env 变量）
│   │   ├── svgIcon.js           # vite-plugin-svg-icons（SVG Sprite）
│   │   ├── unplugin.js          # 按需导入（Element Plus、图标）
│   │   ├── legacy.js            # @vitejs/plugin-legacy（兼容旧浏览器）
│   │   ├── inspect.js           # vite-plugin-inspect（构建分析）
│   │   └── restart.js           # 配置文件变更时自动重启
│   └── utils/
│       └── index.js             # 构建工具函数
├── electron/
│   ├── config/
│   │   └── index.js             # 主进程路径常量（userData、logPath 等）
│   ├── ipc/
│   │   ├── index.js             # IPC 路由注册入口
│   │   ├── app.js               # 应用信息（get-app-version 等）
│   │   ├── update.js            # 更新操作（check / download / install）
│   │   ├── notification.js      # 原生通知
│   │   └── win-control.js       # 窗口控制（最小化、最大化、关闭）
│   ├── main/
│   │   ├── index.js             # 主进程入口（BrowserWindow 创建）
│   │   ├── log.js               # electron-log 配置
│   │   ├── menu.js              # 应用菜单
│   │   ├── tray.js              # 系统托盘
│   │   ├── notification.js      # 通知管理
│   │   ├── update.js            # autoUpdater 初始化 & 事件转发
│   │   └── windowManager.js     # 多窗口管理
│   └── preload/
│       └── index.mjs            # 预加载脚本（暴露 ipcRenderer）
├── resources/                   # 打包时复制到 extraResources
│   ├── icon.png                 # 应用图标（Linux / 通知）
│   ├── icon.ico                 # 应用图标（Windows）
│   ├── app.icns                 # 应用图标（macOS）
│   ├── icons/                   # 多尺寸图标（build-icons 脚本生成）
│   └── tray/                    # 托盘图标（各分辨率）
├── scripts/
│   ├── inject-release-notes.mjs # 打包前从 CHANGELOG 提取版本说明写入 electron-builder.json
│   ├── release.js               # 交互式发布向导（release-it 封装）
│   ├── build-icons.js           # 图标生成脚本（png-to-ico / sharp）
│   └── dir-tree.js              # 输出项目目录树
├── src/
│   ├── main.js                  # Vue 应用入口
│   ├── App.vue                  # 根组件
│   ├── assets/                  # 静态资源（图片、登录背景等）
│   ├── components/              # 全局公共组件
│   │   ├── SvgIcon/             # SVG 图标组件
│   │   ├── UpdateDialog/        # 自动更新弹框
│   │   ├── UpdateProgress/      # 下载进度条
│   │   ├── NotificationPanel/   # 通知中心面板
│   │   ├── NotificationToast/   # 通知 Toast
│   │   ├── Loading/             # 全局加载动画
│   │   └── PagePlaceholder/     # 页面占位组件
│   ├── config/
│   │   ├── menu.js              # 侧边栏菜单配置
│   │   └── nprogress.js         # 进度条配置
│   ├── core/
│   │   └── update.js            # 更新核心逻辑（版本比较等）
│   ├── hooks/
│   │   ├── useUpdater.js        # 更新 IPC 监听桥接（注册所有更新事件）
│   │   └── useGsap.js           # GSAP 动画封装
│   ├── icons/svg/               # SVG 图标源文件（vite-plugin-svg-icons 扫描目录）
│   ├── layouts/
│   │   ├── index.vue            # 主布局容器
│   │   └── components/
│   │       ├── global-header/   # 顶部标题栏（含窗口控制按钮）
│   │       ├── global-siderMenu/# 侧边导航菜单
│   │       ├── global-content/  # 页面内容区（keep-alive）
│   │       ├── global-footer/   # 底部状态栏（含版本号）
│   │       ├── global-logo/     # Logo 区域
│   │       ├── global-breadcrumb/ # 面包屑导航
│   │       └── global-search/   # 全局搜索
│   ├── plugins/
│   │   ├── index.js             # Vue 插件注册入口
│   │   └── icon.js              # Element Plus 图标注册
│   ├── router/
│   │   └── index.js             # Vue Router 路由配置
│   ├── store/
│   │   ├── index.js             # Pinia 实例 + persistedstate 插件
│   │   └── modules/
│   │       ├── app.js           # 应用状态（主题、侧边栏折叠等）
│   │       ├── version.js       # 更新状态（currentVersion、进度等）
│   │       ├── notification.js  # 通知消息列表
│   │       └── user.js          # 用户信息
│   ├── styles/                  # 全局样式
│   │   ├── index.scss           # 样式入口
│   │   ├── variables.scss       # CSS 变量 & 主题色
│   │   ├── themes.scss          # 明暗主题切换
│   │   ├── element.scss         # Element Plus 样式覆盖
│   │   ├── app.scss             # 全局基础样式
│   │   ├── mixin.scss           # SCSS Mixin
│   │   ├── scroll.scss          # 滚动条样式
│   │   ├── transition.scss      # 路由过渡动画
│   │   └── text-ellipsis.scss   # 文字省略工具类
│   ├── utils/
│   │   ├── request.js           # Axios 封装（拦截器、错误处理）
│   │   ├── http.js              # HTTP 请求方法封装
│   │   ├── log.js               # 前端日志工具
│   │   └── windowsModal.js      # 原生窗口弹框工具
│   └── views/                   # 页面视图
│       ├── login/               # 登录页
│       ├── home/                # 首页
│       ├── desktop/             # 桌面工作台
│       ├── provider/            # 服务提供商（列表 / 添加）
│       ├── apikeys/             # API Key 管理
│       ├── quota/               # 配额（用量 / 限制）
│       ├── log/                 # 日志查看
│       └── settings/            # 设置（通用 / 高级）
├── .env.development             # 开发环境变量
├── .env.test                    # 测试环境变量
├── .env.production              # 生产环境变量
├── dev-app-update.yml           # 开发环境更新调试配置（已加入 .gitignore）
├── electron-builder.json        # electron-builder 打包配置
├── vite.config.js               # Vite 配置（含 electron 插件）
├── jsconfig.json                # JS 路径别名
├── eslint.config.js             # ESLint 配置
├── stylelint.config.js          # Stylelint 配置
├── commitlint.config.js         # Commitlint 配置
└── package.json
```

---

## 自动更新

本项目使用 `electron-updater` 实现增量自动更新。详细说明参见 [RELEASE.md](RELEASE.md)。

### 配置更新服务器

在 `.env.*` 环境文件中配置更新地址（由 `vite.config.js` 在构建期注入主进程）：

```dotenv
VITE_UPDATE_URL=https://your-update-server.com/electron-update/
```

或在 `electron-builder.json` 的 `publish` 字段中填写默认回退地址：

```json
"publish": [
  {
    "provider": "generic",
    "url": "https://your-update-server.com/electron-update/"
  }
]
```

### 发布新版本流程

1. `git commit` 提交代码，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
2. 执行 `npm run release:patch / :minor / :major` 打 Tag 并生成 CHANGELOG
3. 执行 `npm run build-win:prod` 或 `npm run build-mac:prod` 打包
4. 按以下顺序将 `release/{version}/` 中的文件上传到服务器（**顺序不可颠倒**）：
   - `*.exe` / `*.dmg`（安装包）
   - `*.blockmap`（差量块映射）
   - `latest.yml`（**最后上传**，上传后客户端立即感知新版本）

### 增量更新注意事项

electron-updater 基于 `.blockmap` 实现差量下载，仅传输两个版本之间变化的数据块，通常可节省 **70–90%** 流量（仅改了业务代码时）。使用时需注意以下几点：

#### 1. 服务器必须支持 HTTP Range 请求

增量下载通过 `Range: bytes=x-y` 头拉取变化的块，服务器须返回 `206 Partial Content`，否则自动降级为全量下载。

验证方式：
```bash
curl -I --range 0-100 https://your-server/electron-update/lightning-x.x.x-Setup.exe
# 返回 206 Partial Content ← 支持增量
# 返回 200 OK              ← 降级全量
```

Nginx 默认支持，注意**不要**添加 `add_header Accept-Ranges none` 或关闭 `proxy_buffering`。

#### 2. `.blockmap` 文件必须与安装包同步上传

缺少 `.blockmap` 时 electron-updater 静默降级为全量下载，不会报错，但会浪费带宽。

#### 3. 保持 `asar: true`

`electron-builder.json` 已配置 `"asar": true`，将所有业务代码打包为单一的 `app.asar` 文件。两个版本间 `node_modules` 未变化时，其对应的块全部复用，增量效果最佳。**不要改为 `false`**。

#### 4. 减少 `asarUnpack` 的使用

`asarUnpack` 中的文件（原生模块如 `sharp`）位于 `app.asar.unpacked/`，每次更新均为全量替换，不受 blockmap 保护。只将必须在 asar 外运行的原生模块放入此列表。

#### 5. 不要手动编辑 `latest.yml`

`latest.yml` 中的 `sha512` 和文件大小由 electron-builder 自动生成。手动修改会导致组装后的安装包校验失败，触发全量重下。

#### 6. 开发环境不执行增量逻辑

使用 `dev-app-update.yml` 调试时，electron-updater 仅做全量下载，增量逻辑只在生产安装包中生效。

---

## NSIS（Windows 安装包）使用说明

本项目 Windows 安装包使用 `electron-builder` 的 `nsis` 目标生成（`.exe` 安装程序 + 卸载器）。你可以通过 `electron-builder.json` 的 `nsis` 字段控制安装交互、安装目录、快捷方式、以及在安装/卸载时执行自定义脚本。

### 1) 相关配置位置

- 配置文件：`electron-builder.json`
- NSIS 配置节点：`nsis`

常用字段说明：

- `oneClick`: `true` 为一键静默式安装；`false` 为向导式安装
- `perMachine`: `true` 安装到所有用户（通常需要管理员权限）；`false` 为当前用户
- `allowToChangeInstallationDirectory`: 允许用户自选安装目录（通常在 `oneClick: false` 时使用）
- `createDesktopShortcut` / `createStartMenuShortcut`: 创建桌面/开始菜单快捷方式
- `runAfterFinish`: 安装完成后是否勾选“立即运行”
- `deleteAppDataOnUninstall`: 卸载时尝试清理应用数据（建议保留为 `true`，同时可配合自定义脚本做更彻底清理）
- `include`: 追加一个 `.nsh` 文件（推荐方式，用于覆写/补充宏）
- `script`: 指定完整 `.nsi` 脚本（会替换默认安装脚本，除非你非常熟悉 NSIS，否则不建议）

### 2) include（.nsh）如何接入

`include` 路径是**相对项目根目录**的路径，例如你将脚本放在 `scripts/installer.nsh`，则在 `electron-builder.json` 中配置：

```json
{
  "nsis": {
    "include": "scripts/installer.nsh"
  }
}
```

注意：当前仓库 `.gitignore` 默认忽略 `*.nsh`，如果你希望把脚本提交到仓库，需要移除对应忽略规则。

### 3) 推荐的 .nsh 宏结构

electron-builder 会在构建 NSIS 安装包时注入一组可覆写的宏。通常你只需要在 `.nsh` 中实现这些宏即可（示例结构）：

```nsh
!macro customInit
!macroend

!macro customHeader
!macroend

!macro customInstall
!macroend

!macro customUnInstall
!macroend
```

这些宏会在安装/卸载的不同阶段被调用。宏内部可以使用 electron-builder 注入的变量（例如 `${APP_FILENAME}`、`${PRODUCT_FILENAME}`、`${COMPANY_NAME}`、`${PRODUCT_GUID}` 等），以最终构建时替换结果为准。

### 4) 常见需求示例

#### 4.1 安装后设置开机自启

如果你希望“当前用户开机自启”，写入 `HKCU\...\Run`：

```nsh
!macro customInstall
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_FILENAME}" '"$INSTDIR\${APP_FILENAME}.exe"'
!macroend
```

如果你是 `perMachine: true` 并希望“所有用户开机自启”，可以写入 `HKLM\...\Run`（需要管理员权限）：

```nsh
!macro customInstall
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_FILENAME}" '"$INSTDIR\${APP_FILENAME}.exe"'
!macroend
```

#### 4.2 卸载时清理注册表（自启、应用自定义键）

卸载时建议至少删除自启项，并按需删除你自己写入的应用注册表键（不要删除不属于本应用的键）：

```nsh
!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_FILENAME}"
  DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_FILENAME}"

  DeleteRegKey HKCU "Software\${PRODUCT_FILENAME}"
  DeleteRegKey HKLM "Software\${PRODUCT_FILENAME}"
!macroend
```

`electron-builder`/NSIS 自身创建的卸载信息通常也会自动清理；如果你确实需要额外删除卸载键，可在确认键名来源与范围后再操作，避免误删。

#### 4.3 卸载时清理用户数据

如果你希望比 `deleteAppDataOnUninstall` 更明确地清理目录，可手动删除常见用户目录（按你的应用实际写入位置选择）：

```nsh
!macro customUnInstall
  RMDir /r "$APPDATA\${APP_FILENAME}"
  RMDir /r "$LOCALAPPDATA\${APP_FILENAME}"
!macroend
```

### 5) 如何构建验证

直接执行项目已有脚本即可（会先注入 releaseNotes，再构建前端，再调用 electron-builder）：

- `npm run build-win:dev`
- `npm run build-win:test`
- `npm run build-win:prod`

生成产物在 `release/{version}/` 下。

## 常见问题

### 1) Windows 终端中文乱码

`dev:win` 和 `electron:win` 脚本已内置 `chcp 65001` 自动切换 UTF-8 编码。

### 2) NSIS 安装器 license 许可协议乱码

如果在 `electron-builder` 的 `nsis` 配置中启用了 `license`，安装向导里出现中文乱码，通常是因为许可协议 `txt` 文件编码不符合 NSIS 读取要求。

请将 license 文本文件转为 **ANSI** 编码（不要使用 UTF-8/GBK 混合或其他编码）：

1. 用记事本打开许可协议 `txt`
2. 点击“另存为”
3. 编码选择 **ANSI** 后保存

完成后重新打包，安装器中的 license 文本一般即可正常显示。

### 3) 打包失败：符号链接权限

在 Windows 上遇到 `Cannot create symbolic link` 错误，请**以管理员身份运行终端**后重试。

### 4) winCodeSign / nsis 下载失败

项目根目录 `.npmrc` 已配置国内镜像加速：

```ini
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

如仍失败，可手动下载对应版本并解压到本地缓存目录：
- `winCodeSign` → `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`
- `nsis` → `%LOCALAPPDATA%\electron-builder\Cache\nsis`

### 5) ASAR 中缺少 dist 目录

`build-win` / `build-mac` 脚本已内置 `vite build`，会在 electron-builder 打包前自动完成前端构建，无需手动执行。

---
