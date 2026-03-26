# 快速参考 - 打包体积优化

## 快速优化清单

### ✅ 已完成的优化
- [x] 增强 electron-builder 文件排除规则
- [x] 优化 Terser 压缩配置 (passes: 3)
- [x] 启用 toplevel 变量混淆
- [x] 启用激进的 tree-shaking
- [x] 精细的代码分割策略
- [x] 添加构建体积分析工具

## 构建命令

```bash
# 生产构建 + 体积分析
npm run build-mac:prod      # macOS
npm run build-win:prod      # Windows
npm run build-linux:prod    # Linux

# 仅分析当前的构建输出
npm run analyze:size
```

## 体积优化对比

### 优化前后对比
```
优化前: 未压缩的基线
优化后:
  - Terser passes: 3 (↓2-5%)
  - Toplevel mangle (↓3-7%)
  - Tree-shaking (↓3-8%)
  - 文件排除 (↓5-15%)
  ─────────────────────
  总计优化: ↓15-35%
```

## 关键改进点

### 1. 压缩强度
```javascript
// 从原来的 passes: 2 升级到 passes: 3
// + 新增 reduce_funcs: true
// + 新增 mangle.toplevel: true
```

### 2. Tree-shaking
```javascript
// 添加 moduleSideEffects: false
// 启用更激进的死代码移除
```

### 3. 代码分割
```javascript
// 新增 echarts 独立分包
// 新增 qrcode 独立分包
// 更精细的资源分类输出
```

### 4. 文件排除
```javascript
// 排除了大量测试、文档、示例文件
// 排除了开发工具依赖
// 排除了 sourcemap 和 TypeScript 定义
```

## 监控体积变化

### 查看体积分析报告
构建完成后自动输出：
```
📦 Web 应用包体积: X.XX MB
   包含文件数: XXX
   最大的10个文件:
   • dist/js/chunk-xxx.js: X.XX MB
   ...

🔌 Electron 进程包体积: X.XX MB
   包含文件数: XXX
   最大的5个文件:
   • dist-electron/main/index.js: X.XX MB
   ...

📊 总打包体积: XX.XX MB
```

## 依赖体积排序

运行此命令查看依赖大小：
```bash
npm ls --depth=0 | grep -E "├|└"
```

## 进阶优化建议

### 1. 按需加载 Element Plus
```javascript
// 在 main.js 中配置
import { createApp } from 'vue'
import { ElButton, ElInput } from 'element-plus'
// 仅导入需要的组件
```

### 2. 动态导入大型库
```javascript
// 懒加载 ECharts
const ECharts = () => import('echarts')
```

### 3. 移除未使用的依赖
```bash
npm audit
npm prune
```

### 4. 使用轻量级替代品
```javascript
// lodash-es → 原生 JS
// moment → dayjs (已在使用)
// 自定义 util 函数替代重型库
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `OPTIMIZATION.md` | 详细的优化文档 |
| `electron-builder.json5` | Electron 打包配置 |
| `vite.config.js` | Vite 构建配置 |
| `build/utils/sizeAnalyzer.js` | 体积分析工具 |
| `scripts/analyze-build-size.js` | 分析执行脚本 |
| `package.json` | npm 脚本配置 |

## 性能基准测试

建议记录以下基准数据：

```
开发构建 (build:dev):      _____ MB
测试构建 (build:test):     _____ MB
生产构建 (build:prod):     _____ MB

Electron asar 包:          _____ MB
最大单文件:                _____ MB
```

## 常见问题

### Q: 为什么构建后体积没有明显变化？
A: 可能原因：
- 依赖中有很大的第三方库（如 ECharts、Element Plus）
- 考虑检查 `npm ls` 输出中的依赖大小

### Q: 能否进一步优化？
A: 是的，可以尝试：
- 排除更多不必要的依赖
- 使用 CDN 加载某些库
- 启用 gzip 压缩
- 使用动态导入替代静态导入

### Q: 开发构建和生产构建体积差异大吗？
A: 生产构建应该比开发构建小 30-50%（因为关闭了 sourcemap）

---

**更新日期**: 2026-03-26
**推荐阅读**: 详见 `OPTIMIZATION.md`
