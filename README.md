# lightning — Vite 6 + Electron 42 + Vue 3 桌面应用 (Turborepo + pnpm Monorepo)

基于 **Turborepo + pnpm workspace** 构建的多应用 monorepo。包含桌面端 (Electron 42)、浏览器端管理后台、营销站点和 Mock 后端服务。统一由 **Turbo** 编排构建/开发流水线。

---

## Monorepo 结构

```
lightning/
├── apps/
│   ├── desktop/         # Electron 桌面应用 (主进程 + 预加载 + 渲染进程)
│   ├── web-admin/       # 浏览器端管理后台 SPA
│   ├── website/         # 营销站点
│   └── backend/         # Nitro Mock 后端服务
├── packages/
│   ├── shared/          # 跨进程共享代码 (通知封装)
│   ├── build-config/    # 共享 Vite 插件 + 代理 + 工具
│   ├── eslint-config/   # 共享 ESLint flat config
│   ├── prettier-config/ # 共享 Prettier 配置
│   └── stylelint-config/# 共享 Stylelint 配置
├── scripts/             # 根级工具脚本 (clean / dir-tree / gen-iconify-data)
├── turbo.json           # Turbo 流水线定义
├── pnpm-workspace.yaml  # pnpm workspace 声明
└── package.json         # 根 workspace 编排器
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| Monorepo 工具 | Turborepo 2.x + pnpm 8.x workspace |
| 桌面框架 | Electron 42.x |
| 前端框架 | Vue 3.5.x (Composition API) |
| 构建工具 | Vite 6.4.x |
| UI 组件库 | Element Plus 2.11.x |
| 状态管理 | Pinia 2.3.x + pinia-plugin-persistedstate |
| 路由 | Vue Router 4.5.x |
| 自动更新 | electron-updater 6.6.x |
| 后端 Mock | Nitropack 2.11.x |
| 代码规范 | ESLint 8.57 (flat config) + Prettier 3.6 + Stylelint 16 + Husky + lint-staged |

---

## 快速开始

### 前置要求

- Node.js >= 22.20
- pnpm >= 8.15

### 安装依赖

```bash
pnpm install
```

> 仓库通过 `preinstall: only-allow pnpm` 强制使用 pnpm。

### 启动开发

```bash
# 同时启动所有 app 的 dev (并行)
pnpm dev

# 单独启动某个 app
pnpm dev:desktop        # Electron 桌面应用
pnpm dev:web-admin      # 浏览器管理后台
pnpm dev:website        # 营销站点
pnpm dev:backend        # Nitro Mock 后端

# 后端 + web-admin 联合调试
pnpm web-admin:stack
```

### 构建

```bash
# 构建所有 app
pnpm build

# 构建单个 app
pnpm build:desktop
pnpm build:web-admin
pnpm build:website
pnpm build:backend

# ���面应用按平台打包 (Windows)
pnpm --filter @lightning/desktop build-win:dev
pnpm --filter @lightning/desktop build-win:test
pnpm --filter @lightning/desktop build-win:prod
```

### 代码质量

```bash
pnpm lint                # 全量 lint (turbo)
pnpm lint:fix            # 全量 lint --fix
pnpm format              # 全量 prettier --write
pnpm format:check        # 全量 prettier --check
pnpm clean               # 清构建产物
pnpm clean:cache         # 清 .turbo 与 node_modules/.cache
pnpm clean:all           # 全量清理(含 node_modules)
```

### 发布 (桌面应用)

```bash
pnpm --filter @lightning/desktop manual:release  # 交互式 release-it
pnpm --filter @lightning/desktop release         # 自动 release-it
```

---

## App 详解

### apps/desktop (Electron 应用)

完整 Electron 应用,主进程 + 预加载脚本 + Vue 3 渲染进程合一的端到端交付。

```
apps/desktop/
├── src/
│   ├── main/            # Electron 主进程 (窗口、托盘、菜单、IPC、deeplink、updater、store)
│   ├── preload/         # 上下文桥(contextBridge)
│   └── renderer/        # Vue 3 渲染进程 (原 src/render)
├── public/             # 静态资源
├── resources/          # electron-builder 图标资源
├── scripts/            # 构建/发布辅助脚本 (pre-dev, afterPack, installer.nsh, release.js, build-icons)
├── index.html          # 渲染进程 HTML 入口
├── vite.config.js      # 主 vite 配置 (vite-plugin-electron)
├── electron-builder.json5
└── package.json        # @lightning/desktop
```

启动 `pnpm dev:desktop` 后会同时拉起后端 (`@lightning/backend-mock`) + Electron 主进程 + Vite 渲染进程开发服务器。

### apps/web-admin

纯浏览器端的 Vue 3 管理后台 SPA,与 Electron 渲染进程共享 ~85% 业务代码,但:

- **不依赖** `electron` / `electron-log` / `electron-store` / `electron-updater`
- `utils/log.js` 用基于 `console` 的等价 API 替代 `electron-log/renderer`(消除真实 electron 泄漏)
- 无 IPC 通道,所有 HTTP 请求走 axios

端口 `3300`。

### apps/website

轻量营销站点,纯 Vue 3 + Vite 6。端口 `5200`。

### apps/backend

Nitro 2.11 Mock 后端服务,提供登录鉴权、产品/菜单/角色/用户 CRUD、WebSocket chat 等接口。端口 `5320`。

---

## Packages 详解

| 包名 | 职责 |
|------|------|
| `@lightning/shared` | 跨进程共享代码(目前仅 notification.js 通知封装)。库模式构建,生成 ESM + CJS 双产物 |
| `@lightning/build-config` | 共享 Vite 插件组合 (`createVitePlugins`)、开发代理 (`proxyServer`)、构建工具 (`sizeAnalyzer`、`getRootPath`) |
| `@lightning/eslint-config` | 基础 + Vue 扩展 ESLint flat config(供各 app 引入) |
| `@lightning/prettier-config` | 统一 Prettier 规则 |
| `@lightning/stylelint-config` | 统一 Stylelint 规则 |

各 app 通过 `workspace:*` 协议引用上述包:

```jsonc
// apps/desktop/package.json
{
  "dependencies": {
    "@lightning/shared": "workspace:*",
    "@lightning/build-config": "workspace:*"
  },
  "devDependencies": {
    "@lightning/eslint-config": "workspace:*",
    "@lightning/prettier-config": "workspace:*",
    "@lightning/stylelint-config": "workspace:*"
  }
}
```

---

## Turbo 任务编排

`turbo.json` 定义了 5 个核心任务,所有 app 共享同一份任务名,便于 root 编排:

| 任务 | 说明 | dependsOn | 缓存 |
|------|------|-----------|------|
| `build` | 编译产物 | `^build`(先构建依赖的包) | 输出 `dist/**` 和 `dist-electron/**` |
| `lint` | 代码检查 | `^lint` | 默认 |
| `dev` | 开发模式 | `^build` | 不缓存、`persistent: true` |
| `dev:nitro` | Nitro 后端热更新 | — | 不缓存 |
| `clean` | 清理产物 | — | 不缓存 |

---

## 提交与 Git Hooks

```bash
git commit -m "feat: 新增功能"      # commitlint 校验提交信息
```

`.husky/pre-commit` 会通过 `pnpm -F <name> run lint-staged` 在每个 app 内触发各自的 lint-staged。

`.husky/commit-msg` 调用 commitlint 强制 conventional commit 格式。

---

## 已知限制

- `apps/desktop/src/preload/index.mjs` 仍然跨进程 import `../main/loading/train.js`(preload 引用主进程 splash 工具),保留原设计。
- render 与 web-admin 两个 app 中约 85% 的 components / hooks / styles / utils / views / store modules 是完全相同的副本,**本次重构未抽取**(按用户确认的保守方案,后续可作为独立优化项)。

---

## 目录变更记录

本次从单包结构迁移到 Turborepo + pnpm monorepo,主要变化:

| 原位置 | 新位置 |
|--------|--------|
| `src/main/` | `apps/desktop/src/main/` |
| `src/preload/` | `apps/desktop/src/preload/` |
| `src/render/` | `apps/desktop/src/renderer/` |
| `src/web-admin/` | `apps/web-admin/` |
| `src/website/` | `apps/website/` |
| `src/backend/` | `apps/backend/` |
| `src/shared/notification.js` | `packages/shared/notification.js`(可通过 `@lightning/shared/notification` 引入) |
| `build/` | `packages/build-config/` |
| 根 `eslint.config.js` 内容 | `packages/eslint-config/src/{index,vue}.js`(根文件 re-export) |
| 根 `.prettierrc.js` 内容 | `packages/prettier-config/index.js` |
| 根 `stylelint.config.js` 内容 | `packages/stylelint-config/index.js` |
| 根 `index.html` | `apps/desktop/index.html` |
| 根 `vite.config.js` | `apps/desktop/vite.config.js` |
| 根 `electron-builder.json5` | `apps/desktop/electron-builder.json5` |
| 根 `dev-app-update.yml` | `apps/desktop/dev-app-update.yml` |
| 根 `public/` | `apps/desktop/public/` |
| 根 `resources/` | `apps/desktop/resources/` |
| 根 `scripts/`(electron 相关) | `apps/desktop/scripts/` |
| 根 `scripts/dir-tree.js`、`gen-iconify-data.js` | 保留在 `scripts/` |

新增:

- `pnpm-workspace.yaml` — workspace 声明
- `turbo.json` — Turbo 流水线
- `scripts/clean.mjs` — monorepo 全量清理
- `apps/{desktop,web-admin}/eslint.config.js` — 各 app 独立的 ESLint flat config
- `apps/{desktop,web-admin,website,backend}/lint-staged.config.js` — 各 app 独立的 lint-staged

业务代码无改动;render 与 web-admin 中 ~85% 相同的代码保持原样未抽取。