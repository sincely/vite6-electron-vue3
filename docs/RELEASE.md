# 发布与自动更新指南

本文档说明如何发布一个新版本、让已安装的客户端自动更新到最新版。

核心要点：

- 客户端更新走 **electron-updater + generic 静态服务器**，与 GitHub Release 无关
- 每次发版必须把构建产物同步到更新服务器，否则客户端检测不到新版本
- 可通过 `update-config.json` 远程控制发布策略（暂停 / 强制升级 / 灰度 / 自动下载）

---

## 一、发布架构总览

```text
开发者提交代码
  │
  ├─► GitHub Actions（可选）或本地打包
  │     └─ release-it 提升版本 → 构建安装包 → 生成更新元数据
  │
  ├─► 更新服务器（http://10.10.24.52:8089/electron-update/）
  │     ├─ latest.yml        ← 客户端读取它判断是否有新版本
  │     ├─ <version>-Setup.exe
  │     ├─ <version>-Setup.exe.blockmap
  │     └─ update-config.json  ← 远程控制发布策略（可选）
  │
  └─► 客户端启动 / 窗口聚焦
        └─ electron-updater 读取 latest.yml → 版本比较 → 下载 → 安装
```

两条链路相互独立：

| 链路 | 作用 | 客户端是否感知 |
| --- | --- | --- |
| GitHub Release | 发版记录、安装包下载 | ❌ 客户端不读取 |
| 更新服务器 | 在线自动更新 | ✅ 唯一数据源 |

**结论：想让客户端收到更新，只需要同步好更新服务器，GitHub Release 不是必须的。**

---

## 二、关键文件

| 文件 | 作用 |
| --- | --- |
| `src/main/update.js` | 主进程更新器：门控检查、聚焦触发、自动下载、事件推送 |
| `src/main/updateConfig.js` | 远端配置客户端：拉取 `update-config.json`、10 分钟轮询、版本禁用判断 |
| `src/main/ipc/update.js` | 更新相关 IPC（手动检查、下载、安装、读取配置） |
| `src/render/core/update.js` | 渲染层 IPC → CustomEvent 桥接 |
| `src/render/store/modules/version.js` | 版本与更新状态 Store |
| `src/render/components/UpdateDialog/index.vue` | 更新弹窗（含强制升级模式、灰度徽标） |
| `src/render/components/SettingDialog/index.vue` | 设置页"关于软件"的更新卡片 |
| `electron-builder.json5` | 打包输出、产物命名、publish 配置 |
| `dev-app-update.yml` | 开发环境更新配置 |
| `.env.production` / `.env.test` | `VITE_UPDATE_URL` 更新服务器地址 |

---

## 三、如何发布一个新版本（核心操作流程）

### 场景 1：正常全量发布

1. **确认代码就绪**

   ```bash
   npm install
   npm run lint:check
   ```

2. **本地打包**（以 Windows 生产版为例）

   ```bash
   npm run build-win:prod
   ```

   产物输出到 `release/<version>/`，包含：

   ```text
   release/1.0.2/
     ├── latest.yml                    ← 更新元数据（版本号、sha512、文件名）
     ├── lightning-win32-1.0.2-Setup.exe
     ├── lightning-win32-1.0.2-Setup.exe.blockmap
     └── win-unpacked/                 ← 免安装目录（无需上传）
   ```

3. **同步更新服务器**（`http://10.10.24.52:8089/electron-update/`）

   按以下顺序上传，**先安装包，最后 latest.yml**：

   ```text
   ① lightning-win32-1.0.2-Setup.exe
   ② lightning-win32-1.0.2-Setup.exe.blockmap
   ③ latest.yml          ← 最后上传，覆盖旧版元数据
   ```

   > ⚠️ 顺序不能反：客户端先读 `latest.yml`，如果元数据已更新但安装包还没传完，客户端会发现新版本但下载失败。

4. **可选：更新 `update-config.json`**

   全量发布通常保持默认配置即可：

   ```json
   {
     "schemaVersion": 1,
     "eligible": true,
     "disabledClientVersions": [],
     "autoDownload": true,
     "checkOnFocus": true,
     "minCheckIntervalMinutes": 30
   }
   ```

5. **验证**

   - 把 `latest.yml` 里声明的 sha512 与服务器上 exe 的实际 sha512 比对
   - 用一台旧版本机器启动应用，观察日志出现"检测到新版本"
   - 确认下载 → 重启安装全流程可用

### 场景 2：灰度分批发布

1. 完成场景 1 的上传步骤
2. 在服务器 `latest.yml` 中追加灰度比例：

   ```yaml
   version: 1.0.3
   stagingPercentage: 20   # 只有 20% 客户端会收到更新
   files:
     - url: lightning-win32-1.0.3-Setup.exe
       ...
   ```

3. 观察灰度结果，逐步调高 `stagingPercentage`（40 → 70 → 100），最终去掉该字段完成全量
4. 客户端无需任何改动，electron-updater 按客户端缓存 ID 自动计算是否命中；命中后弹窗显示"灰度发布 x%"徽标

### 场景 3：强制升级（停用某版本）

将需要废弃的版本加入 `update-config.json` 的 `disabledClientVersions`：

```json
{
  "eligible": true,
  "disabledClientVersions": ["1.0.0", "0.9"]
}
```

- `"1.0.0"` 精确匹配该版本
- `"0.9"` 前缀匹配 0.9.x 整个系列
- 命中版本的应用会弹出**不可跳过**的强制升级窗（标题"当前版本已停止支持"）
- 配置修改后最长 10 分钟生效（客户端轮询），重启客户端立即生效

### 场景 4：紧急暂停更新

将 `eligible` 设为 `false`：

```json
{ "eligible": false }
```

客户端会**完全跳过更新检查**，可用于紧急停发。恢复时改回 `true`。

---

## 四、GitHub Actions 发布（可选）

项目提供了 GitHub Actions 工作流，但**它不会自动同步更新服务器**，发布后仍需手动上传。

```text
prepare-release：release-it 提升版本 + 打 tag（不建 Release）
  → build：按新 tag 构建 Win / macOS / Linux
  → release：合并产物、创建 GitHub Release、上传安装包附件
```

在 GitHub 页面手动触发 `Public` 工作流，选择 `patch / minor / major / alpha / beta`。

工作流不会上传 `latest.yml` / `*.blockmap`，因此**发布后必须按"场景 1"手动同步更新服务器**。

---

## 五、本地构建与打包命令

```bash
# 仅构建前端（验证代码）
npm run build:dev
npm run build:test
npm run build:prod

# 构建桌面安装包
npm run build-win:prod    # Windows（NSIS）
npm run build-mac:prod    # macOS（dmg + zip）
npm run build-linux:prod  # Linux（AppImage）
```

脚本执行顺序：

1. `npm run clean`（清空 dist / dist-electron）
2. `vite build --mode <env>`（构建渲染层 + 主进程 + preload）
3. `electron-builder --win / --mac / --linux`（打包安装包 + 更新元数据）

---

## 六、更新服务器部署

### 目录结构

```text
/electron-update/
  ├── latest.yml                  ← Windows 更新元数据（必需）
  ├── latest-mac.yml              ← macOS 更新元数据（多平台时必需）
  ├── update-config.json          ← 远端发布策略（建议放置）
  ├── lightning-win32-<v>-Setup.exe
  ├── lightning-win32-<v>-Setup.exe.blockmap
  ├── *.dmg / *.zip
  └── *.AppImage
```

### Nginx 示例

```nginx
server {
    listen 8089;
    server_name your-server-ip;

    location /electron-update/ {
        root /var/www/;
        autoindex off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Access-Control-Allow-Origin *;
    }
}
```

### 上传顺序（重要）

1. 安装包（exe / dmg / AppImage）
2. `*.blockmap`
3. `latest*.yml`（最后覆盖）

---

## 七、远端更新配置 update-config.json

客户端启动时从 `VITE_UPDATE_URL` 根目录拉取 `update-config.json`（与 `latest.yml` 同级）。**发布新版本时必须保证该文件存在且字段合法**，否则客户端使用内置兜底配置（不影响现有更新流程）。

### 字段说明

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `schemaVersion` | number | 1 | 配置结构版本 |
| `eligible` | boolean | true | 更新资格总开关。`false` 时客户端完全跳过更新检查（紧急停发） |
| `disabledClientVersions` | string[] | `[]` | 禁用版本列表。命中则强制升级弹窗不可跳过，支持精确（`"1.0.1"`）与前缀（`"1.0"`） |
| `autoDownload` | boolean | false | 发现新版本后是否自动下载（true 对齐 QoderWork），false 时用户点击"立即更新"后才下载 |
| `checkOnFocus` | boolean | true | 窗口聚焦时是否自动检查更新 |
| `minCheckIntervalMinutes` | number | 30 | 聚焦触发的最小检查间隔（分钟），防止频繁请求 |

### 逐字段详细说明

#### `schemaVersion` — 配置结构版本

- **作用**：标识配置结构版本，便于将来配置结构变化时做兼容处理
- **代码逻辑**：`normalizeConfig` 直接透传，非法值时回退 `1`
- **注意事项**：客户端只提取已知字段、忽略未知字段，所以将来配置文件新增字段不会导致老客户端报错（向后兼容）。当前暂无按它分支的逻辑，属于预留字段

#### `eligible` — 更新资格总开关

- **作用**：远程控制"是否允许本应用检查更新"的总开关
- **代码逻辑**：`checkForUpdates` 第一道门控，`false` 时**直接 return**，不执行 `autoUpdater.checkForUpdates()`
- **生效时机**：启动检查 / 窗口聚焦 / 手动"检查更新"都会先走这个判断；手动检查会先刷新远端配置再判断
- **典型场景**：紧急停发（改 `false` 全量客户端立刻停止检查）；暂停发布；恢复发布（改回 `true`，无需发版）
- **注意事项**：`false` 时连检查动作都不会发生（不发网络请求、不读 latest.yml），客户端也不会报"检查更新失败"，是"静默跳过"

#### `disabledClientVersions` — 禁用版本列表

- **作用**：声明哪些版本"已停止支持"，命中客户端弹**不可跳过**的强制升级窗
- **匹配规则**：

  | 配置值 | 命中范围 |
  | --- | --- |
  | `"1.0.0"` | 仅 1.0.0（精确匹配） |
  | `"0.9"` | 0.9.0 / 0.9.1 / 0.9.5…（前缀匹配整个 0.9.x 系列） |

- **代码逻辑**：命中时推送 `force-update` 信号，**仍继续**执行 `checkForUpdates()`（强制升级需要拿到新版本）
- **渲染层表现**（`UpdateDialog`）：标题变"当前版本已停止支持"，隐藏"稍后更新"和关闭按钮，只能点"立即升级"
- **典型场景**：旧版本有安全漏洞必须升级；接口/协议不兼容旧版本无法使用
- **注意事项**：若同时 `eligible=false`，禁用逻辑不会生效（总开关优先直接 return）

#### `autoDownload` — 自动下载策略

- **作用**：发现新版本后是否自动开始下载
- **代码逻辑**：`autoUpdater.autoDownload = config.autoDownload`，配置变化时实时同步
- **行为对比**：

  | 值 | 行为 |
  | --- | --- |
  | `true` | 检测到新版本自动下载，UI 直接进入进度条状态，无需点"立即更新" |
  | `false` | 弹窗显示"发现新版本"+ "立即更新"按钮，用户点击后才下载 |

- **注意事项**：即使自动下载完成，**安装仍需用户点"立即重启安装"**，不会自动重启应用

#### `checkOnFocus` — 窗口聚焦自动检查

- **作用**：主窗口每次获得焦点时是否自动执行一次更新检查（对齐 QoderWork 的 "Window focused - checking for updates"）
- **代码逻辑**：`win.on('focus')` 时若 `checkOnFocus=true` 则调用 `checkForUpdates({ fromFocus: true })`
- **典型场景**：桌面工具应用用户长时间挂着 → `true` 保证回到窗口能拿到新版本；多窗口频繁切换怕请求多 → `false`
- **注意事项**：聚焦检查受 `minCheckIntervalMinutes` 节流，不会每次聚焦都发请求

#### `minCheckIntervalMinutes` — 聚焦检查节流间隔

- **作用**：限制"窗口聚焦触发的检查"最小间隔，避免频繁聚焦导致频繁请求
- **代码逻辑**：仅对 `fromFocus=true` 生效；距上次检查不足该间隔则跳过；**启动检查、手动检查不受节流**
- **注意事项**：值设为 `0` 或负数时回退默认值 `30`

### 字段优先级

```text
checkForUpdates() 执行顺序：
  ① eligible=false        → return（总开关，跳过一切）
  ② fromFocus 且未到间隔   → return（节流）
  ③ 命中 disabledList     → 推送 force-update（仍继续检查）
  ④ autoUpdater.checkForUpdates()
        └─ autoDownload=true → 自动下载
```

- `eligible` 是总闸，`false` 时其他字段全部失效
- `disabledClientVersions` 触发强制升级，语义是"必须升"
- `autoDownload` / `checkOnFocus` / `minCheckIntervalMinutes` 控制体验细节

### 完整示例

```json
{
  "schemaVersion": 1,
  "eligible": true,
  "disabledClientVersions": ["1.0.0"],
  "autoDownload": true,
  "checkOnFocus": true,
  "minCheckIntervalMinutes": 10
}
```

含义：更新通道开放；1.0.0 版本用户必须升级；其他用户发现新版本自动下载；窗口聚焦每 10 分钟最多自动检查一次。

### 更新时机

- 客户端启动时拉取一次，之后每 10 分钟轮询一次
- 配置变化实时推送到渲染层（设置页"关于软件"卡片同步显示"更新已暂停"等状态）

---

## 八、客户端更新链路

```text
应用启动 / 窗口聚焦
  │
  ├─► 主进程拉取 update-config.json（启动拉取 + 10 分钟轮询）
  │     ├─ eligible=false → 跳过检查（日志记录，推送配置给 UI）
  │     ├─ 当前版本被 disabledClientVersions 命中 → 推送 force-update（强制升级弹窗）
  │     └─ 正常 → 继续
  │
  ├─► autoUpdater.checkForUpdates()
  │     └─ 读取 latest.yml，semver 比较（允许降级关闭）
  │
  ├─► 发现新版本
  │     ├─ autoDownload=true → 自动下载
  │     └─ autoDownload=false → 弹窗等用户点"立即更新"
  │
  ├─► 下载进度 → download-progress → UI 进度条（平滑动画）
  │
  ├─► 下载完成 → 弹窗"立即重启安装"
  │
  └─► autoUpdater.quitAndInstall(false, true)
```

### 触发时机

| 触发点 | 说明 |
| --- | --- |
| 主窗口加载完成 | 启动时自动检查一次 |
| 主窗口聚焦 | 每次聚焦检查（受 `checkOnFocus` 控制 + `minCheckIntervalMinutes` 节流） |
| 用户手动 | 设置页"关于软件"→ 检查更新；菜单"检查更新" |

---

## 九、IPC 频道

### 渲染层 → 主进程

| 频道 | 作用 |
| --- | --- |
| `check-for-updates` | 手动检查更新（先刷新远端配置，再走门控检查） |
| `start-download` | 开始下载更新包 |
| `install-update` | 下载完成后安装并重启 |
| `get-update-config` | 获取当前远端更新配置（handle，返回配置对象） |

### 主进程 → 渲染层

| 频道 | 作用 |
| --- | --- |
| `checking-for-update` | 正在检查更新 |
| `update-not-available` | 已是最新版本 |
| `update-available` | 发现新版本（payload 含 `rolloutMode`：batch/full） |
| `download-progress` | 下载进度 |
| `update-downloaded` | 下载完成 |
| `quit-and-install` | 即将退出安装 |
| `update-error` | 更新失败 |
| `update-config` | 远端配置变化（渲染层同步 eligible / autoDownload） |
| `force-update` | 强制升级信号（当前版本被禁用） |

### 渲染层内部 CustomEvent

`src/render/core/update.js` 把部分 IPC 二次转发为浏览器事件：

- `update:available` / `update:open-dialog` / `update:config` / `update:force`

---

## 十、开发环境调试

### 使用 dev-app-update.yml

开发环境启用 `forceDevUpdateConfig`，会读取项目根目录的 `dev-app-update.yml`：

```yaml
version: 1.0.2        # 必须高于 package.json 当前版本，否则永远"已是最新"
provider: generic
url: http://10.10.24.52:8089/electron-update/
```

注意：`version` 是本地模拟的"服务器版本"，用于触发更新检测；实际下载仍从 `url` 拉取。

### 本地模拟下载

- DEV 模式下 `UpdateDialog` 点击"立即更新"会走 `startMockDownload()` 模拟进度条，不需要真实服务器
- 设置页更新卡片、强制升级、灰度徽标等交互均可通过修改 `update-config.json` 验证

---

## 十一、常见问题

### 1. GitHub Release 有新版本，为什么客户端检测不到？

客户端只读 `VITE_UPDATE_URL` 指向的更新服务器 `latest.yml`，不读取 GitHub Release。检查服务器上 `latest.yml` 的版本号是否已高于客户端当前版本。

### 2. 客户端发现新版本但下载失败？

常见原因：

- `latest.yml` 已更新，但安装包未上传完成（上传顺序错误）
- 服务器路径与 `VITE_UPDATE_URL` 不一致
- 服务器缺少 `blockmap` 或文件权限不对
- 更新服务器返回了重定向/拦截（如 403、301 且未跟随）

### 3. 版本号与安装包不一致？

根因是"先构建、后 bump 版本"。当前流程已保证先执行 release-it 提升版本再构建，版本号与 tag、目录、文件名应一致。

### 4. 为什么开发环境会看到更新弹窗？

DEV 模式有两种情况：

- `dev-app-update.yml` 的 `version` 高于当前版本 → 真实检查触发
- 点击"立即更新"走本地 mock 下载流程（不真实下载）

### 5. 服务器 `latest.yml` 低于客户端版本怎么办？

把当前最新构建的 `latest.yml` + exe + blockmap 上传覆盖服务器旧文件即可。客户端版本高于服务器时会被判定为"已是最新"。

### 6. 如何只让部分用户更新？

在服务器 `latest.yml` 加 `stagingPercentage: 20` 灰度；逐步调高直到全量。

### 7. 如何强制旧版本升级？

把旧版本号加入 `update-config.json` 的 `disabledClientVersions`，客户端 10 分钟内生效（重启立即生效），旧版本会弹不可跳过的升级窗。

### 8. 如何紧急停止更新发布？

把 `update-config.json` 的 `eligible` 设为 `false`，客户端完全跳过更新检查。
