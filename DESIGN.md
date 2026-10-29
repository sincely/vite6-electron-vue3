---
name: Lightning
description: Electron 桌面管理端 · 白蓝 Flat Design · 晴空工作台
colors:
  sky-blue: "#2563eb"
  sky-blue-bright: "#3b82f6"
  sky-soft: "#eff6ff"
  active-blue: "#dbeafe"
  bg-window: "#ffffff"
  bg-content: "#f8fafc"
  bg-input: "#f1f5f9"
  ink-primary: "#0f172a"
  ink-secondary: "#475569"
  ink-muted: "#64748b"
  hairline: "#eff1f3"
  hairline-light: "#f1f5f9"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#ef4444"
  info: "#0ea5e9"
  violet: "#7c3aed"
  teal: "#0d9488"
  rose: "#e11d48"
  amber: "#d97706"
  indigo: "#4f46e5"
  cyan: "#06b6d4"
  pink: "#ec4899"
  night-bg: "#0b0c0f"
  night-surface: "#111318"
  night-card: "#131313"
  night-elevated: "#1f2937"
  night-text: "#ffffff"
  night-text-secondary: "#9ca3af"
  night-link: "#60a5fa"
typography:
  display:
    fontFamily: "Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  ui:
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, Fira Code, Cascadia Mono, Consolas, monospace"
    fontSize: "13px"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.sky-blue}"
    textColor: "#ffffff"
    rounded: "4px"
    padding: "8px 15px"
    height: "32px"
  card:
    backgroundColor: "{colors.bg-window}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  menu-item:
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "42px"
  menu-item-active:
    backgroundColor: "{colors.sky-soft}"
    textColor: "{colors.sky-blue}"
  icon-button:
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.sm}"
    size: "30px"
  table-action-button:
    rounded: "{rounded.sm}"
    size: "24px"
  chrome-tab:
    textColor: "{colors.ink-secondary}"
    padding: "0 18px"
    height: "32px"
  chrome-tab-active:
    textColor: "{colors.sky-blue}"
  badge-vibrant:
    backgroundColor: "#f5f3ff"
    textColor: "{colors.violet}"
    rounded: "20px"
    padding: "2px 10px"
  dialog:
    backgroundColor: "{colors.bg-window}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: Lightning

## Overview

**Creative North Star: "晴空工作台 Clear-Sky Workspace"**

Lightning 是一个 Electron 桌面管理端。它的视觉世界像一片晴朗的天空：大面积的白与极浅的灰蓝构成安静、通透的画布（Flat Design），内容像俯瞰视角下的工作台一样清晰铺开；晴空蓝是唯一贯穿全局的行动色，而七色的活力扩展色板如同天空中的信号色——只出现在徽章、图表、辉光和装饰光斑里，为信息编码，从不争夺操作焦点。

系统的能量藏在细节里而不是表面上：静止时一切平面、极简、1px 发丝边框；一旦交互发生，弹性曲线、彩色辉光、渐变指示条才短暂浮现。暗色主题是同一片天空的夜航模式——深蓝黑底色（#0b0c0f）靠亮度而非阴影分层，蓝色被提亮一档以保证在暗底上的可读性。登录页的 WebGL 流体背景（Spectra）和启动屏的三蓝折叠环是这套系统最具表现力的两个签名时刻，但它们被限定在入口场景，不外溢到日常工作界面。

信息密度偏紧凑（日常 UI 文字集中在 12–14px，图标按钮 24–30px，菜单项 42px），这是桌面工具的本分：可扫读性、一致性和效率优先于表达欲。

**Key Characteristics:**

- 白蓝平面画布：白底 + Slate 灰蓝层次 + 晴空蓝 #2563EB 单一行动色
- 平面优先，辉光点睛：静止无投影，彩色 glow 只作为悬浮/强调的状态响应
- 弹性微交互：hover 统一使用回弹曲线 cubic-bezier(0.34, 1.56, 0.64, 1)
- 七色信号板：violet/teal/rose/amber/indigo/cyan/pink 只做信息编码
- 亮暗双主题：亮色靠极轻阴影、暗色靠亮度台阶分层，切换带圆形扩散 View Transition
- 桌面级紧凑密度 + Element Plus 基座（主色已重定为晴空蓝）

## Colors

调色板的性格是"晴朗、冷静、高对比"：以白与 Slate 灰蓝为画布，晴空蓝为唯一行动色，四个语义状态色对齐 Tailwind 色板，七个活力扩展色作为信息信号。亮暗两套主题通过 `html[data-theme]` 切换，全部颜色以 CSS 变量（`--color-*`）为唯一来源。

### Primary

- **晴空蓝 Sky Blue** (#2563EB / Blue-600)：亮色主题主色。所有行动与选中状态的唯一颜色：主按钮、链接、菜单激活、标签页激活、聚焦指示、下载进度。Element Plus 的 primary 基色已在编译期重定为此值。
- **夜航蓝 Night-Sky Blue** (#3B82F6 / Blue-500)：暗色主题主色（同一色相提亮一档），同时作为亮色主题的辅助亮蓝（`--brand-accent-alt`）。
- **晴空浅雾 Sky Soft** (#EFF6FF / Blue-50)：品牌蓝的浅色背景——菜单悬浮底色、选中底色、更新按钮底、`--brand-accent-soft`。
- **激活蓝 Active Blue** (#DBEAFE / Blue-100)：更深一级的选中/按压背景。

### Neutral

- **纸白 Paper White** (#FFFFFF)：窗口、标题栏、侧边栏、卡片的亮色底（`--color-bg-window` / `--color-bg-card`）。
- **晨雾灰蓝 Morning Mist** (#F8FAFC / Slate-50)：主内容区背景（`--color-bg-content`），与白色卡片形成一层极浅的区分。
- **输入灰 Input Slate** (#F1F5F9 / Slate-100)：输入框底色，也是次级边框色（`--color-border-light`）。
- **墨青 Ink Primary** (#0F172A / Slate-900)：正文主文字，亮色主题下的高对比锚点。
- **石板灰 Ink Secondary** (#475569 / Slate-600)：次级文字、菜单默认文字。
- **雾灰 Ink Muted** (#64748B / Slate-500)：辅助文字与图标；刻意比常规 muted 加深一档，避免图标发虚。
- **发丝线 Hairline** (#EFF1F3)：全局 1px 边框色（`--color-border`），极简清爽。
- **夜幕四阶（暗色中性）**：夜航黑 #0B0C0F（窗口/内容底）→ 深夜面 #111318（标题栏/侧边栏）→ 卡片炭 #131313（卡片）→ 抬升灰 #1F2937（悬浮/输入/边框）。暗色层级完全靠这四档亮度差表达。

### Status

- **翡翠绿 Emerald** (#10B981)：成功、上涨（`.text-up`）、新增操作。
- **琥珀橙 Amber** (#F59E0B)：警告。
- **警报红 Red** (#EF4444)：危险、下跌（`.text-down`）、删除操作。
- **天际青 Sky** (#0EA5E9)：信息、查看操作。

### Vibrant（活力扩展色板）

七个扩展色各带 base / light / soft 三件套（暗色主题下切换为更亮更饱和的值，soft 变为 15% 透明度色雾）。它们只用于信息编码：图表系列、彩色徽章、分类标识、装饰光斑、预设渐变。

- **紫罗兰 Violet** (#7C3AED)：扩展色之首，与晴空蓝组成品牌渐变（`--gradient-primary`）和菜单激活指示条渐变。
- **青绿 Teal** (#0D9488)、**玫瑰 Rose** (#E11D48)、**琥珀 Amber** (#D97706)、**靛蓝 Indigo** (#4F46E5)、**青 Cyan** (#06B6D4)、**粉 Pink** (#EC4899)：图表与徽章的信号色序列。

### Named Rules

**单一声音守则 The One Voice Rule.** 晴空蓝是唯一的行动色：按钮、链接、菜单激活、焦点环只允许出现蓝色。七个扩展色永远不做交互色——它们只为数据、状态标签和装饰编码信息。一屏之内，蓝色开口说话，彩色只做记号。

**三件套守则 The Trio Rule.** 使用任何扩展色时必须走 base/light/soft 三件套变量（如 `--color-violet` / `--color-violet-light` / `--color-violet-soft`），soft 做底、base 做字，禁止手写十六进制散值。

**变量唯一来源 Rule.** 所有颜色消费一律通过 CSS 变量（`--color-*` / `--brand-*`），禁止在组件里硬编码色值；亮暗主题因此免费获得。

## Typography

**Body Font:** 系统栈（Element Plus 默认：Helvetica Neue / PingFang SC / Microsoft YaHei / Arial）——项目未声明全局自定义字体，界面文字由系统栈与 Element Plus 接管。
**Mono Font:** ui-monospace / SF Mono / JetBrains Mono / Fira Code / Consolas，用于代码面板、请求响应、角色权限码。
**Special:** 锁屏时钟使用 Inter / DIN Alternate / Bahnschrift 数字风格栈；启动屏与登录品牌区使用 700 字重 + 字距收紧（-0.3px）的品牌标题。

**Character:** 无个性字体正是这套系统的个性——桌面工具的中性、清晰、免加载；层级全部靠字号与字重（500/600/700）拉开，不靠字体切换。

### Hierarchy

- **Display** (700, 28px 上下, line-height 1.2)：仪表盘统计大数字、锁屏时钟。数字场景必须加 `font-variant-numeric: tabular-nums` 防止跳动。
- **Headline** (600, 20px, line-height 1.3)：页面级标题。
- **Title** (600–700, 18px, line-height 1.3, letter-spacing -0.01em)：卡片头、对话框标题。
- **Body** (400, 14px, line-height 1.6)：正文、表格内容、表单说明。
- **UI** (500, 13px)：菜单项、标签页、按钮等界面控件文字——桌面紧凑密度的主力字号。
- **Label** (500–600, 12px)：辅助说明、徽章、次级信息；10–11px 仅限角标等极小场景。

### Named Rules

**正文三阶规则 The 12-13-14 Rule.** 日常 UI 文字只允许 12 / 13 / 14px 三阶：12 辅助、13 控件、14 正文。超过 18px 的字号属于"展示时刻"（页面标题、统计数字、对话框），不出现在表格与表单里。

**数字等宽规则 The Tabular Rule.** 一切会变化的数字（百分比、倒计时、统计值）必须 `tabular-nums`，宽度稳定优先于视觉惊喜。

## Layout

应用是固定视口的桌面窗口（`html/body overflow: hidden`），经典"三带工作台"结构：左侧边栏 + 右侧「标题栏 64px → 标签栏 38px → 内容区」。四种布局模式经设置切换：侧边菜单（默认）、顶部菜单、顶部混合（顶栏一级 + 左侧二级 ≤180px）、双列菜单（窄栏 244px / 带文字 260px）。

关键尺寸全部走变量：侧边栏 260px（收起 72px）、标题栏 64px、标签栏 38px（Chrome 风格 40px）。内容区底色为晨雾灰蓝（#F8FAFC），页面以白底卡片容器承载，卡片间距遵循观察到的 4 / 8 / 12 / 16 / 24px 节奏（spacing 未定义为 token，这是实测复用值）。内容全屏模式可一键隐藏侧栏、顶栏与标签栏，伴随 0.36s 的收展过渡和 ESC 提示胶囊。

滚动条是刻意的极简：全局 2px 细线，透明轨道，浅灰滑块（#CBD5E1，暗色 #374151），悬停加深。

**三带工作台规则 The Three-Band Rule.** 新页面永远假设自己位于「64px 标题栏 + 38px 标签栏」之下的滚动内容区内，不自行绘制顶部导航或占用标签栏高度。

**布局收展规则.** 所有布局级形变（侧栏收起、布局模式切换、全屏）统一 0.36s cubic-bezier(0.22, 0.7, 0.2, 1)；元素级微交互一律不超过 0.25s。

## Elevation & Depth

**平面优先，辉光点睛（Flat-By-Default, Glow-on-Demand）。** 亮色主题静止状态几乎无投影：卡片靠 1px 发丝边框和底色差（白卡片 vs #F8FAFC 内容区）分层，阴影词表只有 4%–8% 透明度的三档极轻投影。彩色辉光（glow）是状态响应而非装饰常驻：只出现在主按钮悬浮、更新按钮 hover、多彩悬浮卡片（`.hover-colorful`，辉光 + 上浮 3px）等时刻。暗色主题完全放弃阴影分层，改用亮度台阶（#0B0C0F → #111318 → #131313 → #1F2937），阴影仅存更深的环境影。

### Shadow Vocabulary

- **轻触 shadow-sm** (`0 1px 2px 0 rgb(0 0 0 / 4%)`)：卡片静止的最低层级。
- **浮起 shadow-md** (`0 2px 4px -1px rgb(0 0 0 / 6%)`)：下拉、气泡。
- **悬浮 shadow-lg** (`0 4px 6px -1px rgb(0 0 0 / 8%)`)：对话框、全屏提示条；这是亮色主题阴影的天花板。
- **晴空辉光 glow-primary** (`0 4px 14px -3px rgb(37 99 235 / 35%)`)：主行动元素的悬浮辉光；success/violet/rose/amber 各有同构辉光，颜色跟随信号色语义。

**玻璃仅限浮层 The Glass Boundary.** backdrop-filter 模糊只允许出现在浮层：MessageBox、全屏提示胶囊、`.glass-card` 工具类。侧边栏、标题栏、内容卡片一律实心平面——玻璃是天空中的云，不是地基。

## Shapes

圆角是柔和的四级阶梯（亮色）：控件 6px → 菜单项/把手 10px → 卡片 14px → 对话框 20px。暗色主题整体放大一档（6/12/16/24px），在深底上保持轮廓的呼吸感。胶囊形（999px/20px）保留给徽章、提示条和角标。边框语言极简：1px 发丝线，颜色浅到几乎隐形（#EFF1F3），暗色下常用 5%–10% 白色透明线代替。

品牌几何有两个签名形状：启动屏/图标的**三蓝折叠环**（#597EF7 / #2F54EB / #1D39C4 三段折环，亮底 multiply 混合产生交叠层次）和菜单激活态的 **3px 渐变指示条**（蓝→紫纵向渐变，圆角 4px，贴菜单项左缘）。

**四级圆角规则 The Radius Ladder.** 圆角只从阶梯上取值（6/10/14/20，暗色 6/12/16/24），组件嵌套时内层圆角 ≤ 外层；禁止 2px、16px 这类阶梯外的散值。

## Components

整体气质：**轻盈而精确，带一点弹性**——小尺寸、发丝边框、紧凑间距，但 hover 与点击统一带回弹曲线 cubic-bezier(0.34, 1.56, 0.64, 1) 的微小 scale/位移，让工具感不冰冷。基座是 Element Plus（主色/状态色已编译期重定），自定义组件在其上叠加统一皮肤。

### Buttons

- **Primary（Element Plus 主按钮）**：晴空蓝底白字，高 32px、padding 8px 15px、圆角 4px；hover/active 由 Element Plus 按主色自动派生深浅。强调场景可叠加晴空辉光。
- **图标按钮**：30×30px、圆角 6px、透明底 + 透明边框，hover 时浮现浅雾底色；标题栏窗口控制、刷新、侧栏收起共用此形态。点击反馈允许 scale(0.94) 的弹性收缩。
- **表格操作按钮**：24×24px 链接式图标按钮（`.table-action` 容器，gap 6px），语义配色固定：查看=信息青 / 编辑=主色蓝 / 删除=危险红 / 新增=成功绿；hover 弹性放大 scale(1.12)。
- **更新按钮（签名态）**：浅雾蓝底 + 40% 透明主色描边，下载中数字 tabular-nums，下载完成切换为成功绿并 2s 呼吸脉动引导点击。

### Cards / Containers

- **标准卡片**：白底、1px 发丝边框、圆角 14px、padding 12px 24px；卡头 18px/600 主文字色 + 12px 辅助副标题（仪表盘用 `.dash-header`），卡体 14px/1.6 次级文字色。
- **玻璃卡片**（`.glass-card` 工具类）：玻璃面 + blur(16px)，仅限浮层与展示性区块。
- **渐变描边卡片**（`.gradient-border`）：1px 蓝紫渐变 mask 描边，用于需要强调的展示卡，不进表格/表单区。

### Navigation

- **侧边菜单项**：高 42px、gap 10px、padding 0 12px、圆角 10px；默认石板灰文字，hover 浮现浅雾底且图标染上品牌蓝；激活态 = 主色文字（600）+ 浅雾底 + 40% 透明主色描边 + 左缘 3px 蓝紫渐变指示条。收起态（72px）只留居中图标。
- **菜单角标**：6px 红点（#FF3860，1.5s 呼吸动画）或 20×18px 文本角标（#FD4E4E，圆角 4px，10px 白字）。
- **多标签栏**：默认风格为描边标签（激活 = 30% 透明主色描边 + 标题前 6px 主色圆点）；Chrome 风格（可选）为 32px 高几何标签、相邻重叠 18px、激活标签底色为主色 10% 混合、关闭钮 16px 圆形 hover 块。

### Dialogs

- **MessageBox（签名皮肤）**：玻璃面 + blur(12px)、圆角 20px、右上角一团 180px 主色径向光晕作装饰；标题 18px/700（字距 -0.01em），按钮最小宽 84px、圆角 10px；遮罩为 36% 墨青 + blur(6px)。
- **全屏提示胶囊**：顶部居中 999px 胶囊，玻璃面 + shadow-lg，内含 `kbd` 键帽（浅雾底、1px 边框、底部 1px 投影）。

### Chips / Badges

- **活力徽章**（`.badge-vibrant--*`）：胶囊形（圆角 20px）、padding 2px 10px、12px/600；soft 色雾做底、base 色做字，七色各一套；hover scale(1.05)。

### 页面过渡

路由切换过渡集中在 transition.scss，10 种预设（page 默认上滑淡入 / fade / slide 四向 / scale / zoom / blur），统一 0.2s cubic-bezier(0.4, 0, 0.2, 1)，经路由 meta 指定。主题切换使用 View Transition 圆形扩散（0.5s，以点击坐标为圆心）。

**弹性反馈规则 The Bounce Rule.** hover/点击的微交互（scale、translateY、图标旋转）统一使用回弹曲线 cubic-bezier(0.34, 1.56, 0.64, 1)，时长 0.2–0.25s；颜色与背景变化仍用标准 ease。弹性的幅度保持克制：scale 不超过 1.12，位移不超过 -3px。

## Do's and Don'ts

### Do:

- **Do** 所有颜色走 CSS 变量（`--color-*` / `--brand-*`），新页面因此自动获得亮暗双主题。
- **Do** 交互色只用晴空蓝；数据与状态标签才用七色信号板，并成对使用 soft 底 + base 字。
- **Do** 新页面以白底卡片（1px 发丝边框、14px 圆角、12px 24px padding）组织内容，置于 #F8FAFC 内容区之上。
- **Do** hover 微交互使用回弹曲线 cubic-bezier(0.34, 1.56, 0.64, 1)，页面级过渡使用 0.2s cubic-bezier(0.4, 0, 0.2, 1)。
- **Do** 表格操作列遵循 `.table-action` 语义配色约定（查看 info / 编辑 primary / 删除 danger / 新增 success）。
- **Do** 动态数字加 `font-variant-numeric: tabular-nums`。
- **Do** 暗色主题下用亮度台阶（#0B0C0F→#111318→#131313→#1F2937）表达层级，而不是加深阴影。

### Don't:

- **Don't** 使用重阴影与拟物效果：亮色主题阴影不得超过 8% 透明度（shadow-lg 是天花板），禁止 Material 高层级投影、内阴影压凹、浮雕描边。
- **Don't** 滥用辉光与渐变文字：`.gradient-text`、彩色 glow 只属于仪表盘亮点区块、营销性展示和登录/启动等入口场景；正文、表格、表单、设置页一律禁止。
- **Don't** 让玻璃拟态蔓延：backdrop-filter 只用于浮层（MessageBox、提示胶囊、glass-card 工具类）；侧边栏、标题栏、内容卡片必须保持实心平面。
- **Don't** 用扩展色做按钮、链接或导航激活色——违反单一声音守则。
- **Don't** 在组件里硬编码色值、阶梯外圆角或超过 0.36s 的元素级动画时长。
- **Don't** 把登录页的 WebGL 流体背景、装饰光斑搬进日常工作界面。
