# Vite6 Electron Vue3 项目

这是一个基于 Vite6、Electron 和 Vue3 构建的桌面应用程序。

## 项目设置

### 依赖安装

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
# 构建 Windows 版本
npm run build:win

# 构建 macOS 版本
npm run build:mac

# 构建所有平台版本
npm run build
```

## 项目结构

-   `electron/main`: Electron 主进程代码
-   `electron/preload`: Electron 预加载脚本
-   `electron/ipc`: 进程间通信 (IPC) 模块
-   `src`: Vue3 渲染进程代码
    -   `src/main.js`: 渲染进程入口文件
    -   `src/router`: Vue Router 配置
    -   `src/store`: Pinia 状态管理
    -   `src/components`: Vue 组件
    -   `src/styles`: 全局样式

## 更新机制

本项目使用 `electron-updater` 实现自动更新。

### 配置

更新服务器地址在 `electron-builder.json` 的 `publish` 字段中配置：

```json
"publish": [
  {
    "provider": "generic",
    "url": "http://localhost:9000" // 请替换为您的实际更新服务器地址
  }
],
```

### 更新流程

1.  **构建新版本**：
    -   更新 `package.json` 中的 `version` 字段。
    -   运行 `npm run electron:build`。这会生成新的安装包和 `latest.yml` (Windows) 或 `latest-mac.yml` (macOS) 文件。
2.  **上传到更新服务器**：
    -   将 `release/${version}` 目录下的所有文件上传到您的更新服务器。
    -   **注意**：只需上传 `.exe`、`latest.yml` 和 `.blockmap` 文件。**不需要**上传 `win-unpacked` 文件夹。
3.  **客户端检查更新**：
    -   当用户运行旧版本的应用时，`electron-updater` 会自动检查更新。如果发现新版本，就会下载并提示用户安装。

## 常见问题

### 终端中文乱码

如果在终端中遇到中文乱码问题，可以尝试在 `package.json` 的 `scripts` 中添加 `chcp 65001 &&` 来强制终端使用 UTF-8 编码。

### Windows 打包失败 (符号链接权限问题)

如果在 Windows 上打包时遇到 `Cannot create symbolic link` 错误，请尝试**以管理员身份运行您的终端**，然后执行构建命令。

### winCodeSign 或 nsis 下载失败

在打包过程中，`electron-builder` 需要下载 `winCodeSign` 和 `nsis` 等二进制工具。如果网络连接不稳定导致下载失败，可以尝试以下方法：

1.  **使用国内镜像（推荐）**：
    在项目根目录的 `.npmrc` 文件中添加以下配置（本项目已默认配置）：
    ```ini
    electron_builder_binaries_mirror="https://npmmirror.com/mirrors/electron-builder-binaries/"
    ```

2.  **手动下载并解压**：
    如果镜像依然无法下载，可以手动从 [electron-builder-binaries](https://github.com/electron-userland/electron-builder-binaries/releases) 下载对应的压缩包，并解压到缓存目录：
    -   `winCodeSign`: 解压到 `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`
    -   `nsis`: 解压到 `%LOCALAPPDATA%\electron-builder\Cache\nsis`

3.  **rcedit 报错 (exit status 1)**：
    如果遇到 `rcedit` 相关的错误，通常是因为版权信息中包含特殊字符或文件被占用。请确保 `electron-builder.json` 中的 `copyright` 字段不包含特殊字符（如 `©`），并尝试关闭杀毒软件后以**管理员身份**重新打包。

### 打包注意事项 (ASAR 缺失 dist 目录)

在进行 `npm run build-win` 或 `npm run build-mac` 时，务必确保打包脚本包含 `vite build`。

**原因**：`electron-builder` 会根据配置将 `dist` 目录打包进 `app.asar`。如果未先执行 `vite build`，`dist` 目录可能为空或不存在，导致安装后的程序无法加载渲染进程页面。

**解决方案**：已在 `package.json` 中优化脚本，确保每次打包前都会先执行前端构建：
```json
"build-win": "vite build && electron-builder --win",
"build-mac": "vite build && electron-builder --mac"
```

### 自定义通知

本项目已实现使用 Element Plus 组件自定义通知。主进程通过 IPC 向渲染进程发送通知数据，渲染进程监听并使用 `ElNotification` 显示。

## 贡献

欢迎提交 Pull Request 或报告 Bug。
