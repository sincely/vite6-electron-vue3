# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**主要用户：开发者。** 在此模板上做二次开发、构建自己桌面管理端产品的工程团队，以及评估选型的个人开发者。他们的工作是：快速跑通一个生产可用的 Electron + Vue3 管理端底座，理解架构与扩展点，然后替换成自己的业务。

**次级受众（模板产出物的最终用户）：**

- **内部管理员/运营**：日常使用系统管理（用户/角色/菜单）、在线监控、通知与反馈界面，需要高效、可扫读、不出错的后台工具。
- **业务决策者**：查看仪表盘与报表、导出数据，需要清晰的数据展示层级。

模板的每个界面同时接受双重检验：开发者要"能直接拿去改"，管理员/决策者要"一眼会用"。

## Product Purpose

Lightning 是一个通用 Electron 桌面管理端模板（Vite6 + Vue3 + Element Plus + Pinia）。它存在的理由：桌面管理端有一层繁重的样板工程——无边框窗口与自定义标题栏、登录与动态权限、多布局、亮暗主题、自动更新、锁屏与深链——每个团队重做一遍既慢又容易做差。Lightning 把这层样板做成生产级底座，让开发者直接进入业务开发。

成功的标准：开发团队能在数分钟内跑起完整演示，数天内带着自己的业务界面上线分发；模板附带的示例界面和 50+ 自定义组件可以直接复用而不需要重写。

## Positioning

相对纯 Web 管理端模板（vue-element-admin、art-design-pro 一类）：Lightning 内建完整的桌面交付能力——自动更新体系（electron-updater + 自建更新服务器 + 多平台更新清单）、无边框窗口/拖拽/平台差异适配（mac 红绿灯、win 控件）、深链、锁屏——同时保留 Web 生态的开发体验和 HMR 速度。

相对一般 Electron 脚手架：它带有企业级动态权限体系（static/dynamic 双模式、菜单树、权限变更监听、强制下线）和成套桌面体验（水印、AI 助手、全局搜索、四种布局、View Transition 主题切换）。"桌面级交付能力 + 完整权限体系"的组合是它的差异化位置。

## Operating Context

- **开发**：`pnpm dev`（Vite 渲染端 + Electron）；`pnpm dev:all` 同时拉起 apps/server 的 Koa2 联调后端。支持 `VITE_USE_MOCK` 纯前端 mock 模式，无后端也能完整体验。
- **后端关系**：apps/server（koa2-app-template）是开发联调脚手架，**不是产品承诺的一部分**；衍生项目可替换为任意后端，渲染端通过 HTTP/IPC 通道对接（`VITE_SERVER_URL`）。
- **分发**：electron-builder 打包 win/mac/linux 三平台；自动更新指向自建更新服务器（`VITE_UPDATE_URL`，多平台更新清单，apps/update 相关工具）。
- **仓库结构**：pnpm workspace monorepo——根应用（Electron 桌面端）、apps/server（联调后端）、apps/update（更新服务）、apps/website（配套网站）。
- **合规**：licenses/ 目录含中英双语《桌面端软件许可协议》与隐私说明。

## Capabilities and Constraints

**持久核心能力（产品承诺，后续工作不得破坏）：**

1. **动态权限体系**：static（前端固定路由表 + 后端授权过滤）/ dynamic（后端路由结构动态生成）双模式；JWT 认证、验证码、登录限制器、菜单树构建、权限变更监听、会话活动追踪、强制下线；配套系统管理界面（用户/角色/菜单）。
2. **自动更新体系**：electron-updater 集成、自建更新服务器、多平台更新清单同步；标题栏更新按钮完整状态机（检查 → 下载中百分比 tabular-nums → 下载完成绿色呼吸引导安装）。
3. **桌面体验套件**：无边框窗口 + 自定义标题栏（含 mac 顶部菜单模式的红绿灯留位）、手动窗口拖拽、锁屏（AES 加密）、深链监听、全局水印、节日礼花、全局搜索、AI 助手 / Lightning Bot、问题反馈面板、四种布局模式（侧边/顶部/顶部混合/双列）、亮暗双主题（View Transition 圆形扩散切换）、内容全屏、Chrome 风格多标签。

**约束与事实：**

- Element Plus 基座，主色/状态色已编译期重定；主题全部走 CSS 变量（`--color-*`），任何新界面必须自动获得亮暗双主题。
- 严格 CSP（`default-src 'self'`），新增外部资源或内联脚本需符合策略。
- Node >= 24.18.0，pnpm workspace；代码规范由 ESLint/Prettier/Stylelint + husky/lint-staged/commitlint 强制。
- 8 套示例仪表盘（console/analysis/ecommerce/crypto/hrm/jobs/sales/social）与演示页（notification-demo、request-demo、examples、widgets、template 等）是**能力展示**，衍生项目可整体替换删除，不构成产品事实。

## Brand Commitments

- **名称**：Lightning（`VITE_APP_NAME`），聊天助手署名 "Lightning Bot"。
- **标志**：三蓝折叠环（#597EF7 / #2F54EB / #1D39C4 三段折环，浅色底 multiply 混合产生交叠层次），应用图标与启动屏共用；深色底还原 normal 混合。
- **启动屏**：品牌环 + 蓝色彗星进度轨道（1.4s 循环），背景色与主题窗口底色严格一致以防挂载跳变；支持 prefers-reduced-motion 降级。
- **视觉体系**：以 DESIGN.md（"晴空工作台 Clear-Sky Workspace"）为权威；品牌蓝 #2563EB 是唯一行动色。
- **文案**：界面文案为中文；许可与隐私文档中英双语。

## Evidence on Hand

- 完整可运行代码库即证据：8 套仪表盘、50+ 自定义组件（src/render/components）、系统管理与监控界面、登录（含 WebGL 流体背景/扫码/第三方登录形态）。
- CHANGELOG.md 记录真实演进史；仓库 github.com/sincely/vite6-electron-vue3，当前 v2.0.13。
- **缺失且不得虚构**：没有真实客户案例、用户评价、下载量/使用统计。模板性质的对外文案不得编造"某公司正在使用"或任何数据背书。
- 更新服务器地址为内网 IP（10.10.24.52），不得出现在对外文案或截图中。

## Product Principles

1. **模板即产品**：每个界面和组件都必须是"可直接复用的样板"——真实结构、完整交互态（加载/空/错误/边界）、干净代码；不允许不可迁移的一次性 hack。
2. **桌面级默认**：权限、更新、窗口行为、锁屏这些桌面样板开箱即用且生产级；衍生项目不应该再补做这一层。
3. **双受众检验**：开发者评估架构与扩展性，管理员/运营评估界面效率——两类用户任一不满意都不算完成。
4. **示例即文档**：演示页和示例仪表盘承担能力文档职责，保持可发现、可运行、与真实实现同步。
5. **核心不可拆**：后端、示例页、扩展色板皆可替换；权限体系、更新体系、桌面体验套件是系统级承诺，任何功能不得单独破坏它们的一致性。
