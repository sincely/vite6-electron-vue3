# 部署与发布说明

本文档基于当前仓库的实际配置编写，覆盖本地构建、Electron 打包、GitHub Actions 发布流程以及版本管理约定。

## 项目概览

当前项目为 Vite 6 + Vue 3 + Electron 桌面应用，构建与发布主要依赖以下文件：

- `package.json`：定义本地开发、构建、打包、校验与 release-it 脚本
- `electron-builder.json5`：定义 Electron 打包目标、产物命名、输出目录与自动更新发布源
- `.release-it.json`：定义版本提升、打 tag、生成 Changelog 与 GitHub Release 行为
- `.github/workflows/public.yml`：当前推荐使用的多平台正式发布工作流
- `.github/workflows/release.yml`：历史保留的旧发布工作流，目前不建议作为主流程继续使用

## 环境要求

- Node.js：`>= 20.20.0`
- npm：建议使用与当前 Node 配套的版本
- Windows 本地开发推荐命令：`npm run dev:win`
- macOS 本地开发推荐命令：`npm run dev:mac`

首次安装依赖建议执行：

```bash
npm install
```

如果 Electron 依赖未正确安装，可补执行：

```bash
npm run electron:postinstall
```

## 本地常用命令

### 开发

```bash
npm run dev
```

### 前端构建

```bash
npm run build:dev
npm run build:test
npm run build:prod
```

### 桌面应用打包

```bash
npm run build-win:prod
npm run build-mac:prod
npm run build-linux:prod
```

### 代码检查

```bash
npm run lint:check
```

### 修复格式与规范问题

```bash
npm run lint
```

## 产物输出规则

Electron Builder 当前配置如下：

- 输出目录：`release/${version}`
- Windows：NSIS 安装包
- macOS：`dmg` + `zip`
- Linux：`AppImage`

当前产物命名规则：

- Windows：`${productName}-${platform}-${version}-Setup.${ext}`
- macOS：`${productName}-${platform}-${version}-${arch}.${ext}`
- Linux：`${productName}-Linux-${version}.${ext}`

因此一次成功打包后，发布文件通常位于类似目录：

```bash
release/0.0.15/
```

## 自动更新发布源

`electron-builder.json5` 中已配置：

- provider：`generic`
- url：`http://10.10.24.52:8089/electron-update`

这表示桌面端自动更新依赖该服务提供更新元数据与安装包。发布时除了 GitHub Release 资产外，也需要确认更新服务器侧的资源同步策略是否已准备完成。

## 当前推荐发布流程

当前推荐使用 GitHub Actions 中的 `.github/workflows/public.yml`，并通过手动触发 `workflow_dispatch` 发布。

### 触发方式

在 GitHub 仓库的 Actions 页面手动运行 `Public` 工作流，并选择版本类型：

- `patch`
- `minor`
- `major`
- `alpha`
- `beta`

### 工作流执行顺序

`public.yml` 现在分为三个阶段：

#### 1. prepare-release

作用：

- 安装依赖
- 配置 Git 用户
- 执行 `release-it`
- 自动更新 `package.json` 版本号
- 自动创建 Git commit 与 Git tag
- 导出本次发布版本号和 tag

使用命令：

```bash
npx release-it <version-type> --ci --no-github.release
```

这里不会立即创建 GitHub Release，只负责“先升级版本，再打 tag”，避免旧流程中“发布版本号与构建产物版本不一致”的问题。

#### 2. build

作用：

- 在 macOS、Windows、Linux 三个平台矩阵构建
- 每个平台都 checkout 到刚刚生成的发布 tag
- 用该 tag 对应的代码和版本号打包
- 上传每个平台构建出的 `release/` 目录

这样可以确保：

- Git tag 版本
- `package.json` 版本
- `release/${version}` 目录
- 安装包文件名中的版本号

四者保持一致。

#### 3. release

作用：

- 下载所有平台上传的构建产物
- 合并到统一 `release/` 目录
- 创建 GitHub Release
- 把安装包作为 Release 附件上传

当前上传的资产包括：

- `release/**/*.dmg`
- `release/**/*.zip`
- `release/**/*.exe`
- `release/**/*.AppImage`

## 本地手动发布方式

如果需要在本地手动控制版本流程，可使用 release-it 脚本。

### 常用命令

```bash
npm run release:patch
npm run release:minor
npm run release:major
npm run release:alpha
npm run release:beta
```

### Dry Run

在真正发布前预演：

```bash
npm run release:dry-run
```

### 只生成 Changelog

```bash
npm run release:changelog
```

### 仅发布 GitHub Release

```bash
npm run release:github
```

## 版本管理约定

项目使用语义化版本：

- `patch`：问题修复，例如 `0.0.14 -> 0.0.15`
- `minor`：向下兼容的新功能，例如 `0.0.15 -> 0.1.0`
- `major`：不兼容变更，例如 `0.1.0 -> 1.0.0`
- `alpha` / `beta`：预发布版本

当前版本号由 `release-it` 统一维护，不建议再手动编辑 `package.json` 后直接发布，否则容易与 tag、Changelog 和 GitHub Release 状态脱节。

## 发布前检查清单

正式发布前建议确认：

- 代码已合并到准备发布的稳定分支
- 本地 `npm install` 正常
- `npm run lint:check` 通过
- 至少执行过一次目标平台构建验证
- GitHub 仓库已配置可用的 `GITHUB_TOKEN`
- 如需跨仓库或更高权限推送 tag，已配置 `PAT_TOKEN`
- 自动更新服务地址可访问，且部署侧已准备接收新包

## GitHub Secrets 说明

当前工作流中涉及以下令牌：

- `GITHUB_TOKEN`：GitHub Actions 默认提供，用于创建 Release
- `PAT_TOKEN`：可选，若默认令牌在推送 tag / commit 权限上受限，建议配置 Personal Access Token

推荐做法：

- 默认先使用 `PAT_TOKEN || GITHUB_TOKEN`
- 若遇到无法推送 tag、无法触发后续流程等问题，优先检查 `PAT_TOKEN` 权限是否完整

## 旧工作流说明

仓库中仍保留 `.github/workflows/release.yml`，但该文件属于较早的单工作流发布方案，存在以下特点：

- 主要在单个平台 job 中执行
- 构建与发布耦合更重
- 与当前多平台矩阵发布方案相比，可维护性较低

除非明确需要回退旧方案，否则请优先使用：

```text
.github/workflows/public.yml
```

## 常见问题

### 为什么会出现“发布版本是 0.0.14，但安装包还是 0.0.13”？

根因通常是先构建、后 bump version。
当前 `public.yml` 已改为：

1. 先执行 `release-it` 提升版本并打 tag
2. 再按新 tag 构建各平台产物
3. 最后创建 GitHub Release

因此现在版本号会与产物目录、文件名、tag 保持一致。

### 如何验证本地打包是否正常？

以 Windows 为例：

```bash
npm run build-win:prod
```

构建成功后检查：

- `release/<version>/` 目录是否生成
- 安装包名称是否带有正确版本号
- 应用启动是否正常

### 如何回滚一次错误发布？

建议顺序：

```bash
git tag -d v0.0.15
git push origin :refs/tags/v0.0.15
```

然后：

- 在 GitHub Releases 删除对应 Release
- 修复问题
- 重新执行发布工作流

### 为什么发布前会先跑校验？

`.release-it.json` 中配置了：

```bash
before:init -> npm run lint:check
```

这意味着正式 release 前会先校验代码规范，避免不合规代码直接进入发布流程。

## 推荐发布操作

### GitHub Actions 发布

1. 确保待发布代码已合并完成
2. 打开 GitHub Actions
3. 手动运行 `Public`
4. 选择 `patch` / `minor` / `major` / `alpha` / `beta`
5. 等待 `prepare-release`、`build`、`release` 三个阶段全部完成

### 本地预检

```bash
npm install
npm run lint:check
npm run build:prod
```

如需验证桌面打包，再追加对应平台命令：

```bash
npm run build-win:prod
```

## 相关文件

- [package.json](file:///d:/project/vite6-electron-vue3/package.json)
- [electron-builder.json5](file:///d:/project/vite6-electron-vue3/electron-builder.json5)
- [.release-it.json](file:///d:/project/vite6-electron-vue3/.release-it.json)
- [public.yml](file:///d:/project/vite6-electron-vue3/.github/workflows/public.yml)
- [release.yml](file:///d:/project/vite6-electron-vue3/.github/workflows/release.yml)
