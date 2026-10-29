# Impeccable 技能详细使用说明

> 适用版本：impeccable v4.8.0（本项目安装于 `.zcode/skills/impeccable/`）
> 官方文档：<https://impeccable.style/docs/>

---

## 一、这是什么

Impeccable 是一个**前端界面设计技能**。它让 AI 以"获奖设计总监"的标准来处理界面工作：不只是改样式，而是带着明确的设计观点（POV）、对产品和用户的理解，产出可直接上线的代码。

**适用范围：**

- 网站、落地页、营销活动页
- 仪表盘、后台管理、产品 UI
- 组件、表单、设置页、引导流程、空状态
- 原生 iOS / Android 界面
- 设计系统建设（DESIGN.md、design tokens 提取）

**不适用范围：** 纯后端任务、与 UI 无关的工作。

**覆盖的设计维度：** UX 评审、视觉层级、布局、排版、色彩、动效、UX 文案、无障碍（a11y）、响应式适配、边界情况处理。

---

## 二、基本调用方式

```
/impeccable [命令] [目标]
```

- **带命令调用**：直接执行对应工作流，例如
  - `/impeccable audit src/views/login` — 对登录页做技术质量审计
  - `/impeccable bolder` — 把当前偏平淡的设计做得更大胆
- **不带参数调用**（`/impeccable`）：它不会自动执行任何命令，而是分析项目当前状态（是否有 PRODUCT.md/DESIGN.md、git 改动、开发服务器是否在运行、设计检测器命中了哪些问题），然后**推荐 2-3 个最有价值的下一步命令**，并附上完整命令菜单供选择。
- **自然语言调用**：即使不写命令名，只要请求明显对应某个命令（如"帮我评审一下这个页面的 UX"），它也会路由到对应命令；如果两个命令都合适，会先问一次。
- **`[目标]`** 可以是文件路径、目录、路由或页面名称。不指定时作用于整个项目或让 AI 询问。

### 工作前提

每次会话首次运行时，技能会执行一次 `impeccable context` 启动器，加载：

| 文件 | 作用 |
|---|---|
| `PRODUCT.md` | 产品事实：产品是什么、给谁用、核心流程、品牌承诺 |
| `DESIGN.md` | 视觉世界的权威定义：色彩、字体、间距、组件风格等持久设计决策 |
| 各 surface brief | 单个页面/路由级别的策略说明 |

这些文件缺失不会阻塞工作，但补齐后设计输出会更贴合项目。用 `init` 和 `document` 命令生成（见下文）。

### 四种模式（Modes）

技能会根据界面性质自动选择设计"野心"的程度：

| 模式 | 访客的成功标准 | 典型界面 | 设计取向 |
|---|---|---|---|
| **Persuade** | 做出决定并采取行动 | 落地页、营销页、定价页 | 全力投入，大胆、有观点 |
| **Operate** | 完成任务 | 应用 UI、仪表盘、后台、设置 | 可扫读性、一致性优先，品牌体现在细节 |
| **Read** | 理解内容 | 文档、文章、帮助、更新日志 | 先结构化理解，再优化阅读体验 |
| **Experience** | 沉浸于作品本身 | 作品集、画廊、展示页 | 让作品从首屏开始主导，界面退居其次 |

注意：模式按**页面**判断，不按产品判断——工具产品的落地页仍是 Persuade，时装品牌的文档页仍是 Read。

---

## 三、命令详解

### Build（构建类）— 从零建立设计与上下文

| 命令 | 说明 | 什么时候用 |
|---|---|---|
| `shape [feature]` | **写代码之前**规划 UX/UI：先做发现式访谈（每轮 2-3 个问题），确认目的、人群、内容、状态、边界，产出经确认的设计简报，不写代码 | 开发新功能/新页面前，想先把方案想清楚 |
| `init` | 扫描项目 + 访谈，把持久的产品事实写入 `PRODUCT.md`（平台判定：web/ios/android/adaptive） | 项目还没有 PRODUCT.md 时；这是其他一切的基础 |
| `document` | 从**现有代码**反向提取视觉体系，生成 `DESIGN.md` | 项目已有成熟界面但没有设计文档 |
| `extract [target]` | 把散落在代码里的颜色、字号、间距等提取为可复用的 tokens 和组件，沉淀为设计系统 | 想建立/规范化设计系统时 |

> `craft` 是废弃别名，等同于普通的 new-work 请求；`teach` 是 `init` 的别名。

### Evaluate（评估类）— 只诊断，不改代码

| 命令 | 说明 | 什么时候用 |
|---|---|---|
| `critique [target]` | UX 设计评审：按启发式规则打分，输出问题清单（含 P0/P1 优先级） | 想知道"这个页面设计得好不好、差在哪" |
| `audit [target]` | 技术质量检查：无障碍（对比度、键盘操作、ARIA）、性能、响应式行为 | 上线前合规检查；原生平台自动用 `audit.native` 变体 |

`critique` 的结果会被 `polish` 读取为待办清单——先 critique 后 polish 是标准组合。

### Refine（精修类）— 在现有设计上改进

| 命令 | 说明 | 什么时候用 |
|---|---|---|
| `polish [target]` | 上线前最终质量打磨；会读取最近一次 critique 快照作为 backlog 并逐项关闭 | 功能完成后、发布前 |
| `bolder [target]` | 放大设计：让安全、平淡的界面更有存在感 | "这个页面太素了" |
| `quieter [target]` | 收敛设计：降低过度刺激、喧闹的界面 | "这个页面太吵了" |
| `distill [target]` | 提炼本质：删掉不必要的复杂性 | 界面元素过多、认知负担重 |
| `harden [target]` | 生产就绪化：错误态、加载态、国际化、边界情况（超长文本、空数据、极端尺寸） | 从 demo 到可上线之间 |
| `onboard [target]` | 设计首次使用流程、空状态、用户激活路径 | 新用户引导体验差 |

**精修 vs 重设计的区别**（技能内置原则）：精修（Refine）保留现有身份、行为和文案；如果目标是**整体换掉视觉世界**，走 new-work 重设计流程，它会保留产品事实和功能，但把旧外观当作证据和反面参考，另起炉灶并替换 DESIGN.md。

### Enhance（增强类）— 针对单一维度提升

| 命令 | 说明 | 什么时候用 |
|---|---|---|
| `animate [target]` | 添加有目的的动画与动效（不是为动而动） | 界面缺乏反馈和生命力 |
| `colorize [target]` | 给单色/灰调 UI 注入策略性色彩 | 页面全是灰白黑 |
| `typeset [target]` | 改进排版层级与字体运用 | 文字层级混乱、阅读吃力 |
| `layout [target]` | 修复间距、节奏与视觉层级 | 元素摆放松散、对不齐 |
| `delight [target]` | 添加个性与令人记住的细节 | 想让产品有"人味" |
| `overdrive [target]` | 突破常规限制的激进视觉效果 | 想要炫技、做 wow effect |

### Fix（修复类）— 解决具体问题

| 命令 | 说明 | 什么时候用 |
|---|---|---|
| `clarify [target]` | 改进 UX 文案：标签、按钮文字、错误提示 | 用户看不懂界面上写什么 |
| `adapt [target]` | 适配不同设备与屏幕尺寸；原生平台用 `adapt.native` | 移动端/小屏显示错乱 |
| `optimize [target]` | 诊断并修复 UI 性能问题（渲染、重排、加载） | 界面卡顿 |

### Iterate（迭代类）— 浏览器内可视化选稿

| 命令 | 说明 | 前提 |
|---|---|---|
| `live` | 可视化变体模式：启动浏览器覆盖层，用鼠标**直接选中页面上的元素**，选一个设计动作，AI 生成多个 HTML+CSS 变体并通过 HMR 热替换到页面里，满意后 accept 写回源码 | 需要运行中的开发服务器（Vite/Next.js 等，带 HMR）或打开的静态 HTML |
| `generate [n] [action] [element]` | live 的快捷通道：一句话生成变体，无需手动选取。例如 `/impeccable generate 5 bolder hero` = 给 hero 区块生成 5 个更大胆的变体。不写数量默认 3 个，上限 8 个 | 同上；**仅限 Web**，原生项目会拒绝并建议改用 `bolder`/`quieter` |

`generate` 支持的动作词汇：`bolder`、`quieter`、`distill`、`polish`、`typeset`、`colorize`、`layout`、`adapt`、`animate`、`delight`（自然语言会自动映射，如"更活泼"→`delight`）。

工作流程：在浏览器覆盖层里翻看变体 → accept 选中的那个（AI 把它固化进源码）或 discard → 结束。中断后可用 `impeccable live-status` / `live-resume` 恢复会话。

> 注意：live 模式要求本地开发环境，不支持注入已部署的生产站点。

---

## 四、辅助管理命令

### `hooks` — 设计检测器钩子

```
/impeccable hooks <on|off|status|ignore-rule|ignore-file|ignore-value|reset>
```

开启后，每次 AI 编辑 UI 相关文件（`.vue`、`.tsx`、`.css`、`.html` 等）都会**自动运行设计检测器**，实时报告机械性问题：图片损坏、内容溢出、对比度不足、渐变文字、发光阴影、设计系统漂移等。分两层：

- **每次编辑**：只报明确的机械问题
- **会话结束（Stop）**：对本次会话改过的所有 UI 文件跑完整规则集，去重后一次性报告

配置存于 `.impeccable/config.json`（`hook.enabled`、`hook.quiet` 静音、`detector.ignoreRules/ignoreFiles/ignoreValues` 忽略项）。检测器为本地运行，无网络请求。

### `doctor` — 产物漂移检修

```
/impeccable doctor
```

检查并修复项目的 Impeccable 产物（PRODUCT.md、DESIGN.md 及其 sidecar、配置、surface briefs、hook）与当前技能版本之间的**格式漂移**（旧版本写的字段、废弃位置的文件）。`auto` 级别的发现直接修复，其余按严重度报告。也用于回答"哪些东西过期了"。

它**不做**设计工作，也不会顺手重设计任何东西。

### `pin` / `unpin` — 命令快捷方式

把常用命令固定为独立的斜杠命令，例如把 `audit` pin 后可直接用 `/audit` 调用，不必每次写 `/impeccable audit`。

---

## 五、推荐工作流

### 场景 A：新项目从零开始

```
1. /impeccable init          → 建立 PRODUCT.md（产品事实）
2. /impeccable shape 登录注册  → 规划 UX，确认设计简报
3. （自然语言描述需求，走 new-work 流程建立视觉世界，产出 DESIGN.md）
4. 实现后 /impeccable polish   → 打磨
```

### 场景 B：已有项目做体检和改进

```
1. /impeccable document               → 从现有代码生成 DESIGN.md
2. /impeccable critique src/views/xx  → UX 评审，得到打分和问题清单
3. /impeccable audit src/views/xx     → 技术审计（a11y/性能/响应式）
4. /impeccable polish src/views/xx    → 按评审清单逐项修复打磨
5. /impeccable harden src/views/xx    → 补齐错误态、边界情况、i18n
```

### 场景 C：视觉方向调整

```
太素了    → /impeccable bolder [目标]
太吵了    → /impeccable quieter [目标]
太复杂了  → /impeccable distill [目标]
灰蒙蒙的  → /impeccable colorize [目标]
```

### 场景 D：开发服务器运行中，可视化选稿

```
1. 启动 dev server（如 pnpm dev）
2. /impeccable generate 4 bolder 顶部导航栏
3. 在浏览器覆盖层里翻看 4 个变体，accept 最满意的一个
```

### 场景 E：上线前最终检查

```
1. /impeccable audit     → a11y / 性能 / 响应式
2. /impeccable harden    → 错误态与边界情况
3. /impeccable polish    → 最终打磨
```

---

## 六、内置设计原则（了解它的"脾气"）

1. **Brief 优先**：你明确钉住的审美、时代风格、材质、字体、色板会被严格执行，即使它与"避免俗套"的内置警告冲突。把你的需求说清楚比什么都重要。
2. **完成到底**：交付物是完整的，不留半成品（除需要你提供的素材）。
3. **看渲染结果验证**：它会以实际上线的尺寸查看渲染效果，并且批量检查——一次看完修完再看，而不是每改一处截一次图。
4. **精修保留，重设计替换**：不会在废弃的旧外观上"打补丁式抛光"；要么完整保留现有身份做精修，要么彻底另起视觉世界。
5. **敏感符号禁区**：与军国主义、种族仇恨相关的符号（如旭日旗光芒、纳粹标志等）不会用作装饰元素。
6. **不擅自修文档漂移**：设计任务中发现 PRODUCT.md/DESIGN.md 过期只会报告，除非你明确要求，否则不会顺手修（`auto` 级除外）。

---

## 七、注意事项与限制

- **`live`、`generate` 和内置检测器仅限 Web**：它们依赖浏览器覆盖层和 HTML 规则引擎，iOS/Android 原生项目不可用（会建议改用 `bolder`/`quieter` 直接改源码）。
- **提问机制**：`shape`、`init`、new-work 等命令会通过结构化提问访谈你（每轮 2-3 个问题）；请求越精确，提问越少。
- **产物位置**：
  - `PRODUCT.md` / `DESIGN.md` — 项目根目录（或技能解析出的位置）
  - `.impeccable/config.json` — 项目共享配置（提交到 git）
  - `.impeccable/config.local.json` — 个人本地配置（gitignore）
  - `.impeccable/live/` — live 模式的会话日志
- **monorepo**：可用 `--target <path>` 指定子应用，context/doctor 等命令都会锚定到正确的子项目。
- **运行环境**：启动器是自包含二进制，首次运行自动下载，不需要 Node 等运行时。

---

## 八、快速参考卡

| 我想… | 命令 |
|---|---|
| 不知道从哪开始 | `/impeccable`（无参数，看推荐） |
| 建立产品上下文 | `/impeccable init` |
| 从代码生成设计文档 | `/impeccable document` |
| 开发前先规划 UX | `/impeccable shape <功能>` |
| 评审设计好不好 | `/impeccable critique <目标>` |
| 检查 a11y/性能/响应式 | `/impeccable audit <目标>` |
| 上线前打磨 | `/impeccable polish <目标>` |
| 设计更大胆 / 更安静 / 更简洁 | `bolder` / `quieter` / `distill` |
| 补错误态和边界情况 | `/impeccable harden <目标>` |
| 加动画 / 加色彩 / 改排版 / 调布局 | `animate` / `colorize` / `typeset` / `layout` |
| 改文案和错误提示 | `/impeccable clarify <目标>` |
| 适配移动端 | `/impeccable adapt <目标>` |
| 修 UI 性能 | `/impeccable optimize <目标>` |
| 浏览器里选元素出变体 | `/impeccable live` |
| 一句话生成 N 个变体 | `/impeccable generate <n> <动作> <元素>` |
| 开关自动设计检测 | `/impeccable hooks on|off|status` |
| 检查产物是否过期 | `/impeccable doctor` |
| 固定常用命令为斜杠命令 | `/impeccable pin <命令>` |
