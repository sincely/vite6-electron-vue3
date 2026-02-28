# Deep AI 项目技术架构文档

本文档旨在详细描述 `deep-ai` 项目的技术架构、核心模块设计及关键技术选型，为后续开发和维护提供指导。

## 1. 技术栈概览 (Tech Stack)

项目基于现代化的桌面端开发框架和工具构建：

- **核心框架**: [Electron 28.3.3](https://www.electronjs.org/) (跨平台桌面应用框架)
- **前端框架**: [Vue 3.5.29](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite 6.3.6](https://vitejs.dev/) (极速构建体验)
- **状态管理**: [Pinia 2.3.1](https://pinia.vuejs.org/)
- **路由管理**: [Vue Router 4.5.1](https://router.vuejs.org/)
- **UI 组件库**: [Element Plus 2.9.11](https://element-plus.org/)
- **动画库**: [GSAP 3.14.2](https://greensock.com/gsap/) (用于高性能交互动画)
- **自动更新**: `electron-updater`
- **代码规范**: ESLint, Prettier, Stylelint, Husky

---

## 2. 核心架构设计 (Core Architecture)

项目遵循 Electron 的经典架构设计，分为 **主进程 (Main Process)** 和 **渲染进程 (Renderer Process)**，并通过 **预加载脚本 (Preload Script)** 进行安全通信。

### 2.1 目录结构

```text
├── build/                # Vite 构建插件及配置
├── electron/
│   ├── main/             # 主进程核心逻辑
│   │   ├── index.js      # 主进程入口
│   │   ├── windowManager.js # 窗口管理中心
│   │   └── update.js     # 自动更新逻辑
│   ├── ipc/              # IPC 通信处理模块
│   └── preload/          # 预加载脚本 (桥接主进程与渲染进程)
├── src/                  # 渲染进程代码 (Vue3)
│   ├── assets/           # 静态资源
│   ├── components/       # 通用业务组件
│   ├── layouts/          # 页面布局框架
│   ├── store/            # Pinia 状态管理
│   ├── views/            # 页面路由组件
│   └── App.vue           # 根组件
└── package.json          # 项目依赖与构建脚本
```

### 2.2 进程间通信 (IPC)

项目采用安全的 `contextIsolation` 模式。
- **主进程**: 监听 `ipcMain` 事件，执行底层操作（如窗口控制、文件操作、自动更新）。
- **渲染进程**: 通过 `window.ipcRenderer` 调用预加载脚本中暴露的 API。
- **安全增强**: 在 `electron/preload/index.mjs` 中仅暴露必要的通信接口，防止渲染进程直接访问 Node.js API。

---

## 3. 关键业务实现 (Key Features)

### 3.1 窗口管理 (Window Management)

通过 `electron/main/windowManager.js` 统一管理应用窗口：
- **无边框窗口 (Frameless Window)**: 登录窗口采用 `frame: false` 和 `transparent: true`，配合渲染进程 CSS (`-webkit-app-region: drag`) 实现自定义拖拽和 20px 大圆角设计。
- **Mac 控制按钮**: 采用 `titleBarStyle: 'hidden'` 模式，在隐藏原生标题栏的同时保留 MacOS 特有的“红绿灯”控制按钮。

### 3.2 登录模块 (Login Module)

- **UI 实现**: 基于 Element Plus 表单组件重构，具备完善的表单校验逻辑。
- **交互动画**: 集成 GSAP 动画库。在登录与注册状态切换时，通过高度自适应（height: auto）和透明度渐变实现丝滑的视觉过渡。
- **视觉风格**: 登录页背景固定为白色 (#fff)，独立于系统主题色，确保品牌一致性。

### 3.3 自动更新 (Auto Update)

- **集成方案**: 使用 `electron-updater` 配合 `generic` 类型的更新服务器。
- **构建保障**: `package.json` 构建脚本 (`build-mac`/`build-win`) 已强制包含 `vite build` 步骤，确保 `app.asar` 中包含最新的 `dist` 资源。

---

## 4. 开发与构建流程 (Workflow)

### 4.1 开发模式
使用 `npm run dev` 启动 Vite 开发服务器，Electron 自动加载本地服务地址。

### 4.2 打包发布
1. **构建前端**: `vite build` 生成 `dist` 目录。
2. **构建主进程**: 编译 `electron/` 目录到 `dist-electron/`。
3. **打包**: `electron-builder` 根据 `electron-builder.json` 配置，将 `dist`、`dist-electron` 和 `node_modules` 封装进 `app.asar` 并生成安装包。

---

## 5. 注意事项 (Important Notes)

- **打包一致性**: 严禁在未执行 `vite build` 的情况下直接调用打包工具，否则会导致 `app.asar` 缺失 `dist` 目录。
- **拖拽区域**: 在无边框窗口中，若要使页面元素可交互（如输入框、按钮），必须显式设置 `-webkit-app-region: no-drag`。
- **权限管理**: Windows 打包遇到符号链接错误时，需以管理员身份运行终端。

---

*文档版本：0.0.9*
*最后更新：2026-03-01*
