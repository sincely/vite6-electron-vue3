# 实现与 QoderWork 对齐的更新系统

## 背景
QoderWork 的更新链路：**远端配置门控（eligible 开关 + 禁用版本 + autoDownload）→ electron-updater（generic + latest.yml + stagingPercentage 灰度）→ 启动/窗口聚焦触发 → 自动下载 → 安装**。本计划把 lightning 对齐到同一模式。

## 已确认决策
- 配置来源：更新服务器静态 JSON `update-config.json`
- 下载策略：自动下载（远端配置控制）
- 禁用版本行为：强制升级弹窗，不可跳过
- 删除 `electron/` 冗余目录

---

## 一、新增文件

### 1. `src/main/updateConfig.js` — 远程配置客户端
- 配置 URL：`${UPDATE_URL}/update-config.json`
- 配置结构：
  ```json
  { "schemaVersion": 1, "eligible": true, "disabledClientVersions": [], "autoDownload": true, "checkOnFocus": true, "minCheckIntervalMinutes": 30 }
  ```
- API：
  - `getUpdateConfig()`：返回内存缓存
  - `refreshUpdateConfig()`：用 Electron 内置 `net.fetch` 拉取远端配置，成功更新内存缓存并推送 `update-config` 事件；失败降级用上次成功缓存，无缓存则默认 `eligible=true`（不影响现有功能），记 warn 日志
  - `startConfigPolling()`：每 10 分钟轮询一次（对齐 QoderWork 600s）
  - `isVersionDisabled()`：版本匹配，支持精确（`1.0.1`）与前缀（`1.0` 匹配 `1.0.x`）

## 二、修改文件

### 2. `src/main/update.js` — 主更新器
- `initUpdater` 流程改为：
  1. 配置 autoUpdater 基础项（现有逻辑保留）
  2. `await refreshUpdateConfig()` 拉取远端配置
  3. 门控判断：
     - `eligible=false` → 跳过检查更新，记日志 + 推送 `update-config`（UI 显示"更新已暂停"）
     - 当前版本命中 `disabledClientVersions` → 推送 `force-update` 事件，**同时继续**检查更新（强制升级需要拿到新版本）
     - 正常 → 检查更新
- 触发时机：保留启动检查（did-finish-load）+ **新增 `win.on('focus')` 窗口聚焦检查**（对齐 QoderWork，带节流 `minCheckIntervalMinutes` 默认 30 分钟防频繁请求）
- `autoUpdater.autoDownload = config.autoDownload`（true 时发现新版本自动下载）
- `update-available` payload 增加 `rolloutMode`（`stagingPercentage` 存在 → `'batch'`，否则 `'full'`）
- 新增推送频道：`update-config`（配置变化）、`force-update`（强制升级）

### 3. `src/main/ipc/update.js`
- 新增 `get-update-config`（`handle`）：返回当前配置，供渲染层读取
- `check-for-updates` handler 先 `refreshUpdateConfig()` 再 `checkForUpdates()`

### 4. `src/render/core/update.js`（useUpdater hook）
- 新增监听 `update-config`、`force-update` → 派发 CustomEvent `update:config` / `update:force`
- 现有逻辑保持

### 5. `src/render/store/modules/version.js`
- 新增 state：`updateEligible: true`、`autoDownload: false`、`forceUpdate: false`
- 新增 actions：`setUpdateEligible` / `setAutoDownload` / `setForceUpdate`
- persist 的 `paths` 已明确列出，新字段不会持久化 ✓

### 6. `src/render/components/UpdateDialog/index.vue`
- **强制升级模式**：监听 `update:force` → 弹窗、隐藏"稍后"/关闭按钮、禁用 `handleLater`、标题显示"当前版本已停止支持"
- **自动下载适配**：`autoDownload=true` 时收到 `update:available` 直接进入下载态（不再显示"立即更新"按钮，进度条正常展示）
- **灰度标识**：`rolloutMode==='batch'` 时版本对比区显示"灰度发布 x%"徽标

### 7. `src/render/components/SettingDialog/index.vue`（关于软件 tab，低优先级增强）
- 监听 `update:config`：`eligible=false` 时更新卡片显示"更新已暂停"，强制升级时显示警告

### 8. `dev-app-update.yml`
- `version: 0.0.6` → `1.0.2`（当前 0.0.6 低于 1.0.1，开发环境永远"已是最新"，无法测试）

### 9. 删除 `electron/` 目录
- 15 个文件，vite.config.js / package.json / build / scripts 均无引用（已确认死代码），`git rm -r electron/`

## 三、灰度分批说明（无需客户端代码）
electron-updater **内置** stagingPercentage 灰度机制（按 updater 缓存 id 自动计算命中），发布方在最新版 `latest.yml` 加 `stagingPercentage` 字段即自动生效——这正是 QoderWork 的实现方式。客户端只需正确透传 `rolloutMode` 供 UI 展示。

## 四、服务器部署说明（需你执行，实现中会写成文档）
在 `http://10.10.24.52:8089/electron-update/` 放置 `update-config.json`（默认全开配置），并同步上传 `release/1.0.1/` 的 `latest.yml` + exe + blockmap（当前服务器 latest.yml 是 0.0.22，低于本机 1.0.1，否则永远"已是最新"）。

## 五、验证
- `node --check` 主进程新增/修改文件
- eslint 检查修改的渲染层文件
- 人工验证：dev 环境（dev-app-update.yml → 1.0.2）触发检查，确认自动下载流程与弹窗状态机

## 影响范围
- 不改变 IPC 现有频道（check-for-updates / start-download / install-update 兼容）
- 不改变 electron-builder publish 配置
- 仅新增 update-config / force-update 两个推送频道与一个 handle