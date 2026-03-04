# Crab — Vite 6 + Electron 28 + Vue 3 桌面应用

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
VITE_ENV = 'development'
VITE_BASE_URL = './'
VITE_USE_MOCK = true
```

---

## 项目结构

```text
├── build/                   # Vite 构建插件及配置
│   ├── config/              # 环境配置 & 代理
│   └── plugins/             # Vite 插件集合（svg、unplugin 等）
├── electron/
│   ├── config/              # 主进程路径常量
│   ├── ipc/                 # IPC 通信模块
│   ├── main/                # 主进程核心（窗口、托盘、更新、通知）
│   └── preload/             # 预加载脚本
├── resources/               # 应用图标 & 托盘图标
├── src/
│   ├── assets/              # 静态资源
│   ├── components/          # 公共组件（SvgIcon、UpdateDialog 等）
│   ├── hooks/               # Composition 钩子
│   ├── icons/svg/           # SVG 图标源文件
│   ├── layouts/             # 布局组件（Header、Sidebar、Footer）
│   ├── plugins/             # Vue 插件注册
│   ├── router/              # Vue Router 路由配置
│   ├── store/               # Pinia Store
│   ├── styles/              # 全局样式 & 主题变量
│   ├── utils/               # 工具函数（请求、日志等）
│   └── views/               # 页面视图
├── .env.development
├── .env.test
├── .env.production
├── electron-builder.json    # 打包配置
├── vite.config.js
└── package.json
```

---

## 自动更新

本项目使用 `electron-updater` 实现增量自动更新。

### 配置更新服务器

在 `electron-builder.json` 的 `publish` 字段中填写服务器地址：

```json
"publish": [
  {
    "provider": "generic",
    "url": "https://your-update-server.com/releases"
  }
]
```

### 发布新版本流程

1. 修改 `package.json` 中的 `version` 字段
2. 执行 `npm run build-win` 或 `npm run build-mac`
3. 将 `release/{version}/` 目录下的以下文件上传至更新服务器：
   - `*.exe` / `*.dmg`
   - `latest.yml` / `latest-mac.yml`
   - `*.blockmap`

---

## 常见问题

### Windows 终端中文乱码

`dev:win` 和 `electron:win` 脚本已内置 `chcp 65001` 自动切换 UTF-8 编码。

### 打包失败：符号链接权限

在 Windows 上遇到 `Cannot create symbolic link` 错误，请**以管理员身份运行终端**后重试。

### winCodeSign / nsis 下载失败

项目根目录 `.npmrc` 已配置国内镜像加速：

```ini
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

如仍失败，可手动下载对应版本并解压到本地缓存目录：
- `winCodeSign` → `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`
- `nsis` → `%LOCALAPPDATA%\electron-builder\Cache\nsis`

### ASAR 中缺少 dist 目录

`build-win` / `build-mac` 脚本已内置 `vite build`，会在 electron-builder 打包前自动完成前端构建，无需手动执行。

---

## 贡献

欢迎提交 Pull Request 或通过 Issue 反馈问题。
